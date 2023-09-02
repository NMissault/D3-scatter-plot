import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

var url =
  'https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/cyclist-data.json';
var margin = {
    top: 100,
    right: 50,
    bottom: 100,
    left: 100
  },
  width = 800 - margin.left - margin.right,
  height = 600 - margin.top - margin.bottom;

var x = d3.scaleLinear().range([0, width]);
var y = d3.scaleTime().range([0, height]);
var color = d3.scaleOrdinal(d3.schemeCategory10);
var timeFormat = d3.timeFormat('%M:%S');
var xAxis = d3.axisBottom(x).tickFormat(d3.format('d'));
var yAxis = d3.axisLeft(y).tickFormat(timeFormat);

// tooltip
var div = d3
.select('body')
.append('div')
.attr('id', 'tooltip')
.style('opacity', 0);
//graph
var svg = d3
.select('body')
.append('svg')
.attr('width', width + margin.left + margin.right)
.attr('height', height + margin.top + margin.bottom)
.attr('class', 'graph')
.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');
// title
svg
.append('text')
.attr('id', 'title')
.attr('x', width / 2)
.attr('y', 0 - margin.top / 2)
.attr('text-anchor', 'middle')
.style('font-size', '30px')
.text('Doping in Professional Bicycle Racing');
// subtitle
svg
.append('text')
.attr('x', width / 2)
.attr('y', 0 - margin.top / 2 + 25)
.attr('text-anchor', 'middle')
.style('font-size', '20px')
.text("35 Fastest times up Alpe d'Huez");

d3.json(url)
  .then(data => {
    data.forEach(function (d) {
        d.Place = +d.Place;
        var parsedTime = d.Time.split(':');
        d.Time = new Date(1970, 0, 1, 0, parsedTime[0], parsedTime[1]);
    });
    x.domain([
        d3.min(data, function (d) {
        return d.Year - 1;
        }),
        d3.max(data, function (d) {
        return d.Year + 1;
        })
    ]);
    y.domain(
        d3.extent(data, function (d) {
            return d.Time;
        })
    );
    // x-axis
    svg
    .append('g')
    .attr('class', 'axis')
    .attr('id', 'x-axis')
    .attr('transform', 'translate(0,' + height + ')')
    .call(xAxis)
    svg
    .append('text')
    .attr('class', 'x-axis-label')
    .attr('x', width)
    .attr('y', height + margin.bottom/2)
    .style('text-anchor', 'end')
    .style('font-size', 18)
    .text('Year');
    // y-axis
    svg
    .append('g')
    .attr('class', 'axis')
    .attr('id', 'y-axis')
    .call(yAxis)
    svg
    .append('text')
    .attr('class', 'label')
    .attr('transform', 'rotate(-90)')
    .attr('x', 0)
    .attr('y', -margin.left/2)
    .style('text-anchor', 'end')
    .style('font-size', 18)
    .text('Time in Minutes');
    // data points
    svg
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('class', 'dot')
      .attr('r', 6)
      .attr('cx', function (d) {
        return x(d.Year);
      })
      .attr('cy', function (d) {
        return y(d.Time);
      })
      .attr('data-xvalue', function (d) {
        return d.Year;
      })
      .attr('data-yvalue', function (d) {
        return d.Time.toISOString();
      })
      .style('fill', function (d) {
        return color(d.Doping !== '');
      })
      .on('mouseover', function (event, d) {
        div.style('opacity', 0.9);
        div.attr('data-year', d.Year);
        div
          .html(
            d.Name +
              ': ' +
              d.Nationality +
              '<br/>' +
              'Year: ' +
              d.Year +
              ', Time: ' +
              timeFormat(d.Time) +
              (d.Doping ? '<br/><br/>' + d.Doping : '')
          )
          .style('left', event.pageX + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function () {
        div.style('opacity', 0);
      });
    

    var legendContainer = svg.append('g').attr('id', 'legend');

    var legend = legendContainer
      .selectAll('#legend')
      .data(color.domain())
      .enter()
      .append('g')
      .attr('class', 'legend-label')
      .attr('transform', function (d, i) {
        return 'translate(0,' + (height / 2 - i * 20) + ')';
      });

    legend
      .append('rect')
      .attr('x', width - 18)
      .attr('width', 18)
      .attr('height', 18)
      .style('fill', color);

    legend
      .append('text')
      .attr('x', width - 24)
      .attr('y', 9)
      .attr('dy', '.35em')
      .style('text-anchor', 'end')
      .text(function (d) {
        if (d) {
          return 'Riders with doping allegations';
        } else {
          return 'No doping allegations';
        }
      });
  })