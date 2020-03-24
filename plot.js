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

let scaleFactor = 1.0;

function getXandY(letter, w, h) {
  let dxMin = -10;
  let dxMax = 10;
  let dyMin = 0;
  let dyMax = 60;
  let rangeYMax = h;
  if (letter === "T") {
    dyMin = 0;
    dyMax = 40;
    rangeYMax = h - 15;
  } else if (letter === "o") {
    dxMin = -5;
    dxMax = 5;
    dyMin = -15;
    dyMax = 15;
  } else if (letter === "v") {
    dyMin = 0;
    dyMax = 40;
  }
  let x = d3
    .scaleLinear()
    .clamp(true)
    .domain([dxMin, dxMax])
    .range([0, w]);
  let y = d3
    .scaleLinear()
    .clamp(true)
    .domain([dyMin, dyMax])
    .range([rangeYMax, 0]);
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

function initialPlotLetter(xData, yData, letter, rotationAmount, polar, w, h) {
  var pad = 10;
  var svg = d3
    .select("#logo")
    .append("svg:svg")
    .attr("height", h + pad)
    .attr("width", w + pad)
    .attr("viewbox", `0 0 ${w + pad} ${h + pad}`);

  let svgTranslateX = 0;
  let svgTranslateY = 0;
  if (letter == "y") {
    svgTranslateX = -90;
    svgTranslateY = 35;
  } else if (letter == "T") {
    svgTranslateX = 50;
  }
  svgTranslateX *= scaleFactor;
  svgTranslateY *= scaleFactor;

  svg.attr(
    "transform",
    `translate(${svgTranslateX}, ${svgTranslateY}) rotate(${rotationAmount})`
  );

  let translateYAmount = 0;
  let translateXAmount = 5;
  if (letter == "l") {
    translateYAmount = -20;
    svg.attr("transform-origin", "top");
  } else if (letter == "o") {
    translateYAmount = 10;
  }
  translateXAmount *= scaleFactor;
  translateYAmount *= scaleFactor;

  var vis = svg
    .append("svg:g")
    .attr("transform", `translate(${translateXAmount}, ${translateYAmount})`);

  chart_line();

  function chart_line() {
    var g = vis.append("svg:g").classed("series", true);

    g.append("svg:path")
      .attr("id", `path_${letter}`)
      .attr("d", lineGen(xData, yData, letter, polar, w, h));
  }
}

let XDataCache = {};

// api request letter get promise that resolves when letter is ready to render
function getLetterPromises(letter, i) {
  if (!XDataCache.hasOwnProperty(letter)) {
    XPromise = loadFloat32Array(`x_${letter}.bin`);
  } else {
    XPromise = new Promise(resolve => resolve(XDataCache[letter]));
  }
  YPromise = loadFloat32Array(`graph_${letter}_${i}.bin`);
  return [XPromise, YPromise];
}

function getWordPromises(word, i) {
  promises = [];
  for (let char of word) {
    promises = promises.concat(getLetterPromises(char, i));
  }
  return promises;
}

async function animateWord(word) {
  let numStates = 10;
  let delayBetweenAnimations = 4000;
  let animationActive = true;
  let initialRender = true;
  // TODO consider random iteration rather than constant loop
  let i = 0;
  while (animationActive) {
    let promises = getWordPromises(word, i);
    await Promise.all(promises).then(async function(values) {
      for (let [letterIndex, letter] of Object.entries(word)) {
        XData = values[letterIndex * 2];
        YData = values[letterIndex * 2 + 1];
        plotLetter(letter, XData, YData, initialRender);
      }
      initialRender = false;
      if (i < numStates - 1) {
        i++;
      } else {
        i = 0;
      }
    });
    await new Promise(resolve => {
      setTimeout(resolve, delayBetweenAnimations);
    });
  }
}

function plotLetter(letter, XData, YData, initialRender) {
  let [rotationAmount, w, h] = getRWH(letter);
  let polar = letter === "o";
  if (initialRender) {
    initialPlotLetter(XData, YData, letter, rotationAmount, polar, w, h);
  } else {
    d3.select(`#path_${letter}`)
      .transition()
      .duration(2000)
      .attr("d", lineGen(XData, YData, letter, polar, w, h));
  }
}

function getRWH(letter) {
  let w = 100;
  let h = 100;
  let rotationAmount = 0;
  if (letter == "y") {
    rotationAmount = 130;
  } else if (letter == "l") {
    rotationAmount = 90;
    h = 50;
  } else if (letter == "T") {
    w = 200;
    h = 200;
  }
  w = w * scaleFactor;
  h = h * scaleFactor;
  return [rotationAmount, w, h];
}

animateWord("Tovly");
