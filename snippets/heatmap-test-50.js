biovisexpressionbar = require("bio-vis-expression-bar");	


var container_div="bar_expression_viewer";
var parentWidth = $("#bar_expression_viewer").parent().width();
var parentHeight = $(window).height();
var eb =  new biovisexpressionbar.ExpressionBar({
	target: container_div,
	data: window.location.href + "/../data/new50genes.json", 
	groupBy: ["High level stress-disease", "High level age","High level tissue","High level variety"], 
	renderProperty: 'count', 
	width: parentWidth,
	fontFamily:'Helvetica Neue, Helvetica, Arial, sans-serif', 	
	headerOffset: 0,
	plot:'HeatMap'
}	
);


var resizeTimer;
$(window).on('resize', function(e){      
  clearTimeout(resizeTimer);  
  resizeTimer = setTimeout(function(){  	
    eb.resizeChart();
  }, 1500);
});