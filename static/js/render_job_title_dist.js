function render_job_title_dist(data) {

    const svgContainer = d3.select('#job_title_chart');
    const width = $('#job_title_chart').width();
    const height = $('#job_title_chart').height();
    const margin = 5;
    d3.select('#job_title_chart').selectAll('*').remove();

    data = d3.entries(data);

    var svg = svgContainer.append('svg')
                .attr("width", '100%')
                .attr("height", '100%')


  // Color palette for continents?
  var color = d3.scaleOrdinal()
    .domain(data.map(function(d) { return d.key;}))
    .range(d3.schemeCategory20);

  // Size scale for countries
  var size = d3.scaleLinear()
    .domain([0, d3.max(data, function(d) { return d.value * 100; })])
    .range([7, 65])  // circle will be between 7 and 55 px wide

  var axisSize = d3.scaleLinear()
    .domain([0, 1])
    .range([0, width])  // circle will be between 7 and 55 px wide

  // create a tooltip
  var Tooltip = d3.select("#job_title_chart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "5px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    Tooltip
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    Tooltip
      .html('<b>' + d.key.slice(0,15) + '</b>' + " " + (d.value * 100).toFixed(2) + "%")
      .style("left", (d3.mouse(this)[0]+20) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
  }

  // Initialize the circle: all located at the center of the svg area
  var node = svg.append("g")
    .selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
      .attr("class", "node")
      .attr("r", function(d){ return size(d.value * 100)})
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .style("fill", function(d){ return color(d.value * 100)})
      .style("fill-opacity", 0.8)
      .attr("stroke", "black")
      .style("stroke-width", 1)
      .on("mouseover", mouseover) // What to do when hovered
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("click", function(event) {
            toggleFilter('job_title', d3.select(this).data());
        })
      .call(d3.drag() // call specific function when circle is dragged
           .on("start", dragstarted)
           .on("drag", dragged)
           .on("end", dragended));

    let helperText = svg.selectAll(null)
    .data(data)
    .enter()
    .append("text")
    .attr("class", "title-text")
    .text(function(d){ if(d.value > 0.10) return d.key.slice(0,9);})


  // Features of the forces applied to the nodes:
  var simulation = d3.forceSimulation()
      .force("center", d3.forceCenter().x(width / 2).y(height / 2)) // Attraction to the center of the svg area
      .force("charge", d3.forceManyBody().strength(.9)) // Nodes are attracted one each other of value is > 0
      .force("collide", d3.forceCollide().strength(.5).radius(function(d){ return (size(d.value * 100)+3) }).iterations(5)) // Force that avoids circle overlapping

  simulation.force('x', d3.forceX().x(function(d) {
        return axisSize(d.value);
    }))
    .force('y', d3.forceY().y(function(d) {
        return 0;
    }));

  // Apply these forces to the nodes and update their positions.
  // Once the force algorithm is happy with positions ('alpha' value is low enough), simulations will stop.
  simulation
      .nodes(data)
      .on("tick", function(d){
        node
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; })

        helperText.attr('x', (data) => {
            return data.x - 25;
        })
        .attr('y', (data) => {
            return data.y;
        });

      });

  // What happens when a circle is dragged?
  function dragstarted(d) {
    if (!d3.event.active) simulation.alphaTarget(.03).restart();
    d.fx = d.x;
    d.fy = d.y;
  }
  function dragged(d) {
    d.fx = d3.event.x;
    d.fy = d3.event.y;
  }
  function dragended(d) {
    if (!d3.event.active) simulation.alphaTarget(.03);
    d.fx = null;
    d.fy = null;
  }

}