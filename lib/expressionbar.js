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
    	dataSet: "", 
		// fontSize: "15px",
		width: "80%",
		height: "200px",
		float_bam: "right",
		new_pos: 10,
		default_read_background:"blue", 
		flanking_size: 300,
		display_bases: false,
		display_orientation: false, 
		display_cigar:false,
		display_mates: false, 
		lazy_loading: false
	};
	jQuery.extend(this.opt, options);

	this._container = jQuery("#"+self.opt.target);
 
    // Apply options values
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

}


require('biojs-events').mixin(ExoressionBar.prototype);
module.exports.ExoressionBar = ExoressionBar;
