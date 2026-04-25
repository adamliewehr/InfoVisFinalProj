# InfoVisFinalProj

Catan Vis Project - A D3.js data visualization analyzing patterns in Settlers of Catan gameplay.

# Loading the data

The data set that I'm using is very large, so I decided not to push it to github, to make things easier

[This](https://github.com/Catan-data/dataset) is the link to the repo I got the data from. The directions for downloading the data are there. Please follow those directions and put the games.tar.gz file into the data, and extract it using this command:

```bash
tar -xzf games.tar.gz
```

# Data Processing

The raw dataset contains ~44,000 JSON files with detailed game event histories. Since we only need summary statistics for this visualization, we use Python to extract and clean the data.

## Setup Python Environment

All data wrangling is isolated in the `data/` folder:

```bash
cd data
python3 -m venv venv
source venv/bin/activate  # On Mac/Linux
pip install pandas tqdm ujson
```

## Running Data Extraction

- **Test script** (1000 games): `python dataWranglingTest.py` - Quick test to verify extraction
- **Full script** (all games): `python dataWrangling.py` - Processes all ~44,000 games using multiprocessing

**Data Validation:** Both scripts filter out invalid games to ensure quality:

- Games must have exactly 4 players with complete data
- All players must have at least 2 VP (starting settlements)
- Winner (Rank 1) must have at least 10 VP
- Filters out 6-7% of games (non-4-player games or incomplete data)

## Cleaned Dataset Fields

The cleaned CSV contains one row per game with the following fields:

### Game-Level Stats

- `game_id` - Database game ID from the original dataset
- `totalTurnCount` - Total number of turns in the game
- `desert_x` - X coordinate of desert hex placement (-2 to 2)
- `desert_y` - Y coordinate of desert hex placement (-2 to 2)
- `desert_ring` - Desert location category: 'center' (0,0), 'inner' (±1), or 'outer' (±2)
- `dice_stats` - Array of dice roll counts for values 2-12
- `dice_chi_squared` - Chi-squared statistic measuring deviation from expected dice distribution (higher = more unusual)

### Player Stats (by Rank)

For each rank (1=winner, 2-3=middle, 4=loser), the following stats are extracted with prefix `rank1_`, `rank2_`, `rank3_`, `rank4_`:

**Victory Points:**

- `settlements` - Settlement count (1 VP each)
- `cities` - City count (2 VP each)
- `largest_army` - Has largest army bonus (2 VP)
- `longest_road` - Has longest road bonus (2 VP)
- `vp_cards` - Victory point development cards
- `total_vp` - Total victory points

**Activity Stats:**

- `devCardsUsed` - Development cards played
- `resourcesUsed` - Total resources spent
- `devCardsBought` - Development cards purchased
- `proposedTrades` - Trades proposed to other players
- `successfulTrades` - Trades successfully completed
- `resourceIncomeBlocked` - Resources blocked by robber

**Resource Stats:**

- Income: `rollingIncome`, `tradeIncome`, `robbingIncome`, `devCardIncome`, `goldIncome`
- Loss: `rollingLoss`, `robbingLoss`, `tradeLoss`, `devCardLoss`
- Totals: `totalResourceIncome`, `totalResourceLoss`, `totalResourceScore`
- `dice_chi_squared` - Chi-squared statistic measuring deviation from expected dice distribution (higher = more unusual)

# Citation

```
MR. MUCHO BUCHO Game Data (2025)
43,947 anonymized 4-player Catan games
https://github.com/Catan-data/dataset
```
