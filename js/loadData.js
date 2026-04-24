// Load data
d3.csv("./data/cleaned_games.csv", d3.autoType).then((data) => {
  // d3.csv("./data/cleaned_games.csv", d3.autoType).then((data) => {
  // just using the test data for now
  // console.log(data);
  // test(data);

  const forScales = [
    { attribute: "rankNumber", scaleType: "quantitative" },
    { attribute: "devCardsBought", scaleType: "quantitative" },
    { attribute: "devCardsUsed", scaleType: "quantitative" },
    { attribute: "proposedTrades", scaleType: "quantitative" },
    { attribute: "rollingIncome", scaleType: "quantitative" },
    { attribute: "tradeIncome", scaleType: "quantitative" },
    // { attribute: "tradeLoss", scaleType: "quantitative" },
    { attribute: "robbingIncome", scaleType: "quantitative" },
    { attribute: "cities", scaleType: "quantitative" },
    { attribute: "settlements", scaleType: "quantitative" },
    // { attribute: "rank", scaleType: "categorical" },
  ];

  const toExtract = forScales.map((element) => {
    return element.attribute;
  });
  // console.log(toExtract);

  const ranks = {
    one: "rank1_",
    two: "rank2_",
    three: "rank3_",
    four: "rank4_",
  };
  const rankNumbers = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
  };

  // Object.keys(ranks).forEach((rank) => {
  //   console.log(rank);
  // });

  let newData = [];

  // console.log(data.length);
  const sliceLength = 125; // number of games. the number of players will be 4 times as much
  const maxStart = data.length - sliceLength;
  // Generate a random start index
  const startIndex = Math.floor(Math.random() * (maxStart + 1));
  // Get the slice
  // const randomSlice = data.slice(startIndex, startIndex + sliceLength);
  const randomSlice = data.slice(0, 125);

  // console.log(randomSlice);

  randomSlice.forEach((game) => {
    // data.forEach((game) => {
    // console.log(game);

    Object.keys(ranks).forEach((rank) => {
      let toAdd = {};
      toAdd["rank"] = rank;
      // console.log(rankNumbers[rank]);
      toExtract.forEach((field) => {
        toAdd[field] = game[`${ranks[rank]}${field}`];
      });

      toAdd["rankNumber"] = rankNumbers[rank];
      // console.log(toAdd);
      newData.push(toAdd);
    });
  });
  console.log(newData);

  // parallellCords(newData, toExtract);
  parallellCordsBrush(newData, toExtract, forScales);
  // handleClickOnFilter(newData);
  // brushTest(newData, toExtract);
});
