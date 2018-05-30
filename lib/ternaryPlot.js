var science = require('science');
var colorbrewer = require('colorbrewer');
var d3 = require('d3');
require('string.prototype.startswith');
var exts = require('./d3Extensions.js');



// Default Ternary Plot Options
var opt = {
  width:($(window).width() * 0.6),
  height: $(window).height(),
  side: ($(window).height() * 0.5),
  margin: {top:100,left:50,bottom:50,right:50},
  axis_labels:['A','B','C'],
  axis_ticks:[0,20,40,60,80,100],
  tickLabelMargin:10,
  axisLabelMargin:40, 
  ternColors: {left: "#579D1C", right: "#FF950E", bottom: "#4B1F6F"}
}

var TernaryPlot = function (parent) {  
  this.parent = parent;
  this.opt = parent.opt;    
  this.selector = parent.ternaryPlotContainer;  
}


// DON'T NEED THIS
TernaryPlot.prototype.renderScales = function(i){

};


// RENDERING THE STRUCTURE OF THE TERNARY PLOT
TernaryPlot.prototype.renderGlobalScale = function(){
 
  // Initialising local variables
    var barHeight = this.opt.barHeight;
    var labelWidth = this.opt.labelWidth;  
    var offset = this.opt.headerOffset;  
    var data = this.parent.data;
    var self = this;      // Saving this object in self for property method calling withing functions    

  // Fix the position of the div conatainer of the ternary plot
    plotContainer = d3.select('#' + this.selector);    

    console.log(`Top-->\nbarHeight: ${barHeight}\noffset: ${offset}\nLeft-->\nlabelWidth: ${labelWidth}`);

    plotContainer.style('position', 'fixed').style('top', (barHeight + offset)).style('left', labelWidth);

  // Set the svg height and width 
    svg = plotContainer.append('svg')        
        .attr('id', 'ternaryPlotSVG')
        .attr("width", opt.width)
        .attr("height", opt.height)
        .style('font-family', this.parent.opt.fontFamily);

  // Adding a group for the ternary plot structure
    ternaryPlotGroup = svg.append('g')
      .attr('id', 'ternaryPlotGroup');

  // Add a sub group for the axes
    axes = ternaryPlotGroup.append('g');

  // Calculating the height and width of the Plot
    w = opt.side;
    h = Math.sqrt( opt.side*opt.side - (opt.side/2)*(opt.side/2));

  // Setting the position of the corners
    corners = [
    [opt.margin.left, h + opt.margin.top], // a
    [ w + opt.margin.left, h + opt.margin.top], //b 
    [(w/2) + opt.margin.left, opt.margin.top] ] //c

  // Loading the corner titles
    opt.axis_labels = data.tern_order;  

  // Render corner titles
    axes.selectAll('.axis-title')
      .data(opt.axis_labels)
      .enter()
        .append('g')        
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

  // Render Tooltip
    this._renderTooltip();

};


// DON'T NEED THIS
TernaryPlot.prototype.calculateBarWidth = function(){  

};


// DON'T NEED THIS
TernaryPlot.prototype.rangeX = function(){

}


// DON'T NEED THIS
TernaryPlot.prototype.ScaleRangeX = function(){

};


