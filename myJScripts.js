var radiusScale = 20, radiusOffset = 20;

var svgContext,
    svgWidth,
    svgHeight,
    svgHalfWidth,
    svgHalfHeight,
    circles;

var nodes;
var simulation;
var shownDataIdx = 1;
var animatingRadius = false;

function initSVGContext() {
    svgContext=d3.select("svg");
    svgWidth = +svgContext.attr("width");
    svgHeight = +svgContext.attr("height");
    svgHalfWidth = svgWidth/2;
    svgHalfHeight = svgHeight/2;
}

function normalize(v, min, max) {
    return (v - min) / (max - min);
}

$("input").change(function(){
    shownDataIdx = $("input:checked").data("idx");
    simulation.force("collide").radius(function(d) { return d.dataSet[shownDataIdx]; });
    simulation.alpha(2).restart();
});

function initJSONData(){
    $.getJSON("dataJson.json", function(data){
        nodes = [];
        var marginData = {
             wellbeing: {min: 100.0, max: -1.0},
             life: {min: 100.0, max: -1.0},
             inequality: {min: 200, max: -1},
             ecological: {min: 100.0, max: -1.0},
             happy: {min: 100.0, max: -1.0}
         };

        for(var i = 0; i < data.length; i++){
            var d = data[i];
            marginData.wellbeing.max = Math.max(d.wellbeing, marginData.wellbeing.max);
            marginData.wellbeing.min = Math.min(d.wellbeing, marginData.wellbeing.min);
            marginData.life.max = Math.max(d.life, marginData.life.max);
            marginData.life.min = Math.min(d.life, marginData.life.min);
            marginData.inequality.max = Math.max(d.inequality, marginData.inequality.max);
            marginData.inequality.min = Math.min(d.inequality, marginData.inequality.min);
            marginData.ecological.max = Math.max(d.ecological, marginData.ecological.max);
            marginData.ecological.min = Math.min(d.ecological, marginData.ecological.min);
            marginData.happy.max = Math.max(d.happy, marginData.happy.max);
            marginData.happy.min = Math.min(d.happy, marginData.happy.min);
        }
        for(var i = 0; i < data.length; i++){
            var d = data[i];
            nodes.push({
                country: d.country,
                dataSet: [
                    normalize(+d.wellbeing, marginData.wellbeing.min, marginData.wellbeing.max) * radiusScale + radiusOffset,
                    normalize(+d.life, marginData.life.min, marginData.life.max) * radiusScale + radiusOffset,
                    normalize(+d.inequality, marginData.inequality.min, marginData.inequality.max) * radiusScale + radiusOffset,
                    normalize(+d.ecological, marginData.ecological.min, marginData.ecological.max) * radiusScale + radiusOffset,
                    normalize(+d.happy, marginData.happy.min, marginData.happy.max) * radiusScale + radiusOffset
                ]
            });
            svgContext.append("circle")
                .attr("cx", svgWidth/2)
                .attr("cy", svgHeight/2)
                .attr("r", nodes[i].dataSet[0])
                .attr("data-idx", i)
                .style("fill", "red");
        }
        circles = d3.selectAll("circle");
        simulation = d3.forceSimulation(nodes)
            .velocityDecay(0.2)
            .alpha(2)
            .force("x", d3.forceX().strength(0.002))
            .force("y", d3.forceY().strength(0.002))
            .force("collide", d3.forceCollide().radius(function(d) { return d.dataSet[shownDataIdx]; }).iterations(2))
            .on("tick", ticked);
    });
}
function ticked() {
    circles.transition().attr("cx", function(d, i){
        return nodes[i].x + svgHalfWidth;
    }).attr("cy", function(d, i){
        return nodes[i].y + svgHalfHeight;
    }).attr("r", function(d, i){
        return nodes[i].dataSet[shownDataIdx];
    }).duration(40);
}
