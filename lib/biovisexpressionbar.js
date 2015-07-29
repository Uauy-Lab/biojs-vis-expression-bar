var jQuery = require("jquery");
var d3 = require("d3");
var science = require("science");
var colorbrewer = require("colorbrewer")
//qvar stats = require("stats-lite");
/*
 * expression-bar
 * https://github.com/homonecloco/expression-bar
 *
 * Copyright (c) 2014 Ricardo H. Ramirez-Gonzalez
 * Licensed under the MIT license.
 */

/**
@class expressionbar
*/

/**
 * Private Methods
 */

/*
 * Public Methods
 */



var ExpressionBar = function (options) {
	var self = this;
	this.opt = {
   target: "bar_expression_viewer",
   fontFamily: '"Andale mono", courier, monospace',
   fontColor: "white",
   backgroundColor: "white",
   selectionFontColor: "black",
   selectionBackgroundColor: "yellow",
   width: "600",
   height: "800", 
   barHeight: 20,
   labelWidth: 200,
   renderProperty: "fpkm",
   renderGroup: "group",
   highlight: "MyGene", 
   groupBy: "groups", 
   groupBarWidth: 20, 
   colorFactor: "renderGroup", 
   headerOffset: 100
 };

 jQuery.extend(this.opt, options);
 this.opt.sc = d3.scale.category20();
 this.loadExpression(this.opt.data)
 this._container = jQuery("#"+self.opt.target);

 this._container.css({
  'font-family': self.opt.fontFamily, 
  'font-size': self.opt.barHeight + "px",
  'text-align': 'center',
  'vertical-align':'top',
  'display': 'table-cell',
  'width': self.opt.width + "px",
  'height': self.opt.height + "px",
  'overflow': 'scroll',
  'backgroundColor': self.opt.backgroundColor
 });

 this.chartSVGid =this.opt.target+"_chart_svg"
 this._container.append('Color by: <select id="'+this.opt.target+'_group"></select>');
 this._container.append('Property: <select id="'+this.opt.target+'_property"></Select>');
 this._container.append('<button type="button" id="' +this.opt.target + '_save"> Save plot</button>');
 this._container.append('<br/><svg id="' + this.chartSVGid + '" ></svg>');

 this.property_selector = jQuery('#'+ this.opt.target+'_property');
 this.group_selector_colour = jQuery('#'+ this.opt.target+'_group');
 this.save_button = jQuery('#'+ this.opt.target+'_save');
 this.save_button.click(function(e) {
    self.saveRenderedSVG();
});
 
 this.renderGroupSelectorColour();
 
 this.chart = d3.select("#"+this.chartSVGid).attr("width", this.opt.width);
 this.barGroups = new Array();
};

ExpressionBar.prototype.renderPropertySelector = function(){
 var self = this;
 var group_options = this.data.values[this.opt.highlight];
 jQuery.each(group_options, function(key,value) {   
   self.property_selector
   .append(jQuery("<option></option>")
     .attr("value",key)
     .text(key)); 
 });
 this.property_selector.val(this.opt.renderProperty);

 this.property_selector.on("change", function(event) { 
   self.opt.renderProperty  = self.property_selector.find(":selected").text();;
   self.refresh();
 } );

};

ExpressionBar.prototype.renderGroupSelectorColour = function(){
 var self = this;
 var group_options = {"study":"study", "group":"group"};
 jQuery.each(group_options, function(key,value) {   
   self.group_selector_colour
   .append(jQuery("<option></option>")
    .attr("value",key)
     .text(value)); 
 });
 this.group_selector_colour.val(this.opt.renderGroup);

 this.group_selector_colour.on("change", function(event) { 
   self.opt.renderGroup  = self.group_selector_colour.find(":selected").text();;
   self.refresh();
 } );

};

ExpressionBar.prototype.saveRenderedSVG = function(){
  //get svg element.
  var svg = document.getElementById(this.chartSVGid);

  //get svg source.
  var serializer = new XMLSerializer();
  var source = serializer.serializeToString(svg);

  //add name spaces.
  if(!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)){
     source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  if(!source.match(/^<svg[^>]+"http\:\/\/www\.w3\.org\/1999\/xlink"/)){
    source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
  }

  //add xml declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

  //convert svg source to URI data scheme.
  var url = "data:image/svg+xml;charset=utf-8,"+encodeURIComponent(source);

  //set url value to a element's href attribute.
  //document.getElementById(this.opt.target + '_save').href = url;
  //you can download svg file by right click menu.
  var pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', "plot.svg");
  if (document.createEvent) {
       var event = document.createEvent('MouseEvents');
        event.initEvent('click', true, true);
        pom.dispatchEvent(event);
    }
    else {
       
    }
    document.body.removeChild(pom);
};


