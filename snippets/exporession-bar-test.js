
//if(isNode){
var biovisexpressionbar = require("bio-vis-expression-bar");	
//}

var container_div="bar_expression_viewer";

var eb =  new biovisexpressionbar.ExpressionBar({
	target: container_div,
	highlight: 'Traes_4AL_F9DCE24F4.1',
<<<<<<< HEAD
	data: window.location.href + "/../data/realTestHom.js", 
	groupBy: ["High level stress-disease", "High level age","High level tissue","High level variety"], 
	renderProperty: 'count', 
	width: '1000',
	fontFamily:'Palatino Linotype, Book Antiqua, Palatino, serif', 
	barHeight: 12
=======
	data: window.location.href + "/../data/realTestHom.js", 	
	renderProperty: 'tpm', 
	fontFamily:'Palatino Linotype, Book Antiqua, Palatino, serif',
	groupBy: ["High level stress-disease", "High level age","High level tissue","High level variety"], 
	barHeight: 12,
	width: 1000,	
	headerOffset:100	
>>>>>>> 040e55d6a21c66c5590d6a42c4d1dc7123499e6a
}	
);