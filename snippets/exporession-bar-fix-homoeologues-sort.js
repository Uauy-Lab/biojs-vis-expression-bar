
//if(isNode){
var biovisexpressionbar = require("bio-vis-expression-bar");	
//}

var container_div="bar_expression_viewer";

var eb =  new biovisexpressionbar.ExpressionBar({
	target: container_div,
	highlight: 'Traes_4AL_F9DCE24F4.1',
	data: window.location.href + "/../data/dataTest.json", 	
	renderProperty: 'tpm', 
	fontFamily:'Palatino Linotype, Book Antiqua, Palatino, serif',
	groupBy: ["High level stress-disease", "High level age","High level tissue","High level variety"], 
	barHeight: 12,
	width: window.innerWidth - 40,	
	headerOffset:100	
}	
);

// rescaling the bar chart after a 1.5 second delay of resizing the window ****************REMOVE THIS NOW!!!!!!!!!!!!!!!
var resizeTimer;
$(window).on('resize', function(e){      
  clearTimeout(resizeTimer);  // Making sure that the reload doesn't happen if the window is resized within 1.5 seconds
  resizeTimer = setTimeout(function(){
    eb.resizeChart();
  }, 1500);
});

$("button").click(function(){
	$("h1").toggle("fast");
});
