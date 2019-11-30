ForceDiagram = function(_parentElement, _data ){
    this.parentElement = _parentElement;
    this.data = _data;
    console.log(this.data);
    this.initVis();
};

ForceDiagram.prototype.initVis = function(){
    var vis = this;
    
    vis.w = 960;
    vis.h = 500;

    vis.radius = 25;
    vis.color = d3.scaleOrdinal(d3.schemeCategory20);
    vis.centerScale = d3.scalePoint().padding(1).range([0, vis.w]);
    vis.forceStrength = 0.05;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.w)
        .attr("height", vis.h);

    vis.simulation = d3.forceSimulation()
        .force("collide",d3.forceCollide( function(d){
            return 25 + 8 }).iterations(16)
        )
        .force("charge", d3.forceManyBody())
        .force("y", d3.forceY().y(vis.h / 2))
        .force("x", d3.forceX().x(vis.w / 2));

    vis.data.forEach(function (element) {
        element['2019-10'] = + element['2019-10'];
    });

    vis.circles = vis.svg.selectAll("circle")
        .data(vis.data);

    vis.circlesEnter = vis.circles.enter().append("circle")
        .attr("r", function(d, i){ return 10; })
        .attr("cx", function(d, i){ return 175 + 25 * i + 2 * i ** 2; })
        .attr("cy", function(d, i){ return 250; })
        // .style("fill", function(d, i){ return color(d.ID); })
        // .style("stroke", function(d, i){ return color(d.ID); })
        // .style("stroke-width", 10)
        .style("pointer-events", "all")
        .style('fill', 'red')
        // .call(d3.drag()
        //     .on("start", dragstarted)
        //     .on("drag", dragged)
        //     .on("end", dragended));

    vis.circles = vis.circles.merge(vis.circlesEnter);

    function ticked() {
        //console.log("tick")
        //console.log(data.map(function(d){ return d.x; }));
        vis.circles
            .attr("cx", function(d){ return d.x; })
            .attr("cy", function(d){ return d.y; });
    }

    vis.simulation
        .nodes(vis.data)
        .on("tick", ticked);

    function groupBubbles() {
        hideTitles();

        // @v4 Reset the 'x' force to draw the bubbles to the center.
        vis.simulation.force('x', d3.forceX().strength(vis.forceStrength).x(vis.w / 2));

        // @v4 We can reset the alpha value and restart the simulation
        vis.simulation.alpha(1).restart();
    }

    function splitBubbles(byVar) {

        vis.centerScale.domain(vis.data.map(function(d){ return d[byVar]; }));

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
            .attr('text-anchor', 'middle')
            .text(function (d) { return byVar + ' ' + d; });

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

                console.log(buttonId)
                // Toggle the bubble chart based on
                // the currently clicked button.
                splitBubbles(buttonId);
            });
    }

    setupButtons()

}