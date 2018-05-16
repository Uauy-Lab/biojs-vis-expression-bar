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
  axisLabelMargin:40, 
  ternColors: {left: "#579D1C", right: "#FF950E", bottom: "#4B1F6F"}
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
  var self = this;      // Saving this object in self for property method calling withing functions
  
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

  // Loading the corner titles and reordering them for correct rendering order <====== Don't know if messes with data (Probably will)
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
            if(i===0) {return opt.ternColors.left;}
            if(i===1) {return opt.ternColors.right;}
            if(i===2) {return opt.ternColors.bottom;}
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

    // Getting the 4 coordinates to draw the lines 
    var coordsArr = self._getFourCoords(v);
  
    // Draw the axis    
    self._drawAxis(coordsArr[0], coordsArr[1], opt.ternColors.left);
    self._drawAxis(coordsArr[1], coordsArr[2], opt.ternColors.right);
    self._drawAxis(coordsArr[2], coordsArr[3], opt.ternColors.bottom);
            
    // Tick labels
    self._drawTicks(coordsArr[0], 60, 'end', -opt.tickLabelMargin, v, opt.ternColors.left);
    self._drawTicks(coordsArr[1], -60, 'end', -opt.tickLabelMargin, 100-v, opt.ternColors.right);
    self._drawTicks(coordsArr[2], 0, 'start', opt.tickLabelMargin, v, opt.ternColors.bottom);    

  });

  // Render Arrows
  var rightArrowDistance = w/2 + opt.margin.right/2;
  var leftArrowDistance = w/2 + opt.margin.left/2;
  var bottomArrowDistance = h/2 + opt.margin.bottom;
  this._drawLeftArrows(30, 30, opt.ternColors.left, leftArrowDistance);  
  this._drawRightArrows(30, 30, opt.ternColors.bottom, rightArrowDistance);  
  this._drawBottomArrows(90, 30, opt.ternColors.right, bottomArrowDistance);

};


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
  if(i != 0){
    return;
  }

  var data = this.parent.data.renderedData;
  var allDataArray = [];  
  var self = this;

  // Loading all homeolouges data into an array
  for (var i=0; i<3; i++) {    
    var conditionArray = [];
    for(var j=0; j<data[i].length; j++){
      var dataHash = {};

      for (var key in this.parent.data.tern){
        if (data[i][j].gene === this.parent.data.tern[key]){        
          dataHash[key] = data[i][j].gene
        }
      }              
      dataHash.renderIndex = data[i][j].renderIndex;
      dataHash.value = data[i][j].value;    
      dataHash.factors = data[i][j].factors;
      conditionArray.push(dataHash);
    }    
    allDataArray.push(conditionArray);
  }      

  // console.log(this.parent.data.renderedData);

  // Creating hash labels for the circles  
    // Loading all condition text into an array 
  var allConditionsTextArr = [];
  var allConditionsTextNode = d3.select(`#bar_expression_viewer_chart_svg g`).selectAll('text').nodes();  
  for(var i=0; i<allConditionsTextNode.length; i++){    
    allConditionsTextArr.push(allConditionsTextNode[i].innerHTML);
  }  

    // Creating hashes from the text and repopulating the array
  var allConditionsHashArr = []; 
  allConditionsTextArr.forEach(function(d){
    allConditionsHashArr.push( 'p' + self._generateHash(d));    
  });
    

  // Loading the data    
  var d = [];
  for (var j = 0; j < allDataArray[0].length; j++) {
    d.push({
      a:allDataArray[0][j].value,
      b:allDataArray[1][j].value,
      c:allDataArray[2][j].value,
      label:allConditionsHashArr[j].toString(),
      factors:allDataArray[2][j].factors
    })          
  }    

  this._loadData(d, function(d){ return [d.a, d.b, d.c]});

};


// FOR DYNAMIC REASONS 
TernaryPlot.prototype.refreshBar = function(gene, i){

}; 


// DON'T NEED THIS
TernaryPlot.prototype.refreshScale = function(){

};



// Private functions
TernaryPlot.prototype._lineAttributes = function(p1, p2){
  return { x1:p1[0], y1:p1[1],
         x2:p2[0], y2:p2[1] };
}

