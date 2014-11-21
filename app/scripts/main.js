'use strict';

$(function () {

    var margin = {top:100, right: 0, bottom: 30, left: 70},
        width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right,
        height = parseInt(d3.select("#chart").style("height")) - margin.top - margin.bottom;

    var color = d3.scale.ordinal()
        .range(['rgb(254,153,41)','rgb(236,112,20)']);

    var x0a = d3.scale.ordinal()
        .rangeRoundBands([0, width], .3);

    var x0b = d3.scale.ordinal();

    var y0 = d3.scale.linear()
        .range([height, 0]);

    var x0Axis = d3.svg.axis()
        .scale(x0a)
        .orient("bottom");

    var y0Axis = d3.svg.axis()
        .scale(y0)
        .tickSize(-width)
        .orient("left");

    var svg = d3.select("#chart").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("foreignObject")
    .attr("width", 400)
    .attr("height", 100)
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .attr("x", -height)
      .attr("y", -margin.left -5)
      .attr("transform", "rotate(-90)")
      .append("xhtml:body")
      .html("Seasonal Water Use <span style='font-size: 10px;'>(in Millions of Gallons)</span>");

    var legend;

    d3.csv("data/usage.csv", function(error, data) {
      var seasonNames = d3.keys(data[0]).filter(function(key) { return key !== "Year"; });

      data.forEach(function(d) {
        d.seasons = seasonNames.map(function(season) { return {season: season, value: +d[season]}; });
      });

      x0a.domain(data.map(function(d) { return d.Year; }));
      x0b.domain(seasonNames).rangeRoundBands([0, x0a.rangeBand()]);
      y0.domain([0, 2000]);

      svg.append("g")
          .attr("class", "x axis")
          .attr("transform", "translate(0," + height + ")")
          .call(x0Axis);

      svg.append("g")
          .attr("class", "y axis")
          .call(y0Axis);

      var year = svg.selectAll(".year")
          .data(data)
        .enter().append("g")
          .attr("class", "year")
          .attr("transform", function(d) { return "translate(" + x0a(d.Year) + ",0)"; });

      year.selectAll("rect")
          .data(function(d) { return d.seasons; })
        .enter().append("rect")
          .attr("class", function(d) { return d.season; })
          .attr("width", x0b.rangeBand())
          .attr("x", function(d) { return x0b(d.season); })
          .attr("y", height)
          .attr("height", 0)
          .style("fill", function(d) { return color(d.season); })
          .transition().delay(function (d,i){ return i * 800;})
          .duration(500)
          .attr("y", function(d) { return y0(d.value); })
          .attr("height", function(d) { return height - y0(d.value); });

      legend = svg.selectAll(".legend")
          .data(seasonNames.slice().reverse())
        .enter().append("g")
          .attr("class", "legend")
          .attr("transform", function(d, i) { return "translate("+margin.right+"," + (i+2) * -22  + ")"; });

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", color);

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text(function(d) { return d; });

    });

    var x1 = d3.time.scale()
      .range([0, width]);

    var y1 = d3.scale.linear()
        .range([height, 0]);

    var x1Axis = d3.svg.axis()
      .scale(x1)
      .orient("bottom");

    // var y1Axis = d3.svg.axis()
    //   .tickValues([0,10000,20000,30000,40000])
    //   .scale(y1)
    //   .orient("left");

    var parseDate = d3.time.format("%Y-%m").parse;

    // svg.append("text")
    //   .attr("class", "y label")
    //   .attr("text-anchor", "middle")
    //   .attr("x", -height/2)
    //   .attr("y", -margin.left+8)
    //   .attr("transform", "rotate(-90)")
    //   .text("Total Flows in cubic feet per second");

    

    d3.csv("data/flows.csv", function(error, data) {

      data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.flow = +d.flow;
      });

      x1.domain(d3.extent(data, function(d) { return d.date; }));
      y1.domain([0, 40000]);

      

      // svg.append("g")
      //     .attr("class", "x axis")
      //     .attr("transform", "translate(0," + (height + 10 )+ ")")
      //     .call(x1Axis);

      // svg.append("g")
      //     .attr("class", "y axis")
      //     .call(y1Axis);

      var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return x1(d.date); })
        .y(function(d) { return y1(d.flow); });

      line.defined(function(d) { return !isNaN(d.flow); });

      var path = svg.append("path")
        .datum(data)
        .attr("class", "line")
        .attr("d", line);

      var totalLength = path.node().getTotalLength();

      path
        .attr("stroke-dasharray", totalLength + " " + totalLength)
        .attr("stroke-dashoffset", totalLength)
        .transition()
        .duration(2000)
        .ease("linear")
        .attr("stroke-dashoffset", 0);

      legend = svg.selectAll(".legend")
          .data(data)
        .enter().append("g")
          .attr("class", function(d,i) { return "legend-flows legend-flows-" + i; })
          .attr("transform", function(d,i) { return "translate("+margin.right+"," + (i+2) * -22  + ")"; });

      // legend.append("path")
      //     .attr({
      //       d: "M5.2,20.9c1.1-2.8,2.9-6.4,5.9-9.1c3.4-3,8.5-4.1,12.2-4.9",
      //       stroke: '#000'
      //     })
      //     .attr("transform", function(d) { return "translate(886," + -3  + ")"; })
      //     .attr("class", "line legend");

      legend.append("rect")
          .attr("x", width - 18)
          .attr("width", 18)
          .attr("height", 18)
          .style("fill", 'steelblue');

      legend.append("text")
          .attr("x", width - 24)
          .attr("y", 9)
          .attr("dy", ".35em")
          .style("text-anchor", "end")
          .text('Flow Rates near Ashland NE');

    });

    function resize() {
      width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right;
    }

    d3.select(window).on('resize', resize);

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.parentNode.appendChild(this.parentNode);
        });
    };

    d3.select('.line').moveToFront();

});





