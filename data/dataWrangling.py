import ujson as json
import pandas as pd
from pathlib import Path
from tqdm import tqdm
from multiprocessing import Pool, cpu_count

# Expected probabilities for 2 dice (dice values 2-12)
EXPECTED_PROBS = [1/36, 2/36, 3/36, 4/36, 5/36, 6/36, 5/36, 4/36, 3/36, 2/36, 1/36]

def get_desert_ring(x, y):
    """Determine which ring the desert is in"""
    if x == 0 and y == 0:
        return 'center'
    elif abs(x) == 2 or abs(y) == 2:
        return 'outer'
    elif abs(x) <= 1 and abs(y) <= 1:
        return 'inner'
    else:
        return 'unknown'

def calculate_chi_squared(dice_stats):
    """Calculate chi-squared statistic for dice distribution"""
    if not dice_stats or len(dice_stats) != 11:
        return None
    
    total_rolls = sum(dice_stats)
    if total_rolls == 0:
        return None
    
    chi_squared = 0
    for observed, expected_prob in zip(dice_stats, EXPECTED_PROBS):
        expected = total_rolls * expected_prob
        if expected > 0:  # Avoid division by zero
            chi_squared += ((observed - expected) ** 2) / expected
    
    return chi_squared

def calculate_total_vp(vp_dict):
    """Calculate total VP from victory points dictionary
    Correct mapping:
    0: Settlements (1 VP each)
    1: Cities (2 VP each) 
    2: VP Cards (1 VP each)
    3: Largest Army (2 VP)
    4: Longest Road (2 VP)
    """
    total = 0
    total += vp_dict.get('0', 0) * 1  # Settlements
    total += vp_dict.get('1', 0) * 2  # Cities
    total += vp_dict.get('2', 0) * 1  # VP Cards
    total += vp_dict.get('3', 0) * 2  # Largest Army
    total += vp_dict.get('4', 0) * 2  # Longest Road
    return total

def is_valid_game(result):
    """Check if game has valid data and follows standard Catan rules"""
    if result is None:
        return False
    
    # Check all 4 players exist with valid data
    for rank in [1, 2, 3, 4]:
        total_vp = result.get(f'rank{rank}_total_vp')
        if total_vp is None or total_vp < 2:
            return False
    
    # Winner must have 10-12 VP (normal game completion)
    winner_vp = result.get('rank1_total_vp', 0)
    if winner_vp < 10 or winner_vp > 12:
        return False
    
    # Check total dev cards across all players doesn't exceed 25 (standard deck size)
    total_dev_cards = 0
    for rank in [1, 2, 3, 4]:
        total_dev_cards += result.get(f'rank{rank}_devCardsBought', 0)
    
    if total_dev_cards > 25:
        return False
    
    return True

