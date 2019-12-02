

ForceDiagram = function(_parentElement, _toggleID, _twoBedroomData, _threeBedroomData ){
    this.parentElement = _parentElement;
    this.data = _twoBedroomData;
    this.displayData = _twoBedroomData;
    this.sortSelection = _toggleID;
    this.splitSelection = "all";
    this.initVis();
};

ForceDiagram.prototype.initVis = function() {
    var vis = this;

    vis.margin = { top: 20, right: 20, bottom: 20, left: 60 };
    vis.w = 960 - vis.margin.left - vis.margin.right;
    vis.h = vis.w * 1/2;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.w + vis.margin.left + vis.margin.right)
        .attr("height", vis.h + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.centerScale = d3.scalePoint().padding(1).range([0, vis.w]);
    vis.forceStrength = 0.5;

    vis.radiusScale = d3.scaleLinear()
        .range([8, 20]);

    vis.simulation = d3.forceSimulation()
        .force("collide", d3.forceCollide( function(d){
            return vis.radiusScale(d['2019-10']) + .5 }).iterations(30)
        )
        .force("charge", d3.forceManyBody().strength(10))
        .force("y", d3.forceY().y(vis.h / 2))
        .force("x", d3.forceX().x(vis.w / 2));


    // color scale for the regions: range: 9-class reds from colorbrewer
    vis.color = d3.scaleOrdinal()
        .range(["rgba(204, 82, 2, 1)", "rgb(254, 153, 41)", "rgb(254, 227, 145)"])
        .domain(["West", "Northeast", "South"]) ;

    // Add tooltip over circles
    vis.tip = d3.tip()
        .attr('class', 'd3-tip')
        .attr('id', 'forceToolTip')
        .direction('s');

    vis.setUpButtons();

    vis.wrangleData(this.sortSelection);

};

ForceDiagram.prototype.wrangleData = function(id){
    var vis = this;

    console.log("How we're splitting: " + vis.splitSelection);
    console.log("Highest or lowest: " + id);

    vis.data.forEach(function (element) {
        element['2019-10'] = +element['2019-10'];
    });

    // Sort by highest or lowest prices
    if (id == "Highest") {
        // Sort descending by price
        vis.data.sort( function(a, b){
            return b['2019-10'] - a['2019-10'];
        });
    } else {

        vis.data.sort( function(a, b){
            return a['2019-10'] - b['2019-10'];
        });
    }

    // Only grab the top 100
    var temp = [];
    var counter = 0;
    vis.data.forEach(function (element) {
        if (counter < 100) {
            temp.push(element);
        }
        counter++;
    });

    vis.displayData = temp;

    vis.radiusScale.domain(d3.extent(vis.displayData, function(d){return d['2019-10'];}));


    vis.drawDiagram();
    vis.splitBubbles("all");
};

ForceDiagram.prototype.drawDiagram = function(){
    var vis = this;

    formatComma = d3.format(",.0f");

    vis.tip
        .html(function(d) {
        return "<p><strong>" + d['City'] +
            "</p><p><strong> Cost : </strong>" + formatComma(d['2019-10']);
        });

    vis.circles = vis.svg.selectAll("circle")
        .data(vis.displayData);

    vis.circles.enter().append("circle")
        .attr("r", function(d, i){ return vis.radiusScale(d['2019-10']); })
        .attr("cx", function(d, i){
            return 175 + 25 * i + 2 * i ** 2;
        })
        .attr("cy", function(d, i){
            return 250;
        })
        .style("fill", function(d, i){
            return vis.color(d['Region']);
        })
        .merge(vis.circles)
        .call(vis.tip)
        .style("pointer-events", "all")
        .on('mouseover', vis.tip.show)
        .on('mouseout', vis.tip.hide);

    vis.circles.exit()
        .transition(d3.transition())
        .attr("r", 1e-6)
        .remove();

    function ticked() {
        vis.circles
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; });
    }

    vis.simulation
        .nodes(vis.displayData)
        .on("tick", ticked);

};

ForceDiagram.prototype.setUpButtons = function(){
    var vis = this;

    d3.selectAll('.button')
        .on('click', function () {

            d3.selectAll('.button').classed('active', false);
            var button = d3.select(this);

            button.classed('active', true);

            var buttonId = button.attr('id');

            vis.splitSelection = buttonId;

            vis.splitBubbles(buttonId);
        });

    d3.selectAll('.highlowtoggle')
        .on('click', function () {

            d3.selectAll('.highlowtoggle').classed('active', false);

            var button = d3.select(this);

            button.classed('active', true);
            var buttonId = button.attr('id');

            this.sortSelection = buttonId;

            vis.wrangleData(buttonId);
        });

};

ForceDiagram.prototype.splitBubbles = function(byVar){
    var vis = this;

    vis.centerScale.domain(vis.displayData.map(function(d){ return d[byVar]; }));

    if(byVar == "all"){
        vis.hideTitles()
    } else {
        vis.showTitles(byVar);
    }

    // @v4 Reset the 'x' force to draw the bubbles to their year centers
    vis.simulation.force('x', d3.forceX().strength(vis.forceStrength).x(function(d){
        return vis.centerScale(d[byVar]);
    }));

    // @v4 We can reset the alpha value and restart the simulation
    vis.simulation.alpha(2).restart();

};


ForceDiagram.prototype.hideTitles = function(byVar) {
    var vis = this;
    vis.svg.selectAll('.title').remove();

};

ForceDiagram.prototype.showTitles = function(byVar) {
    var vis = this;

    // Another way to do this would be to create
    // the year texts once and then just hide them.
    var titles = vis.svg.selectAll('.title')
        .data(vis.centerScale.domain());

    titles.enter().append('text')
        .attr('class', 'title')
        .merge(titles)
        .attr('x', function (d) { return vis.centerScale(d); })
        .attr('y', 40)
        .style("fill", "white")
        .attr('text-anchor', 'middle')
        .text(function (d) { return d; });

    titles.exit().remove();

};





// function groupBubbles() {
//     hideTitles();
//
//     // @v4 Reset the 'x' force to draw the bubbles to the center.
//     vis.simulation.force('x', d3.forceX().strength(vis.forceStrength).x(vis.w / 2));
//
//     // @v4 We can reset the alpha value and restart the simulation
//     vis.simulation.alpha(1).restart();
// }


