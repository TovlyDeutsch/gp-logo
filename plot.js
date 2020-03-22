// import * as d3 from "../node_modules/d3";
console.log("test");
console.log(d3);

const loadJSON = callback => {
  let xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", "graph.json", true);
  // Replace 'my_data' with the path to your file
  xobj.onreadystatechange = () => {
    if (xobj.readyState === 4 && xobj.status === 200) {
      // Required use of an anonymous callback
      // as .open() will NOT return a value but simply returns undefined in asynchronous mode
      callback(xobj.responseText);
    }
  };
  xobj.send(null);
};

function plot(data) {
  console.log("plotting");
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

    g.append("svg:path").attr("d", function(d) {
      return d3.line()(
        data.map(function(pair) {
          return [x(pair[0]), y(pair[1])];
        })
      );
    });
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

    rules
      .append("svg:g")
      .classed("grid x_grid", true)
      .attr("transform", "translate(0," + h + ")")
      .call(
        make_x_axis()
          .tickSize(-h, 0, 0)
          .tickFormat("")
      );

    rules
      .append("svg:g")
      .classed("grid y_grid", true)
      .call(
        make_y_axis()
          .tickSize(-w, 0, 0)
          .tickFormat("")
      );

    rules
      .append("svg:g")
      .classed("labels x_labels", true)
      .attr("transform", "translate(0," + h + ")")
      .call(make_x_axis().tickSize(5));

    rules
      .append("svg:g")
      .classed("labels y_labels", true)
      .call(make_y_axis().tickSize(10, 5, 0));
  }
}

loadJSON(response => {
  // Parse JSON string into object
  let actual_JSON = JSON.parse(response);
  plot(actual_JSON);
});
