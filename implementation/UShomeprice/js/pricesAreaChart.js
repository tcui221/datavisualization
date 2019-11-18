
PricesVis = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;

    this.initVis();
};

PricesVis.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 20, right: 20, bottom: 200, left: 60 };

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

    // SVG drawing area
    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    // Scales and axes
    vis.x = d3.scaleTime()
        .range([0, vis.width]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    var formatTime = d3.timeFormat("%b %d");

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickFormat(function(d) { return formatTime(d); });

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);

    // Append a path for the area function, so that it is later behind the brush overlay
    vis.pricePath = vis.svg.append("path")
        .attr("class", "area area-prices");

    // Define the D3 path generator
    vis.area = d3.area()
        .x(function(d,index) { return vis.x(index); })
        .y0(vis.height)
        .y1(function(d) { return vis.y(d); });

    vis.area.curve(d3.curveCardinal);

    // Append axes
    vis.svg.append("g")
        .attr("class", "x-axis axis")
        .attr("transform", "translate(0," + vis.height + ")");

    vis.svg.append("g")
        .attr("class", "y-axis axis");

    // Axis titles
    vis.svg.append("text")
        .attr("x", -50)
        .attr("y", -8)
        .text("Average Prices");
    vis.svg.append("text")
        .attr("x", vis.width - 5)
        .attr("y", vis.height + 25)
        .text("Time");

    vis.wrangleData();
};


PricesVis.prototype.wrangleData = function(){
    var vis = this;

    var parseTime = d3.timeParse("%Y-%m");

    vis.wrangledData = [];
    var totalValidDates = 0;

    vis.data.forEach( function(value, index) {

        var tempDates = d3.keys(vis.data[index]);
        var tempValues = d3.values(vis.data[index]);

        var temp = [];

        for (var i = 0; i < tempDates.length; i ++) {
            temp.push({"date": tempDates[i], "value": tempValues[i]});
        }

        // console.log("temp starting");
        // console.log(temp);

        // Filtering out non-date values
        temp.forEach(function (item, index) {
            item['date'] = parseTime(item['date']);
            item['value'] = +item['value'];
        });

        temp = temp.filter(function (item, index) {
            return (item['date'] != null);
        });

        vis.wrangledData.push(temp);
    });

    console.log(vis.wrangledData);
    // console.log(totalValidDates);


    // Prepare empty array
    var averagePricePerYear = d3.range(0, totalValidDates - 1).map(function() {
        return 0;
    });

    // Iterate over each day and fill array
    // vis.wrangledData.forEach(function(d){
    //     d3.range(0, totalValidDates - 1).forEach(function(i){
    //         // console.log(d);
    //         averagePricePerYear[i] += d[i];
    //     });
    // });

    vis.displayData = averagePricePerYear;

    // vis.updateVis();
};


PricesVis.prototype.updateVis = function(){
    var vis = this;

    vis.y.domain(d3.extent(vis.displayData));

    vis.pricePath
        .datum(vis.displayData)
        .transition()
        .attr("d", vis.area);

    vis.svg.select(".x-axis").call(vis.xAxis);
    vis.svg.select(".y-axis").call(vis.yAxis);
};


PricesVis.prototype.onSelectionChange = function(selectionStart, selectionEnd){
    var vis = this;

    // Filter original unfiltered data depending on selected time period (brush)
    vis.filteredData = vis.data.filter(function(d){
        return d.time >= selectionStart && d.time <= selectionEnd;
    });

    vis.wrangleData();
};