// PREPARING DATA FOR DISPLAY
TernaryPlot.prototype.renderGeneBar = function(i){ 
  // Only run this function once
    if(i != 0){   
      return;
    }  

  // Initialising variables
    var data = this.parent.data.renderedData;
    var ternOrder = this.parent.data.tern_order;
    var tern = this.parent.data.tern;  
    var self = this;
    var dataMap = new Map();  

  // Load rendered data into a map/hash to its corresponding tern/key    
    ternOrder.forEach(function(ternOrderElement){    
    for(var i=0; i<data.length; i++){
      for (var key in tern){
        if (data[i][0].gene === tern[key] && key === ternOrderElement){                
          dataMap.set(ternOrderElement, data[i]);
        }
      }      
    }  
  });  
  
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
      allConditionsHashArr.push( 'circle' + self._generateHash(d));    // IMPORTANT: had to add a prefix (circle) to the hash to make it selectable by d3
    });
    
      // Adding the hash ids to the conditions for linking them to the circles
    d3.select(`#bar_expression_viewer_chart_svg g`).selectAll('text').attr('id', function(d, i){
      return allConditionsHashArr[i];
    });

  // Creating an array of maps that hold all the data needed for visualisation
    var mapArray = [];  
    for(var i=0; i<dataMap.values().next().value.length; i++){    // Loop for the number of condition titles
      var mapElement = new Map();
      var coordArguments = [];  
      var sumOfValues = 0;
      ternOrder.forEach(function(ternOrderElement, index){        // Go through the terns in order and set their value and factors and sum their values
        coordArguments.push(dataMap.get(ternOrderElement)[i].value);            
        mapElement.set(ternOrderElement, dataMap.get(ternOrderElement)[i].value);
        mapElement.set('factors', dataMap.get(ternOrderElement)[i].factors);
        sumOfValues += dataMap.get(ternOrderElement)[i].value;
        if(index===2){    // If this is the last tern (Calculate the contribution percentage)
          ternOrder.forEach(function(ternOrderElementInnerLoop, indexInnerLoop){
            var ternValue = mapElement.get(ternOrderElementInnerLoop);
            mapElement.set(ternOrderElementInnerLoop, (ternValue / sumOfValues) * 100);
          });
        }
      });                
      var circleCoords = self._coord(coordArguments);
      mapElement.set('cx', circleCoords[0]);
      mapElement.set('cy', circleCoords[1]);
      mapElement.set('id', allConditionsHashArr[i]);    
      mapArray.push(mapElement);
    }        

  // Load data onto the plot
    this._loadData(mapArray);    
};


// FOR DYNAMIC REASONS 
TernaryPlot.prototype.refreshBar = function(gene, i){

}; 


// DON'T NEED THIS
TernaryPlot.prototype.refreshScale = function(){

};



// Private functions ---------------------------------------------------------------------------------------------
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

