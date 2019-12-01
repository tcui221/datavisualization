

ForceDiagram = function(_parentElement, _toggleID, _twoBedroomData, _threeBedroomData ){
    this.parentElement = _parentElement;
    this.data = _twoBedroomData;
    this.displayData = _twoBedroomData;
    console.log("Force diagram data");
    this.toggleID = _toggleID;
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

    vis.radius = 8;
    vis.color = d3.scaleOrdinal(d3.schemeCategory20);
    vis.centerScale = d3.scalePoint().padding(1).range([0, vis.w]);
    vis.forceStrength = 0.5;

    vis.simulation = d3.forceSimulation()
        .force("collide",d3.forceCollide( function(d){
            return vis.radius + 2 }).iterations(10)
        )
        .force("charge", d3.forceManyBody().strength(-10))
        .force("y", d3.forceY().y(vis.h / 2))
        .force("x", d3.forceX().x(vis.w / 2));


    vis.wrangleData(this.toggleID);

};

ForceDiagram.prototype.wrangleData = function(id){
    var vis = this;

    vis.data.forEach(function (element) {
        element['2019-10'] = +element['2019-10'];
    });

    // Sort by highest or lowest prices
    if (id == "Highest") {
        // console.log("Highest");
        // Sort descending by price
        vis.data.sort( function(a, b){
            return b['2019-10'] - a['2019-10'];
        });
    } else {

        // console.log("Lowest");
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

    vis.drawDiagram();
};

ForceDiagram.prototype.drawDiagram = function(){
    var vis = this;

    vis.circles = vis.svg.selectAll("circle")
        .data(vis.displayData);

    vis.circlesEnter = vis.circles.enter().append("circle")
        .attr("r", function(d, i){ return vis.radius; })
        .attr("cx", function(d, i){ return 175 + 25 * i + 2 * i ** 2; })
        .attr("cy", function(d, i){ return 250; })
        // .style("fill", function(d, i){ return color(d.ID); })
        // .style("stroke", function(d, i){ return color(d.ID); })
        // .style("stroke-width", 10)
        .style("pointer-events", "all")
        .style('fill', 'red');
        // .call(d3.drag()
        //     .on("start", dragstarted)
        //     .on("drag", dragged)
        //     .on("end", dragended));

    vis.circles = vis.circles.merge(vis.circlesEnter);

    function ticked() {
        vis.circles
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; });
    }

    vis.simulation
        .nodes(vis.displayData)
        .on("tick", ticked);

    function groupBubbles() {
        hideTitles();

        // @v4 Reset the 'x' force to draw the bubbles to the center.
        vis.simulation.force('x', d3.forceX().strength(vis.forceStrength).x(vis.w / 2));

        // @v4 We can reset the alpha value and restart the simulation
        vis.simulation.alpha(1).restart();
    }

    function splitBubbles(byVar) {

        vis.centerScale.domain(vis.displayData.map(function(d){ return d[byVar]; }));

        if(byVar == "all"){
            hideTitles()
        } else {
            showTitles(byVar, vis.centerScale);
        }

        // @v4 Reset the 'x' force to draw the bubbles to their year centers
        vis.simulation.force('x', d3.forceX().strength(vis.forceStrength).x(function(d){
            return vis.centerScale(d[byVar]);
        }));

        // @v4 We can reset the alpha value and restart the simulation
        vis.simulation.alpha(2).restart();
    }

    function hideTitles() {
        vis.svg.selectAll('.title').remove();
    }

    function showTitles(byVar, scale) {
        // Another way to do this would be to create
        // the year texts once and then just hide them.
        var titles = vis.svg.selectAll('.title')
            .data(scale.domain());

        titles.enter().append('text')
            .attr('class', 'title')
            .merge(titles)
            .attr('x', function (d) { return scale(d); })
            .attr('y', 40)
            .style("fill", "white")
            .attr('text-anchor', 'middle')
            .text(function (d) { return d; });

        titles.exit().remove()
    }

    function setupButtons() {
        d3.selectAll('.button')
            .on('click', function () {

                // Remove active class from all buttons
                d3.selectAll('.button').classed('active', false);
                // Find the button just clicked
                var button = d3.select(this);

                // Set it as the active button
                button.classed('active', true);

                // Get the id of the button
                var buttonId = button.attr('id');

                // console.log(buttonId)
                // Toggle the bubble chart based on
                // the currently clicked button.
                splitBubbles(buttonId);
            });

        d3.selectAll('.highlowtoggle')
            .on('click', function () {

                d3.selectAll('.highlowtoggle').classed('active', false);

                var button = d3.select(this);

                button.classed('active', true);
                var buttonId = button.attr('id');

                vis.wrangleData(buttonId);
            });
    }

    setupButtons();

};

