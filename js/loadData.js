// Load data
d3.csv("./data/cleaned_games_test.csv", d3.autoType).then((data) => {
  // just using the test data for now
  console.log(data);
  test(data);
});

function test(data) {
  const margin = { top: 40, right: 170, bottom: 25, left: 40 };
  const width = 1000;
  const height = 500;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3
    .select("#svg-container")
    .append("svg")
    .attr("viewBox", [0, 0, width, height])
    .style("border", "1px solid black");

  const innerChart = svg
    .append("g")
    .attr("transform", `translate(${margin.top} ${margin.left})`);
}
