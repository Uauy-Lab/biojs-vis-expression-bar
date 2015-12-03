var jQuery = require('jquery');
var science = require('science');

// load everything 
//require('jquery-ui/sortable');
//require('jquery-ui/tooltip');
require('jquery-ui');



var ExpressionData = function (data, options) {
	for (var attrname in data) { 
		this[attrname] = data[attrname]; 
	}
	this.opt = options;
};

ExpressionData.prototype.setAvailableFactors = function(){
   var groups = this.factorOrder;
   var fo = this.factorOrder;
   var sf = this.selectedFactors;
   var opt_fo = this.opt.renderedOrder;
   var opt_sf = this.opt.selectedFactors;

   if( typeof opt_fo !== 'undefined'){
    fo = this.opt.renderedOrder;
   }

   if(typeof opt_sf !== 'undefined' ){
    sf = this.opt.selectedFactors;
   }


   this.renderedOrder = jQuery.extend(true, {}, fo);
   this.selectedFactors = jQuery.extend(true, {},  sf);
   var factorOrder = this.defaultFactorOrder;
   //console.log(factorOrder);
   this.factors = new Map();
   for (var fo in factorOrder) {
    var g = factorOrder[fo];
    //console.log(g);
    for(var k in groups[g]){
      if(! this.factors.has(g)){
        this.factors.set(g, new Set());
      }
      var current_set = this.factors.get(g);
      current_set.add(k);
    }  
  }
};


require('biojs-events').mixin(ExpressionData.prototype);
module.exports.ExpressionData = ExpressionData;