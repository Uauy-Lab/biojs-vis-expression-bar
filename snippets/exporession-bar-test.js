

var container_div="bar_expression_viewer";

var eb =  new biovisexpressionbar.ExpressionBar({
	target: container_div,
	//data: "data/test_data.json",
	//highlight: 'Traes_4AL_F99FCB25F.1', 
	highlight: 'Traes_4AL_F9DCE24F4.1',
	data: "data/realTestHom.js", 
	groupBy: 'groups', 
	renderProperty: 'count', 
	width: '1000',
	fontFamily:'Palatino Linotype, Book Antiqua, Palatino, serif', 
}
	
);