const parallellCordsBrush = (data, dimensions) => {
  const margin = { top: 40, right: 170, bottom: 25, left: 40 };
  const width = 1000;
  const height = dimensions.length * 150;
  //   const height = 500;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3
    .select("#svg-container")
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  let color = d3
    .scaleOrdinal()
    .domain(["1", "2", "3", "4"])
    .range(["blue", "orange", "green", "purple"]);

  // const x = {};
  // for (i in dimensions) {
  //   let name = dimensions[i];
  //   x[name] = d3
  //     .scaleLinear()
  //     .domain(
  //       d3.extent(data, function (d) {
  //         return +d[name];
  //       }),
  //     )
  //     .range([0, width]);
  // }
  const x = new Map(
    Array.from(dimensions, (key) => [
      key,
      d3.scaleLinear(
        d3.extent(data, (d) => d[key]),
        [margin.left, width - margin.right],
      ),
    ]),
  );

  //   console.log(y);

  y = d3.scalePoint().range([0, height]).padding(1).domain(dimensions);

  function path(d) {
    return d3.line()(
      dimensions.map(function (p) {
        return [x.get(p)(d[p]), y(p)];
      }),
    );
  }

  let highlight = function (d) {
    rank = d.rank;
    // console.log(rank);

    // first every group turns grey
    d3.selectAll(".line")
      .transition()
      .duration(200)
      .style("stroke", "lightgrey")
      .style("opacity", "0.2");
    // Second the hovered specie takes its color
    d3.selectAll("." + rank)
      .transition()
      .duration(200)
      .style("stroke", color(rank))
      .style("opacity", "1");
  };

  // Unhighlight
  let doNotHighlight = function (d) {
    d3.selectAll(".line")
      .transition()
      .duration(200)
      .delay(1000)
      .style("stroke", function (d) {
        return color(d.rank);
      })
      .style("opacity", "1");
  };

  // const path = svg
  //   .selectAll(".line")
  //   .data(data)
  //   .enter()
  //   .append("path")
  //   .attr("class", function (d) {
  //     return "line " + d.rank;
  //   }) // 2 class for each line: 'line' and the group name
  //   .attr("d", path)
  //   .style("fill", "none")
  //   .style("stroke", function (d) {
  //     return color(d.rank);
  //   })
  //   .on("mouseover", (event, datum) => {
  //     //   console.log(datum);
  //     highlight(datum);
  //   })
  //   .on("mouseleave", doNotHighlight)
  //   .style("opacity", 0.5);

  // Save the selection to a variable
  const lines = svg
    .selectAll(".myLines")
    .data(data)
    .enter()
    .append("path")
    .attr("class", (d) => "line " + d.rank)
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", (d) => color(d.rank))
    .style("opacity", 0.5);
  // .on("mouseover", (event, datum) => {
  //   //   console.log(datum);
  //   highlight(datum);
  // })
  // .on("mouseleave", doNotHighlight);

  // const path = svg
  //   .append("g")
  //   .attr("fill", "none")
  //   .attr("stroke-width", 1.5)
  //   .attr("stroke-opacity", 0.4)
  //   .selectAll("path")
  //   .data(data)
  //   .join("path")
  //   .attr("stroke", (d) => color(d[keyz]))
  //   .attr("d", path)
  //   .call((path) => path.append("title").text((d) => d.name));

  // const axes =
  // svg
  //   .selectAll("myAxis")
  //   // For each dimension of the dataset I add a 'g' element:
  //   .data(dimensions)
  //   .enter()
  //   .append("g")
  //   // I translate this element to its right position on the y axis
  //   .attr("transform", function (d) {
  //     return `translate(0, ${y(d)}) `;
  //   })
  //   // And I build the axis with the call function
  //   .each(function (d) {
  //     d3.select(this).call(d3.axisBottom().scale(x[d]));
  //   })
  //   //   Add axis title
  //   .append("text")
  //   .style("text-anchor", "middle")
  //   .attr("y", -9)
  //   .text((d) => {
  //     return d;
  //   })
  //   .style("fill", "black");

  // Append the axis for each key.
  const axes = svg
    .append("g")
    .selectAll("g")
    .data(dimensions)
    .join("g")
    .attr("transform", (d) => `translate(0,${y(d)})`)
    .each(function (d) {
      d3.select(this).call(d3.axisBottom(x.get(d)));
    })
    .call((g) =>
      g
        .append("text")
        .attr("x", margin.left)
        .attr("y", -6)
        .attr("text-anchor", "start")
        .attr("fill", "currentColor")
        .text((d) => d),
    )
    .call((g) =>
      g
        .selectAll("text")
        .clone(true)
        .lower()
        .attr("fill", "none")
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round")
        .attr("stroke", "white"),
    );

  // Create the brush behavior.
  const deselectedColor = "#ddd";
  const brushHeight = 50;
  const brush = d3
    .brushX()
    .extent([
      [margin.left, -(brushHeight / 2)],
      [width - margin.right, brushHeight / 2],
    ])
    .on("start brush end", brushed);

  axes.call(brush);

  const selections = new Map();

  function brushed({ selection }, key) {
    if (selection === null) selections.delete(key);
    else selections.set(key, selection.map(x.get(key).invert));
    const selected = [];
    lines.each(function (d) {
      const active = Array.from(selections).every(
        ([key, [min, max]]) => d[key] >= min && d[key] <= max,
      );
      d3.select(this).style("stroke", active ? color(d.rank) : deselectedColor);
      if (active) {
        d3.select(this).raise();
        selected.push(d);
      }
    });
    svg.property("value", selected).dispatch("input");
  }
};