/**
 * Sets a Map with the available factors and the values from the json
 * response. 
 */
ExpressionBar.prototype.setAvailableFactors = function(){
   var groups = this.data["groups"];
   this.factors = new Map();
   for (var g in groups) {
      for(var k in groups[g].factors){
        if(! this.factors.has(k)){
          this.factors.set(k, new Set());
        }
        var current_set = this.factors.get(k);
        current_set.add(groups[g].factors[k]);
      }  
   };

   this.factorOrder = new Map()     

};

ExpressionBar.prototype.loadExpression = function(url) {
  if (typeof url === 'undefined') { return };
  var self = this;
  d3.json(url, function(error, json) {
    if (error) {
      console.warn(error);
      return;
    }
    self.data = json;
    self.dataLoaded();
  })
};


//To keep the indeces we reiterate and set them
ExpressionBar.prototype.setRenderIndexes = function(to, from){
  for(i in from){
    var gene=from[i];
    for(j in gene){
      to[i][j].renderIndex = from[i][j].renderIndex;
    }
  }
};

ExpressionBar.prototype.getGroupedData = function(property, groupBy){
  var dataArray = new Array;
  var offset = 0; 

  for(gene in this.data.values){
    var i = 0;
    var data = this.data.values[gene][property];
    var innerArray = new Array
    if(groupBy == null){
      for(var o in data) {
        var oldObject = data[o];
        var newObject = JSON.parse(JSON.stringify(oldObject));
        newObject["renderIndex"] = i;
        newObject["id"] = i++;
        newObject["name"] = this.data.experiments[newObject.experiment].name
        newObject["stdev"] = 0;
        newObject["gene"] = gene;
        newObject["offset"] = offset;

        innerArray.push(newObject);
      }
    }else if(groupBy == "groups"){
      var groups ={}
      var g = this.data.groups;
      var e = this.data.experiments;
      for(var o in g){  
        var newObject= {};
        newObject["renderIndex"] = i;
        newObject["id"] = i++;
        newObject["name"] = g[o].description;
        newObject["data"] = new Array;
        newObject["offset"] = offset;
        newObject["factors"] = g[o].factors;
        groups[o] = newObject;
      }

      for(var o in e){
        groups[e[o].group].data.push(data[o].value);
      }

      for(var o in groups){
        var newObject = groups[o];
        var v = science.stats.mean(newObject.data);
        var stdev = science.stats.variance(newObject.data);
        newObject["value"] = v;
        newObject["stdev"] = stdev;
        newObject["gene"] = gene;
        innerArray.push(newObject);
      }
      offset ++;
      dataArray.push(innerArray);
    }
      else{
        console.log("Not yet implemented");
      }
  }

  if(this.renderedData){
    this.setRenderIndexes(dataArray, this.renderedData);
  }

  return dataArray;
};

//The only parameter, sortOrder, is an array of the factors that will be used tos ort. 
ExpressionBar.prototype.sortRenderedGroups = function(sortOrder){
 var orderMap = {};
 var i;
 var sortable = this.renderedData[0].slice();
 sortOrder.push("id");

 var sorted = sortable.sort(function(a, b){
  for(var i in sortOrder){
    var o = sortOrder[i];
    if (a.factors[o] > b.factors[o]) {
      return 1;
    }
    if (a.factors[o] < b.factors[o]) {
     return -1;
    };
  }
 });
 for (var i = 0; i < sorted.length; i++) {
   sorted[i].renderIndex = i;
 };

 for(var i = 0; i < this.renderedData.length; i++){
  for (var j = 0; j < sorted.length; j++) {
    var obj = this.renderedData[i][sorted[j].id];
    obj.renderIndex = sorted[j].renderIndex;
  };
 }
};

ExpressionBar.prototype.refreshBar = function(gene, i){
  var data = this.renderedData;
  var dat = data[i];
  var x=this.x;
  var sc = this.opt.sc;
  var colorFactor = this.opt.colorFactor;
  var self = this;
  var colors = null;
  var barHeight = this.opt.barHeight;
  var headerOffset  = this.opt.headerOffset;
  if(colorFactor != "renderGroup"){
    colors = this.factorColors[colorFactor];
  }

  //Refresh the bar sizes and move them if they where sorted
  var bar = this.barGroup.selectAll("g").filter(function (d, j) { return j == i;});
  rects = bar.selectAll("rect").transition().duration(1000)
  .attr("width", function(d,j) {
    return x(dat[j].value);
  })
  .attr("fill", function(d,j){
    var ret = sc(dat[j].id%20);
    if(colorFactor != "renderGroup"){
      ret=colors[dat[j].factors[colorFactor]];
    }
    return ret;     
  })
  .attr("y", function(d,j){
    return (barHeight * dat[j].renderIndex) + headerOffset;   
  })
  ;
}; 


