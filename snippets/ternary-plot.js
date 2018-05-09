// var biovisexpressionbar = require("bio-vis-expression-bar");


// var container_div="bar_expression_viewer";
// var parentWidth = $("#bar_expression_viewer").parent().width();
// var parentHeight = $(window).height();
// var eb =  new biovisexpressionbar.ExpressionBar({
// 	target: container_div,
// 	highlight: 'Traes_4AL_F9DCE24F4.1',
// 	data: window.location.href + "/../data/ternaryPlot.json",
// 	renderProperty: 'tpm',
// 	fontFamily:'Helvetica Neue, Helvetica, Arial, sans-serif',
// 	groupBy: ["High level stress-disease", "High level age","High level tissue","High level variety"],
// 	headerOffset:0,
// 	plot:'Bar'
// });


// var resizeTimer;
// $(window).on('resize', function(e){
//   clearTimeout(resizeTimer);  // Making sure that the reload doesn't happen if the window is resized within 1.5 seconds
//   resizeTimer = setTimeout(function(){
//     eb.resizeChart();
//   }, 1500);
// });





//**********************************************************************************88

function ternaryPlot(selector, userOpt ) {

	var plot = {
		dataset:[]
	};

	// Options
	var opt = {
		width:900,
		height:900,
		side: 700,
		margin: {top:50,left:50,bottom:50,right:50},
		axis_labels:['A','B','C'],
		axis_ticks:[0,20,40,60,80,100],
		tickLabelMargin:10,
		axisLabelMargin:40 
	}

	// Getting user options
	for(var o in userOpt){
		opt[o] = userOpt[o];
	}

	// Set the svg height and width
	var svg = d3.select(selector).append('svg')
						.attr("width", opt.width)
                        .attr("height", opt.height);

    // Add the group 
	var axes = svg.append('g').attr('class','axes');

	// Calculating the height and width of the Plot
    var w = opt.side;
    var h = Math.sqrt( opt.side*opt.side - (opt.side/2)*(opt.side/2));

    // Setting the position of the corners
	var corners = [
		[opt.margin.left, h + opt.margin.top], // a
		[ w + opt.margin.left, h + opt.margin.top], //b 
		[(w/2) + opt.margin.left, opt.margin.top] ] //c

	//axis names
	// Gets each value in the axis-labels and appends the following to them (d is the value & i is index)	
	axes.selectAll('.axis-title')
		.data(opt.axis_labels)
		.enter()
			.append('g')
				.attr('class', 'axis-title')
				.attr('transform',function(d,i){
					console.log(`This is d: ${d}, i: ${i}`);	// Shall be removed later
					return 'translate('+corners[i][0]+','+corners[i][1]+')';
				})
				.append('text')
				.text(function(d){ return d; })
				.attr('text-anchor', function(d,i){
					if(i===0) return 'end';
					if(i===2) return 'middle';
					return 'start';
					
				})
				.attr('transform', function(d,i){
					var theta = 0;
					if(i===0) theta = 120;
					if(i===1) theta = 60;
					if(i===2) theta = -90;

					var x = opt.axisLabelMargin * Math.cos(theta * 0.0174532925),
						y = opt.axisLabelMargin * Math.sin(theta * 0.0174532925);
					return 'translate('+x+','+y+')'
				});


	//ticks
	//(TODO: this seems a bit verbose/ repetitive!);
	var n = opt.axis_ticks.length;
	if(opt.minor_axis_ticks){
		opt.minor_axis_ticks.forEach(function(v) {	
			var coord1 = coord( [v, 0, 100-v] );
			var coord2 = coord( [v, 100-v, 0] );
			var coord3 = coord( [0, 100-v, v] );
			var coord4 = coord( [100-v, 0, v] );

			axes.append("line")
				.attr( lineAttributes(coord1, coord2) )
				.classed('a-axis minor-tick', true);	

			axes.append("line")
				.attr( lineAttributes(coord2, coord3) )
				.classed('b-axis minor-tick', true);	

			axes.append("line")
				.attr( lineAttributes(coord3, coord4) )
				.classed('c-axis minor-tick', true);		
		});
	}

	// This will add the ticks and lines (IMPORTANT)  
	opt.axis_ticks.forEach(function(v) {	
		console.log(`This is V: ${v}`);
		var coord1 = coord( [v, 0, 100-v] );
		var coord2 = coord( [v, 100-v, 0] );
		var coord3 = coord( [0, 100-v, v] );
		var coord4 = coord( [100-v, 0, v] );

		// Add the lines (This is where everything breaks)
		axes.append("line")
			.attr( lineAttributes(coord1, coord2) )
			// .classed('a-axis tick', true);	

		axes.append("line")
			.attr( lineAttributes(coord2, coord3) )
			// .classed('b-axis tick', true);	

		axes.append("line")
			.attr( lineAttributes(coord3, coord4) )
			// .classed('c-axis tick', true);	


		// tick labels
		axes.append('g')
			.attr('transform',function(d){
				return 'translate(' + coord1[0] + ',' + coord1[1] + ')'
			})
			.append("text")
				.attr('transform','rotate(60)')
				.attr('text-anchor','end')
				.attr('x',-opt.tickLabelMargin)
				.text( function (d) { return v; } )
				.classed('a-axis tick-text', true );

		axes.append('g')
			.attr('transform',function(d){
				return 'translate(' + coord2[0] + ',' + coord2[1] + ')'
			})
			.append("text")
				.attr('transform','rotate(-60)')
				.attr('text-anchor','end')
				.attr('x',-opt.tickLabelMargin)
				.text( function (d) { return (100- v); } )
				.classed('b-axis tick-text', true);

		axes.append('g')
			.attr('transform',function(d){
				return 'translate(' + coord3[0] + ',' + coord3[1] + ')'
			})
			.append("text")
				.text( function (d) { return v; } )
				.attr('x',opt.tickLabelMargin)
				.classed('c-axis tick-text', true);
	})

	function lineAttributes(p1, p2){
		return { x1:p1[0], y1:p1[1],
				 x2:p2[0], y2:p2[1] };
	}

	function coord(arr){
		var a = arr[0], b=arr[1], c=arr[2]; 
		var sum, pos = [0,0];
	    sum = a + b + c;
	    if(sum !== 0) {
		    a /= sum;
		    b /= sum;
		    c /= sum;
			pos[0] =  corners[0][0]  * a + corners[1][0]  * b + corners[2][0]  * c;
			pos[1] =  corners[0][1]  * a + corners[1][1]  * b + corners[2][1]  * c;
		}
	    return pos;
	}

	function scale(p, factor) {
	    return [p[0] * factor, p[1] * factor];
	}

	plot.data = function(data, accessor, bindBy){ //bind by is the dataset property used as an id for the join
		plot.dataset = data;

		var circles = svg.selectAll("circle")
			.data( data.map( function(d){ return coord(accessor(d)); }), function(d,i){
				if(bindBy){
					return plot.dataset[i][bindBy];
				}
				return i;
			} );

		circles.enter().append("circle");

		circles.transition().attr("cx", function (d) { return d[0]; })
			.attr("cy", function (d) { return d[1]; })
			.attr("r", 6);

		return this;
	}

	plot.getPosition = coord;

	return plot;
}

function next(){
	var d = []
	for(var i = 0; i < 100; i++){
		d.push({
			journalist:Math.random(),
			developer:Math.random(),
			designer:Math.random(),
			label:'point'+i
		})
	}
	tp.data(d, function(d){ return [d.journalist, d.developer, d.designer]}, 'label');
}

// d3.select('#nextbutton').on('click', function(e){
// 	next(); d3.event.preventDefault(); });

var tp = ternaryPlot( '#plot');

// next();