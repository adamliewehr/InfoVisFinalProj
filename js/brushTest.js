function brushTest(data, keys) {
  const margin = { top: 40, right: 170, bottom: 25, left: 40 };
  const width = 1000;
  const height = keys.length * 150;
  //   const height = 500;
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const svg = d3
    .create("svg")
    .attr("id", "parallel")
    .attr("viewBox", [0, 0, width, height]);

  const brush = d3
    .brushX()
    .extent([
      [margin.left, -(brushHeight / 2)],
      [width - margin.right, brushHeight / 2],
    ])
    .on("start brush end", brushed);
  for (let item in keys) {
    svg
      .append("g")
      .attr("class", "rectBar")
      .attr("transform", `translate(0,${y(keys[item])})`)
      .call((g) =>
        g
          .append("g")

          .selectAll(".rect" + item)
          .data(barNum[item])
          .join("rect")
          .attr("class", "rect" + item)
          .attr("x", (d, i) => xBand(i))
          .attr("fill", selectedColor)
          .attr("y", (d) => -barScale[item](d))
          .attr("height", (d) => barScale[item](d))
          .attr("width", xBand.bandwidth()),
      );
  }
  const path = svg
    .append("g")
    .attr("fill", "none")
    .attr("stroke-width", 1.5)
    .attr("stroke-opacity", 0.4)
    .attr("class", "parallelPath")
    .selectAll("path")
    .data(data.slice().sort((a, b) => d3.ascending(a["year"], b["year"])))
    .join("path")
    .attr("stroke", selectedLineColor)
    .attr("d", (d) => line(d3.cross(keys, [d], (key, d) => [key, d[key]])));

  path.append("title").text(label);

  svg
    .append("g")
    .selectAll("g")
    .data(keys)
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
    )
    .call(brush);
  brushSlider();

  const selections = new Map();

  function brushed({ selection }, key) {
    console.log(selection);
    if (selection === null) selections.delete(key);
    else selections.set(key, selection.map(x.get(key).invert));
    const selected = [];
    path.each(function (d) {
      const active = Array.from(selections).every(
        ([key, [min, max]]) => d[key] >= min && d[key] <= max,
      );
      d3.select(this).style("stroke", active ? selectedLineColor : "none");
      if (active) {
        d3.select(this).raise();
        selected.push(d);
      }
    });
    if (selection === null) {
      d3.select(".rect" + keys.indexOf(key)).attr("fill", selectedColor);
    } else {
      let Range = barRange.get(key);
      let path = (Range[1] - Range[0]) / 6;
      let brushRange = d3.map(selection, x.get(key).invert);
      let [min, max] = [
        Math.floor((brushRange[0] - Range[0]) / path),
        Math.floor((brushRange[1] - Range[0]) / path),
      ];
      console.log(min, max);
      d3.selectAll(".rect" + keys.indexOf(key)).attr("fill", (d, i) =>
        i >= min && i <= max ? selectedColor : deselectedColor,
      );
      // .attr("fill",  deselectedColor)
    }

    svg.property("value", selected).dispatch("input");
    d3.select(".rectBar").lower();
    brushSlider();
  }

  return svg.property("value", data).node();
}