ExpressionBar.prototype.refresh = function(){
  var chart=this.chart;
  this.renderedData = this.getGroupedData(this.opt.renderProperty,this.opt.groupBy);
  this.x.domain([0,this.maxInData()]);
  var gene = this.opt.highlight;
  for (var i in  this.renderedData) {
    this.refreshBar(gene, i);
  };
  this.refreshTitles();
};

ExpressionBar.prototype.renderGeneBar = function( i){
  var data = this.renderedData;
  var dat = data[i];
  var render_width = this.calculateBarWidth();
  var barHeight = this.opt.barHeight;
  var labelWidth = this.opt.labelWidth;
  var x=this.x;
  var sc = this.opt.sc;
  var blockWidth = (this.opt.width - this.opt.labelWidth) / this.totalGenes;
  var gXOffset = (blockWidth * i) + labelWidth;
  bar = this.barGroup.append("g");
  bar.attr("transform", "translate(" + gXOffset  + "," + barHeight + ")");
  var gene = "";
  for(j in  dat){
    var d = dat[j];
    bar.append("rect")
    .attr("y", (barHeight * d.renderIndex  ) + this.opt.headerOffset )
    .attr("height", barHeight - 2)
    .attr("fill", "white")
    .attr("width", x(0));
    gene = d.gene
  }
  bar.append("text")
    .attr("x",0)
    .attr("y", 10)
    .attr("dx", ".35em")
    .attr("height", barHeight)
    .text(gene);   
};



ExpressionBar.prototype.calculateBarWidth = function(){  
  var availableWidth = this.opt.width - this.opt.labelWidth
  var widthPerBar = (availableWidth / this.totalGenes ) - 10; // 10 px of border. maybe dynamic?
  return widthPerBar;
};

ExpressionBar.prototype.maxInData = function(){
  var max = 0;
  for(var i in this.renderedData){
    for(var j in this.renderedData[i]){
      var curr =this.renderedData[i][j]
      if(curr.value + curr.stdev > max){
        max = curr.value ;
      }
    }
  }
  return max;
};

ExpressionBar.prototype.prepareColorsForFactors = function(factors){
  //this.factorColors = Map.new();
  this.totalColors = 8
  self = this;
  var colors = [
    colorbrewer['Accent'][this.totalColors],
    colorbrewer['Dark2'][this.totalColors],
    colorbrewer['Set1'][this.totalColors],
    colorbrewer['Set2'][this.totalColors],
    colorbrewer['Paired'][this.totalColors],
    colorbrewer['Pastel1'][this.totalColors], 
    colorbrewer['Set3'][this.totalColors],
    colorbrewer['Pastel2'][this.totalColors]
  ];
  this.factorColors= new Map();  
  var i = 0;  
  this.factors.forEach(function(value, key, map){
    var color = new Map();
    var index =  i % self.totalColors ;
    var currentColorSet = colors[index];
    var j = 0;   
    value.forEach(function(name){
      color[name] = currentColorSet[j++ % self.totalColors ];
    });
    i ++ ; 
    self.factorColors[key] = color;
  });
};

ExpressionBar.prototype.refreshTitles = function(){
  var barHeight = this.opt.barHeight;
  var arr = this.renderedData[0];
  var headerOffset = this.opt.headerOffset;
  var factorLength = this.factors.size;
  this.titleGroup.selectAll("rect").transition().duration(1000)
  .attr("y", function(d,i){
    var groupIndex = Math.floor(i/factorLength);
    var pos = arr[groupIndex].renderIndex ;
    return (((pos ) * barHeight) ) + headerOffset;
  });

  this.titleGroup.selectAll("text").transition().duration(1000)
  .attr("y", function(d,i){
     var pos = arr[i].renderIndex ; 
    return (((pos + 1 ) * barHeight) - 5 ) + headerOffset;
  });

};

ExpressionBar.prototype.renderFactorTitles = function(){
  this.factorTitle = this.chart.append("g");
  this.factorTitle.attr("transform", "translate(" + 20 + "," + (this.opt.headerOffset - (this.opt.barHeight * 2 )) + ")");

  var barHeight = this.opt.barHeight;
  var xFact = 0;
  var self = this;
  this.factors.forEach(function(value, key, map){
    console.log("Rendering factor titles");
    console.log(key);
    self.factorTitle.append("text")
     .attr("y", xFact)
     .attr("dx", "-.8em")
     .attr("dy", ".15em")
     .attr("transform", function(d) {
         return "rotate(-65)" 
      })
     //.style("font-size","10px") 
     .text(key);
    xFact += self.opt.groupBarWidth;
  });
}

