// TODO configure this import
// import * as d3 from "../node_modules/d3";

const loadFloat32Array = fileName => {
  // TODO considering locally caching instead of fresh requests
  return new Promise(resolve => {
    let xobj = new XMLHttpRequest();
    xobj.responseType = "arraybuffer";
    xobj.open("GET", `./letter_data/${fileName}`, true);
    // Replace 'my_data' with the path to your file
    xobj.onreadystatechange = () => {
      if (xobj.readyState === 4 && xobj.status === 200) {
        // Required use of an anonymous callback
        // as .open() will NOT return a value but simply returns undefined in asynchronous mode
        resolve(new Float32Array(xobj.response));
      }
      // TODO consider request failure
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
  .domain([0, 45])
  .range([h, 0]);

function lineGen(xData, yData) {
  return _d =>
    d3.line().curve(d3.curveCardinal)(
      Object.entries(xData).map(function([index, xValue]) {
        return [x(xValue), y(yData[index])];
      })
    );
}

function plot(xData, yData, rotationAmount) {
  var pad = 50;
  var svg = d3
    .select("body")
    .append("svg:svg")
    .attr("height", h + pad)
    .attr("width", w + pad);

  svg.attr("transform", ` rotate(${rotationAmount})`);

  var vis = svg.append("svg:g").attr("transform", `translate(40,20)`);
  // vis.style("transfrom", `rotate(${rotationAmount}deg)`);

  chart_line();

  function chart_line() {
    var g = vis.append("svg:g").classed("series", true);

    g.append("svg:path")
      .attr("id", "path1")
      .attr("d", lineGen(xData, yData));
  }
}

let activeLetter = "y";

async function main() {
  let initialDataY;
  XPromise = loadFloat32Array(`x_${activeLetter}.bin`);
  initialYPromise = loadFloat32Array(`graph_${activeLetter}_0.bin`);
  let XData;
  Promise.all([XPromise, initialYPromise]).then(function(values) {
    XData = values[0];
    initialDataY = values[1];
    let rotationAmount = 0;
    if (activeLetter == "y") {
      rotationAmount = 130;
    }
    plot(XData, initialDataY, rotationAmount);
  });
  let animationActive = true;
  // TODO consider random iteration rather than constant loop
  let i = 1;
  while (animationActive) {
    // TODO consider loading (or having option to) all these files at once
    await loadFloat32Array(`graph_${activeLetter}_${i}.bin`).then(response => {
      let currentYData = response;
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
