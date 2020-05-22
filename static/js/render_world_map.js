
function render_country_chart(data) {

    //data = d3.entries(data);
    const svgContainer = d3.select('#world_chart');

    svgContainer.selectAll('*').remove();

    const margin = 10;
    const origiWidth = $('#world_chart').width();
    const origiHeight = $('#world_chart').height();
    const width = origiWidth - margin * 2;
    const height = origiHeight - margin * 2;

    var svg = svgContainer.append('svg')
                .attr("width", '100%')
                .attr("height", '100%')

  svg.append("g")
    .attr("transform", "translate(" + margin + "," + margin + ")");
    data.push({ "country" : 'Root', "value" : 0, 'Continent' : null });
    data.push({ "country" : 'Asia', "value" : 0, 'Continent' : 'Root'});
    data.push({ "country" : 'Europe', "value" : 0, 'Continent' : 'Root'});
    data.push({ "country" : 'South America', "value" : 0, 'Continent' : 'Root'});
    data.push({ "country" : 'North America', "value" : 0, 'Continent' : 'Root'});
    data.push({ "country" : 'Africa', "value" : 0, 'Continent' : 'Root'});
    data.push({ "country" : 'Oceania', "value" : 0, 'Continent' : 'Root'});

  var root = d3.stratify()
  .id(function(d) { return d.country; })
  .parentId(function(d) { if(d.Continent == 'Other') return 'Africa'; else return d.Continent; })   // Name of the parent (column name is parent in csv)
  (data);

  root.sum(function(d) { return +d.value * 100 })   // Compute the numeric value for each entity

  // Then d3.treemap computes the position of each element of the hierarchy
  // The coordinates are added to the root object above
  d3.treemap()
  .size([width, height])
  .padding(4)
  (root)

  // create a tooltip
  var Tooltip = d3.select("#world_chart")
    .append("div")
    .style("opacity", 0)
    .attr("class", "tooltip")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "2px")
    .style("border-radius", "5px")
    .style("padding", "3px")

  // Three function that change the tooltip when user hover / move / leave a cell
  var mouseover = function(d) {
    Tooltip
      .style("opacity", 1)
  }
  var mousemove = function(d) {
    Tooltip
      .html('<b>' + d.data.country + '</b>' + " " + (d.data.value * 100).toFixed(2) + "%")
      .style("left", (d3.mouse(this)[0]+20) + "px")
      .style("top", (d3.mouse(this)[1]) + "px")
  }
  var mouseleave = function(d) {
    Tooltip
      .style("opacity", 0)
  }

    var color = d3.scaleOrdinal()
    .domain(['Europe', 'North America', 'South America', 'Oceania', 'Africa' ,'Asia'])
    .range(d3.schemeCategory20);

  // use this information to add rectangles:
  let boxes = svg
    .selectAll("rect")
    .data(root.leaves())
    .enter()
    .append("rect")
      .attr('x', function (d) { return d.x0; })
      .attr('y', function (d) { return 0; })
      .attr('width', function (d) { return d.x1 - d.x0; })
      .attr('height', function (d) { return d.y1 - d.y0; })
      .style("stroke", "black")
      .style("fill", function(d) {return color(d.data.Continent);})
      .attr("class", "rects")
      .on("mouseover", mouseover) // What to do when hovered
      .on("mousemove", mousemove)
      .on("mouseleave", mouseleave)
      .on("click", function(event) {
            toggleFilter('country', [{"key" : event.data.country}]);
       });

    boxes.transition()
        .duration(1000)
        .attr("y", function(d) { return d.y0; });

  // and to add the text labels
  svg.selectAll("text")
    .data(root.leaves())
    .enter()
    .append("text")
      .attr("class", "title-text")
      .attr("x", function(d){ return d.x0 + 5})    // +10 to adjust position (more right)
      .transition()
        .duration(1000)
      .attr("y", function(d){ return d.y0 + 20})    // +20 to adjust position (lower)
      .text(function(d){ if(d.data.value > 0.02) return d.data.country.slice(0,6);})

}