ExpressionBar.prototype.renderTitles = function(){
  var barHeight = this.opt.barHeight
  var self = this;
  var headerOffset = this.opt.headerOffset;
  this.titleGroup = this.chart.append("g");
  this.titleGroup.attr("transform", "translate(0," + barHeight + ")");
  arr = this.renderedData[0];

  var titleSetOffset = this.factors.size  * this.opt.groupBarWidth;
  var factorWidth = this.opt.groupBarWidth - 2; 
  

  for(i in arr){
    var pos = arr[i].renderIndex ; 
    this.titleGroup.append("text")
    .attr("x",titleSetOffset)
    .attr("y", (((pos + 1 ) * barHeight) -5 ) + headerOffset)
    .attr("dx", ".35em")
    .attr("height", barHeight - 2)
    .on("click", function(){self.setFactorColor("renderGroup")})
    .text(arr[i].name);
    var xFact = 0;
    this.factors.forEach(function(value, key, map){
      var factorValue = arr[i].factors[key];
      var color = self.factorColors[key][factorValue];
      var tooltip = key + ": " + factorValue;
      self.titleGroup.append("rect")
      .attr("x", xFact)
      .attr("y", (pos * barHeight) + headerOffset)
      .attr("height", barHeight - 2)
      .attr("fill", color)
      .attr("width", factorWidth)
      .on("mouseenter", function(){self.showTooltip(tooltip, this)})
      .on("click", function(){
        self.sortRenderedGroups([key]);
        self.setFactorColor(key);

      })
      .on("mouseleave", function(){self.hideTooltip()});
      xFact += self.opt.groupBarWidth;
    });
  }
};

ExpressionBar.prototype.setFactorColor = function(factor){
  this.opt.colorFactor = factor;
  this.refresh();
};

ExpressionBar.prototype.renderTooltip = function(){
  var barHeight = this.opt.barHeight;
  this.tooltipBox = this.chart.append("rect");
  this.tooltip = this.chart.append("text");
  this.tooltip.attr("x",0)
  .attr("y", 0)
  .attr("height", barHeight -2)
  .attr("fill", "white")
  .attr("font-size", 10)
  .attr("visibility", "hidden")
};

ExpressionBar.prototype.showTooltip = function(mouseovertext, evt) {
    var tooltip = this.tooltip;
    var coordinates = [0, 0];
    coordinates = d3.mouse(evt);
    var x = coordinates[0] + 11 ;
    var y = coordinates[1] + 27;
    tooltip.attr("x", x);
    tooltip.attr("y", y);
    tooltip.text(mouseovertext);
    var textBox = tooltip.node().getBBox();
    var padding = 2;
    this.tooltipBox.attr("x", textBox.x - padding);
    this.tooltipBox.attr("y", textBox.y - padding);
    this.tooltipBox.attr("width", textBox.width + (padding*2))
    this.tooltipBox.attr("height", textBox.height + (padding*2))
    tooltip.attr("visibility", "visible");
    this.tooltipBox.attr("visibility", "visible");
}

ExpressionBar.prototype.hideTooltip = function() {
  this.tooltip.attr("visibility", "hidden");
  this.tooltipBox.attr("visibility", "hidden");
}


ExpressionBar.prototype.render = function() {
  var chart=this.chart;
  var gene = this.opt.highlight;
  var data = this.getGroupedData(this.opt.renderProperty, this.opt.groupBy);
  var sc = this.opt.sc;
  var barHeight = this.opt.barHeight
  var labelWidth = this.opt.labelWidth
  var groupBy = this.opt.renderGroup;
  this.totalGenes = Object.keys(this.data.values).length; 
  var barWidth = this.calculateBarWidth();
  this.renderedData = data;
  this.x = d3.scale.linear().range([0, barWidth]);
  var x=this.x;

  x.domain([0,this.maxInData()])
  this.totalHeight = barHeight * (data[0].length + 3 )  ;
  chart.attr("height", this.totalHeight + this.opt.headerOffset);
  
  this.renderFactorTitles();
  this.renderTitles();
  this.barGroup = chart.append("g");
  for (var i in data) {
    this.renderGeneBar(i);
  }
  this.renderTooltip(); 
};


ExpressionBar.prototype.dataLoaded = function(){
  this.setAvailableFactors();
  this.prepareColorsForFactors();
  this.render();
  this.refresh();
  this.renderPropertySelector();
};


require('biojs-events').mixin(ExpressionBar.prototype);
module.exports.ExpressionBar = ExpressionBar;