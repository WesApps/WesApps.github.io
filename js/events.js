$(document).ready(initialize_events);

var event_data = [];
var categories = [];
var color_array = [];
var previous_selection;
var display_event;
var current_sort = "date";
var filters = {};
filters.today = false;
filters.past = true;
filters.query = "";

function initialize_events() {
    get_events();
}

function get_events() {
    var data = $.getJSON("http://104.131.29.221/api/events/latest", function(res) {
        if (!(res)) {
            return {};
        } else {
            return events_callback(res);
        }
    })
}

//handles successful fetch of events
function events_callback(res) {
    var result_count = res["Result Count"];
    var results = res["Results"];
    var m_names = new Array("January", "February", "March",
        "April", "May", "June", "July", "August", "September",
        "October", "November", "December");
    //display results
    for (i in results) {
        var name = results[i]["name"];
        var category = results[i]["category"];
        var description = results[i]["description"];
        var link = results[i]["link"];
        var source = results[i]["source"];
        var time = results[i]["time"];
        var location = results[i]["location"];

        //Add category to set of categories
        if (categories.indexOf(category) == -1) {
            categories.push(category);
        }

        //Process time/date
        time = time.replace("T", " ");
        var date = new Date(Date.parse(time));
        var curr_day = date.toString().split(" ")[0];
        var curr_date = date.getDate();
        var curr_month = date.getMonth();
        var time_str = date.toLocaleString().split(" ");
        time_str.splice(0, 1);
        tmp_time = time_str[0];
        tmp_time = tmp_time.split(":")
        tmp_time.splice(2, 1);
        time_str[0] = tmp_time.join(":");
        time = curr_day + ", " + m_names[curr_month] + " " +
            curr_date + ", " + time_str.join(" ");
        date_tomorrow = new Date(date);
        date_tomorrow.setDate(date.getDate() + 1);

        event_data[i] = {
            "name": name,
            "category": category,
            "description": description,
            "link": link,
            "source": source,
            "time": time,
            "date": date,
            "date_tomorrow": date_tomorrow,
            "location": location
        };
    }
    color_array = coloring(categories.length).sort();
    populate_list(event_data);
    // set listeners
    set_listeners();


    //populate event display with either today's event or if not
    //today's then the closest event to today (looking forwards)
    populate_event_display(display_event);
}

function create_header(inner) {
    var hdr_tr = document.createElement("tr");
    hdr_tr.setAttribute("class", "header-tr");
    var hdr_td = document.createElement("td");
    hdr_td.setAttribute("colspan", 2);
    hdr_td.innerHTML = inner;
    hdr_tr.appendChild(hdr_td);
    return hdr_tr
}

function populate_list(events) {
    //Populates list with events and initializes
    //events display with an event
    var events_list = $("#events-list")[0];
    var dateObj = new Date();
    var day = dateObj.getDate();
    var month = dateObj.getMonth();
    var today = new Date(dateObj.getFullYear(), month, day);
    var prev_header;

    for (i in events) {

        var curr_event = events[i];

        //set category/date header
        if (current_sort == "date") {
            var tmp = curr_event["date"]
            var day = tmp.getDate();
            var month = tmp.getMonth();
            var year = tmp.getFullYear();
            var tmpDate = new Date(year, month, day);
            if (!(prev_header) || (prev_header.toString() != tmpDate.toString())) {
                //Display new header if appropriate
                prev_header = tmpDate
                events_list.appendChild(create_header(prev_header.toString().split(" ").splice(0, 3).join(" ")));
            }
        }


        var tr = document.createElement("tr");
        tr.setAttribute("class", "event-tr");
        var cat_td = document.createElement("td");

        cat_td.setAttribute("class", "cat_color");
        tr.appendChild(cat_td);
        // Set color by category
        var cat_index = categories.indexOf(curr_event["category"]);
        var b_color;
        if (cat_index == -1) {
            b_color = color_array[0];
        } else {
            b_color = color_array[cat_index];
        }
        cat_td.style.background = "#" + b_color;

        var entry = document.createElement("td");
        entry.setAttribute("class", "event-entry-container");
        entry.setAttribute("id", "event_" + i);
        curr_event["id"] = "event_" + i;
        tr.appendChild(entry);
        events_list.appendChild(tr);

        var name = document.createElement("div");
        name.setAttribute("class", "event-entry-name");
        name.innerHTML = curr_event["name"];
        entry.appendChild(name);

        var time = document.createElement("div");
        time.setAttribute("class", "event-entry-time");
        time.innerHTML = curr_event["time"];
        entry.appendChild(time);



        //Grab first event
        if (!(display_event)) {
            display_event = curr_event;
        }

        //If curr event is more than a day old, hide it.
        if (curr_event["date_tomorrow"] < today) {
            entry.hidden = true;
        }

        //if curr event is ever today, it wins!
        if (curr_event["date"].toDateString() == today.toDateString()) {
            display_event = curr_event;
            continue;
        }
        //otherwise get the closest event
        if ((curr_event["date"] - today) >= 0) {
            if (Math.abs((curr_event["date"] - today)) < (Math.abs((display_event["date"]) - today))) {
                display_event = curr_event;
            }
        }
    }
    filter_headers();
}