TernaryPlot.prototype._coord = function(arr){
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

TernaryPlot.prototype._getFourCoords = function(tick){
  var coordsArr = []
    coordsArr.push(this._coord( [tick, 0, 100-tick] ));
    coordsArr.push(this._coord( [tick, 100-tick, 0] ));
    coordsArr.push(this._coord( [0, 100-tick, tick] ));
    coordsArr.push(this._coord( [100-tick, 0, tick] ));

    return coordsArr;
}

TernaryPlot.prototype._scale = function(){
  return [p[0] * factor, p[1] * factor];
}

TernaryPlot.prototype._loadData = function(data, accessor, bindBy){  //bind by is the dataset property used as an id for the join
    plot.dataset = data;
    var self = this;
    var colorFactor = this.opt.colorFactor;    
    var colors = null;


    if(! this.parent.isFactorPresent(colorFactor)){
      colorFactor = this.parent.getDefaultColour();
    }


    if(colorFactor != 'renderGroup'){
      colors = this.parent.factorColors[colorFactor]; 
    }



    var circles = svg.selectAll("circle")
      .data( data.map( function(d){ 
        var coordsLabel = self._coord(accessor(d)); 
        coordsLabel.push(d.label);
        coordsLabel.push(d.factors);
        return coordsLabel;
      }));
        

    circles
      .enter()
      .append("circle")
      .attr("cx", function (d) { return d[0]; })
      .attr("cy", function (d) { return d[1]; })
      .attr('id', function(d)  { return d[2]; })
      .attr("r", 6)
      .style("fill", function(d, i){        
        var ret = "#222222"
        if(colorFactor != 'renderGroup'){                    
          ret=colors[d[3][colorFactor]];
        }
        return ret;     
      })
      .style("stroke", function(d, i){        
        var ret = "#222222"
        if(colorFactor != 'renderGroup'){                    
          ret=colors[d[3][colorFactor]];
        }
        return ret;     
      })
      .style("stroke-width", 2);

    // If a condition text has been hovered over
    $(`#bar_expression_viewer_chart_svg g text`).on('mouseenter', function(){
      var conditionHash = 'p' + self._generateHash(this.innerHTML);      
      d3.select("#"+conditionHash).attr('r', 10);    
    });

    // If a condition text has been left
    $(`#bar_expression_viewer_chart_svg g text`).on('mouseleave', function(){
      var conditionHash = 'p' + self._generateHash(this.innerHTML);
      d3.select("#"+conditionHash).attr('r', 6);    
    });    

    return this;
}

// Form: https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript-jquery
TernaryPlot.prototype._generateHash = function(str){
  var hash = 0, i, chr;
  if (str.length === 0) return hash;
  for (i = 0; i < str.length; i++) {
    chr   = str.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
}

TernaryPlot.prototype._drawAxis = function(x, y, color){
  var allLineAttributes = this._lineAttributes(x, y);    
        axes.append("line")          
          .attr('x1', allLineAttributes.x1)
          .attr('x2', allLineAttributes.x2)
          .attr('y1', allLineAttributes.y1)
          .attr('y2', allLineAttributes.y2)
          .style('stroke', color)
          .style('stroke-width', 0.5);
}

TernaryPlot.prototype._drawTicks = function(coord, rotate, anchor, margin, tickText, color){
  axes.append('g')
      .attr('transform',function(d){
        return 'translate(' + coord[0] + ',' + coord[1] + ')'
      })
      .append("text")
        .attr('transform',`rotate(${rotate})`)
        .attr('text-anchor',anchor)
        .attr('x',margin)
        .text(tickText)               
        .style('font-weight', 'lighter')
        .style('font-size', '1rem')
        .style('fill', color);
}

TernaryPlot.prototype._getDegree = function(angle){
  return (angle/180) * Math.PI;
}

TernaryPlot.prototype._drawRightArrows = function(arrowPositionAngle, bladePositionAngle, color, moveArrow){

    var data = this.parent.data;
    var middleTick = opt.axis_ticks[(opt.axis_ticks.length - 1)] / 2    
    var coordsArr = this._getFourCoords(middleTick);
         
        
    var arrowPosX = moveArrow * Math.cos(this._getDegree(arrowPositionAngle)),
        arrowPosY = -moveArrow * Math.sin(this._getDegree(arrowPositionAngle));    
   
    var bladePosX = 10 * Math.cos(this._getDegree(bladePositionAngle)),
        bladePosY = 10 * Math.sin(this._getDegree(bladePositionAngle));    

    // Adding arrow base
    var allLineAttributes = this._lineAttributes(coordsArr[0], coordsArr[1]);    
    var arrowGroup = axes.append('g').attr('transform', `translate(${arrowPosX}, ${arrowPosY})`);
    arrowGroup.append("line")
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x2)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y2)
      .style('stroke', color);

    // Adding one blade
    arrowGroup.append('line')
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x1 + bladePosX)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y1 + bladePosY)
      .style('stroke', color);        

    // Adding one blade
    bladePosX = 10 * Math.cos(this._getDegree(bladePositionAngle+60));
    bladePosY = 10 * Math.sin(this._getDegree(bladePositionAngle+60));
    arrowGroup.append('line')
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x1 + bladePosX)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y1 + bladePosY)
      .style('stroke', color);   
      

    // Adding the gene title on top of the arrow
    arrowGroup.append('text')            
      .text(data.tern.B)
      .attr('x', allLineAttributes.x1)
      .attr('y', allLineAttributes.y1 - 20)            
      .attr('transform', `rotate(${60}, ${allLineAttributes.x1}, ${allLineAttributes.y1})`)      
      .style('fill', color);
}

