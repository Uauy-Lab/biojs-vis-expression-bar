biovisexpressionbar = require("bio-vis-expression-bar");	


var container_div="bar_expression_viewer";
var parentWidth = $("#bar_expression_viewer").parent().width();
var parentHeight = $(window).height();
var eb =  new biovisexpressionbar.ExpressionBar({
	target: container_div,
	data: window.location.href + "/../data/50genes.json", 
	groupBy: ["High level stress-disease", "High level age","High level tissue","High level variety"], 
	renderProperty: 'count', 
	width: parentWidth,
	fontFamily:'Palatino Linotype, Book Antiqua, Palatino, serif', 
	barHeight: (parentHeight * 0.02),
	headerOffset: 180,
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