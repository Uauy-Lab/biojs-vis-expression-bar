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
   groupBarWidth: 20
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
 this._container.append('Color by: <select id="'+this.opt.target+'_group"></select>')
 this._container.append(' Property: <select id="'+this.opt.target+'_property"></Select>');
 this._container.append('<br/><svg id="' + this.chartSVGid + '" ></svg>');
 this.property_selector = jQuery('#'+ this.opt.target+'_property');
 this.group_selector_colour = jQuery('#'+ this.opt.target+'_group');
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
        newObject["id"] = ++i;
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
        newObject["id"] = ++i;
        newObject["name"] = g[o].description;
        newObject["data"] = new Array;
        newObject["offset"] = offset;
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
  return dataArray;
};

ExpressionBar.prototype.refreshBar = function(gene, i){
  var data = this.renderedData;
  var dat = data[i];
  var x=this.x;
  var sc = this.opt.sc;
  var groupBy = this.opt.renderGroup;
  x.domain([0,this.maxInData()])
  var bar = this.barGroup.selectAll("g").filter(function (d, j) { return i === i;})
  rects = bar.selectAll("rect").transition().duration(1000).attr("width", function(d,j) {
    return x(dat[j].value);
  });
}; 

ExpressionBar.prototype.refresh = function(){
  var chart=this.chart;
  this.renderedData = this.getGroupedData(this.opt.renderProperty,this.opt.groupBy);

  var gene = this.opt.highlight;
  for (var i in  this.renderedData) {
    this.refreshBar(gene, i);
  }
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
    .attr("y", barHeight * d.id )
    .attr("height", barHeight - 2)
    .attr("fill", sc(d.id%20))
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
  colors = [
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

ExpressionBar.prototype.renderTitles = function(){
  var barHeight = this.opt.barHeight

  this.titleGroup = this.chart.append("g");
  this.titleGroup.attr("transform", "translate(0," + barHeight + ")");
  arr = this.renderedData[0];

  var titleSetOffset = this.factors.size  * this.opt.groupBarWidth;
    
  for(i in arr){
    var pos = arr[i].id + 1 ; 
    this.titleGroup.append("text")
    .attr("x",titleSetOffset)
    .attr("y", pos * barHeight)
    .attr("dx", ".35em")
    .attr("height", barHeight)
    .text(arr[i].name);
  }
};

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
  this.totalHeight = barHeight * (data[0].length + 3 );
  chart.attr("height", this.totalHeight);
  console.log(chart);
  this.renderTitles();
  this.barGroup = chart.append("g");
  for (var i in data) {
    this.renderGeneBar(i);
  }
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