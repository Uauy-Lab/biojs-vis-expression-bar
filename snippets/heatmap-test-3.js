biovisexpressionbar = require("bio-vis-expression-bar");	


var container_div="bar_expression_viewer";

var eb =  new biovisexpressionbar.ExpressionBar({
	target: container_div,
	data: window.location.href + "/../data/3genes.json", 
	groupBy: ["High level stress-disease", "High level age","High level tissue","High level variety"], 
	renderProperty: 'count', 
	width: window.innerWidth - 60,
	fontFamily:'Palatino Linotype, Book Antiqua, Palatino, serif', 
	barHeight: 12,
	headerOffset: 200,
	plot:'HeatMap'
}	
);


// rescaling the bar chart after a 1.5 second delay of resizing the window ****************REMOVE THIS NOW!!!!!!!!!!!!!!!
var resizeTimer;
$(window).on('resize', function(e){      
  clearTimeout(resizeTimer);  // Making sure that the reload doesn't happen if the window is resized within 1.5 seconds
  resizeTimer = setTimeout(function(){
  	console.log("We are resizing now and want to call resize Chart");
    eb.resizeChart();
  }, 1500);
});