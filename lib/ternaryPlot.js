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


// RENDERING THE STRUCTURE OF THE TERNARY PLOT
TernaryPlot.prototype.renderGlobalScale = function(){

  // Initialising local variables
  var barHeight = this.opt.barHeight;
  var labelWidth = this.opt.labelWidth;  
  var data = this.parent.data;
  
  // Set the svg height and width
  svg = d3.select(this.selector).append('g')
    .attr('transform', 'translate(' + labelWidth  + ',' + barHeight + ')')
    .append('svg')
    .attr("width", opt.width)
    .attr("height", opt.height);

  // Add the group for the ternary plot
  axes = svg.append('g').attr('class','axes');

  // Calculating the height and width of the Plot
  w = opt.side;
  h = Math.sqrt( opt.side*opt.side - (opt.side/2)*(opt.side/2));

  // Setting the position of the corners
  corners = [
  [opt.margin.left, h + opt.margin.top], // a
  [ w + opt.margin.left, h + opt.margin.top], //b 
  [(w/2) + opt.margin.left, opt.margin.top] ] //c

  // Loading the corner titles and reordering them for correct rendering order     <============ Don't know if messes with data
  opt.axis_labels = data.tern_order;  
  var tempContainer = opt.axis_labels[1];
  opt.axis_labels[1] = opt.axis_labels[2];
  opt.axis_labels[2] = tempContainer;

  // Render corner titles
  axes.selectAll('.axis-title')
    .data(opt.axis_labels)
    .enter()
      .append('g')
        .attr('class', 'axis-title')
        .attr('transform',function(d,i){          
          return 'translate('+corners[i][0]+','+corners[i][1]+')';
        })        
        .style('font-size', '1.5rem')
        .append('text')
          .attr('font-size', barHeight)
          .text(function(d){ return d; })
          .style('fill', function(d, i){
            if(i===0) {return '#07ff66';}
            if(i===1) {return '#6607ff';}
            if(i===2) {return '#ff6607';}
          })
          .attr('text-anchor', function(d,i){
            if(i===0) return 'end';
            if(i===2) return 'middle';
            return 'start';            
          })          
          .attr('transform', function(d,i){
            var theta = 0;
            if(i===0){theta = 120;}
            if(i===1){theta = 60;} 
            if(i===2){theta = -90;}

            var x = opt.axisLabelMargin * Math.cos(theta * 0.0174532925),
                y = opt.axisLabelMargin * Math.sin(theta * 0.0174532925);

            return `translate(${x},${y})`
          });
  

  // Render axis & axis titles 
  opt.axis_ticks.forEach(function(v) {      
    var coord1 = coord( [v, 0, 100-v] );
    var coord2 = coord( [v, 100-v, 0] );
    var coord3 = coord( [0, 100-v, v] );
    var coord4 = coord( [100-v, 0, v] );    

    // Add the axis
    var allLineAttributes = lineAttributes(coord1, coord2);    
    axes.append("line")
      .attr('class', 'a-axis tick')      
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x2)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y2)
      .style('stroke', '#07ff66')
      .style('stroke-width', 0.5);  

    allLineAttributes = lineAttributes(coord2, coord3); 
    axes.append("line")
      .attr('class', 'b-axis tick')
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x2)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y2)
      .style('stroke', '#6607ff')
      .style('stroke-width', 0.5);  
      

    allLineAttributes = lineAttributes(coord3, coord4); 
    axes.append("line")
      .attr('class', 'c-axis tick')
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x2)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y2)
      .style('stroke', '#ff6607')
      .style('stroke-width', 0.5);  


    // Tick labels
    axes.append('g')
      .attr('transform',function(d){
        return 'translate(' + coord1[0] + ',' + coord1[1] + ')'
      })
      .append("text")
        .attr('transform','rotate(60)')
        .attr('text-anchor','end')
        .attr('x',-opt.tickLabelMargin)
        .text( function (d) { return v; } )
        .classed('a-axis tick-text', true )        
        .style('font-weight', 'lighter')
        .style('font-size', '1rem')
        .style('fill', '#07ff66');

    axes.append('g')
      .attr('transform',function(d){
        return 'translate(' + coord2[0] + ',' + coord2[1] + ')'
      })
      .append("text")
        .attr('transform','rotate(-60)')
        .attr('text-anchor','end')
        .attr('x',-opt.tickLabelMargin)
        .text( function (d) { return (100- v); } )
        .classed('b-axis tick-text', true)
        .style('font-weight', 'lighter')
        .style('font-size', '1rem')
        .style('fill', '#6607ff');

    axes.append('g')
      .attr('transform',function(d){
        return 'translate(' + coord3[0] + ',' + coord3[1] + ')'
      })
      .append("text")
        .text( function (d) { return v; } )
        .attr('x',opt.tickLabelMargin)
        .classed('c-axis tick-text', true)
        .style('font-weight', 'lighter')
        .style('font-size', '1rem')
        .style('fill', '#ff6607');

  });

  this.DrawArrows();
  
  this.renderGeneBar();

};


