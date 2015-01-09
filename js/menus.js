$(document).ready(intialize_menus);

var all_entries;
var menus_container;

function intialize_menus() {
    menus_container = $("#menu-list-container")[0];
    get_menus();
}

function get_menus() {
    var data = $.getJSON("http://wesapi.org/api/menus/all?maxresults=", function(res) {
        if (!(res)) {
            return {}
        } else {
            //once we get the data, call the callback
            //function to put it into the html page.
            return menu_callback(res);
        }
    })
}

//handles fetch of menus
function menu_callback(res) {
    console.log(res)
    var result_count = res["Result Count"];
    var results = res["Results"];

    var latenight = results["latenight"];
    var redandblack = results["redandblack"];
    var starandcrescent = results["starandcrescent"];
    var summerfields = results["summerfields"];
    var usdan = results["usdan"];

    // usdan, summies, weswings, latenight, red and black
    // process_usdan(usdan);
    process_summerfields(summerfields);
    // process_weswings(weswings);
    process_latenight(latenight);
    process_redandblack(redandblack);
}

function process_type1(data,title,id){
    // Processes Late Night and Summerfields data types.
    var menu_element = document.createElement("div");
    menu_element.setAttribute("id", "menu-"+id);
    var title_element = document.createElement("div");
    title_element.setAttribute("class", "title");

    // append title to menu element
    menu_element.appendChild(title_element);
    menus_container.appendChild(menu_element);

    var data_title = "Late Night";
    title_element.innerHTML = data_title;
    for (i in data) {
        var item_title_element = document.createElement("div");
        var title = data[i]["title"];
        item_title_element.innerHTML = title;
        menu_element.appendChild(item_title_element);

        var item_description_element = document.createElement("div");
        var description = data[i]["description"];
        item_description_element.innerHTML = description;
        menu_element.appendChild(item_description_element);

        var item_filter_element = document.createElement("div");
        var filter = data[i]["filter"];
        item_filter_element.innerHTML = filter;
        menu_element.appendChild(item_filter_element);

        var item_price_element = document.createElement("div");
        var price = data[i]["price"];
        item_price_element.innerHTML = price;
        menu_element.appendChild(item_price_element);
        
    }
}

function process_type2(data, title, id){
    var menu_element = document.createElement("div");
    menu_element.setAttribute("id", "menu-"+id);
    var name_element = document.createElement("div");
    name_element.setAttribute("class", "name");

    // append title to menu element
    menu_element.appendChild(name_element);
    menus_container.appendChild(menu_element);

    var data_name = "Red and Black";
    name_element.innerHTML = data_name;
    for (i in data){
        var item_name_element = document.createElement("div");
        var name = data[i]["name"];
        item_name_element.innerHTML = name;
        menu_element.appendChild(item_name_element);
    }

}


function process_latenight(data) {
    process_type1(data,"Late Night","latenight")
}

function process_summerfields(data) {
    process_type1(data,"Summerfields","summerfields")
}

function process_usdan() {};

function process_redandblack(data) {
    process_type2(data,"Red and Black","redandblack")
}

// for (i in results) {
//     var name = results[i]["name"];
//     var raw_data = results[i]["data"];
//     var filter = raw_data["filter"] ? raw_data["filter"][0] : "";
//     var price = raw_data["price"] ? raw_data["price"][0] : "";
//     var description = raw_data["description"] ? raw_data["description"][0] : "";
//     var title = raw_data["title"] ? raw_data["title"][0] : "";
// }
//var data_ul = document.createElement("ul");
/*for (d in raw_data) {
            var data = raw_data[d];
            var field_li = document.createElement("li");
            var field_title = document.createElement("div");
            var field_data = document.createElement("div");
            field_title.setAttribute("class", "field-div");
            field_data.setAttribute("class", "field-data");
            field_li.appendChild(field_title);
            field_li.appendChild(field_data);
            data_ul.appendChild(field_li);
            field_title.innerHTML = d + ": ";
            if (typeof(data) == "object") 
            {
                for (j in data) 
                {
                    var tmp = data[j] + "<br>"
                    field_data.innerHTML += tmp;
                }
            } else 
                {
                field_data.innerHTML = data;
                }
        }
    var newEntry = document.createElement("li");
        newEntry.setAttribute("class", "entry-li")

    //name
    var entryName = document.createElement("div");
    entryName.setAttribute("class", "entry-name");
    entryName.innerHTML = name;

    //data
    var entryData = document.createElement("div");
    entryData.setAttribute("class", "entry-data");
    entryData.appendChild(data_ul);
    newEntry.appendChild(entryName);
    newEntry.appendChild(entryData);
    menlist.appendChild(newEntry);

    //set 'all_entries'
        all_entries = menlist;

        //set listener for searching
        $("#menu-search").on("input", function(e) {
            if ($(this).data("lastval") != $(this).val()) {
                $(this).data("lastval", $(this).val());
                //change action
                filterEntries($(this).val())
            };
        });
}
}


function filterEntries(query) {
    // Hides entries iff !(query subset of entry name)
    curr_entries = all_entries.getElementsByClassName("entry-li");
    for (i in curr_entries) {
        if (!(curr_entries[i].children)) {
            continue;
        }
        var name = curr_entries[i].children[0].innerHTML.toLocaleLowerCase();
        //if query not in entry, hide this li element.
        if (name.indexOf(query.toLocaleLowerCase()) == -1) {
            curr_entries[i].hidden = true;
        } else {
            curr_entries[i].hidden = false;
        }
    }
}




*/