function populate_event_display(d_event) {
    //populates the event display area with the event data given
    $("#event-display-title")[0].innerHTML = d_event["name"];
    $("#event-display-time")[0].innerHTML = "<b>When: </b>" + d_event["time"];
    if (d_event["link"]) {
        $("#event-display-link")[0].hidden = false;
        $("#event-display-link")[0].innerHTML = "Read on " + d_event["source"];
        $("#event-display-link")[0].href = d_event["link"];
    } else {
        $("#event-display-link")[0].hidden = true;
        $("#event-display-link")[0].href = "";
        $("#event-display-link")[0].innerHTML = "";
    }
    $("#event-display-category")[0].innerHTML = "<b>Category: </b>" + d_event["category"];

    if (d_event["location"]) {
        $("#event-display-location")[0].hidden = false;
        $("#event-display-location")[0].innerHTML = "<b>Where: </b>" + d_event["location"];
    } else {
        $("#event-display-location")[0].hidden = true;
    }
    $("#event-display-description")[0].innerHTML = d_event["description"];

    var current_event_element = $("#" + d_event["id"])[0];

    //if previously selected element, clear
    if (previous_selection) {
        previous_selection.style.background = "";
    }

    //set the class of the current event element in table to active
    current_event_element.style.background = "rgba(255, 83, 83, 0.18)";

    //scroll to event element in table
    current_event_element.scrollIntoViewIfNeeded();

    previous_selection = current_event_element;
}

function get_event_by_id(id) {
    //returns an event by it's event id
    for (i in event_data) {
        if (event_data[i]["id"] == id) {
            return event_data[i];
        }
    }
}

function set_row_click() {

    $(".event-entry-container").click(function(ev) {
        var lookup_id = ev.currentTarget.id;
        var current_event = get_event_by_id(lookup_id);
        populate_event_display(current_event);
    })
}

function set_listeners() {
    set_row_click();

    //on click for only today button
    $("#show-today").click(function(ev) {
        filters.today = !(filters.today);
        if (filters.today) {
            $("#show-today")[0].className = "btn-active";
        } else {
            $("#show-today")[0].className = "btn-inactive";
        }
        filter_entries();
    })

    //on click for show past button
    $("#show-past").click(function(ev) {
        filters.past = !(filters.past);
        if (!(filters.past)) {
            $("#show-past")[0].className = "btn-active";
        } else {
            $("#show-past")[0].className = "btn-inactive";
        }
        filter_entries();
    })

    //on click for sort date button
    $("#sort-date").click(function(ev) {
        if (current_sort == 'date') {
            return;
        }
        current_sort = 'date';
        $("#sort-date")[0].className = "btn-active";
        $("#sort-category")[0].className = "btn-inactive";
        sort_entries('date');
    })

    //on click for sort category button
    $("#sort-category").click(function(ev) {
        if (current_sort == 'category') {
            return;
        }
        current_sort = 'category';
        $("#sort-category")[0].className = "btn-active";
        $("#sort-date")[0].className = "btn-inactive";
        sort_entries('category');
    })

    // set listener for search
    $("#events-search").on("input", function(e) {
        if ($(this).data("lastval") != $(this).val()) {
            $(this).data("lastval", $(this).val());
            //change action
            filters.query = $(this).val()
            filter_entries()
        };
    });
}

