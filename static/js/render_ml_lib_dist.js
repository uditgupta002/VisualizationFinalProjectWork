function render_ml_lib_dist(data) {

    const width = $('#ml_libraries_dist').width();
    const height = $('#ml_libraries_dist').height();

    frequency_list = [];
    for(element in data) {
        frequency_list.push({"text": element,
            "size": data[element],
            "href" : "https://www.google.com/search?q=" + element
        });
    }

    d3.select('#ml_libraries_dist').selectAll('svg').remove();

    d3.wordcloud()
        .selector("#ml_libraries_dist")
        .size([width, height])
        .fill(d3.scaleOrdinal().range(d3.schemeCategory10))
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .words(frequency_list)
        .onwordclick(function(d, i) {
            if (d.href) { window.open(d.href); }
    })
    .start();
}