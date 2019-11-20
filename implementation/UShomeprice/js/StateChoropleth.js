/*
 * choro - Object constructor function
 * @param _parentElement 	-- the HTML element in which to draw the visualization
 * @param _map              -- GeoJson for US data, source: https://eric.clst.org/tech/usgeojson/
 * @param _home             -- csv data for median home value per sq ft, source: https://www.zillow.com/research/data/
 */

USchoropleth_State = function(_parentElement, _map, _home){
    this.parentElement = _parentElement;
    this.USmapJson = _map;
    this.homeValue = _home;
    this.displayData = []; // see data wrangling
    this.attributeArray = [];
    this.currentAttribute = 0;
    this.playing = false;
    this.zoomed = false;

    // DEBUG RAW DATA
    // console.log(this.USmapJson);
    // console.log(this.homeValue);

    this.initVis();
    this.animateMap();
};


/*
 * Initialize visualization (static content, e.g. SVG area or axes)
 */

USchoropleth_State.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 40, right: 60, bottom: 60, left: 60};
    vis.padding = 20;

    vis.width = 900 - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Create a projection and specify it in a new geo path generator
    vis.projection = d3.geoAlbersUsa()
        .translate([vis.width / 2, vis.height / 2])
        .precision(0)
        .scale(vis.height * 2);
    // .scale(1000)
    // .scale(vis.height * 2).translate([vis.width / 2, vis.height / 2]);

    vis.path = d3.geoPath()
        .projection(vis.projection);

    // create color scale for the choropleth: range: 9-class reds from colorbrewer
    vis.color = d3.scaleQuantize()
        .range(colorbrewer.YlOrBr[9]);

    vis.x = d3.scaleTime()
        .range([0, vis.width]);
        // .domain([0,281]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(20, -10) ");

    vis.parseTime = d3.timeParse("%Y-%m");

    vis.wrangleData();
};

USchoropleth_State.prototype.wrangleData = function() {
    var vis = this;

    for (var i in vis.USmapJson.features) {    // for each geometry object
        for (var j in vis.homeValue) {  // for each row in the CSV

            // 'RegionName' in the csv is the same as the 'NAME' in the GeoJSON
            if (vis.USmapJson.features[i].properties.NAME == vis.homeValue[j].RegionName) {   // if they match
                // console.log(vis.USmapJson.features[i].properties.NAME);
                for (var k in vis.homeValue[j]) {   // for each column in the a row within the CSV

                    // we do not want to add this attributes to the properties
                    if(k != 'RegionID' && k != 'RegionName' && k != 'SizeRank') {
                        if(vis.attributeArray.indexOf(k) == -1) {
                            vis.attributeArray.push(k);  // add new column headings to our array for later
                        }
                        vis.USmapJson.features[i].properties[k] = Number(vis.homeValue[j][k])  // add each CSV column key/value to geometry object
                    }
                }
                break;  // stop looking through the CSV since we made our match
            }

        }
    }

    // console.log(vis.USmapJson);
    d3.select('#clock').html(vis.attributeArray[vis.currentAttribute].substring(0,4));  // populate the clock initially with the current year
    vis.drawMap();  // render the map now with the newly populated data object
};

USchoropleth_State.prototype.drawMap = function() {
    var vis = this;

    vis.x
        .domain(d3.extent(vis.attributeArray, function(d){return vis.parseTime(d);}))

    console.log(vis.USmapJson.features);
    console.log(d3.extent(vis.attributeArray, function(d){return vis.parseTime(d);}))
    console.log(vis.x(vis.parseTime(vis.attributeArray[vis.currentAttribute+1])));


    vis.svg.select(".x-axis").call(vis.xAxis);

    vis.timeline = vis.svg.append("image")
        .data(vis.USmapJson.features)
        .attr("xlink:href", "img/icon-house.png")
        .attr("class", "icon")
        .attr("width", 50)
        .attr("height", 50)
        .attr("y", -40)
        .attr("x", vis.x(vis.parseTime(vis.attributeArray[vis.currentAttribute])));


    vis.countyPaths = vis.svg.selectAll(".county")
        .data(vis.USmapJson.features)
        .enter().append("path")
        .attr("class", "county")
        .attr("id", function(d) { return "code_" + d.properties.GEO_ID; }, true)  // give each a unique id for access later
        .attr("d", vis.path)
        .on('click', function (d) {
            if (!vis.zoomed) {
                vis.zoomed = true;
                vis.stateZoom(d.properties.GEO_ID);
            } else {
                vis.zoomed = false;
                vis.usZoom();
            }
        });

    var dataRange = vis.getDataRange(); // get the min/max values from the current year's range of data values

    d3.selectAll('.county')  // select all the countries
        .attr('fill', function(d) {
            var value = d.properties[vis.attributeArray[vis.currentAttribute]];
            if (value) {
                //If value exists…
                return vis.getColor(value, dataRange);
            } else {
                //If value is undefined…
                return "#FFFFFF";
            }
        });


};

