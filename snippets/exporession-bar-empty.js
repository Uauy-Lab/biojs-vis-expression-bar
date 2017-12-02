
biovisexpressionbar = require("bio-vis-expression-bar");	


var container_div="bar_expression_viewer";

var eb =  new biovisexpressionbar.ExpressionBar({
	target: container_div,
	data: window.location.href + "/../data/empty_stub.json", 
	groupBy: ["High level Stress-disease", "High level age","High level tissue","High level variety"], 
	renderProperty: 'count', 
	width: '1000',
	fontFamily:'Palatino Linotype, Book Antiqua, Palatino, serif', 
	barHeight: 12
}	
);