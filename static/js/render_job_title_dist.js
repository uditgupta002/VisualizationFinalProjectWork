function render_job_title_dist(data) {

    const width = $('#job_title_chart').width();
    const height = $('#job_title_chart').height();

    frequency_list = [];
    for(element in data) {
        frequency_list.push({"text": element,
            "size": data[element],
            "href" : "https://www.google.com/search?q=" + element
        });
    }

    d3.select('#job_title_chart').selectAll('svg').remove();

    d3.wordcloud()
        .selector("#job_title_chart")
        .size([width, height])
        .fill(d3.scaleOrdinal().range(d3.schemeCategory10))
        .rotate(function() { return ~~(Math.random() * 2) * 90; })
        .words(frequency_list)
        .onwordclick(function(d, i) {
            //if (d.href) { window.open(d.href); }
            toggleFilter('job_title', [{'key' : d.text}]);
    })
    .start();
}