function render_education_graph(data) {
    data = d3.entries(data);
    const svgContainer = d3.select('#education_chart');

    const margin = 30;
    const origiWidth = $('#education_chart').width();
    const origiHeight = $('#education_chart').height();
    const width = origiWidth - 2 * margin;
    const height = origiHeight - 2 * margin;

    svgContainer.selectAll('svg').remove();

    var svg = svgContainer.append('svg')
    .attr("width", '100%')
    .attr("height", '100%')
    //.attr('viewBox','0 0 '+Math.min(width,height)+' '+Math.min(width,height))
    //.attr('preserveAspectRatio','xMinYMin');

    const chart = svg.append('g')
        .attr('transform', `translate(${margin + 10}, ${margin - 5})`);

    const xScale = d3.scaleBand()
      .range([0, width])
      .domain(data.map(function(d) { return d.key;}))
      .padding(0.3);

    const yScale = d3.scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, function(d) { return d.value * 100 + 5;})]);

    // vertical grid lines
    // const makeXLines = () => d3.axisBottom()
    //   .scale(xScale)

    const makeYLines = () => d3.axisLeft()
      .scale(yScale)

    chart.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale));

    chart.append('g')
      .call(d3.axisLeft(yScale));

    // vertical grid lines
    // chart.append('g')
    //   .attr('class', 'grid')
    //   .attr('transform', `translate(0, ${height})`)
    //   .call(makeXLines()
    //     .tickSize(-height, 0, 0)
    //     .tickFormat('')
    //   )

    chart.append('g')
      .attr('class', 'grid')
      .call(makeYLines()
        .tickSize(-width, 0, 0)
        .tickFormat('')
      )

    const barGroups = chart.selectAll()
      .data(data)
      .enter()
      .append('g')

    barGroups
      .append('rect')
      .attr('class', 'bar')
      .attr('x', (g) => xScale(g.key))
      .attr('y', yScale(0))
      .attr('height', 0)
      .attr('width', xScale.bandwidth())
      .on('mouseenter', function (actual, i) {
        d3.selectAll('.value')
          .attr('opacity', 0)

        d3.select(this)
          .transition()
          .duration(300)
          .attr('opacity', 0.6)
          .attr('x', (a) => xScale(a.key) - 5)
          .attr('width', xScale.bandwidth() + 10)

        const y = yScale(actual.value * 100)

        line = chart.append('line')
          .attr('id', 'limit')
          .attr('x1', 0)
          .attr('y1', y)
          .attr('x2', width)
          .attr('y2', y)

        barGroups.append('text')
          .attr('class', 'divergence')
          .attr('x', (a) => xScale(a.key) + xScale.bandwidth() / 2)
          .attr('y', (a) => yScale(a.value * 100) + 15)
          .attr('fill', '#716565')
          .attr('text-anchor', 'middle')
          .text((a, idx) => {
            const divergence = (a.value * 100 - actual.value * 100).toFixed(1)

            let text = ''
            if (divergence > 0) text += '+'
            text += `${divergence}%`

            return idx !== i ? text : '';
          })
      })
      .on('mouseleave', function () {
        d3.selectAll('.value')
          .attr('opacity', 1)

        d3.select(this)
          .transition()
          .duration(300)
          .attr('opacity', 1)
          .attr('x', (a) => xScale(a.key))
          .attr('width', xScale.bandwidth())

        chart.selectAll('#limit').remove()
        chart.selectAll('.divergence').remove()
      })
      .on('click', function(event) {
            toggleFilter('education', d3.select(this).data());
        });

    svg.selectAll('.bar')
        .transition("makeBars")
        .duration(1000)
        .attr("y", function(d) {
            return yScale(d.value * 100);
        })
        .attr("height", (g) => height - yScale(g.value * 100));

    barGroups
      .append('text')
      .attr('class', 'value')
      .attr('x', (a) => xScale(a.key) + xScale.bandwidth() / 2)
      .attr('y', (a) => yScale(a.value * 100) + 15)
      .attr('text-anchor', 'middle')
      .text((a) => (a.value * 100).toFixed(2) + '%')

    svg
      .append('text')
      .attr('class', 'label')
      .attr('x', -(height / 2) - margin)
      .attr('y', margin - 20)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .text('Percentage')

    svg.append('text')
      .attr('class', 'label')
      .attr('x', width / 2 + margin)
      .attr('y', height + margin * 1.9)
      .attr('text-anchor', 'middle')
      .text('Degree Type')


    barGroups.append("g")
    .attr("class", "brush")
    .call(d3.brushX()
        .extent([[0, height - 20], [xScale.range()[1] , height]])
        .on("end", brushended));

    function brushended() {
      if (!d3.event.sourceEvent) return; // Only transition after input.
      if (!d3.event.selection) return; // Ignore empty selections.
      var selection = d3.event.selection;
      var selected = xScale
                    .domain()
                    .filter(function(d){
                        return (selection[0] <= xScale(d)) && (xScale(d) <= selection[1])
                    });
      var filters = data.filter(function(d) { return selected.includes(d.key); } );
      toggleFilter('education', filters);
    }

}