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
};

var TernaryPlot = function (parent) {  
  this.parent = parent;
  this.opt = parent.opt;    
  this.selector = parent.chartSVGid;  
};


// DON'T NEED THIS
TernaryPlot.prototype.renderScales = function(i){

};


// RENDERING THE STRUCTURE OF THE TERNARY PLOT
TernaryPlot.prototype.renderGlobalScale = function(){  

  // Initialising local variables
    var barHeight = this.opt.barHeight;
    var labelWidth = this.opt.labelWidth;
    var plotContainerId = this.parent.plotContainer;
    var offset = this.opt.headerOffset;  
    var data = this.parent.data;
    var self = this;      // Saving this object in self for property method calling withing functions    
    var optionsHeight = $(`#bar_expression_viewer_options`).height();

    opt.width = $(document).width() - labelWidth;
    opt.height = window.innerHeight;
    opt.side = opt.width;    


  // Remove footer
    $(`#${this.parent.chartSVGidFoot}`).css('display', 'none');

  // Fix the position of the div conatainer of the ternary plot
    plotContainer = d3.select('#' + this.selector);


  // Set the svg height and width	
    svg = plotContainer.append('g')
        .attr('id', 'ternaryPlotSVG')
        .attr("width", $(document).width())
        .attr("height", $('#' + this.selector).height())
        .attr(`transform`, `translate(${labelWidth},${-20})`)
        .style('font-family', this.parent.opt.fontFamily);

  // Adding the block divisions    
    this._drawBlockDivisions();
    

  // Adding a group for the ternary plot structure
    ternaryPlotGroup = svg.append('g')
      .attr('id', 'ternaryPlotGroup');

  // Add a sub group for the axes
    axes = ternaryPlotGroup.append('g');


  // Deciding the sizing of the ternary plot  
    this._calculateplotSize();
    

  // Setting the position of the corners
    corners = [
    [opt.margin.left, h + opt.margin.top], // a
    [ w + opt.margin.left, h + opt.margin.top], //b 
    [(w/2) + opt.margin.left, opt.margin.top] ] //c

  // Loading the corner titles
    opt.axis_labels = data.tern_order;  

  // Render corner labels
    this._drawCornerLabels();
  
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

  	this._responseToScroll(); 
 
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
      if(sumOfValues !== 0){        // Ignore if there are no data for a certain condition (avoid rendering the circle)
        mapArray.push(mapElement);
      }      
    }    

    var centroid = this._calculateCentroid(mapArray);    

    var expressionBias = this._calculateExpressionBias(mapArray, centroid);

    this._indicateExpressionBias(expressionBias);

    mapArray.unshift(centroid);    


  // Load data onto the plot
    this._loadData(mapArray);    
};


// FOR DYNAMIC REASONS 
TernaryPlot.prototype.refreshBar = function(gene, i){

}; 


// DON'T NEED THIS
TernaryPlot.prototype.refreshScale = function(){

};


TernaryPlot.prototype.showHighithRow = function(){
  return 0;
}

TernaryPlot.prototype.hideHidelightRow = function(){
  var self = this;
  if(typeof self.parent.selectionBox !== 'undefined'){
    self.parent.selectionBox .attr('visibility', 'hidden');
    self.parent.selectionBoxGene.attr('visibility', 'hidden');
    self.parent.selectionBoxTitles.attr('display', 'none');
  }
}


// Private functions ---------------------------------------------------------------------------------------------
TernaryPlot.prototype._lineAttributes = function(p1, p2){
  return { x1:p1[0], y1:p1[1],
         x2:p2[0], y2:p2[1] };
}

