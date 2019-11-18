
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

    var parseTime = d3.timeParse("%Y-%m");

    var years = [];

    var temp = d3.keys(vis.data[0]);
    temp.forEach( function(value, index) {
        // This is how i'm filtering out non-date values
        value = parseTime(value);

        if (value != undefined) { years.push(value);}
    });

    console.log(years);

    // Scales and axes
    vis.x = d3.scaleLinear()
        .range([0, vis.width])
        .domain([0,99]);

    vis.y = d3.scaleLinear()
        .range([vis.height, 0]);

    vis.xAxis = d3.axisBottom()
        .scale(vis.x);

    vis.yAxis = d3.axisLeft()
        .scale(vis.y);


    // Append a path for the area function, so that it is later behind the brush overlay
    vis.agePath = vis.svg.append("path")
        .attr("class", "area area-age");

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
        .text("Votes");
    vis.svg.append("text")
        .attr("x", vis.width - 5)
        .attr("y", vis.height + 25)
        .text("Age");

    // (Filter, aggregate, modify data)
    // vis.wrangleData();
};


PricesVis.prototype.wrangleData = function(){
    var vis = this;

    // Here you want to aggregate the data by age, not by day (as it is given)!
    // Prepare empty array
    var averagePricePerYear = d3.range(0,99).map(function() {
        return 0;
    });

    // Aggregate by category:
    // Iterate over each day and fill array
    vis.filteredData.forEach(function(day){
        d3.range(0,99).forEach(function(i){
            votesPerAge[i] += day.ages[i];
        });
    });

    // Set data to visualize
    vis.displayData = votesPerAge;

    // Update the visualization
    vis.updateVis();
};


PricesVis.prototype.updateVis = function(){
    var vis = this;

    // Update domains
    vis.y.domain(d3.extent(vis.displayData));


    // Call the area function and update the path
    // D3 uses each data point and passes it to the area function.
    // The area function translates the data into positions on the path in the SVG.
    vis.agePath
        .datum(vis.displayData)
        .transition()
        .attr("d", vis.area);


    // Call axis function with the new domain
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
