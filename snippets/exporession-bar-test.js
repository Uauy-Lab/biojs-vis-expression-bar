

var container_div="bar_expression_viewer";

var eb =  new biovisexpressionbar.ExpressionBar({
	target: container_div,
	data: "data/test_data.json", 
	groupBy: 'groups', 
	renderProperty: 'count'
}
	
);