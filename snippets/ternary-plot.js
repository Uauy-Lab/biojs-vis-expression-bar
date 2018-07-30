var biovisexpressionbar = require("bio-vis-expression-bar");

$(document).ready(function(){
	runThese();
})

function runThese(){
	var container_div="bar_expression_viewer";
	var parentWidth = $("#bar_expression_viewer").parent().width();
	var parentHeight = $(window).height();
	var eb =  new biovisexpressionbar.ExpressionBar({
		target: container_div,
		highlight: 'Traes_4AL_F9DCE24F4.1',
		data: window.location.href + "/../data/ternaryPlot.json",
		renderProperty: 'tpm',
		fontFamily:'Helvetica Neue, Helvetica, Arial, sans-serif',
		groupBy: ["High level stress-disease", "High level age","High level tissue","High level variety"],
		headerOffset:0,
		plot:'Bar'
	});

	// Key 'T' for showing the ternary plot as shortcut
	$(document).keypress(function(event){
		var keyPressed = (String.fromCharCode(event.which)); 
		if(keyPressed === 't'){
			$(`#bar_expression_viewer_showTernaryPlot`).click();
		}
	});


	var resizeTimer;
	$(window).on('resize', function(e){
		clearTimeout(resizeTimer);  // Making sure that the reload doesn't happen if the window is resized within 1.5 seconds
		resizeTimer = setTimeout(function(){
			eb.resizeChart();
		}, 1500);
	});
}
