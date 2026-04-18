// Load data
d3.csv("./data/cleaned_games_test.csv", d3.autoType).then((data) => {
  // d3.csv("./data/cleaned_games.csv", d3.autoType).then((data) => {
  // just using the test data for now
  console.log(data);
  // test(data);

  const toExtract = [
    "devCardsBought",
    "devCardsUsed",
    "proposedTrades",
    "rollingIncome",
    "tradeIncome",
    "tradeLoss",
  ];

  const ranks = {
    one: "rank1_",
    two: "rank2_",
    three: "rank3_",
    four: "rank4_",
  };

  // Object.keys(ranks).forEach((rank) => {
  //   console.log(rank);
  // });

  let newData = [];

  data.slice(0, 100).forEach((game) => {
    // data.forEach((game) => {
    // console.log(game);

    Object.keys(ranks).forEach((rank) => {
      const toAdd = {};
      toAdd["rank"] = rank;

      toExtract.forEach((field) => {
        toAdd[field] = game[`${ranks[rank]}${field}`];
      });

      newData.push(toAdd);
    });
  });
  console.log(newData);

  // parallellCords(newData, toExtract);
  parallellCordsBrush(newData, toExtract);
  // brushTest(newData, toExtract);
});