TernaryPlot.prototype._drawLeftArrows = function(arrowPositionAngle, bladePositionAngle, color, moveArrow){  

    var data = this.parent.data;
    var middleTick = opt.axis_ticks[(opt.axis_ticks.length - 1)] / 2    
    var coordsArr = this._getFourCoords(middleTick);
         
        
    var arrowPosX = -moveArrow * Math.cos(this._getDegree(arrowPositionAngle)),
        arrowPosY = -moveArrow * Math.sin(this._getDegree(arrowPositionAngle));    
   
    var bladePosX = 10 * Math.cos(this._getDegree(bladePositionAngle)),
        bladePosY = 10 * Math.sin(this._getDegree(bladePositionAngle));    

    // Adding arrow base    
    var allLineAttributes = this._lineAttributes(coordsArr[1], coordsArr[2]);    
    var arrowGroup = axes.append('g').attr('transform', `translate(${arrowPosX}, ${arrowPosY})`);
    arrowGroup.append("line")
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x2)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y2)
      .style('stroke', color);

    // Adding one blade
    arrowGroup.append('line')
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x1 + bladePosX)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y1 - bladePosY)
      .style('stroke', color);        

    // Adding one blade
    bladePosX = 10 * Math.cos(this._getDegree(bladePositionAngle+60));
    bladePosY = 10 * Math.sin(this._getDegree(bladePositionAngle+60));
    arrowGroup.append('line')
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x1 + bladePosX)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y1 - bladePosY)
      .style('stroke', color);   


    // Adding the gene title on top of the arrow
    arrowGroup.append('text')            
      .text(data.tern.A)
      .attr('x', allLineAttributes.x1)
      .attr('y', allLineAttributes.y1 - 20)            
      .attr('transform', `rotate(${-60}, ${allLineAttributes.x1}, ${allLineAttributes.y1})`)      
      .style('fill', color);
}

TernaryPlot.prototype._drawBottomArrows = function(arrowPositionAngle, bladePositionAngle, color, moveArrow){

    var data = this.parent.data;
    var middleTick = opt.axis_ticks[(opt.axis_ticks.length - 1)] / 2    
    var coordsArr = this._getFourCoords(middleTick);
         
        
    var arrowPosX = moveArrow * Math.cos(this._getDegree(arrowPositionAngle)),
        arrowPosY = moveArrow * Math.sin(this._getDegree(arrowPositionAngle));    
   
    var bladePosX = 10 * Math.cos(this._getDegree(bladePositionAngle)),
        bladePosY = 10 * Math.sin(this._getDegree(bladePositionAngle));    

    // Adding arrow base
    var allLineAttributes = this._lineAttributes(coordsArr[2], coordsArr[3]);    
    var arrowGroup = axes.append('g').attr('transform', `translate(${arrowPosX}, ${arrowPosY})`);
    arrowGroup.append("line")
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x2)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y2)
      .style('stroke', color);

    // Adding one blade
    arrowGroup.append('line')
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x1 - bladePosX)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y1 + bladePosY)
      .style('stroke', color);        
    
    // Adding one blade
    arrowGroup.append('line')
      .attr('x1', allLineAttributes.x1)
      .attr('x2', allLineAttributes.x1 - bladePosX)
      .attr('y1', allLineAttributes.y1)
      .attr('y2', allLineAttributes.y1 - bladePosY)
      .style('stroke', color);   

    // Adding the gene title on top of the arrow
    arrowGroup.append('text')            
      .text(data.tern.D)
      .attr('x', allLineAttributes.x2)
      .attr('y', allLineAttributes.y2 + 20)                              
      .style('fill', color);
}



module.exports.TernaryPlot = TernaryPlot;
