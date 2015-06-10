var jQuery = require("jquery");
var d3 = require("d3");
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

var ExoressionBar = function (options) {
	var self = this;
	this.opt = {
   target: "bar_expression_viewer",
   fontFamily: '"Andale mono", courier, monospace',
   fontColor: "white",
   backgroundColor: "#7BBFE9",
   selectionFontColor: "black",
   selectionBackgroundColor: "yellow",
   width: "600",
   height: "800", 
   barHeight: "20"

 };
 jQuery.extend(this.opt, options);

 this.loadExpression(this.opt.data)
 this._container = jQuery("#"+self.opt.target);

 this._container.css({
      'font-family': self.opt.fontFamily, // this is one example of the use of self instead of this

      'font-size': self.opt.base_width + "px",
      'text-align': 'center',
      'vertical-align':'top',
      'display': 'table-cell',
      'width': self.opt.width + "px",
      'height': self.opt.height + "px",
      'overflow': 'auto',
      'backgroundColor': self.opt.backgroundColor  

    });
 this.chartSVGid =this.opt.target+"_chart_svg"
 this._container.append('<div>Controls here</div>');
 this._container.append('<svg id="' + this.chartSVGid + '" ></svg>');


 
 
 this.x = d3.scale.linear()
 .range([0, this.opt.width]);

 this.chart = d3.select("#"+this.chartSVGid).attr("width", this.opt.width);
 console.log("chart")
 console.log(this.chart);

};

ExoressionBar.prototype.loadExpression = function(url) {
  var self = this;
  d3.json(url, function(error, json) {
    if (error) return console.warn(error);
    self.data = json;
    self.data_loaded();
  })
};

ExoressionBar.prototype.data_loaded = function(){
  console.log(this.data);
  var x=this.x;
  var chart=this.chart;
  var data = this.data.fpkm;
  var barHeight = this.opt.barHeight
  x.domain([0, d3.max(data, function(d) { return d.value; })]);
  console.log(data.length);
  console.log(barHeight);
  chart.attr("height", barHeight * data.length);

  var bar = this.chart.selectAll("g")
      .data(data)
    .enter().append("g")
      .attr("transform", function(d, i) { return "translate(0," + i * barHeight + ")"; });

  bar.append("rect")
      .attr("width", function(d) { return x(d.value); })
      .attr("height", barHeight - 1);

  bar.append("text")
      .attr("x", function(d) { return x(d.value) - 3; })
      .attr("y", barHeight / 2)
      .attr("dy", ".35em")
      .text(function(d) { return d.value; });
};


require('biojs-events').mixin(ExoressionBar.prototype);
module.exports.ExoressionBar = ExoressionBar;