USchoropleth_State.prototype.getColor = function(value, values_list) {
    var vis = this;
    vis.color
        .domain([values_list[0],values_list[1]]) ; // input uses min and max values

    return vis.color(value);  // return that number to the caller
};

USchoropleth_State.prototype.getDataRange = function() {
    // function loops through all the data values from the current data attribute
    // and returns the min and max values
    var vis = this;

    var min = Infinity, max = -Infinity;
    d3.selectAll('.county')
        .each(function(d,i) {
            var currentValue = d.properties[vis.attributeArray[vis.currentAttribute]];
            if(currentValue <= min && currentValue != -99 && currentValue != 'undefined') {
                min = currentValue;
            }
            if(currentValue >= max && currentValue != -99 && currentValue != 'undefined') {
                max = currentValue;
            }
        });
    return [min,max];

};

USchoropleth_State.prototype.sequenceMap = function() {
    var vis = this;

    // console.log(this.data);

    var dataRange = vis.getDataRange(); // get the min/max values from the current year's range of data values
    d3.selectAll('.county').transition()  //select all the countries and prepare for a transition to new values
        .duration(200)  // give it a smooth time period for the transition
        .attr('fill', function(d) {
            console.log(vis.x(vis.parseTime(vis.attributeArray[vis.currentAttribute])));
            var value = d.properties[vis.attributeArray[vis.currentAttribute]];
            if (value) {
                //If value exists…
                return vis.getColor(value, dataRange); //the end color value
            } else {
                //If value is undefined…
                return "#FFFFFF";
            }
        });

    d3.select('.icon').transition()
        .duration(200)
        // .attr('y', -20)
        .attr('x', vis.x(vis.parseTime(vis.attributeArray[vis.currentAttribute])));
};

USchoropleth_State.prototype.animateMap = function() {
    var vis = this;

    var timer;  // create timer object
    d3.select('#play')
        .on('click', function() {  // when user clicks the play button
            if(vis.playing == false) {  // if the map is currently playing
                timer = setInterval(function(){   // set a JS interval
                    if(vis.currentAttribute < vis.attributeArray.length-1) {
                        vis.currentAttribute +=1;  // increment the current attribute counter
                    } else {
                        vis.currentAttribute = 0;  // or reset it to zero

                        d3.select('.icon')
                            .transition()
                            .duration(0)
                            .attr("x", 0);
                    }
                    vis.sequenceMap();  // update the representation of the map
                    d3.select('#clock').html(vis.attributeArray[vis.currentAttribute].substring(0,4));  // update the clock
                }, 200);

                d3.select(this).html('stop');  // change the button label to stop
                vis.playing = true;   // change the status of the animation
            } else {    // else if is currently playing
                clearInterval(timer);   // stop the animation by clearing the interval
                d3.select(this).html('play');   // change the button label to play
                vis.playing = false;   // change the status again
            }
        });
};

/*
 * See entire US map
 */

USchoropleth_State.prototype.usZoom = function() {
    var vis = this;

    var t = d3.transition().duration(800);

    vis.projection.scale(vis.height * 2).translate([vis.width / 2, vis.height / 2]);

    vis.countyPaths.transition(t)
        .attr('d', vis.path);
};

/*
 * Zoom in to a state
 */

USchoropleth_State.prototype.stateZoom = function(id) {
    var vis = this;

    var state = vis.USmapJson.features.find(function (d) { return d.properties.GEO_ID === id });

    var t = d3.transition().duration(800);

    vis.projection.fitExtent(
        [[vis.padding, vis.padding], [vis.width - vis.padding, vis.height - vis.padding]],
        state
    );

    vis.countyPaths.transition(t)
        .attr('d', vis.path);
};



