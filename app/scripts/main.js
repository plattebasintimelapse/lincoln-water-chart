'use strict';

$(function() {

  function drawGraphic() {

    // clear existing graphic
    $('#chart svg').remove();

    var margin = {top:130, right: 60, bottom: 30, left: 65},
        width = parseInt(d3.select("#chart").style("width")) - margin.left - margin.right,
        height = parseInt(d3.select("#chart").style("height")) - margin.top - margin.bottom;

    var color = d3.scale.ordinal()
        .range(['rgb(254,153,41)','rgb(236,112,20)']);

    var x0a = d3.scale.ordinal()
        .rangeRoundBands([0, width], .2);

    var x0b = d3.scale.ordinal();

    var y0 = d3.scale.linear()
        .range([height, 0]);

    var x0Axis = d3.svg.axis()
        .scale(x0a)
        .ticks(6)
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
      .attr("x", -height+margin.bottom)
      .attr("y", -margin.left -5)
      .attr("transform", "rotate(-90)")
      .append("xhtml:body")
      .html("Seasonal Water Use <span style='font-size: 10px;'>(in millions of gallons)</span>");

    var legend;

    var tip0 = d3.tip()
      .attr('class', 'd3-tip')
      .offset([-10, 0])
      .direction('n')
      .html(function(d) { return d.value + " Mgal"; });

    svg.call(tip0);

       var x1 = d3.time.scale()
      .range([0, width]);

    var y1 = d3.scale.linear()
        .range([height, 0]);

    var x1Axis = d3.svg.axis()
      .scale(x1)
      .orient("bottom");

    var y1Axis = d3.svg.axis()
      .tickValues([0,20000,40000])
      .tickFormat(d3.format("s"))
      .scale(y1)
      .orient("right");

    var parseDate = d3.time.format("%Y-%m").parse;

    svg.append("foreignObject")
      .attr("width", 220)
      .attr("height", 80)
      .attr("class", "y label")
      .attr("text-anchor", "middle")
      .attr("x", (height/2)-margin.top)
      .attr("y", -width-65)
      .attr("transform", "rotate(90)")
      .append("xhtml:body")
      .html("Total Flows <span style='font-size: 10px;'>(in cubic feet per second)</span>");

    var line;

    d3.csv("data/flows.csv", function(error, data) {

      data.forEach(function(d) {
        d.date = parseDate(d.date);
        d.flow = +d.flow;
      });

      x1.domain(d3.extent(data, function(d) { return d.date; }));
      y1.domain([0, 40000]);

      svg.append("g")
          .attr("class", "y axis")
          .attr("transform", "translate(" + width + " ,0)")  
          .call(y1Axis);

      line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return x1(d.date); })
        .y(function(d) { return y1(d.flow); });

      line.defined(function(d) { return !isNaN(d.flow); });

      var path = svg.append("path")
        .datum(data)
        .attr("class", "line")
        // .attr("id", "flow-line")
        .attr("d", line);

      d3.select('path').moveToFront();

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
          .text('Platte Flows near Ashland, Neb');

    });

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
          .attr("class", function(d) { return d.season + " rect"; })
          .attr("width", x0b.rangeBand())
          .attr("x", function(d) { return x0b(d.season); })
          .attr("y", height)
          .attr("height", 0)
          .style("fill", function(d) { return color(d.season); })
          .on('mouseover', tip0.show)
          .on('mouseout', tip0.hide)
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

      d3.select('.line').moveToFront();

    });

    d3.selection.prototype.moveToFront = function() {
        return this.each(function(){
            this.parentNode.appendChild(this);
        });
    };
  };

  var pymChild = new pym.Child({ renderCallback: drawGraphic });

  d3.select(window).on('resize', drawGraphic);

});





