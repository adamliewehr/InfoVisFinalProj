const parallellCords = (data, dimensions) => {
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

  const x = {};
  for (i in dimensions) {
    let name = dimensions[i];
    x[name] = d3
      .scaleLinear()
      .domain(
        d3.extent(data, function (d) {
          return +d[name];
        }),
      )
      .range([0, width]);
  }
  //   console.log(y);

  y = d3.scalePoint().range([0, height]).padding(1).domain(dimensions);

  function path(d) {
    return d3.line()(
      dimensions.map(function (p) {
        return [x[p](d[p]), y(p)];
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

  svg
    .selectAll("myPath")
    .data(data)
    .enter()
    .append("path")
    .attr("class", function (d) {
      return "line " + d.rank;
    }) // 2 class for each line: 'line' and the group name
    .attr("d", path)
    .style("fill", "none")
    .style("stroke", function (d) {
      return color(d.rank);
    })
    .style("opacity", 0.5)
    .on("mouseover", (event, datum) => {
      //   console.log(datum);
      highlight(datum);
    })
    .on("mouseleave", doNotHighlight);

  svg
    .selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions)
    .enter()
    .append("g")
    // I translate this element to its right position on the y axis
    .attr("transform", function (d) {
      return `translate(0, ${y(d)}) `;
    })
    // And I build the axis with the call function
    .each(function (d) {
      d3.select(this).call(d3.axisBottom().scale(x[d]));
    })
    //   Add axis title
    .append("text")
    .style("text-anchor", "middle")
    .attr("y", -9)
    .text((d) => {
      return d;
    })
    .style("fill", "black");
};