def extract_player_stats(players, activity_stats, resource_stats):
    """Extract stats for each player by rank"""
    # Create color to rank mapping
    color_to_rank = {}
    for color, player_data in players.items():
        rank = player_data.get('rank')
        if rank:
            color_to_rank[color] = rank
    
    # Extract stats for each rank
    stats = {}
    for rank in [1, 2, 3, 4]:
        # Find the color for this rank
        player_color = None
        for color, r in color_to_rank.items():
            if r == rank:
                player_color = color
                break
        
        if player_color and player_color in players:
            # Victory Points
            vp = players[player_color].get('victoryPoints', {})
            stats[f'rank{rank}_settlements'] = vp.get('0', 0)
            stats[f'rank{rank}_cities'] = vp.get('1', 0)
            stats[f'rank{rank}_vp_cards'] = vp.get('2', 0)
            stats[f'rank{rank}_largest_army'] = vp.get('3', 0)
            stats[f'rank{rank}_longest_road'] = vp.get('4', 0)
            stats[f'rank{rank}_total_vp'] = calculate_total_vp(vp)
            
            # Activity Stats
            activity = activity_stats.get(player_color, {})
            stats[f'rank{rank}_devCardsUsed'] = activity.get('devCardsUsed', 0)
            stats[f'rank{rank}_resourcesUsed'] = activity.get('resourcesUsed', 0)
            stats[f'rank{rank}_devCardsBought'] = activity.get('devCardsBought', 0)
            stats[f'rank{rank}_proposedTrades'] = activity.get('proposedTrades', 0)
            stats[f'rank{rank}_successfulTrades'] = activity.get('successfulTrades', 0)
            stats[f'rank{rank}_resourceIncomeBlocked'] = activity.get('resourceIncomeBlocked', 0)
            
            # Resource Stats (goldIncome removed - not part of base game)
            resource = resource_stats.get(player_color, {})
            stats[f'rank{rank}_tradeLoss'] = resource.get('tradeLoss', 0)
            stats[f'rank{rank}_devCardLoss'] = resource.get('devCardLoss', 0)
            stats[f'rank{rank}_robbingLoss'] = resource.get('robbingLoss', 0)
            stats[f'rank{rank}_rollingLoss'] = resource.get('rollingLoss', 0)
            stats[f'rank{rank}_tradeIncome'] = resource.get('tradeIncome', 0)
            stats[f'rank{rank}_devCardIncome'] = resource.get('devCardIncome', 0)
            stats[f'rank{rank}_robbingIncome'] = resource.get('robbingIncome', 0)
            stats[f'rank{rank}_rollingIncome'] = resource.get('rollingIncome', 0)
            stats[f'rank{rank}_totalResourceLoss'] = resource.get('totalResourceLoss', 0)
            stats[f'rank{rank}_totalResourceScore'] = resource.get('totalResourceScore', 0)
            stats[f'rank{rank}_totalResourceIncome'] = resource.get('totalResourceIncome', 0)
        else:
            # Missing player data - set all to None
            for field in ['settlements', 'cities', 'vp_cards', 'largest_army', 'longest_road', 'total_vp',
                         'devCardsUsed', 'resourcesUsed', 'devCardsBought', 'proposedTrades', 
                         'successfulTrades', 'resourceIncomeBlocked', 'tradeLoss',
                         'devCardLoss', 'robbingLoss', 'rollingLoss', 'tradeIncome', 'devCardIncome',
                         'robbingIncome', 'rollingIncome', 'totalResourceLoss', 'totalResourceScore',
                         'totalResourceIncome']:
                stats[f'rank{rank}_{field}'] = None
    
    return stats

def process_file(args):
    """Process a single JSON file"""
    i, json_file = args
    try:
        with open(json_file) as f:
            game_data = json.load(f)
            
            # Get database game ID
            game_id = game_data['data'].get('databaseGameId')
            
            end_game_state = game_data['data']['eventHistory']['endGameState']
            
            # Get total turns
            total_turns = end_game_state['totalTurnCount']
            
            # Get dice stats
            dice_stats = end_game_state.get('diceStats', [])
            chi_squared = calculate_chi_squared(dice_stats)
            
            # Get desert location
            tile_hex_states = game_data['data']['eventHistory']['initialState']['mapState']['tileHexStates']
            desert_x, desert_y = None, None
            
            for hex_id, hex_data in tile_hex_states.items():
                if hex_data.get('type') == 0:  # Desert has type 0
                    desert_x = hex_data.get('x')
                    desert_y = hex_data.get('y')
                    break
            
            desert_ring = get_desert_ring(desert_x, desert_y) if desert_x is not None else None
            
            # Get player stats
            players = end_game_state.get('players', {})
            activity_stats = end_game_state.get('activityStats', {})
            resource_stats = end_game_state.get('resourceStats', {})
            player_stats = extract_player_stats(players, activity_stats, resource_stats)
            
            result = {
                'game_id': game_id,
                'totalTurnCount': total_turns,
                'desert_x': desert_x,
                'desert_y': desert_y,
                'desert_ring': desert_ring,
                'dice_stats': str(dice_stats),
                'dice_chi_squared': chi_squared
            }
            
            # Add player stats to result
            result.update(player_stats)
            
            return result
            
    except Exception as e:
        print(f"Error processing file {json_file}: {e}")
        return None

if __name__ == '__main__':
    # Get all files
    files = list(Path('games').glob('*.json'))
    
    # Create (index, filepath) tuples
    file_args = list(enumerate(files))
    
    # Process in parallel with all CPU cores
    with Pool(cpu_count()) as pool:
        results = list(tqdm(pool.imap(process_file, file_args, chunksize=100), total=len(files)))
    
    # Filter out None values and invalid games
    valid_data = [r for r in results if is_valid_game(r)]
    
    df = pd.DataFrame(valid_data)
    df.to_csv('cleaned_games.csv', index=False)
    
    print(f"\nDone! Processed {len(files)} files")
    print(f"Valid games: {len(valid_data)}")
    print(f"Filtered out: {len(files) - len(valid_data)} games ({100 * (len(files) - len(valid_data)) / len(files):.1f}%)")
