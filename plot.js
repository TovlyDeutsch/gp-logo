// import * as d3 from "../node_modules/d3";
console.log("test");
console.log(d3);

const loadJSON = fileName => {
  // TODO considering locally caching instead of fresh requests
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

function lineGen(xData, yData) {
  console.log(xData);
  return _d =>
    d3.line().curve(d3.curveCardinal)(
      Object.entries(xData).map(function([index, xValue]) {
        return [x(xValue), y(yData[index])];
      })
    );
}

function plot(xData, yData) {
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

  make_rules();
  chart_line();
  console.log("plotted line");

  function chart_line() {
    var g = vis.append("svg:g").classed("series", true);

    g.append("svg:path")
      .attr("id", "path1")
      .attr("d", lineGen(xData, yData));
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
  let initialDataY;
  XPromise = loadJSON("x.json");
  initialYPromise = loadJSON("graph0.json");
  let XData;
  Promise.all([XPromise, initialYPromise]).then(function(values) {
    XData = JSON.parse(values[0]);
    initialDataY = JSON.parse(values[1]);
    plot(XData, initialDataY);
  });
  let animationActive = true;
  let i = 1;
  while (animationActive) {
    await loadJSON(`graph${i}.json`).then(response => {
      let currentYData = JSON.parse(response);
      d3.select("#path1")
        .transition()
        .duration(2000)
        .attr("d", lineGen(XData, currentYData));
    });
    await new Promise(resolve => {
      setTimeout(resolve, 4000);
    });
    if (i < 9) {
      i++;
    } else {
      i = 0;
    }
  }
}

main();
