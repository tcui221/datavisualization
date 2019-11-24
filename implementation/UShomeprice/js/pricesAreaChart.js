
PricesVis = function(_parentElement, _data){
    this.parentElement = _parentElement;
    this.data = _data;
    this.filteredData = this.data;

    this.initVis();
};

PricesVis.prototype.initVis = function(){
    var vis = this;

    vis.margin = { top: 20, right: 60, bottom: 200, left: 60 };

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

    var formatTime = d3.timeFormat("%b, %Y");
    var formatMillions = d3.format(".2s");

    vis.xAxis = d3.axisBottom()
        .scale(vis.x)
        .tickFormat(function(d) { return formatTime(d); });

    vis.yAxis = d3.axisLeft()
        .scale(vis.y)
        .tickFormat(function(d) {
            console.log(d);
            return formatMillions(d); });

    // Append a path for the area function, so that it is later behind the brush overlay
    vis.pricePath = vis.svg.append("path")
        .attr("class", "area area-prices");

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
        .attr("x", vis.width - 400)
        .attr("y", vis.height + 45)
        .text("Time");

    vis.wrangleData();
};


PricesVis.prototype.wrangleData = function(){
    var vis = this;

    var parseTime = d3.timeParse("%Y-%m");
    vis.wrangledData = [];

    vis.data.forEach( function(value, index) {

        var tempDates = d3.keys(vis.data[index]);
        var tempValues = d3.values(vis.data[index]);

        var temp = [];

        for (var i = 0; i < tempDates.length; i ++) {
            temp.push({"date": tempDates[i], "value": tempValues[i]});
        }

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


    // Prepare empty array
    var averagePricePerYear = vis.wrangledData[0];

    // Iterate over each day and fill array
    vis.wrangledData.forEach(function(d){
        d3.range(0, 281).forEach(function(i){
            averagePricePerYear[i]['value'] += d[i]['value'];
        });
    });

    vis.displayData = averagePricePerYear;

    console.log(vis.displayData);

    vis.updateVis();
};


PricesVis.prototype.updateVis = function(){
    var vis = this;

    // Update domains
    vis.x.domain(d3.extent(vis.displayData, function(d) {
        return d['date'];
    }));

    vis.y.domain(d3.extent(vis.displayData, function(d) {
        return d['value'];
    }));

    // Define the D3 path generator
    vis.area = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d, index) { return vis.x(d['date']); })
        .y0(vis.height)
        .y1(function(d) { return vis.y(d['value']); });

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
    // vis.filteredData = vis.data.filter(function(d){
    //     return d.time >= selectionStart && d.time <= selectionEnd;
    // });

    vis.wrangleData();
};
