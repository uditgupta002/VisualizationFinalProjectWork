function render_viz_lib_dist(data) {

    const width = $('#level_of_work').width();
    const height = $('#level_of_work').height();

    frequency_list = [];
    for(element in data) {
        frequency_list.push({"text": element,
            "size": data[element],
            "href" : "https://www.google.com/search?q=" + element
        });
    }

    d3.select('#level_of_work').selectAll('svg').remove();

    d3.wordcloud()
        .selector("#level_of_work")
        .size([width, height])
        .fill(d3.scaleOrdinal().range(d3.schemeCategory10))
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .words(frequency_list)
        .onwordclick(function(d, i) {
            if (d.href) { window.open(d.href); }
    })
    .start();
}