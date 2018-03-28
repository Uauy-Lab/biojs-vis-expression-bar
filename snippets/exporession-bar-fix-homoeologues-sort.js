
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
	width: 1000,	
	headerOffset:100	
}	
);