function filter_entries() {
    // Hides entries iff !(query subset of entry name)
    var curr_entries = document.getElementsByClassName("event-entry-container");
    var dateObj = new Date();
    var day = dateObj.getDate();
    var month = dateObj.getMonth();
    var today = new Date(dateObj.getFullYear(), month, day);
    for (i in curr_entries) {
        if (!(curr_entries[i].children)) {
            continue;
        }
        var name = curr_entries[i].children[0].innerHTML.toLocaleLowerCase();
        var ev_id = curr_entries[i].id;
        curr_event = get_event_by_id(ev_id);
        //if filters.today, check if event time is today, else if hidden show it.
        //this may be overridden by the query filters
        if (filters.today) {
            if (curr_event["date"].toDateString() != today.toDateString()) {
                curr_entries[i].hidden = true;
                continue;
            }
        } else {
            curr_entries[i].hidden = false;
        }

        //if filters.past, check if event time + 24 hours is < today, else if hidden show it.
        //this may be overridden by the query filters
        if (filters.past) {
            if (curr_event["date_tomorrow"] < today) {
                curr_entries[i].hidden = true;
                continue;
            }
        } else {
            curr_entries[i].hidden = false;
        }

        if (filters.query) {
            //if query not in entry, hide this li element.
            if (name.indexOf(filters.query.toLocaleLowerCase()) == -1) {
                curr_entries[i].hidden = true;
            } else {
                curr_entries[i].hidden = false;
            }
        }
    }
    filter_headers();
}

function filter_headers() {
    //Now filter out any section headers that have no real rows in them
    var headers = document.getElementsByClassName("header-tr");
    for (i = 0; i < headers.length; i++) {
        var curr_header = headers[i];
        var next = curr_header.nextElementSibling;
        //go through all next siblings until they are no longer
        //events or one of them is not hidden 
        var hide = true;
        while (next.className == "event-tr") {
            if (!(next.getElementsByClassName('event-entry-container')[0].hidden)) {
                hide = false;
            }
            next = next.nextElementSibling;
            if (!(next)) {
                break;
            }
        }
        curr_header.hidden = hide;
        // var next = curr_header.nextElementSibling;
        // console.log(next.getElementsByClassName('event-entry-container'))
        // if (next.getElementsByClassName('event-entry-container')[0].hidden) {
        // console.log("hello")
    }
}

function sort_entries(type) {
    //sorts entries by:
    //'category' or 'date'

    if (type == "category") {
        event_data.sort(function(a, b) {
            var textA = a.category.toUpperCase();
            var textB = b.category.toUpperCase();
            return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
        });

    } else if (type == "date") {
        event_data.sort(function(a, b) {
            var textA = a.date;
            var textB = b.date
            return (textA > textB) ? -1 : (textA < textB) ? 1 : 0;
        });
    }
    //Remove old events list 
    $("#events-list")[0].innerHTML = "";

    //populate
    populate_list(event_data);

    set_row_click()

    //filter
    filter_entries();

}

function coloring(num_colors) {
    // Uses color-scheme.js to output a color scheme of length
    // num_colors to color-code categories.
    // Since we have an arbitrary number of categories but are limited to 16 colors 
    // by the ColorScheme lib, we'll assume we only have <= 16 categories,
    // which is a fair assumption. 
    // Constraint: want to match num_colors with color scheme closest in size.

    var starting_hue = 50;
    var scheme;
    var variation = 'pastel';

    if (num_colors <= 4) {
        num_colors <= 4;
        scheme = 'mono';
    } else if (num_colors <= 12) {
        scheme = 'triade';
    } else {
        num_colors <= 16;
        scheme = 'tetrade';
    }


    scm = new ColorScheme;
    scm.from_hue(starting_hue)
        .scheme(scheme)
        .distance(0.2)
        .add_complement(false)
        .variation(variation)
        .web_safe(true);

    var colors = scm.colors();
    return colors;
}
