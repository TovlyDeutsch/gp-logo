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

function getXandY(letter, w, h) {
  let dxMin = -10;
  let dxMax = 10;
  let dyMin = 0;
  let dyMax = 60;
  if (letter === "T") {
    dyMin = 0;
    dyMax = 40;
  } else if (letter === "o") {
    dxMin = -5;
    dxMax = 5;
    dyMin = -11;
    dyMax = 19;
  } else if (letter === "v") {
    dyMin = 0;
    dyMax = 40;
  }
  let x = d3
    .scaleLinear()
    .domain([dxMin, dxMax])
    .range([0, w]);
  let y = d3
    .scaleLinear()
    .domain([dyMin, dyMax])
    .range([h, 0]);
  return [x, y];
}

function lineGen(xData, yData, letter, polar, w, h) {
  let [x, y] = getXandY(letter, w, h);
  return _d =>
    d3.line().curve(d3.curveCardinal)(
      Object.entries(xData).map(function([index, xValue]) {
        if (polar) {
          let theta = (2 * Math.PI) / (xData.length - 1);
          let r = 4;
          return [
            x((r + yData[index]) * Math.cos(index * theta)),
            y(3 * (r + yData[index]) * Math.sin(index * theta))
          ];
        } else {
          return [x(xValue), y(yData[index])];
        }
      })
    );
}

function plot(xData, yData, letter, rotationAmount, polar, w, h) {
  var pad = 10;
  var svg = d3
    .select("body")
    .append("svg:svg")
    .attr("height", h + pad)
    .attr("width", w + pad);

  let svgTranslateX = 0;
  let svgTranslateY = 0;
  if (letter == "y") {
    svgTranslateX = -90;
    svgTranslateY = 35;
  }

  svg.attr(
    "transform",
    `translate(${svgTranslateX}, ${svgTranslateY}) rotate(${rotationAmount})`
  );

  let translateYAmount = 0;
  let translateXAmount = 5;
  if (letter == "l") {
    translateYAmount = -20;
    svg.attr("transform-origin", "top");
  }
  // var vis = svg.append("svg:g");
  var vis = svg
    .append("svg:g")
    .attr("transform", `translate(${translateXAmount}, ${translateYAmount})`);
  // if (letter == "l") {
  //   svg.attr("transform-origin", "top");
  // }
  // vis.style("transfrom", `rotate(${rotationAmount}deg)`);

  chart_line();

  function chart_line() {
    var g = vis.append("svg:g").classed("series", true);

    g.append("svg:path")
      .attr("id", `path_${letter}`)
      .attr("d", lineGen(xData, yData, letter, polar, w, h));
  }
}

// let activeLetter = "T";

async function plotAndAnimateLetter(activeLetter) {
  let initialDataY;
  XPromise = loadFloat32Array(`x_${activeLetter}.bin`);
  initialYPromise = loadFloat32Array(`graph_${activeLetter}_0.bin`);
  let XData;
  let polar = activeLetter === "o";
  Promise.all([XPromise, initialYPromise]).then(async function(values) {
    XData = values[0];
    initialDataY = values[1];
    let rotationAmount = 0;
    let w = 100;
    let h = 100;
    if (activeLetter == "y") {
      rotationAmount = 130;
    } else if (activeLetter == "l") {
      rotationAmount = 90;
      h = 50;
    } else if (activeLetter == "T") {
      w = 200;
      h = 200;
    }
    plot(XData, initialDataY, activeLetter, rotationAmount, polar, w, h);
    let animationActive = true;
    // TODO consider random iteration rather than constant loop
    let i = 1;
    while (animationActive) {
      // TODO consider loading (or having option to) all these files at once
      await loadFloat32Array(`graph_${activeLetter}_${i}.bin`).then(
        response => {
          let currentYData = response;
          d3.select(`#path_${activeLetter}`)
            .transition()
            .duration(2000)
            .attr("d", lineGen(XData, currentYData, activeLetter, polar, w, h));
        }
      );
      await new Promise(resolve => {
        setTimeout(resolve, 4000);
      });
      if (i < 9) {
        i++;
      } else {
        i = 0;
      }
    }
  });
}

plotAndAnimateLetter("T");
plotAndAnimateLetter("o");
plotAndAnimateLetter("v");
plotAndAnimateLetter("l");
plotAndAnimateLetter("y");
