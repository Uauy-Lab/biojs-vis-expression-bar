//var jQuery = require('jquery');
var science = require('science');
var colorbrewer = require('colorbrewer');
var d3 = require('d3');
require('string.prototype.startswith');
var exts = require('./d3Extensions.js');



// Default Ternary Plot Options
var opt = {
  width:650,
  height:650,
  side: 450,
  margin: {top:100,left:50,bottom:50,right:50},
  axis_labels:['A','B','C'],
  axis_ticks:[0,20,40,60,80,100],
  tickLabelMargin:10,
  axisLabelMargin:40 
}

var plot = {
  dataset:[]
};

var TernaryPlot = function (parent) {
  this.parent = parent;
  this.opt = parent.opt;  
  this.selector = "#bar_expression_viewer_chart_svg";
}


// DON'T NEED THIS
TernaryPlot.prototype.renderScales = function(i){

};


// RENDERING THE LINES OF THE TERNARY PLOT
TernaryPlot.prototype.renderGlobalScale = function(){

  var barHeight = this.opt.barHeight;
  var labelWidth = this.opt.labelWidth;  
  var data = this.parent.data;

  // Loading the corner titles
  opt.axis_labels = data.tern_order;  
  var tempContainer = opt.axis_labels[1];
  opt.axis_labels[1] = opt.axis_labels[2];
  opt.axis_labels[2] = tempContainer;

  
  // Set the svg height and width
  svg = d3.select(this.selector).append('g')
    .attr('transform', 'translate(' + labelWidth  + ',' + barHeight + ')')
    .append('svg')
    .attr("width", opt.width)
    .attr("height", opt.height);

  // Add the group 
  var axes = svg.append('g').attr('class','axes');

  // Calculating the height and width of the Plot
  var w = opt.side;
  var h = Math.sqrt( opt.side*opt.side - (opt.side/2)*(opt.side/2));

  // Setting the position of the corners
  corners = [
  [opt.margin.left, h + opt.margin.top], // a
  [ w + opt.margin.left, h + opt.margin.top], //b 
  [(w/2) + opt.margin.left, opt.margin.top] ] //c


  // Corner titles
  // Gets each value in the axis-labels and appends the following to them (d is the value & i is index) 
  axes.selectAll('.axis-title')
    .data(opt.axis_labels)
    .enter()
      .append('g')
        .attr('class', 'axis-title')
        .attr('transform',function(d,i){          
          return 'translate('+corners[i][0]+','+corners[i][1]+')';
        })
        .append('text').attr('font-size', barHeight)
        .text(function(d){ return d; })
        .attr('text-anchor', function(d,i){
          if(i===0) return 'end';
          if(i===2) return 'middle';
          return 'start';
          
        })
        .attr('class', function(d, i){
          if(i===0){return 'corner-a';}
          if(i===1){return 'corner-b';}
          if(i===2){return 'corner-c';}
        })
        .attr('transform', function(d,i){
          var theta = 0, rotate = 0;
          if(i===0){theta = 120;}
          if(i===1){theta = 60;} 
          if(i===2){theta = -90;}

          var x = opt.axisLabelMargin * Math.cos(theta * 0.0174532925),
            y = opt.axisLabelMargin * Math.sin(theta * 0.0174532925);
          return `translate(${x},${y})`
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

      console.log(`THis is the axes ${axes}`);

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
    var coord1 = coord( [v, 0, 100-v] );
    var coord2 = coord( [v, 100-v, 0] );
    var coord3 = coord( [0, 100-v, v] );
    var coord4 = coord( [100-v, 0, v] );    

    // Add the lines 
    var allLineAttributes = lineAttributes(coord1, coord2);    
    axes.append("line").attr('class', 'a-axis tick')
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x2)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y2);  

    allLineAttributes = lineAttributes(coord2, coord3); 
    axes.append("line").attr('class', 'b-axis tick')
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x2)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y2);  
      

    allLineAttributes = lineAttributes(coord3, coord4); 
    axes.append("line").attr('class', 'c-axis tick')
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x2)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y2);  


    //tick labels
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

  });


  // Drawing the arrows 
    var xi = 50;
    var coordz1 = coord( [xi, 0, 100-xi] );
    var coordz2 = coord( [xi, 100-xi, 0] );    
    var coordz3 = coord( [0, 100-xi, xi] );
    var coordz4 = coord( [100-xi, 0, xi] );
    var someX = 0, someY = 0;
        
        
    someX = w/2;
    someY = h/3 * Math.cos(60);    
    var lnin = lineAttributes(coordz1, coordz2);    
    var damnit = axes.append('g').attr('transform', `translate(${someX}, ${someY})`);
    damnit.append("line").attr('class', 'c-axis')
      .attr('x1', lnin.x1)
      .attr('x2', lnin.x2)
      .attr('y1', lnin.y1)
      .attr('y2', lnin.y2);


    var newX = 20 * Math.cos(30);
    var newY = 20 * Math.sin(30);
    damnit.append('line').attr('class', 'c-axis')
      .attr('x1', lnin.x1)
      .attr('x2', lnin.x1 + newX)
      .attr('y1', lnin.y1)
      .attr('y2', lnin.y1 - newY);      

    console.log(`X2: ${newX}\nY2: ${newY}`);

    newX = 20 * Math.sin(-30);
    newY = 20 * Math.cos(-30);
    damnit.append('line').attr('class', 'c-axis')
      .attr('x1', lnin.x1)
      .attr('x2', lnin.x1 + newX)
      .attr('y1', lnin.y1)
      .attr('y2', lnin.y1 + newY);   
  
    console.log(`X2: ${newX}\nY2: ${newY}`);    

    // damnit.append('text').attr('class', 'c-axis')
    //   .text(data.tern["B"])
    //   .attr('transform', 'rotate(60)');



    // someX = -(w/2);
    // someY = h/3 * Math.cos(60);
    // lnin = lineAttributes(coordz2, coordz3); 
    // damnit = axes.append('g').attr('transform', `translate(${someX}, ${someY})`);
    // damnit.append("line").attr('class', 'a-axis')
    //   .attr('x1', lnin.x1)
    //   .attr('x2', lnin.x2)
    //   .attr('y1', lnin.y1)
    //   .attr('y2', lnin.y2);  

    // damnit.append('line').attr('class', 'a-axis')
    //   .attr('x1', lnin.x1)
    //   .attr('x2', (lnin.x1 + 20))
    //   .attr('y1', lnin.y1)
    //   .attr('y2', (lnin.y1 - 10));      

    // damnit.append('line').attr('class', 'a-axis')
    //   .attr('x1', lnin.x1)
    //   .attr('x2', (lnin.x1 - 3))
    //   .attr('y1', lnin.y1)
    //   .attr('y2', (lnin.y1 - 20));      
      

    // damnit.append('text').attr('class', 'a-axis')
    //   .text(data.tern["B"])
    //   .attr('transform', 'rotate(-60)')      
    //   ;


      
    // someX = 0;
    // someY = h/2 + opt.margin.bottom;
    // lnin = lineAttributes(coordz3, coordz4);
    // axes.append('g').attr('transform', `translate(${someX}, ${someY})`)
    // .append("line").attr('class', 'b-axis')
    //   .attr('x1', lnin.x1)
    //   .attr('x2', lnin.x2)
    //   .attr('y1', lnin.y1)
    //   .attr('y2', lnin.y2);



  this.renderGeneBar();

};



