// import * as d3 from "../node_modules/d3";
console.log("test");
console.log(d3);

const loadJSON = fileName => {
  return new Promise(resolve => {
    let xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open("GET", fileName, true);
    // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = () => {
      if (xobj.readyState === 4 && xobj.status === 200) {
        // Required use of an anonymous callback
        // as .open() will NOT return a value but simply returns undefined in asynchronous mode
        resolve(xobj.responseText);
      }
    };
    xobj.send(null);
  });
};

var w = 400;
var h = 400;
var x = d3
  .scaleLinear()
  .domain([-10, 10])
  .range([0, w]);
var y = d3
  .scaleLinear()
  .domain([0, 35])
  .range([h, 0]);

function lineGen(data) {
  return _d =>
    d3.line()(
      data.map(function(pair) {
        return [x(pair[0]), y(pair[1])];
      })
    );
}

function plot(data) {
  console.log("plotting");

  var pad = 50;
  var svg = d3
    .select("body")
    .append("svg:svg")
    .attr("height", h + pad)
    .attr("width", w + pad);

  var vis = svg.append("svg:g").attr("transform", "translate(40,20)");

  var legend = d3
    .select("body")
    .append("div")
    .classed("legend", true);

  // function lineLookup(x) {
  //   return
  // }

  make_rules();
  chart_line();
  console.log("plotted line");

  function chart_line() {
    var g = vis.append("svg:g").classed("series", true);

    g.append("svg:path")
      .attr("id", "path1")
      .attr("d", lineGen(data));
  }

  function make_rules() {
    var rules = vis.append("svg:g").classed("rules", true);

    function make_x_axis() {
      return d3
        .axisBottom()
        .scale(x)
        .ticks(10);
    }

    function make_y_axis() {
      return d3
        .axisLeft()
        .scale(y)
        .ticks(10);
    }
  }
}

async function main() {
  let data1;
  await loadJSON("graph0.json").then(response => {
    // Parse JSON string into object
    data1 = JSON.parse(response);
    plot(data1);
  });
  let animationActive = true;
  let i = 1;
  while (animationActive) {
    console.log("i");
    await loadJSON(`graph${i}.json`).then(response => {
      console.log(` plotting graph${i}.json`);
      let currentData = JSON.parse(response);
      d3.select("#path1")
        .transition()
        .duration(2000)
        .attr("d", lineGen(currentData));
    });
    await new Promise(resolve => {
      setTimeout(resolve, 2000);
    });
    if (i < 9) {
      i++;
    } else {
      i = 0;
    }
  }
}

main();

// loadJSON(response => {
//   // Parse JSON string into object
//   let actual_JSON = JSON.parse(response);
//   plot(actual_JSON);
// });
