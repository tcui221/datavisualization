/* USchoropleth */


// --> CREATE SVG DRAWING AREA
var width = 800,
    height = 500;

// Create an SVG area (width: 1000px, height: 600px)
var svg = d3.select("#US-choropleth").append("svg")
    .attr("width", width)
    .attr("height", height);

// Create a projection and specify it in a new geo path generator
var projection = d3.geoAlbersUsa()
    .translate([width / 2, height / 2])
    .scale(500);

var path = d3.geoPath()
    .projection(projection);

// create color scale for the choropleth: range: 9-class reds from colorbrewer
var color = d3.scaleQuantize()
    .range(colorbrewer.YlOrBr[9]);

// Use the Queue.js library to read two files
queue()
    // geoJSON data is obtained from https://eric.clst.org/tech/usgeojson/
    .defer(d3.json, "data/USgeojson.json")
    // .defer(d3.csv, "data/global-malaria-2015.csv")
    .await(function(error, USmapJson){

        // --> PROCESS DATA
        console.log(USmapJson);


        // 'MunicipalCodeFIPS' in the csv is the same as the 'County' number in the GeoJSON


        // convert topoJson to GeoJson
        console.log(USmapJson);


        window.map = USmapJson;

        // updateChoropleth();

        svg.selectAll("path")
            .data(USmapJson.features)
            .enter().append("path")
            .attr("d", path)
            .attr("fill", function(d) {
                var value = d.properties['CENSUSAREA'];

                if (value) {
                    //If value exists…
                    return color(value);
                } else {
                    //If value is undefined…
                    return "#FFFFFF";
                }
            })
            .attr("stroke", "black");

    });



function updateChoropleth() {

    // retrieving the chosen metric
    var metrics = d3.select("#metric-type").property("value");

    // updating the color scale domain and legend labels formatting, depending on the metric chosen
    if (metrics === 'risk' || metrics === 'high_risk') {
        color.domain([0, 1]); // percentage values goes from 0-100%
        var legendformat = percentformat;
    }
    else {
        color.domain([0, d3.max(map, function(d) { return d.properties[metrics]; })])
        var legendformat = popformat;
    }

    // setting the title for the legend based on the metric chosen
    if (metrics == 'risk') {var legentitle = 'Percentage of the population at risk for malaria';}
    else if (metrics == 'high_risk') {var legentitle = 'Percentage of the population at high risk for malaria';}
    else if (metrics == 'UN_population') {var legentitle = "Country's population";}
    else if (metrics == 'malaria_cases') {var legentitle = 'Number of diagnosed cases of malaria';}
    else {var legentitle = 'Number of suspected cases of malaria';}

    // --> Choropleth implementation
    d3.select("#chart-choropleth")
        .selectAll("path")
        .remove();

    // Render the africa map by using the path generator
    svg.selectAll("path")
        .data(map)
        .enter().append("path")
        .attr("d", path)
        .attr("fill", function(d) {
            var value = d.properties[metrics];

            if (value) {
                //If value exists…
                return color(value);
            } else {
                //If value is undefined…
                return "#FFFFFF";
            }
        })
        .attr("stroke", "black")

        // rollover functionality to display tool tips
        .on("mouseover", function (d) {
            var value = d.properties[metrics];

            if (value) {
                tip.show(d)
                d3.select(this)
                    .transition().duration(200)
                    .style("fill", "grey");
            }

        })
        .on("mouseout", function () {
            tip.hide()
            d3.select(this)
                .transition().duration(200)
                .style("fill",
                    function (d) {
                        return color(d.properties[metrics]);
                    });
        });


    // legend (color scale) implementation

    svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(200,300)");

    var legendOrdinal = d3.legendColor()
        .cells(10)
        .shapePadding(0)
        .labelFormat(legendformat)
        .title(legentitle)
        .titleWidth(200)
        .scale(color);

    svg.select(".legendOrdinal")
        .style("font-size","12px")
        .style("fill", "white")
        .call(legendOrdinal);

    // create tooltip
    var tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([0, 10])
        .html(function (d) {

            return "<span class ='toolTipHead'><b>Country: " + d.properties.name + "</b><br/>" +
                "Population: " + popformat(d.properties.UN_population) + "<br/>" +
                "%population at risk: " + percentformat(d.properties.risk) + "<br/>" +
                "%population at high risk: " + percentformat(d.properties.high_risk) + "<br/>" +
                "malaria cases: " + popformat(d.properties.malaria_cases) + "<br/>" +
                "suspected malaria cases: " + popformat(d.properties.suspected_cases) + "</span>";
        })

    svg.call(tip);

}