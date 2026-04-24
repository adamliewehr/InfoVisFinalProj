const parallellCordsBrush = (data, dimensions, forScales) => {
  // populateFilters();
  const margin = { top: 20, right: 50, bottom: 25, left: 50 };
  const width = 1000;
  const height = dimensions.length * 100;
  // const innerWidth = width - margin.left - margin.right;
  // const innerHeight = height - margin.top - margin.bottom;

  const svg = d3
    .select("#svg-container")
    .append("svg")
    .style("background-color", "#bcbcbc")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  let color = d3
    .scaleOrdinal()
    .domain(["1", "2", "3", "4"])
    .range(["red", "yellow", "#3431de", "#934adc"]);
  // .range(["red", "blue", "blue", "blue"]); // winner is red anyone who isn't a winner is blue

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
  // console.log(dimensions);
  // const x = new Map(
  //   Array.from(dimensions, (key) => [
  //     key.attribute,
  //     d3.scaleLinear(
  //       d3.extent(data, (d) => d[key.attribute]),
  //       [margin.left, width - margin.right],
  //     ),
  //     // .tickFormat(d3.format("d")),
  //   ]),
  // );
  const x = {};
  // for (const dim of dimensions) {
  //   x[dim] = d3.scaleLinear(
  //     d3.extent(data, (d) => d[dim]),
  //     [margin.left, width - margin.right],
  //   );
  // }
  // console.log(forScales);
  for (const dim of forScales) {
    // console.log(dim);
    // console.log(dim["attribute"]);
    x[dim["attribute"]] =
      dim["scaleType"] == "quantitative"
        ? d3.scaleLinear(
            d3.extent(data, (d) => d[dim["attribute"]]),
            [margin.left, width - margin.right],
          )
        : d3.scalePoint(
            data.map((d) => d[dim["attribute"]]),
            [(margin.left, width - margin.right)],
          );
  }
  // const x = new Map(
  //   Array.from(dimensions, (key) => [
  //     key,
  //     d3.scaleLinear(
  //       d3.extent(data, (d) => d[key]),
  //       [margin.left, width - margin.right],
  //     ),
  //     // .tickFormat(d3.format("d")),
  //   ]),
  // );
  console.log("x", x);

  y = d3.scalePoint().range([0, height]).domain(dimensions);

  function path(d) {
    return d3.line()(
      dimensions.map((p) => {
        // console.log(p);
        const handler = x[p];
        // getting the scale from the x map of scales
        const data = d[p]; // getting the data
        const result = handler(data); // getting the value from the scale with the value from the data

        const toReturn = [result, y(p)]; // for every dimension
        // wow
        // console.log(toReturn);
        return toReturn;
      }),
    );
  }

  // let highlight = function (d) {
  //   rank = d.rank;
  //   // console.log(rank);

  //   // first every group turns grey
  //   d3.selectAll(".line")
  //     .transition()
  //     .duration(200)
  //     .style("stroke", "lightgrey")
  //     .style("opacity", "0.2");
  //   // Second the hovered specie takes its color
  //   d3.selectAll("." + rank)
  //     .transition()
  //     .duration(200)
  //     .style("stroke", color(rank))
  //     .style("opacity", "1");
  // };

  // // Unhighlight
  // let doNotHighlight = function (d) {
  //   d3.selectAll(".line")
  //     .transition()
  //     .duration(200)
  //     .delay(1000)
  //     .style("stroke", function (d) {
  //       return color(d.rank);
  //     })
  //     .style("opacity", "1");
  // };

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
    .attr("d", path) // it does actually draw the entire line at once as one element, not several connected lines as one datapoint
    .style("fill", "none")
    .style("stroke", (d) => color(d.rank))
    .style("stroke-width", 5)
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
    .attr("class", "axis")
    .each(function (d) {
      d3.select(this).call(d3.axisBottom(x[d]));
    })
    .call((g) =>
      g
        .append("text")
        .attr("x", margin.left - 10)
        .attr("y", 0)
        .attr("text-anchor", "end")
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

  //
  //
  //
  //
  //
  //

  // const svg = d3
  //   .select("#svg-container")
  //   .append("svg")
  //   .style("background-color", "#bcbcbc")
  //   .attr("width", width + margin.left + margin.right)
  //   .attr("height", height + margin.top + margin.bottom)
  //   .append("g")
  //   .attr("transform", `translate(${margin.left},${margin.top})`);

  const barChartSvgHeight = 200;
  const barChart = d3
    .select("#barChart")
    .append("svg")
    .style("background-color", "#bcbcbc")
    .style("border-bottom", "2px solid black")
    .attr("width", width + margin.left + margin.right)
    .attr("height", barChartSvgHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  let counts = [{ one: 0 }, { two: 0 }, { three: 0 }, { four: 0 }];

  const rankNumbers = {
    one: 1,
    two: 2,
    three: 3,
    four: 4,
  };
  barChart
    .selectAll("rect")
    .data(counts)
    .join("rect")
    .attr("x", (d) => {
      // console.log("test");
      // return x["rankNumber"](4);
      return x["rankNumber"](rankNumbers[Object.keys(d)[0]]);
    })
    .attr("y", 0)
    .attr("width", 50)
    .attr("height", 0)
    .attr("fill", (d) => {
      return color(rankNumbers[Object.keys(d)[0]].toString());
    })
    .attr("stroke", "black");
  // const barChartYScale = d3
  //   .scaleLinear()
  //   .domain([0, 100])
  //   .range([100, 0])
  //   .nice();

  // barChart
  //   .selectAll("rect")
  //   .data(counts)
  //   .join("rect")
  //   .attr("x", (d) => {
  //     // console.log("test");
  //     // return x["rankNumber"](4);
  //     return x["rankNumber"](rankNumbers[Object.keys(d)[0]]);
  //   })
  //   .attr("y", (d) => {
  //     return barChartYScale(d[Object.keys(d)[0]]);
  //   })
  //   .attr("width", 100)
  //   .attr("height", 100)
  //   .attr("fill", "black");

  //
  //
  //
  //
  //
  //
  //
  //
  //

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

  // svg
  //   .append("circle")
  //   .attr("class", "testCircle")
  //   .attr("cx", 100)
  //   .attr("cy", 100)
  //   .attr("r", 100)
  //   .attr("fill", "black");

  // d3.select(".testCircle").attr("fill", "green");

  // i got this from mike bostock himself..
  function brushed({ selection }, key) {
    // console.log("new selection");
    // console.log(key);
    // console.log(selection);

    if (selection === null) {
      selections.delete(key);
      // console.log("test");
    } else {
      selections.set(key, selection.map(x[key].invert));
    }
    const selected = [];
    lines.each(function (d) {
      const active = Array.from(selections).every(
        ([key, [min, max]]) => d[key] >= min && d[key] <= max,
      );
      d3.select(this)
        .transition()
        .duration(150)
        .style("stroke", active ? color(d.rank) : deselectedColor)
        .style("opacity", active ? 0.5 : 0.0);

      if (active) {
        d3.select(this).raise();
        selected.push(d);

        // console.log("test");
      }
    });

    // d3.selectAll(".axis").raise();
    // d3.selectAll(".axis text").raise();
    lines.lower(); // genuinely i'm so stupid
    // d3.select(".testCircle").raise();
    svg.property("value", selected).dispatch("input");

    let counts = [{ one: 0 }, { two: 0 }, { three: 0 }, { four: 0 }];
    let max = 0;
    selected.forEach((line) => {
      // console.log(line);
      counts.forEach((obj) => {
        const curr = Object.keys(obj)[0];
        if (line["rank"] == curr) {
          obj[curr] += 1;

          max = Math.max(max, obj[curr]);
        }
      });
    });

    const barChartYScale = d3
      .scaleLinear()
      .domain([0, max])
      .range([barChartSvgHeight - 10, 0])
      .nice();

    // console.log(counts);
    // console.log(max);

    barChart
      .selectAll("rect")
      .data(counts)
      .join("rect")
      .transition()
      .attr("x", (d) => {
        // console.log("test");
        // return x["rankNumber"](4);
        return x["rankNumber"](rankNumbers[Object.keys(d)[0]]);
      })
      .attr("y", (d) => {
        return barChartYScale(d[Object.keys(d)[0]]);
      })
      .attr("width", 50)
      .attr("height", (d) => {
        return barChartSvgHeight - barChartYScale(d[Object.keys(d)[0]]);
      })
      .attr("fill", (d) => {
        return color(rankNumbers[Object.keys(d)[0]].toString());
      })
      .attr("stroke", "black");

    barChart
      .selectAll("text")
      .data(counts)
      .join("text")
      .transition()
      // .text((d) => {
      //   return `v: ${d[Object.keys(d)[0]]}, s:${Math.round(barChartYScale(d[Object.keys(d)[0]]))}`;
      // })
      .text((d) => {
        return ` ${d[Object.keys(d)[0]]}`;
      })
      .attr("x", (d) => {
        // console.log("test");
        // return x["rankNumber"](4);
        return x["rankNumber"](rankNumbers[Object.keys(d)[0]]) + 50 / 2;
      })
      .attr("y", (d) => {
        const val = d[Object.keys(d)[0]];
        return (val == 0 ? -12 : -3) + barChartYScale(val);
      })
      .attr("fill", "black")
      .attr("font-size", 20)
      .attr("text-anchor", "middle");

    // console.log(counts);
  }
};
