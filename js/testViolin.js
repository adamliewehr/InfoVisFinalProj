const test = (data) => {
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

  const ranks = [
    { id: "rank1_" },
    { id: "rank2_" },
    { id: "rank3_" },
    { id: "rank4_" },
  ];

  let maxTrades = 0;

  // proposedTrades
  ranks.forEach((rank) => {
    const rankString = `${rank.id}devCardsBought`;
    // console.log(rankString);
    rank["proposedTrades"] = data.map((d) => d[rankString]);

    const maxInRank = d3.max(rank.proposedTrades);
    console.log(maxInRank);

    if (maxInRank > maxTrades) {
      maxTrades = maxInRank;
    }

    rank["mean"] = d3.mean(rank.proposedTrades);

    rank["bins"] = d3.bin()(rank.proposedTrades);

    const quartileScale = d3
      .scaleQuantile()
      .domain(rank.proposedTrades)
      .range([0, 1, 2, 3]);

    rank["quartiles"] = quartileScale.quantiles();
  });

  console.log(ranks);

  const xScale = d3
    .scalePoint()
    .domain(ranks.map((d) => d.id))
    .range([0, innerWidth])
    .padding(0.7);

  console.log(maxTrades);

  const yScale = d3
    .scaleLinear()
    .domain([0, maxTrades])
    .range([innerHeight, 0])
    .nice();

  let maxBinLength = 0;

  ranks.forEach((rank) => {
    const max = d3.max(rank.bins, (d) => d.length);
    if (max > maxBinLength) {
      maxBinLength = max;
    }
  });

  const violinsScale = d3
    .scaleLinear()
    .domain([0, maxBinLength])
    .range([0, xScale.step() / 2]);

  const leftAxis = d3.axisLeft(yScale);
  innerChart.append("g").call(leftAxis);

  const bottomAxis = d3.axisBottom(xScale);
  innerChart
    .append("g")
    .attr("transform", `translate(0, ${innerHeight})`)
    .call(bottomAxis);

  ranks.forEach((rank) => {
    const container = innerChart.append("g");

    // Append area
    const areaGenerator = d3
      .area()
      .x0((d) => xScale(rank.id) - violinsScale(d.length))
      .x1((d) => xScale(rank.id) + violinsScale(d.length))
      .y((d) => yScale(d.x1) + (yScale(d.x0) - yScale(d.x1)) / 2)
      .curve(d3.curveCatmullRom);

    container
      .append("path")
      .attr("d", areaGenerator(rank.bins))
      .attr("fill", "black")
      .attr("fill-opacity", 0.3);

    // Append interquartile range
    const width = 8;
    container
      .append("rect")
      .attr("x", xScale(rank.id) - width / 2)
      .attr("y", yScale(rank.quartiles[2]))
      .attr("width", width)
      .attr("height", yScale(rank.quartiles[0]) - yScale(rank.quartiles[2]))
      .attr("rx", 4)
      .attr("ry", 4)
      .attr("fill", "grey");

    // Append mean
    container
      .append("circle")
      .attr("cx", (d) => xScale(rank.id))
      .attr("cy", (d) => yScale(rank.mean))
      .attr("r", 3)
      .attr("fill", "white");
  });
};
