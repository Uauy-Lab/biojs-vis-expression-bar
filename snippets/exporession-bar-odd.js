var isNode = false;

if (typeof module !== 'undefined' && module.exports) {
            isNode = true;
}

if(isNode){
	biovisexpressionbar = require("bio-vis-expression-bar");	
}

var container_div="bar_expression_viewer";

var eb =  new biovisexpressionbar.ExpressionBar({
	target: container_div,
	data: "data/realTestCompareOdd.js", 
	groupBy: ["High level stress-disease", "High level age","High level tissue","High level variety"], 
	renderProperty: 'count', 
	width: '1000',
	fontFamily:'Palatino Linotype, Book Antiqua, Palatino, serif', 
	barHeight: 12
}	
);