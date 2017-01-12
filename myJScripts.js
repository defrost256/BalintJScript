var canvas = $("canvas")[0],
    context = canvas.getContext("2d"),
    width = canvas.width,
    height = canvas.height,
    tau = 2 * Math.PI;

var nodes;
var collide;
var simulation;
var shownDataIdx = 1;

function normalize(v, min, max)
{
    return (v - min) / (max - min);
}

$("input").change(function(){
    shownDataIdx = $("input:checked").data("idx");
    simulation.force("collide").radius(function(d) { return d.dataSet[shownDataIdx] + 2; });
    simulation.alpha(2).restart();
});

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
                normalize(+d.wellbeing, marginData.wellbeing.min, marginData.wellbeing.max) * 10 + 5,
                normalize(+d.life, marginData.life.min, marginData.life.max) * 10 + 5,
                normalize(+d.inequality, marginData.inequality.min, marginData.inequality.max) * 10 + 5,
                normalize(+d.ecological, marginData.ecological.min, marginData.ecological.max) * 10 + 5,
                normalize(+d.happy, marginData.happy.min, marginData.happy.max) * 10 + 5
            ]
        });
    }
    collide = d3.forceCollide();
    simulation = d3.forceSimulation(nodes)
        .velocityDecay(0.2)
        .force("x", d3.forceX().strength(0.002))
        .force("y", d3.forceY().strength(0.002))
        .force("collide", collide.radius(function(d) { return d.dataSet[shownDataIdx] + 2; }).iterations(2))
        .on("tick", ticked);
});

function ticked() {
    context.clearRect(0, 0, width, height);
    context.save();
    context.translate(width / 2, height / 2);

    context.beginPath();
    nodes.forEach(function(d) {
        context.moveTo(d.x + d.dataSet[shownDataIdx] + 1, d.y);
        context.arc(d.x, d.y, d.dataSet[shownDataIdx] + 1, 0, tau);
    });
    context.fillStyle = "#ddd";
    context.fill();
    context.strokeStyle = "#333";
    context.stroke();

    context.restore();
}