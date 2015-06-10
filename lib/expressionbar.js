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
		width: "600px",
		height: "800px"
	};
	jQuery.extend(this.opt, options);
  
  this.load_expression(this.opt.data)
	this._container = jQuery("#"+self.opt.target);
  console.log ("Modifying: ")
  console.log (self.opt.target);

  this._container.css({
      'font-family': self.opt.fontFamily, // this is one example of the use of self instead of this

      'font-size': self.opt.base_width + "px",
      'text-align': 'center',
      'vertical-align':'top',
      'display': 'table-cell',
      'width': self.opt.width,
      'height': self.opt.height,
      'overflow': 'auto',
      'backgroundColor': self.opt.backgroundColor  

    });

  this._container.append('<div>Controls here</div>');
  console.log(this.opt.data)

};

ExoressionBar.prototype.load_expression = function(url) {
  var self = this;
  d3.json(url, function(error, json) {
    if (error) return console.warn(error);
    self.data = json;
    self.data_loaded();
  })
};

ExoressionBar.prototype.data_loaded = function(){
  console.log(this.data);
};


require('biojs-events').mixin(ExoressionBar.prototype);
module.exports.ExoressionBar = ExoressionBar;
