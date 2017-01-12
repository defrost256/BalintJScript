var style = {
    circle: {
        radiusScale: 20,
        radiusOffset: 20,
        dataColors: [
            "#0b6cf4",
            "#32cdc0",
            "#eebb11",
            "#9140bf",
            "#fa2014"
        ]
    },
    details: {
        animTimeMS: 800,
        detailsCircleSize: 100,
        fontColor: "white",
        countryTextFontSize: 30,
        dataTextFontSize: 20,
        circleStrokeColor: {
            r: 0,
            g: 0,
            b: 0
        }
    }
};

var svgContext,
    svgWidth,
    svgHeight,
    svgHalfWidth,
    svgHalfHeight,
    circles,
    detailsCircle,
    detailsText = {
        country: undefined,
        data: undefined
    };

var nodes;
var simulation;
var shownDataIdx = 0;
var animatingRadius = false;
var detailsOpen = false;

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

function getStrokeWithAlpha(a)
{
    var c = style.details.circleStrokeColor;
    return "rgba(" + c.r + "," + c.g + "," + c.b + "," + a + ")";
}

$("input").change(function(){
    shownDataIdx = $("input:checked").data("idx");
    simulation.force("collide").radius(function(d) { return d.graphicData[shownDataIdx]; });
    simulation.alpha(2).restart();
});

function openDetails(elem){
    if(!detailsOpen){
        detailsOpen=true;
        svgContext.append("circle")
            .classed("details", true)
            .attr("cx", elem.attr("cx"))
            .attr("cy", elem.attr("cy"))
            .attr("r", elem.attr("r"))
            .style("fill", style.circle.dataColors[shownDataIdx])
            .style("stroke", getStrokeWithAlpha(0));
        detailsCircle = d3.select("circle.details");
        svgContext.append("text")
            .classed("details", true)
            .attr("id", "textC")
            .attr("x", elem.attr("cx"))
            .attr("y", elem.attr("cy"))
            .attr("text-anchor", "middle")
            .attr("font-size", 5)
            .text(nodes[elem.data("idx")].country)
            .style("fill", style.details.fontColor);
        detailsText.country = d3.select("text.details#textC");
        svgContext.append("text")
            .classed("details", true)
            .attr("id", "textD")
            .attr("x", elem.attr("cx"))
            .attr("y", elem.attr("cy"))
            .attr("dy", 0)
            .attr("text-anchor", "middle")
            .attr("font-size", 5)
            .text(nodes[elem.data("idx")].dataSet[shownDataIdx])
            .style("fill", style.details.fontColor);
        detailsText.data = d3.select("text.details#textD");
        detailsCircle.on("click", function(){closeDetails();});
        detailsCircle.transition().attr("r", style.details.detailsCircleSize)
            .style("stroke", getStrokeWithAlpha(1))
            .duration(style.details.animTimeMS);
        detailsText.country.transition()
            .attr("font-size", style.details.countryTextFontSize)
            .duration(style.details.animTimeMS);
        detailsText.data.transition()
            .attr("font-size", style.details.dataTextFontSize)
            .attr("dy", 1.2 * style.details.countryTextFontSize)
            .duration(style.details.animTimeMS);
    }
}

function closeDetails(){
    detailsCircle.transition().attr("r", 0)
        .style("stroke", getStrokeWithAlpha(0))
        .duration(300)
        .on("end", function(){
            detailsCircle.remove();
            detailsOpen=false;
        });
    detailsText.country.transition().attr("font-size", 0)
        .duration(200)
        .on("end", function(){
            detailsText.country.remove();
        });
    detailsText.data.transition().attr("font-size", 0)
        .duration(200)
        .on("end", function () {
            detailsText.data.remove();
        });
}

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
                graphicData: [
                    normalize(+d.wellbeing, marginData.wellbeing.min, marginData.wellbeing.max) * style.circle.radiusScale + style.circle.radiusOffset,
                    normalize(+d.life, marginData.life.min, marginData.life.max) * style.circle.radiusScale + style.circle.radiusOffset,
                    normalize(+d.inequality, marginData.inequality.min, marginData.inequality.max) * style.circle.radiusScale + style.circle.radiusOffset,
                    normalize(+d.ecological, marginData.ecological.min, marginData.ecological.max) * style.circle.radiusScale + style.circle.radiusOffset,
                    normalize(+d.happy, marginData.happy.min, marginData.happy.max) * style.circle.radiusScale + style.circle.radiusOffset
                ],
                dataSet: [
                    +d.wellbeing,
                    +d.life,
                    +d.inequality,
                    +d.ecological,
                    +d.happy
                ]
            });
            svgContext.append("circle")
                .attr("cx", svgWidth/2)
                .attr("cy", svgHeight/2)
                .attr("r", nodes[i].graphicData[0])
                .attr("data-idx", i)
                .style("fill", "red");
        }
        circles = d3.selectAll("circle");
        simulation = d3.forceSimulation(nodes)
            .velocityDecay(0.2)
            .alpha(2)
            .force("x", d3.forceX().strength(0.002))
            .force("y", d3.forceY().strength(0.002))
            .force("collide", d3.forceCollide().radius(function(d) { return d.graphicData[shownDataIdx]; }).iterations(2))
            .on("tick", ticked);

        $("circle").click(function(){
            openDetails($(this));
        });
    });
}
function ticked() {
    circles.transition().attr("cx", function(d, i){
        return nodes[i].x + svgHalfWidth;
    }).attr("cy", function(d, i){
        return nodes[i].y + svgHalfHeight;
    }).attr("r", function(d, i){
        return nodes[i].graphicData[shownDataIdx];
    }).style("fill", style.circle.dataColors[shownDataIdx])
        .duration(40);
}