// ADDED STUFF FORM THE GIVEN CODE
TernaryPlot.prototype.data = function (data, accessor, bindBy){ //bind by is the dataset property used as an id for the join
  plot.dataset = data;

  var circles = svg.selectAll("circle")
    .data( data.map( function(d){ return coord(accessor(d)); }), function(d,i){
      if(bindBy){
        return plot.dataset[i][bindBy];
      }
      return i;
    } );

  circles.enter().append("circle").attr("cx", function (d) { return d[0]; })
    .attr("cy", function (d) { return d[1]; })
    .attr("r", 6);

  circles.transition();

  return this;
}

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
// ADDED STUFF FORM THE GIVEN CODE



// CALCULATING THE POSITION OF THE TERNARY PLOT
TernaryPlot.prototype.calculateBarWidth = function(){  

};


// DON'T NEED THIS
TernaryPlot.prototype.rangeX = function(){

}


// DON'T NEED THIS
TernaryPlot.prototype.ScaleRangeX = function(){

};


// RENDERING CIRCLES
TernaryPlot.prototype.renderGeneBar = function(i){

  // var data = this.parent.data.renderedData;

  // console.log(data.tern);

  // // Generating all data
  // var d = []  
  // for(var i = 0; i < 100; i++){
  //   d.push({
  //     a:Math.random() * 50,
  //     b:Math.random() * 50,
  //     c:Math.random() * 50 ,
  //     label:'point'+i
  //   })
  // }

  // // Loading the data
  // this.data(d, function(d){ return [d.a, d.b, d.c]}, 'label');
};


// FOR DYNAMIC REASONS 
TernaryPlot.prototype.refreshBar = function(gene, i){

}; 


// DON'T NEED THIS
TernaryPlot.prototype.refreshScale = function(){

};


module.exports.TernaryPlot = TernaryPlot;
