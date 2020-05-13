
//Function renders pie chart to visualize gender distributions
function render_pie_chart(data) {
    d3.select("#gender_chart").select('svg').remove();

    // set the dimensions and margins of the graph
    var width = $('#gender_chart').width(),
        height = $('#gender_chart').height(),
        margin = 5;

    // The radius of the pieplot is half the width or half the height (smallest one).
    var radius = Math.min(width, height) / 2 - margin;

    // append the svg object to the div called 'my_dataviz'

    var genderSVG = d3.select("#gender_chart")
        .append("svg")
        .attr("width", '100%')
        .attr("height", '100%')
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    // set the color scale
var color = d3.scaleOrdinal()
              .domain(data)
              .range(d3.schemeCategory20);

// Compute the position of each group on the pie:
var pie = d3.pie()
            .value(function(d) {return d.value * 100; });

var data_ready = pie(d3.entries(data));
// shape helper to build arcs:
var arcGenerator = d3.arc()
                    .innerRadius(radius - 50)
                    .outerRadius(radius);

    // Build the pie chart: Basically, each part of the pie is a path that we build using the arc function.
    var slices = genderSVG.selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('path')
        .attr('fill', function(d){ return(color(d.data.key)); })
        .attr("stroke", "black")
        .style("stroke-width", "1px")
        .style("opacity", 0.5)
        .on('click', function(d) {
            toggleFilter('gender', [d.data]);
        })
        //.attr('d', arcGenerator)
        .transition()
        .duration(1000)
        .attrTween('d', function(d) {
            var i = d3.interpolate(d.startAngle+0.1, d.endAngle);
            return function(t) {
                d.endAngle = i(t);
                return arcGenerator(d)
            }
        });

    // Now add the annotation. Use the centroid method to get the best coordinates
    genderSVG.selectAll('mySlices')
        .data(data_ready)
        .enter()
        .append('text')
        .text(function(d){ return d.data.key[0]; })
        .attr("transform", function(d) { return "translate(" + arcGenerator.centroid(d) + ")";  })
        .style("text-anchor", "middle")
        .style("font-size", 10);
}