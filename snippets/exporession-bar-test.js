

var container_div="bar_expression_viewer";

var eb =  new biovisexpressionbar.ExpressionBar({
	target: container_div,
	//data: "data/test_data.json",
	highlight: 'Traes_4AL_F99FCB25F.1', 
	data: "data/realTest.js", 
	groupBy: 'groups', 
	renderProperty: 'count'
}
	
);