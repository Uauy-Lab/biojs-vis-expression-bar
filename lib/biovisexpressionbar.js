var jQuery = require("jquery");
var d3 = require("d3");
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

/**
 * Method responsible to say Hello
 *
 * @example
 *
 *     expressionbar.hello('biojs');
 *
 * @method hello
 * @param {String} name Name of a person
 * @return {String} Returns hello name
 */

 module.exports.hello = function (name) {
  return 'hello ' + name;
};

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
   barHeight: "20",
   labelWidth: "200",
   renderProperty: "fpkm",
   renderGroup: "group",
   highlight: "MyGene", 
   groupBy: "groups"
 };

 jQuery.extend(this.opt, options);
 this.opt.sc = d3.scale.category20();
 this.loadExpression(this.opt.data)
 this._container = jQuery("#"+self.opt.target);

 this._container.css({
  'font-family': self.opt.fontFamily, 
  'font-size': self.opt.base_width + "px",
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
 this.x = d3.scale.linear().range([0, this.opt.width - this.opt.labelWidth]);
 this.chart = d3.select("#"+this.chartSVGid).attr("width", this.opt.width);

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
  var self = this;
  if (typeof url === 'undefined') { return };
  d3.json(url, function(error, json) {
    if (error) {
      console.warn(error);
      return;
    }
    self.data = json;
    self.dataLoaded();
  })
};

ExpressionBar.prototype.getGroupedData = function(property,gene, groupBy){
  if(groupBy == null){
    var dataArray = new Array;
    var i = 0;
    for(var o in this.data.values[gene][property]) {
      var oldObject = this.data.values[gene][property][o];
      var newObject = JSON.parse(JSON.stringify(oldObject));
      newObject["id"] = ++i;
      newObject["name"] = this.data.experiments[newObject.experiment].name
      dataArray.push(newObject);
    }
    console.log(dataArray);
    return dataArray;
  }else if(groupBy == "groups"){

  }
  else{
    console.log("Not yet implemented");
  }
};

ExpressionBar.prototype.refresh = function(){
  var chart=this.chart;
  var gene = this.opt.highlight;
  var data = this.getGroupedData(this.opt.renderProperty, gene);
  var x=this.x;
  var sc = this.opt.sc;
  var groupBy = this.opt.renderGroup;
  x.domain([0, d3.max(data, function(d) { return d.value; })]);
  
  chart.selectAll("rect").data(data)
  .transition()
  .duration(1000)
  .attr("width", function(d) { return x(d.value); })
  .attr("fill", function(d) { return sc(d["id"]%20); });
};

ExpressionBar.prototype.render = function() {
  var x=this.x;
  var chart=this.chart;
  var gene = this.opt.highlight;
  var data = this.getGroupedData(this.opt.renderProperty, gene, this.opt.groupBy);
  var sc = this.opt.sc;
  var barHeight = this.opt.barHeight
  var labelWidth = this.opt.labelWidth
  var groupBy = this.opt.renderGroup;

  x.domain([0, d3.max(data, function(d) { return d.value; })]);
  chart.attr("height", barHeight * data.length);

  var bar = this.chart.selectAll("g")
  .data(data)
  .enter().append("g")
  .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

  bar.append("rect")
  .attr("x", labelWidth)
  .attr("height", barHeight - 1)
  .attr("fill", function(d) {return sc(d[groupBy]%20); })
  .attr("width", 0);

  bar.append("text")
  .attr("x", 0)
  .attr("y", barHeight / 2)
  .attr("dy", ".35em")
  .text(function(d) { return d.name;  });

};


ExpressionBar.prototype.dataLoaded = function(){
  this.setAvailableFactors();
  this.render();
  this.refresh();
  this.renderPropertySelector();
};


require('biojs-events').mixin(ExpressionBar.prototype);
module.exports.ExpressionBar = ExpressionBar;