// Drawing the arrows on the axis         <================================== Make the whole thing smarter
TernaryPlot.prototype.DrawArrows = function(){
  
    // Drawing the arrows 
    var xi = 50;
    var coordz1 = coord( [xi, 0, 100-xi] );
    var coordz2 = coord( [xi, 100-xi, 0] );    
    var coordz3 = coord( [0, 100-xi, xi] );
    var coordz4 = coord( [100-xi, 0, xi] );
    var someX = 0, someY = 0;
        
        
    var degree = (30/180) * Math.PI;

    // 1ST ARROW
    var distance = w/2 + opt.margin.right/2;
    someX = distance * Math.cos(degree);
    someY = -distance * Math.sin(degree);    
    var lnin = lineAttributes(coordz1, coordz2);    
    var damnit = axes.append('g')
    .attr('transform', `translate(${someX}, ${someY})`);
    damnit.append("line")      
      .attr('x1', lnin.x1)
      .attr('x2', lnin.x2)
      .attr('y1', lnin.y1)
      .attr('y2', lnin.y2)
      .style('stroke', '#ff6607');


    var newX = 20 * Math.cos(degree);
    var newY = 20 * Math.sin(degree);
    damnit.append('line')
      .attr('x1', lnin.x1)
      .attr('x2', lnin.x1 + newX)
      .attr('y1', lnin.y1)
      .attr('y2', lnin.y1 + newY)
      .style('stroke', '#ff6607');      

    var degre2 = (90/180) * Math.PI;

    newX = 20 * Math.cos(degre2);
    newY = 20 * Math.sin(degre2);
    damnit.append('line')
      .attr('x1', lnin.x1)
      .attr('x2', lnin.x1 + newX)
      .attr('y1', lnin.y1)
      .attr('y2', lnin.y1 + newY)
      .style('stroke', '#ff6607');   



    // 2ND ARROW
    distance = w/2 + opt.margin.left/2;
    someX = -distance * Math.cos(degree);
    someY = -distance * Math.sin(degree); 
    lnin = lineAttributes(coordz2, coordz3); 
    damnit = axes.append('g').attr('transform', `translate(${someX}, ${someY})`);
    damnit.append("line")
      .attr('x1', lnin.x1)
      .attr('x2', lnin.x2)
      .attr('y1', lnin.y1)
      .attr('y2', lnin.y2)
      .style('stroke', '#07ff66');

    newX = 20 * Math.cos(degree);
    newY = 20 * Math.sin(degree);
    damnit.append('line')
      .attr('x1', lnin.x1)
      .attr('x2', lnin.x1 + newX)
      .attr('y1', lnin.y1)
      .attr('y2', lnin.y1 - newY)
      .style('stroke', '#07ff66');      


    newX = 20 * Math.cos(degre2);
    newY = 20 * Math.sin(degre2);
    damnit.append('line')
      .attr('x1', lnin.x1)
      .attr('x2', lnin.x1 + newX)
      .attr('y1', lnin.y1)
      .attr('y2', lnin.y1 - newY)
      .style('stroke', '#07ff66');       
      

    // 3RD ARROW
    someX = 0;
    someY = h/2 + opt.margin.bottom;
    lnin = lineAttributes(coordz3, coordz4);
    damnit = axes.append('g').attr('transform', `translate(${someX}, ${someY})`);
    damnit.append("line")
      .attr('x1', lnin.x1)
      .attr('x2', lnin.x2)
      .attr('y1', lnin.y1)
      .attr('y2', lnin.y2)
      .style('stroke', '#6607ff');

    newX = 20 * Math.cos(degree);
    newY = 20 * Math.sin(degree);
    damnit.append('line')
      .attr('x1', lnin.x1)
      .attr('x2', lnin.x1 - newX)
      .attr('y1', lnin.y1)
      .attr('y2', lnin.y1 - newY)
      .style('stroke', '#6607ff');      


    newX = 20 * Math.cos(degree);
    newY = 20 * Math.sin(degree);
    damnit.append('line')
      .attr('x1', lnin.x1)
      .attr('x2', lnin.x1 - newX)
      .attr('y1', lnin.y1)
      .attr('y2', lnin.y1 + newY)
      .style('stroke', '#6607ff');  
}


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