// Rendering the circles onto the plot
TernaryPlot.prototype._loadData = function(data){  //bind by is the dataset property used as an id for the join    
    var self = this;
    var colorFactor = this.opt.colorFactor;    
    var colors = null;
    var ternOrder = this.parent.data.tern_order;


    // Getting the color & color factor
      if(! this.parent.isFactorPresent(colorFactor)){
        colorFactor = this.parent.getDefaultColour();
      }

      if(colorFactor != 'renderGroup'){
        colors = this.parent.factorColors[colorFactor]; 
      }
    

    // Rendering the circles      
      var circles = ternaryPlotGroup.selectAll("circle")        
        .data( data );
          
      circles.exit().remove();

      circles
        .enter()
        .append("circle")
        .attr("r", 6)        
        .merge(circles)          
          .transition()
          .attr("cx", function (dataElements) { return dataElements.get('cx'); })
          .attr("cy", function (dataElements) { return dataElements.get('cy'); })
          .attr('id', function (dataElements)  { return dataElements.get('id'); })      
          .style("fill", function(dataElements, i){        
            var ret = "#222222"
            if(colorFactor != 'renderGroup'){                    
              ret=colors[dataElements.get('factors')[colorFactor]];
            }
            return ret;     
          })
          .style("stroke", "#222222")
          .style("stroke-width", 2);

        circles
          .on('mouseenter', function(){          
            var circle = d3.select(this);         
            var thisCircleData = circle.data();            
            circle.attr('r', 10);
            d3.select(`text#${circle.attr('id')}`).style('fill', 'red')      
            var toolTipText = "";            
            ternOrder.forEach(function(element, index){                                  
              toolTipText += `${element} : ${thisCircleData[0].get(element).toFixed(2)}% `;
            });                                                  
            self._showTooltip(toolTipText, this);
          })
          .on('mouseleave', function(){          
            var circle = d3.select(this);
            circle.attr('r', 6);         
            d3.select(`text#${circle.attr('id')}`).style('fill', 'black')
            self._hideTooltip();
          });          



    // If a condition text has been hovered over
      $(`#conditions text`).on('mouseenter', function(){
        self.parent.selectionBox.attr('visibility', 'visible');
        self.parent.selectionBox.attr('width', self.parent.opt.labelWidth);
        var conditionHash = 'circle' + self._generateHash(this.innerHTML);      // IMPORTANT: had to add a prefix (circle) to the hash to make it selectable by d3                  
        var thisCircle = d3.select("circle#"+conditionHash);                
        var thisCircleData = thisCircle.data();
        thisCircle.attr('r', 10);
        $("#ternaryPlotGroup").get(0).appendChild(thisCircle.node());        
        var toolTipText = "";            
        ternOrder.forEach(function(element, index){                                  
          toolTipText += `${element} : ${thisCircleData[0].get(element).toFixed(2)}% `;
        }); 
        self._showTooltip(toolTipText, thisCircle.node());
      });

    // If a condition text has been left
      $(`#conditions text`).on('mouseleave', function(){
        self.parent.selectionBox.attr('visibility', 'hidden');        
        var conditionHash = 'circle' + self._generateHash(this.innerHTML);      // IMPORTANT: had to add a prefix (circle) to the hash to make it selectable by d3
        d3.select("circle#"+conditionHash).attr('r', 6);   
        self._hideTooltip(); 
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
      .text(data.tern[data.tern_order[2]])
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
      .text(data.tern[data.tern_order[0]])
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
      .text(data.tern[data.tern_order[1]])
      .attr('x', allLineAttributes.x2)
      .attr('y', allLineAttributes.y2 + 20)                              
      .style('fill', color);
}

TernaryPlot.prototype._renderTooltip = function(){
  var barHeight = this.opt.barHeight;
  var fontSize = this.opt.fontSize;
  this.tooltipBox = svg.append('rect');
  this.tooltip = svg.append('text');
  this.tooltip.attr('x',0)
  .attr('y', 0)
  .attr('height', barHeight -2)
  .attr('fill', 'white')
  .attr('font-size', fontSize/1.4)
  .attr('visibility', 'hidden')
}

TernaryPlot.prototype._showTooltip = function(mouseovertext, evt){
  var tooltip = this.tooltip;  
  var x, y;  

  var svgPosition = d3.select(evt).position(this);    
    
  x = svgPosition.left + 11;
  y = svgPosition.top;  
    
  var svg1 = $('#' + this.parent.ternaryPlotContainer);  

  var max =  svg1.height() - this.opt.barHeight;
  if(y > max){
    y = max;
  }

  tooltip.attr('x', x);
  tooltip.attr('y', y);
  tooltip.text(mouseovertext);
  var textBox = tooltip.node().getBBox();

  var xOffset = 0;
  var rigthBox = textBox.x + textBox.width;

  if(  rigthBox > svg1.width()){
    xOffset = textBox.width;
    tooltip.attr('x', x - xOffset);
  }

  var padding = 2;
  this.tooltipBox.attr('x', textBox.x - xOffset - padding);
  this.tooltipBox.attr('y', textBox.y - padding);
  this.tooltipBox.attr('width', textBox.width + (padding*2))
  this.tooltipBox.attr('height', textBox.height + (padding*2))
  tooltip.attr('visibility', 'visible');
  this.tooltipBox.attr('visibility', 'visible');
}

TernaryPlot.prototype._hideTooltip = function(){
  this.tooltip.attr('visibility', 'hidden');
  this.tooltipBox.attr('visibility', 'hidden');
  return;
}

module.exports.TernaryPlot = TernaryPlot;

