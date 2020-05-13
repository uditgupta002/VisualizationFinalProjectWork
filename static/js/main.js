
//Global list for all the views to reference
var filters_list = {};
var current_data = null;
var backend_data_url = "http://localhost:5000/data";

// On start of the application fetch the data and then render all the views.
window.onload = function() {
    fetchAndRender();
};

//Filter logic to be called by other views
function toggleFilter(key, valueList) {
    //Search if the filter already exists and if so, remove the filter and refresh the views.
    // Else add the new filter to filters_list and fetch new filtered data.
    var current_filters_for_key = null;
    var newValues = valueList.map(function(d) { return d.key; });
    if(key in filters_list) {
        current_filters_for_key = filters_list[key];
        var newList = [];
        newValues.forEach(function(newValue) {
            if(!(current_filters_for_key.includes(newValue))) {
                newList.push(newValue);
            }
        });
        current_filters_for_key.forEach(function(oldValue) {
            if(!(newValues.includes(oldValue))) {
                newList.push(oldValue);
            }
        });
        current_filters_for_key = newList;
    } else {
        current_filters_for_key = valueList.map(function(d) { return d.key; });
    }
    //Update filter values for the sent key
    if(current_filters_for_key.length > 0)
        filters_list[key] = current_filters_for_key;
    else {
        delete filters_list[key];
    }
    //Refresh Views with new data
    fetchAndRender(filters_list);
}

function fetchAndRender(filterJSON = {}) {

    //Call the backend asynchronously to get the data with appropriate filters applied
    var response = fetch(backend_data_url, {
        method: 'POST',
        cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(filterJSON) // body data type must match "Content-Type" header
    })
    .then(response => response.json())
    .then(data => refreshViews(data));
}

function refreshViews(updatedDataJson) {
    //Refresh all the views and summary numbers
    render_pie_chart(updatedDataJson['gender']);
    render_education_graph(updatedDataJson['education']);
    render_age_graph(updatedDataJson['age_group']);
    render_job_title_dist(updatedDataJson['job_title']);
    render_primary_tool_dist(updatedDataJson['primary_tool_used']);


    //Refresh the Summary headers
    $('#total_responders_count').html(updatedDataJson['total_responders']);
    $('#average_experience_level').html(updatedDataJson['years_in_ml']);
    $('#average_company_size').html(updatedDataJson['size_of_company']);

    //Animate the numbers
    $('.summary_numbers').each(function () {
        $(this).prop('Counter',0).animate({
            Counter: $(this).text()
        }, {
            duration: 1000,
            easing: 'swing',
            step: function (now) {
                $(this).text(Math.ceil(now));
            }
        });
    });
}


function sym(args) {
  var arr = Array.from(arguments);
  arr = arr.reduce(function(a, b) {
    var aNotB = a.filter(function(val) { return !b.includes(val); });
    var bNotA = b.filter(function(val) { return !a.includes(val); });
    return aNotB.concat(bNotA);
  });
  return arr.filter(function(value, index, self) {
    return self.indexOf(value) === index;
  });
}