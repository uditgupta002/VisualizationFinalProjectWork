function render_primary_tool_dist(data) {

    data = d3.entries(data);
    const svgContainer = d3.select('#level_of_work');

    svgContainer.selectAll('svg').remove();

    const margin = 30;
    const origiWidth = $('#level_of_work').width();
    const origiHeight = $('#level_of_work').height();
    const width = origiWidth - margin * 4;
    const height = origiHeight - margin * 2;


    var svg = svgContainer.append('svg')
                .attr("width", '100%')
                .attr("height", '100%')

    var x = d3.scaleLinear()
              .domain([0, 100])
              .range([0, width]);

    const chart = svg.append("g")
                     .attr('transform', `translate(${margin + 50}, ${margin - 5})`);

    chart.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .attr("transform", "translate(-5,0)rotate(-45)")
        .style("text-anchor", "end");

    // Y axis
    var y = d3.scaleBand()
      .range([0, height])
      .domain(data.map(function(d) { return d.key;}))
      .padding(1);

    chart.append("g")
      .call(d3.axisLeft(y))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)");

    // Lines
    chart.selectAll("myline")
        .data(data)
        .enter()
        .append("line")
        .attr("class", "myline")
        .attr("x1", x(0))
        .attr("x2", x(0))
        .attr("y1", function(d) { return y(d.key); })
        .attr("y2", function(d) { return y(d.key); })
        .attr("stroke", "white");

// Circles -> start at X=0
    chart.selectAll("mycircle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", x(0) )
        .attr("cy", function(d) { return y(d.key); })
        .attr("r", "7")
        .style("fill", "#69b3a2")
        .attr("stroke", "black")
        .on('click', function(d) {
            toggleFilter('primary_tool_used', d3.select(this).data());
        });
    // Change the X coordinates of line and circle
    chart.selectAll("circle")
        .transition()
        .duration(1000)
        .attr("cx", function(d) { return x(d.value * 100); });

    chart.selectAll(".myline")
        .transition()
        .duration(1000)
        .attr("x1", function(d) { return x(d.value * 100); });
}