// Array in the parameter must contain the data in the form: A, D, B
TernaryPlot.prototype._coord = function(arr){
  var a = arr[0], d=arr[1], b=arr[2]; 
    var sum, pos = [0,0];
    sum = a + d + b;
      if(sum !== 0) {
        a /= sum;
        d /= sum;
        b /= sum;
        pos[0] =  corners[0][0]  * a + corners[1][0]  * d + corners[2][0]  * b;
        pos[1] =  corners[0][1]  * a + corners[1][1]  * d + corners[2][1]  * b;
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
    var tooltip_order = this.parent.data.tooltip_order;
    var plotContainerId = this.parent.plotContainer;


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
        .attr("cx",  w/2)
        .attr("cy", h/2)
        .merge(circles)          
          .transition()
          .attr("cx", function (dataElements) { return dataElements.get('cx'); })
          .attr("cy", function (dataElements) { return dataElements.get('cy'); })
          .attr('id', function (dataElements)  { return dataElements.get('id'); })
          .style("fill", function(dataElements, i){
            var ret = "red"
            if(colorFactor != 'renderGroup' && dataElements.get('id') !== 'centroid'){
              ret=colors[dataElements.get('factors')[colorFactor]];
            }
            return ret;     
          })
          .style("stroke", "#222222")
          .style("stroke-width", 2);

        circles

          .on('mouseenter', function(){          
      			// This variable is used to determine the scroll amount to make the tooltip popup move
      		 	initialScrollValue = $(`#${plotContainerId}`).scrollTop();

            var circle = d3.select(this);
            var thisCircleData = circle.data();
      			var thisCricleObject = this;
            var toolTipText = "";
            var circleId = circle.attr('id');

            circle.attr('r', 10);
            d3.select(`text#${circle.attr('id')}`).style('fill', 'red')
            tooltip_order.forEach(function(element, index){
              toolTipText += `${element} : ${thisCircleData[0].get(element).toFixed(2)}% `;
            });
            if(circleId === 'centroid'){
              toolTipText = 'Centroid: ' + toolTipText;
            }
            self.parent.showTooltip(toolTipText, this);
          })
          .on('mouseleave', function(){
            var circle = d3.select(this);
            circle.attr('r', 6);         
            d3.select(`text#${circle.attr('id')}`).style('fill', 'black')
            self.parent.hideTooltip();
          });          



    // If a condition text has been hovered over
      $(`#conditions text`).on('mouseenter', function(){
        try{
          self.parent.selectionBox.attr('visibility', 'visible');
          self.parent.selectionBox.attr('width', self.parent.opt.labelWidth);
          var conditionHash = 'circle' + self._generateHash(this.innerHTML);      // IMPORTANT: had to add a prefix (circle) to the hash to make it selectable by d3                  
          var thisCircle = d3.select("circle#"+conditionHash);                
          var thisCircleData = thisCircle.data();
          thisCircle.attr('r', 10);
          $("#ternaryPlotGroup").get(0).appendChild(thisCircle.node());        
          var toolTipText = "";            
          tooltip_order.forEach(function(element, index){                                  
            toolTipText += `${element} : ${thisCircleData[0].get(element).toFixed(2)}% `;
          }); 
          self.parent.showTooltip(toolTipText, thisCircle.node()); 

        } catch(err){
          console.warn(`${this.innerHTML} has no value`);
        }        
      });

    // If a condition text has been left
      $(`#conditions text`).on('mouseleave', function(){
        self.parent.selectionBox.attr('visibility', 'hidden');        
        var conditionHash = 'circle' + self._generateHash(this.innerHTML);      // IMPORTANT: had to add a prefix (circle) to the hash to make it selectable by d3
        d3.select("circle#"+conditionHash).attr('r', 6);   
        self.parent.hideTooltip(); 
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

TernaryPlot.prototype._drawBlockDivisions = function(){
  var data = this.parent.data;
  var chartHeaderId = this.parent.chartSVGidHead;
  var labelWidth = this.parent.opt.labelWidth;
  var headerOffset = this.parent.opt.headerOffset;  
  var blockContainer = d3.select(`#${chartHeaderId}`).append('g').attr('id', 'expression-bias');
  var blockSize = 25;


  for (var j = 0; j < Object.keys(data.expression_bias).length; j++) {

    // Append the expression bias label
    blockContainer.append('text').text(Object.keys(data.expression_bias)[j]).attr('width', 100).attr('height', blockSize).attr('x', labelWidth).attr('y', (headerOffset - (blockSize*3) - 10)+(j*blockSize*2));    

    var blockDiv = blockContainer.append('g').attr('id', `block-group-${j}`);

    for (var i = 0; i < Object.values(data.expression_bias)[j].length; i++) {
      blockDiv.append('rect')
        .attr('width', blockSize)
        .attr('height', blockSize)
        .style('stroke-width', 2)
        .style('stroke', 'black')
        .style('fill', 'white')
        .attr('x', (i*blockSize)+labelWidth+120)
        .attr('y', (headerOffset - (blockSize*4) - 5)+(j*blockSize*2));

      blockDiv.append('text')
        .style('font-size', 10)
        .text(Object.values(data.expression_bias)[j][i])
        .attr('width', blockSize)
        .attr('height', blockSize)
        .attr('x', (i*blockSize)+labelWidth + 130)
        .attr('y', (headerOffset - (blockSize*3) + 5)+(j*blockSize*2));
    }     

  }

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

TernaryPlot.prototype._drawCornerLabels = function(){
  axes.selectAll('.axis-title')
    .data(opt.axis_labels)
    .enter()
      .append('g')        
        .attr('transform',function(d,i){          
          return 'translate('+corners[i][0]+','+corners[i][1]+')';
        })        
        .style('font-size', '1.3rem')
        .append('text')            
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
}

TernaryPlot.prototype._responseToScroll = function(){

  var plotContainer = this.parent.plotContainer;
	var labelWidth = this.parent.opt.labelWidth;  
  var sortDiv = this.parent.sortDivId;
  var chartSVGidHead = this.parent.chartSVGidHead;
  var self = this;
  var lastScrollLeft = 0;  
    

	$(`#${plotContainer}`).scroll(function(){

		if(typeof initialScrollValue === "undefined"){
			initialScrollValue = 0;
		}

		scrollValue = $(`#${plotContainer}`).scrollTop();    	
		// Amount of scroll vertically
		var amountOfScroll = scrollValue - initialScrollValue;
    // Amount of Scroll horizontally
    var documentScrollLeft = $(`#${plotContainer}`).scrollLeft();

    // Move elements in response
		d3.select('#ternaryPlotSVG').attr(`transform`, `translate(${labelWidth},${-20 + scrollValue})`);
		$('#toolTipRect').attr(`transform`, `translate(${0},${amountOfScroll})`);
		$('#toolTipText').attr(`transform`, `translate(${0},${amountOfScroll})`);
    
    if (lastScrollLeft != documentScrollLeft){      
      lastScrollLeft = documentScrollLeft;
      d3.select(`#${chartSVGidHead}`).attr(`transform`, `translate(${-lastScrollLeft},${0})`);
      $(`#${sortDiv}`).css(`left`, -lastScrollLeft);
    }

	});

  // scroll the plot when it is refreshed
	if(typeof scrollValue !== "undefined"){
	  d3.select('#ternaryPlotSVG').attr(`transform`, `translate(${labelWidth},${-20 + scrollValue})`);
	}
}

TernaryPlot.prototype._calculateCentroid = function(data){  
  var averageOfA = 0, averageOfB = 0, averageOfD = 0;
  var dataMap = new Map();
  
  var arr = [];
  var brr = [];
  var drr = [];
  for(var mapElement in data){
    averageOfA += data[mapElement].get('A');
    averageOfB += data[mapElement].get('B');
    averageOfD += data[mapElement].get('D');    
  }  
  averageOfA /= data.length;
  averageOfB /= data.length;
  averageOfD /= data.length;

  var circleCoords = this._coord([averageOfA, averageOfD, averageOfB]);  

  dataMap.set('id', 'centroid');
  dataMap.set('A', averageOfA);
  dataMap.set('B', averageOfB);
  dataMap.set('D', averageOfD);
  dataMap.set('cx', circleCoords[0]);
  dataMap.set('cy', circleCoords[1]);    

  return dataMap;
}

TernaryPlot.prototype._calculateExpressionBias = function(data, centroid){
  var sumOfDistances = 0,
      expressionBias = 0;

  var aDistanceArr = [],
      bDistancesArr = [],
      dDistancesArr = [];

  for(var mapElement in data){
    var aDistances = data[mapElement].get('A') - centroid.get('A');
    var bDistances = data[mapElement].get('B') - centroid.get('B');
    var dDistances = data[mapElement].get('D') - centroid.get('D');
    sumOfDistances += Math.sqrt(Math.pow(aDistances, 2) + Math.pow(bDistances, 2) + Math.pow(dDistances, 2));
    aDistanceArr.push(aDistances);
    bDistancesArr.push(bDistances);
    dDistancesArr.push(dDistances);
  }    

  expressionBias = sumOfDistances / data.length;    

  return expressionBias;
}

TernaryPlot.prototype._indicateExpressionBias = function(expressionBias){
    var numOfBlockRows = d3.selectAll(`#expression-bias g`).nodes().length;    

    for(var i=0; i<numOfBlockRows; i++){

      var blockLabels = d3.selectAll(`#block-group-${i} text`).nodes();
      var selectedLabel = 0;

      for(var label in blockLabels){
        if((blockLabels[label].innerHTML - expressionBias/100) > 0){     // Select the first label value that produces a negative value (indicates the index of the block)
            selectedLabel = blockLabels.indexOf(blockLabels[label]);     
            break;
        }
      }

      var nChild = (Math.floor(selectedLabel * 2)) + 1;      

      d3.select(`#block-group-${i} rect:nth-child(${nChild})`).style('fill', 'red');  

    }    
}

TernaryPlot.prototype._calculateplotSize = function(){  
  var plotContainerId = this.parent.plotContainer;
  var labelWidth = this.opt.labelWidth;
  var plotContainerHeight = $(`#${plotContainerId}`).height() - 70;
  var plotContainerWidth = $(`#${this.parent.chartSVGid}`).width() - labelWidth;
  var parentWidth = $(`#${this.parent.opt.target}`).parent().width() - 20; // 50 is the scrollbar width


  if(parentWidth < 900){
    
      h = plotContainerHeight - 150;
      w = Math.sqrt((4/3) * (h*h));

  } else {
    
    if(plotContainerHeight < plotContainerWidth){

      h = plotContainerHeight - 150;
      w = Math.sqrt((4/3) * (h*h));

    } else {

      w = plotContainerWidth - 150;
      h = Math.sqrt( w*w - (w/2)*(w/2));

    }

  }

}

module.exports.TernaryPlot = TernaryPlot;

