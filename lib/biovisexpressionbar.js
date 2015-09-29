var jQuery = require('jquery');
var d3 = require('d3');
var science = require('science');
var colorbrewer = require('colorbrewer');
// load everything 
//require('jquery-ui/sortable');
//require('jquery-ui/tooltip');
require('jquery-ui');
//require("jquery-ui-browserify");
//qvar stats = require('stats-lite');
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

//This is a patch!
d3.selection.prototype.position = function() {

  var el = this.node();
  var elPos = el.getBoundingClientRect();
  var vpPos = getVpPos(el);

  function getVpPos(el) {
    if(el.parentElement.tagName === 'svg') {
      var ret = el.parentElement.getBoundingClientRect();
      ret.top = 0;
      ret.left = 0;
      return ret;
    }
    return getVpPos(el.parentElement);
  }

  return {
    top: elPos.top - vpPos.top,
    left: elPos.left - vpPos.left,
    width: elPos.width,
    bottom: elPos.bottom - vpPos.top,
    height: elPos.height,
    right: elPos.right - vpPos.left
  };

};

function numberWithCommas(x) {
  num = x.toFixed(2);
  var parts = num.toString().split('.');
  parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');

  return parts.join('.');
}


var ExpressionBar = function (options) {
	var self = this;
	this.setDefaultOptions();
  jQuery.extend(this.opt, options);
  this.opt.sc = d3.scale.category20();

  this.setupContainer();
  this.setupButtons();
  this.setupProgressBar();

  this.loadExpression(this.opt.data);
  this.setupSVG();
  this.sortOrder = [];

};

ExpressionBar.prototype.setupProgressBar = function(){
  pb_id =  this.opt.target + '_progressbar';
  this.pb = jQuery( '#' + pb_id );
  this.pb.attr("height", "20px");
  this.pb.progressbar({
    value: false
  });
  this.pb.hide(); 
}

ExpressionBar.prototype.setupSVG = function(){

 this.renderGroupSelectorColour(); 
 this.chart = d3.select('#'+this.chartSVGid).attr('width', this.opt.width);
 this.chartHead = d3.select('#'+this.chartSVGidHead).
 attr('width', this.opt.width);
 this.chartHead.attr('height', this.opt.headerOffset);
 this.chartFoot = d3.select('#'+this.chartSVGidFoot).
 attr('width', this.opt.width);
 this.chartFoot.attr('height', 20);
 this.barGroups = [];
};

ExpressionBar.prototype.setupButtons = function(){
 var self = this;
 this.propertySelector = jQuery('#'+ this.opt.target+'_property');
 this.groupSelectorColour = jQuery('#'+ this.opt.target+'_group');
 this.saveSVGButton = jQuery('#'+ this.opt.target+'_save');
 this.saveSVGButton.click(function(e) {
  self.saveRenderedSVG();
});

 this.savePNGButton = jQuery('#'+ this.opt.target+'_save_png');
 this.savePNGButton.click(function(e) {
  self.saveRenderedPNG();
});
};

ExpressionBar.prototype.setupContainer = function(){
 var self = this;
 this._container = jQuery('#'+self.opt.target);
 this._container.css({
  'font-family': self.opt.fontFamily, 
  'font-size': self.opt.barHeight + 'px',
  'text-align': 'center',
  'vertical-align':'top',
  'display': 'table-cell',
  'width': self.opt.width + 'px',
  'height': self.opt.height + 'px',
  'overflow': 'scroll',
  'backgroundColor': self.opt.backgroundColor
});
 this.chartSVGid =this.opt.target+'_chart_svg';
 this.chartSVGidHead =this.opt.target+'_header_svg';
 this.chartSVGidFoot =this.opt.target+'_footer_svg';
 this.sortDivId = this.opt.target + '_sort_div';


 this._container.append('Property: <select id="'+ 
  this.opt.target+'_property"></Select>');
 this._container.append('<button type="button" id="' +
  this.opt.target + '_save">Save as SVG</button>');
 this._container.append('<button type="button" id="' +
  this.opt.target + '_save_png">Save as PNG</button>');
 this._container.append('<div id="' +
  this.opt.target + '_progressbar" width="20px" height="20px"> </div>');
 this._container.append('<div id="' +
  this.opt.target + '_preferences"></div>');



this._container.append('<br/><svg id="' + 
  this.chartSVGidHead + '" ></svg>');

this._container.append('<div id="' + this.sortDivId + '" height="20px"></div><br/><br/>');

var central_str='<div style="overflow-y: auto;max-height:' + this.opt.height +'px; ">'
central_str += '<svg id="' + this.chartSVGid + '" ></svg></div>'

this._container.append(central_str);



this._container.append('<br/><svg id="' + 
  this.chartSVGidFoot + '" ></svg>');
};

ExpressionBar.prototype.setDefaultOptions = function(){
  this.opt = {
   target: 'bar_expression_viewer',
   fontFamily: 'Andale mono, courier, monospace',
   fontColor: 'white',
   backgroundColor: 'white',
   selectionFontColor: 'black',
   selectionBackgroundColor: 'yellow',
   width: '1100',
   height: '500', 
   barHeight: 10,
   labelWidth: 500,
   renderProperty: 'fpkm',
   renderGroup: 'group',
   highlight: 'MyGene', 
   groupBy: 'groups', 
   groupBarWidth: 20, 
   colorFactor: 'renderGroup', 
   headerOffset: 100,
   showHomoeologues: false
 };
}

ExpressionBar.prototype.setSelectedInJoinForm = function() {
//  var inputGroup = this.joinForm.filter('[name=group]');
var self = this;
var groupByValue = this.opt.groupBy;
if (groupByValue.constructor === Array) {
  for(var i in groupByValue){
    jQuery(this.joinForm)
    .find('[name=factor][value=' + groupByValue[i] +']')
    .prop('checked',true);

  }
  groupByValue = 'factors';
}
jQuery(this.joinForm)
.find('[name=showHomoeologues][value=show]')
.prop('checked', this.opt.showHomoeologues).
on('change', function(evt) {
  self.opt.showHomoeologues = this.checked;
});

jQuery(this.joinForm)
.find('[name=group][value=' + groupByValue +']')
.prop('checked',true); 

jQuery(this.joinForm)
.find('[name=group]')
.on('change', function(){self.toggleFactorCheckbox(self)}); 
};

ExpressionBar.prototype.toggleFactorCheckbox = function(self) {
  var joinForm = self.joinForm;
  var selectedCheckbox = jQuery(joinForm)
  .find('[name=group]:checked');

  var factorOptions =  jQuery(joinForm).find('[name=factor]');
  if(selectedCheckbox.val() === 'factors'){
    factorOptions.prop('disabled', false);
  }else{
    factorOptions.prop('disabled', true);  
  }
};


//Returns if we need to update the page or not. 
ExpressionBar.prototype.updateGroupBy = function(self) {
  var joinForm = self.joinForm;
  var selectedCheckbox = jQuery(joinForm)
  .find('[name=group]:checked');
  var factorOptions =  jQuery(joinForm).find('[name=factor]:checked');  
  var oldGroupBy = self.opt.groupBy;
  var ret = true;
  if(selectedCheckbox.val()  === 'factors'){
    var facts = [];
    factorOptions.each(function(){
      facts.push(jQuery(this).val());
    });
    //TODO:Show an error in case the factors show an error
    //To clarify the behaviour. maybe prevent the submission. 
    self.opt.groupBy = facts;
    if(facts.length == 0){
      self.opt.groupBy = 'groups';
      ret = false
    }
    
  }else{  
    self.opt.groupBy = selectedCheckbox.val();
  }  
  if(oldGroupBy == self.opt.groupBy){
    ret = false
  }
  return true;
};

ExpressionBar.prototype.refreshSVG = function(self) {
 var chart=self.chart;
 console.log("refreshSVG");
   //console.trace();
   //self.svgFootContainer.selectAll("*").remove;
   //self.factorTitle.selectAll("*").remove();
   chart.selectAll("*").remove();
   this.renderedData = false;
   //self.setAvailableFactors();
   self.prepareColorsForFactors();
   self.render();
   self.refresh();
 };

 ExpressionBar.prototype._getSortedKeys = function(obj) {
  var keys = []; for(var key in obj) keys.push(key);
  return keys.sort(function(a,b){return obj[a]-obj[b]});
};

ExpressionBar.prototype._addSortPriority = function(factor, end){
  end = typeof end !== 'undefined' ? end : true;
  this._removeSortPriority(factor);
  if(end == true){
   this.sortOrder.push(factor);
 }else{
   this.sortOrder.unshift(factor);
 }
}

ExpressionBar.prototype._removeSortPriority = function(factor){
  var index = this.sortOrder.indexOf(factor);
  if (index > -1) {
    this.sortOrder.splice(index, 1);
  }
}


ExpressionBar.prototype._refershSortedOrder = function(factor){
  var self = this;
  var name=this.opt.target + '_sorted_list_'+ factor;
  jQuery('#'+ name  + ' div').each(function(e) {
    div = jQuery(this);
    var factor = div.data('factor');
    var value  = div.data('value');   
    self.renderedOrder[factor][value] = div.index();
  } 
  );
  this._addSortPriority(factor)
  this.sortRenderedGroups(this.sortOrder, this.renderedOrder);
  this.setFactorColor(factor);
  this.refresh();
}

ExpressionBar.prototype._updateFilteredFactors = function(sortDivId){

  //This may not work when we have more than
  //checks = jQuery(":checkbox[id*='|']");
  var toSearch='#'+ sortDivId +' input:checkbox';
  this.refreshSVGEnabled = false;

  jQuery(toSearch).each(function() {
    src = jQuery(this);
    self = src.data('expression-bar');
    factor = src.data('factor');
    value = src.data('value');
    self.selectedFactors[factor][value] = this.checked; 
  });
  this.refreshSVGEnabled = true;

}

ExpressionBar.prototype.renderSortWindow = function(){
  var self = this;
  
  var listText = ''

  var factorCount = 0;
  for(i in this.renderedOrder){
    //var i = ri.split(' ').join('_');
    factorCount ++;
    var orderedKeys = this._getSortedKeys(this.renderedOrder[i]);
//    listText += '<div style="max-height:150px;overflow-y: auto;">' ;
name=this.opt.target + '_sorted_list_'+ i.split(' ').join('_');;

//    listText += i;
listText += '<span id="span_' + name + '" class="ui-icon  ui-icon-arrowthick-2-n-s" ></span>'
listText += '<div id="dialog_' + name + '" width="150px" \
style="z-index:3; overflow:scroll; max-height:' + this.opt.height/2 +'px" >' ;
listText += '<div id="all_' + name + '"  onmouseover="this.style.cursor=\'pointer\';">all</div>';
listText += '<div id="none_' + name +'"  onmouseover="this.style.cursor=\'pointer\';">none</div>';

listText += '<div id="div_' + name + '">' ; 
listText += '<form id="' + name +'">';

    //console.log(name);
    for(j in orderedKeys){
      var bgcolor = this.factorColors[i][orderedKeys[j]];
      var longFactorName = this.data.longFactorName[i][orderedKeys[j]];
      var shortId = i.split(' ').join('_') + '|' + orderedKeys[j];
      var checked = '';
      if(this.data.selectedFactors[i][orderedKeys[j]]){
        checked = 'checked';
      }

      listText += '<div \
      id="' + this.opt.target + '_sorted_position:' + shortId +'" \
      style="background-color:' + bgcolor + '" \
      height="'+this.opt.barHeight+ 'px" \
      data-factor="'+ i +'" \
      data-value="' + orderedKeys[j] +'" \
      title="' + longFactorName +'"\
      >' ;

      listText += '<input type="checkbox" id="' +shortId+'" \
      name="' +  shortId + '" \
      data-factor="'+ i +'" \
      data-value="' + orderedKeys[j] +'" \
      ' + checked + '/>';
      listText += orderedKeys[j] + '</div>'  ;

    }
    listText += '</form>' ;
    listText += "</div>" ;
    listText += "</div>" ;
  }

  this.sortDiv = jQuery('#'+this.sortDivId);
  this.sortDiv.tooltip({
    track: true
  });
  this.sortDiv.html(listText); 
  //this.sortDiv.css('column-count',factorCount);
  //this.sortDiv.css('height',factorCount * this.opt.barHeight *2);

  this.sortDiv.disableSelection();
  checks = jQuery(":checkbox[id*='|']");
  
  checks.click(function(evt){
    var src = jQuery(this);
    var self2 = src.data('expression-bar');
    self2._updateFilteredFactors(self2.sortDivId);
    if(self2.refreshSVGEnabled == true){
      self2.updateGroupBy(self2);  
      self2.refreshSVG(self2); 

    }
    
  });

  checks.data("expression-bar", this);
  var xFact = 0;
  for(var i in this.renderedOrder){

    var name=this.opt.target + '_sorted_list_'+ i.split(' ').join('_');
    
    jQuery('#span_' + name).on("click", function(e){
      var nameinside = e.target.id.replace("span_", "dialog_")
      var sdialog = jQuery('#'+nameinside);
      sdialog.show();
      jQuery(document).mouseup(function (e){
        var container = sdialog;

      if (!container.is(e.target) // if the target of the click isn't the container...
          && container.has(e.target).length === 0) // ... nor a descendant of the container
      {
        container.hide();
      }
    });

    })

    var s = jQuery('#'+ name);
    var sbtn = jQuery('#span_' + name);
    var sdialog = jQuery('#dialog_' + name);
    var count = s.children().length;
    var sall = jQuery('#all_'+ name);
    var snone = jQuery('#none_'+ name);
    
    sall.on("click", function(e){
      var nameinside = e.target.id.replace("all_", "");
      jQuery('#'+ nameinside +' input:checkbox').each(function() {
        jQuery(this).prop( "checked", true ); // do your staff with each checkbox
        self._updateFilteredFactors(self.sortDivId );
        
      });
      if(self.refreshSVGEnabled == true){
        self.updateGroupBy(self);  
        self.refreshSVG(self); 
      }

    });


    snone.on("click", function(e){
      var nameinside = e.target.id.replace("none_", "");
      jQuery('#'+ nameinside +' input:checkbox').each(function() {
        jQuery(this).prop( "checked", false ); // do your staff with each checkbox
        self._updateFilteredFactors(self.sortDivId );    
      });
      if(self.refreshSVGEnabled == true){
        self.updateGroupBy(self);  
        self.refreshSVG(self); 
      }

    });

    sbtn.attr('width', this.opt.barHeight    * 2 );
    sbtn.attr('height', this.opt.barHeight );
    sbtn.css("position", "absolute");
    sbtn.css("left", xFact + this.opt.groupBarWidth);
    s.css("text-align", "left");


    s.sortable({
      update: function(event, ui) {
        var factor = ui.item.data('factor');
        var value  = ui.item.data('value');
        var index  = ui.item.index();    
        self._refershSortedOrder(factor);
      }
    });

    sdialog.css("position", "absolute");
    sdialog.css("left", xFact );
    sdialog.css("background-color", "white");
    //sdialog.css("top", "10px" );
    sdialog.css("border", "outset")
    s.disableSelection();
    sdialog.hide();
    
    //sdialog.on("mouseleave", function(){sdialog.hide()})
    
    xFact += self.opt.groupBarWidth;
  }

};


ExpressionBar.prototype.showHighlightedFactors = function(toShow, evt){
  //console.log("TADA!");

  //console.log(evt);
  var factorNames = this.data.longFactorName;
  var self = this;
  for(key in toShow.factors){
    
    var value = toShow.factors[key];
    
    var escaped_key = key.replace(/ /g, "_");
    var label_div_id = self.opt.target + "_factor_label_" + escaped_key;
    var colour_div_id = self.opt.target + "_factor_colour_" + escaped_key;
    var label_full_div_id = self.opt.target + "_factor_full_label_" + escaped_key;

    var long_name = factorNames[key][value];
    var colour = self.factorColors[key][value];
    if(long_name.length > 28){
      long_name = value;
    }
    jQuery("#" + label_div_id).text(long_name);
    jQuery("#" + colour_div_id).css("background-color", colour);
    jQuery("#" + label_full_div_id).show();
  }

};

ExpressionBar.prototype.hideHighlightedFactors = function(){
   this.factors.forEach(function(value, key, map){
    var escaped_key = key.replace(/ /g, "_");
    var label_full_div_id = self.opt.target + "_factor_full_label_" + escaped_key;
    jQuery("#"+label_full_div_id).hide();
  });
};



ExpressionBar.prototype.renderMergeButton = function() {
  var self = this;


  var formText='<div style="text-align: left;"><div style="float: left;width:50%; display: inline-block" id="' + this.opt.target +
   '-join-form" title="Merge factors">\
  <form>\
  <fieldset>\
  <input type="checkbox" name="showHomoeologues" value="show">Homoeologues </input>\
  <input type="radio" name="group" value="groups"> Experiment\
  <input type="radio" name="group" value="factors" > Factors\
  <input type="radio" name="group" value="ungrouped" checked> Ungrouped<br/>';

  var formTextMiddle = '</fieldset> </form> </div>\
  <div style="width:50%; display: inline-block; column-count: 3;-webkit-column-count: 3; -moz-column-count: 3;" id="' + this.opt.target +
  '-display-factors" title="Selected Factor">';
  var formTextEnd =  '</div></div>';


  var checkboxes = '';
  var factorDivs = '';
  this.factors.forEach(function(value, key, map){
    checkboxes +=  '<input type="checkbox" name="factor" value="' + key +'"';
    checkboxes += '>' + key + '</input>';
    var escaped_key = key.replace(/ /g, "_");
    var label_div_id = self.opt.target + "_factor_label_" + escaped_key;
    var colour_div_id = self.opt.target + "_factor_colour_" + escaped_key;
    var label_full_div_id = self.opt.target + "_factor_full_label_" + escaped_key;

    factorDivs += '<div  id="'+ label_full_div_id + '" >\
    <div style="float: left;width:20px" id="'+ colour_div_id + '" \
    height="10px">&nbsp;</div>\
    <div  width="80%" style="float: left; padding:0px; margin-left: 5px;" id="'+ label_div_id + '"></div><br/></div>';


  });

  var prefs = jQuery('#'+ this.opt.target + '_preferences');
  prefs.append(formText + checkboxes + formTextMiddle + factorDivs + formTextEnd);
  this.joinForm = jQuery('#'+ this.opt.target+'-join-form');
  this.setSelectedInJoinForm();
  this.toggleFactorCheckbox(this);
  this.joinForm.find( "input" ).on("change", function(event){
    self.updateGroupBy(self);  
    self.refreshSVG(self);
  });
  this.joinForm.find( "form" ).on( "submit", function( event ) {
    event.preventDefault();
    self.updateGroupBy(self);  
    self.refreshSVG(self);   
  });  
};


ExpressionBar.prototype.renderPropertySelector = function(){
 var self = this;
 var groupOptions = this.data.values[this.opt.highlight];
 
 jQuery.each(groupOptions, function(key,value) {   
   self.propertySelector
   .append(jQuery('<option></option>')
     .attr('value',key)
     .text(key)); 
 });
 this.propertySelector.val(this.opt.renderProperty);

 this.propertySelector.on('change', function(event) { 
   self.opt.renderProperty  = self.propertySelector.find(':selected').text();;
   self.refresh();
 } );

};

ExpressionBar.prototype.renderGroupSelectorColour = function(){
 var self = this;
 var groupOptions = {'study':'study', 'group':'group'};
 jQuery.each(groupOptions, function(key,value) {   
   self.groupSelectorColour
   .append(jQuery('<option></option>')
    .attr('value',key)
    .text(value)); 
 });
 this.groupSelectorColour.val(this.opt.renderGroup);

 this.groupSelectorColour.on('change', function(event) { 
   self.opt.renderGroup  = self.groupSelectorColour.find(':selected').text();;
   self.refresh();
 } );

};

ExpressionBar.prototype.saveRenderedPNG = function(){

  var svgData = this.prepareSVGForSaving();

  var canvas = document.createElement( 'canvas' );
  canvas.height = this.opt.headerOffset + 20 + this.totalHeight ;
  canvas.width = this.opt.width;

  var ctx = canvas.getContext( '2d' );

  var img = new Image();
  img.width = this.opt.width;
  img.height = this.opt.headerOffset + 20 + this.totalHeight ;
  img.src = "data:image/svg+xml;base64," + btoa( svgData );

  img.onload = function() {
    ctx.drawImage(img, 0, 0);
    var canvasdata = canvas.toDataURL('image/png');
    var a = document.createElement('a');
    a.download = 'expVIP_'+Date.now()+'.png';
    a.href = canvasdata; 
    document.body.appendChild(a);
    a.click();
  };

};

ExpressionBar.prototype.prepareSVGForSaving = function(){
   //get svg element.

   var svgHead = document.getElementById(this.chartSVGidHead);
   var svg = document.getElementById(this.chartSVGid);
   var svgFoot = document.getElementById(this.chartSVGidFoot);
  //get svg source.
  
  var headHeight = svgHead.height.baseVal.value;
  var footHeight = headHeight + svg.height.baseVal.value;

  var serializer = new XMLSerializer();
  var sourceHead = serializer.serializeToString(svgHead);
  var sourceMain = serializer.serializeToString(svg);
  var sourceFoot = serializer.serializeToString(svgFoot);
  var svg_width  = this.opt.width;
  var svg_height = this.opt.headerOffset + 20 + this.totalHeight ;


  sourceMain = sourceMain.replace(/^<svg/, '<svg y="' + headHeight + '" ');
  sourceFoot = sourceFoot.replace(/^<svg/, '<svg y="' + footHeight + '" ');
  var source = '<svg xmlns:xlink="http://www.w3.org/1999/xlink" xmlns="http://www.w3.org/2000/svg" \
  font-family="' + self.opt.fontFamily + '" font-size="' + self.opt.barHeight + 'px" width="'+svg_width+'px" height="'+svg_height+'px" >'

  source += sourceHead;
  source += sourceMain;
  source += sourceFoot;
  source += '</svg>'
  //add xml declaration
  source = '<?xml version="1.0" standalone="no"?>\r\n' + source;

  return source;
}

ExpressionBar.prototype.saveRenderedSVG = function(){
  var source = this.prepareSVGForSaving();
  //convert svg source to URI data scheme.
  var url = 'data:image/svg+xml;charset=utf-8,'+ encodeURIComponent(source);

  //set url value to a element's href attribute.
  //document.getElementById(this.opt.target + '_save').href = url;
  //you can download svg file by right click menu.
  var pom = document.createElement('a');
  pom.href = url;
  pom.setAttribute('download', 'expVIP_'+Date.now()+'plot.svg');
  if (document.createEvent) {
   var event = document.createEvent('MouseEvents');
   event.initEvent('click', true, true);
   pom.dispatchEvent(event);
 }
 else {
  console.log("Create event not working");
}
if(pom.parentElement){
  pom.parentElement.removeChild(pom);
}

};


/**
 * Sets a Map with the available factors and the values from the json
 * response. 
 */
 ExpressionBar.prototype.setAvailableFactors = function(){
   var groups = this.data.factorOrder;
   this.renderedOrder = jQuery.extend(true, {},  this.data.factorOrder);
   this.selectedFactors = jQuery.extend(true, {},  this.data.selectedFactors);
   this.factors = new Map();
   for (var g in groups) {
    for(var k in groups[g]){
      if(! this.factors.has(g)){
        this.factors.set(g, new Set());
      }
      var current_set = this.factors.get(g);
      current_set.add(k);
    }  
  }
};

ExpressionBar.prototype.loadExpression = function(url) {
  if (typeof url === 'undefined') { 
    return ;
  }
  var self = this;
  self.pb.show();
  d3.json(url, function(error, json) {
    if (error) {
      console.warn(error);
      return;
    }
    self.data = json;
    if(typeof self.data.compare === "undefined"){
      self.data.compare = "";
    }

    self.pb.hide();
    self.dataLoaded();
  })
};


//To keep the indeces we reiterate and set them
ExpressionBar.prototype.setRenderIndexes = function(to, from){
  for(var i in from){
    var gene=from[i];
    for(var j in gene){
      to[i][j].renderIndex = from[i][j].renderIndex;
    }
  }
};

ExpressionBar.prototype.getGroupFactor = function(o,groupBy){
  var factorArray = {};
  for (var i in groupBy) {
    factorArray[groupBy[i]] = o.factors[groupBy[i]];
  };
  return factorArray;
};

ExpressionBar.prototype.getGroupFactorDescription = function(o,groupBy){
  var factorArray = [];
  //console.log(o);
  var factorNames = this.data.longFactorName;
  //console.log(factorNames);
  
  var numOfFactors = groupBy.length;

  for(var i in groupBy) {
    //console.log(i);
    var grpby = groupBy[i];
    //console.log(grpby);

    var curr_fact = factorNames[grpby];
    var curr_short =  o.factors[groupBy[i]]; 
    var curr_long = curr_fact[curr_short];
    factorArray[i] = curr_long;
    if(numOfFactors > 4 || curr_long.length > 15 ){
      factorArray[i] = curr_short;
    }
  };
  return factorArray.join(", ");
};

ExpressionBar.prototype.calculateStats = function(newObject){
  var v = science.stats.mean(newObject.data);
  var stdev = Math.sqrt(science.stats.variance(newObject.data));
  newObject['value'] = v;
  newObject['stdev'] = stdev;

};

ExpressionBar.prototype._prepareSingleObject = function(index, oldObject){
  var newObject = JSON.parse(JSON.stringify(oldObject));
  
  newObject.renderIndex = index;
  newObject.id = index;
  newObject.name = this.data.experiments[newObject.experiment].name
  newObject.data = []; 
  newObject.data.push(oldObject.value); 
  newObject.value = oldObject.value;
  newObject.stdev = 0;
  var group = this.data.experiments[newObject.experiment].group;
  newObject.factors = this.data.groups[group].factors;
  return newObject
};

ExpressionBar.prototype._prepareGroupedByExperiment = function(index, group){
 var newObject= {};
 newObject.renderIndex = index;
 newObject.id = index;
 newObject.name = this.data.groups[group].description;
 newObject.data = [];
 newObject.factors = this.data.groups[group].factors;
 return newObject;
};

ExpressionBar.prototype._prepareGroupedByFactor = function(index, description){
  var newObject= {};
  newObject.renderIndex = index;
  newObject.id = index;
  newObject.name = description;
  newObject.data = [];
  newObject.factors = {};
  return newObject;
};

ExpressionBar.prototype._isFiltered = function(group){
  //var g = this.data.groups;
  var ret = true;
  for(f in group.factors){
    ret &= this.selectedFactors[f][group.factors[f]];    
  }

  return ! ret;

}

ExpressionBar.prototype._fillGroupByExperiment = function(index, gene, property){
  var groups ={};
  var innerArray = [];
  var data = this.data.values[gene][property];
  var g = this.data.groups;
  var e = this.data.experiments;
  var o;
  var filtered;
  var i = index;
  for(o in g){  
    var newObject = this._prepareGroupedByExperiment(i++,o);
    newObject.gene = gene;
    groups[o] = newObject;
  }
  for(o in e){
    groups[e[o].group].data.push(data[o].value);
  }
  i = index;
  for(o in groups){
    var newObject = groups[o];
    newObject.gene = gene;
    this.calculateStats(newObject);
    if(!this._isFiltered(newObject)){
      newObject.renderIndex = i;
      newObject.id = i++;
      innerArray.push(newObject);
    }

  }
  return innerArray;
};

ExpressionBar.prototype._fillGroupByFactor = function(index, gene, property, groupBy){
 var groups ={};
 var innerArray = [];
 var data = this.data.values[gene][property];
 var g = this.data.groups;
 var e = this.data.experiments;
 var names = [];
 var o;
 var i = index;
 for(o in g){  

  var description = this.getGroupFactorDescription(g[o], groupBy);
  if(names.indexOf(description) === -1){
    var newObject = this._prepareGroupedByFactor(i++, description);
    newObject.gene = gene;
    var factorValues = this.getGroupFactor(g[o], groupBy);
    newObject.factors = factorValues;
    groups[description] = newObject;
    names.push(description);
  }
}
i = index;
for(o in e){
 
  var group = g[e[data[o].experiment].group];

  if(!this._isFiltered(group)){
    var description = this.getGroupFactorDescription(g[e[o].group], groupBy);
    groups[description].data.push(data[o].value);
  }
}
for(o in groups){
  var newObject = groups[o];
  if( newObject.data.length == 0){
    continue;
  }
  this.calculateStats(newObject);
  if(!this._isFiltered(newObject)){
    newObject.renderIndex = i;
    newObject.id = i++;
    innerArray.push(newObject);
  }
}
return innerArray;
};





ExpressionBar.prototype.getGroupedData = function(property, groupBy){
  var dataArray = [];
  
  for(var gene in this.data.values){
    if(!this.opt.showHomoeologues &&  ( gene != this.data.gene &&  gene !=  this.data.compare ) ) {
      continue;
    }
    var i = 0;
    if(groupBy == 'ungrouped'){
     var innerArray = []; 
     var data = this.data.values[gene][property];
     for(var o in data) {  
      var oldObject = data[o];
      var newObject = this._prepareSingleObject(i, oldObject);
      newObject.gene = gene;
        //console.log(newObject);
        var filtered = this._isFiltered(newObject)
        if (! filtered){
          innerArray.push(newObject);
          i++;
        }
        
      }
      dataArray.push(innerArray);
    }else if(groupBy == 'groups'){
      var innerArray = this._fillGroupByExperiment(i++, gene, property);
      dataArray.push(innerArray);

    }else if(groupBy.constructor === Array){ //This is grouping by factors. 
      var innerArray = this._fillGroupByFactor(i++, gene, property, groupBy);
      dataArray.push(innerArray);
    }else{
      console.log('Not yet implemented');
    }
  }
  if(this.renderedData){
    this.setRenderIndexes(dataArray, this.renderedData);
  }
  return dataArray;
};

//The only parameter, sortOrder, is an array of the factors that will be used to sort. 
ExpressionBar.prototype.sortRenderedGroups = function(sortOrder, factorOrder){
 var orderMap = {};
 var i;
 var sortable = this.renderedData[0].slice();
 var sorted = sortable.sort(function(a, b){
  for(i in sortOrder){
    var o = sortOrder[i];
    if(factorOrder[o][a.factors[o]] > factorOrder[o][b.factors[o]]) {
      return 1;
    }
    if (factorOrder[o][a.factors[o]] < factorOrder[o][b.factors[o]]) {
     return -1;
   };
 }
 return a.id > b.id  ? 1 : -1;
});

 for ( i = 0; i < sorted.length; i++) {
   sorted[i].renderIndex = i;
 };
 for(i = 0; i < this.renderedData.length; i++){
  for (var j = 0; j < sorted.length; j++) { 
    var obj = this.renderedData[i][sorted[j].id];
    obj.renderIndex = sorted[j].renderIndex;
  };
};
};

ExpressionBar.prototype.isFactorPresent = function(factor) {
  var renderedData = this.renderedData;
  var globalFactors = this.factors;
  if(this.opt.groupBy == 'ungrouped' || this.opt.groupBy === 'groups' ){
    //We need to add a better decision here. M
    return true;
  }else{
    return jQuery.inArray(factor, this.opt.groupBy) > -1;
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
  var headerOffset  = 0;
  
  if(! this.isFactorPresent(colorFactor)){
    colorFactor = 'renderGroup';
  }

  var getY = function(d,j){
    return (barHeight * dat[j].renderIndex) + headerOffset;   
  };

  if(colorFactor != 'renderGroup'){
    colors = this.factorColors[colorFactor]; 
  }

  //Refresh the bar sizes and move them if they where sorted
  var bar = this.barGroup.selectAll('g').filter(function (d, j) { return j == i;});
  rects = bar.selectAll('rect').transition().duration(1000).ease("cubic-in-out")
  .attr('width', function(d,j) {
    var val = dat[j].value;
    if(isNaN(val)){
      val = 0;
    }
    return x(val);
  })
  
  .attr('fill', function(d,j){
    var ret = sc(dat[j].id%20);
    if(colorFactor != 'renderGroup'){
      ret=colors[dat[j].factors[colorFactor]];
    }
    return ret;     
  })
  .attr('y', getY )
  ;
  
  var lines = bar.selectAll('line').transition().duration(1000).ease("cubic-in-out")
     // .attr('x1', gXOffset)
     .attr('y1', function(d,j) {return getY(d,j) + (barHeight/2) })
     .attr('y2', function(d,j) {return getY(d,j) + (barHeight/2) } )
     .attr('x2', function(d,j) {
      var ret =x(dat[j].value + dat[j].stdev); 
      if(isNaN(ret)){
        ret = 0;
      }
      return ret} )
     .attr('x1', function(d,j) { 
      var left = dat[j].value - dat[j].stdev;
      if(isNaN(left)){
        left = 0;
      }
      if(left < 0){
        left = 0
      }

      return x(left);
    })
     .attr('stroke-width', 2)
     .attr('stroke', 'black');

   }; 


   ExpressionBar.prototype.refresh = function(){
    var chart=this.chart;
    this.renderedData = this.getGroupedData(this.opt.renderProperty,this.opt.groupBy);
    this.totalRenderedGenes = this.renderedData.length;
   
    this.x.domain([0,this.maxInData()]);
    var gene = this.opt.highlight;
    for (var i in  this.renderedData) {
      this.refreshBar(gene, i);
    };
    this.refreshTitles();
    this.refreshScale();
  };

  ExpressionBar.prototype.renderGeneBar = function( i){
    var data = this.renderedData;
    var dat = data[i];
    var render_width = this.calculateBarWidth();
    var barHeight = this.opt.barHeight;
    var labelWidth = this.opt.labelWidth;
    var x=this.x;
    var sc = this.opt.sc;
    var blockWidth = (this.opt.width - this.opt.labelWidth) / this.totalRenderedGenes;
    var gXOffset = (blockWidth * i) + labelWidth;
    bar = this.barGroup.append('g');
    bar.attr('transform', 'translate(' + gXOffset  + ',' + barHeight + ')');
    var gene = '';

    for(var j in  dat){
      var d = dat[j];
      var y = (barHeight * d.renderIndex  ) ;

      var rect = bar.append('rect')
      .attr('y', y)
      .attr('height', barHeight - 2)
      .attr('fill', 'white')
      .attr('width', x(0))
      .on('mouseenter', function(da,k){
        var pos = d3.select(this).position(this);
        var index = ((pos.top ) / self.opt.barHeight)-1;
        var tooltip =  self.opt.renderProperty + ': ' +
        numberWithCommas(da.value) ;
        self.showTooltip(tooltip, this);
        self.showHighlightedFactors(da, this)
        }
      )
      .on('mouseleave', function(){
        self.hideTooltip();
        self.hideHighlightedFactors();
      });
      console.log(d); 
      rect.data([d]);

      bar.append('line').attr('x1', 0)
      .attr('y1', y + (barHeight/2))
      .attr('x2', 0)
      .attr('y2', y + (barHeight/2) )
      .attr('stroke-width', 1)
      .attr('stroke', 'black');
    }

  };


  ExpressionBar.prototype.calculateBarWidth = function(){  
    var availableWidth = this.opt.width - this.opt.labelWidth
  var widthPerBar = (availableWidth / this.totalRenderedGenes ) - 10; // 10 px of border. maybe dynamic?
  return widthPerBar;
};

ExpressionBar.prototype.maxInData = function(){
  var max = 0;
  for(var i in this.renderedData){
    for(var j in this.renderedData[i]){
      var curr =this.renderedData[i][j]
      if(curr.value + curr.stdev > max){
        max = curr.value + curr.stdev  ;
      }
    }
  }
  return max;
};

ExpressionBar.prototype.prepareColorsForFactors = function(){
  //this.factorColors = Map.new();
  this.totalColors = 8
  self = this;
  var colors = [
  colorbrewer['Pastel2'][this.totalColors],
  colorbrewer['Accent'][this.totalColors],
  colorbrewer['Dark2'][this.totalColors],
  colorbrewer['Set1'][this.totalColors],
  colorbrewer['Set2'][this.totalColors],
  colorbrewer['Paired'][this.totalColors],
  colorbrewer['Pastel1'][this.totalColors], 
  colorbrewer['Set3'][this.totalColors]
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
  var headerOffset = 0;
  var factorLength = this.factors.size;
  this.titleGroup.selectAll('rect').transition().duration(1000).ease("cubic-in-out")
  .attr('y', function(d,i){
    var groupIndex = Math.floor(i/factorLength);
    var pos = arr[groupIndex].renderIndex ;
    return (((pos ) * barHeight) ) + headerOffset;
  });

  this.titleGroup.selectAll('text').transition().duration(1000).ease("cubic-in-out")
  .attr('y', function(d,i){
   var pos = arr[i].renderIndex ; 
   return (((pos + 1 ) * barHeight) - 5 ) + headerOffset;
 });

};

ExpressionBar.prototype.renderGeneTitles = function(i){
   //this.factorTitle = this.chartHead.append('g');
   var data = this.renderedData;
   var dat = data[i];
   if (typeof dat === 'undefined') { 
    return ;
  }
  if (typeof dat[0] === 'undefined') { 
    return ;
  }
  var render_width = this.calculateBarWidth();
  var barHeight = this.opt.barHeight;
  var labelWidth = this.opt.labelWidth;
  var x=this.x;
  var sc = this.opt.sc;
  var blockWidth = (this.opt.width - this.opt.labelWidth) / this.totalRenderedGenes;
  var gXOffset = (blockWidth * i) + labelWidth;
  bar = this.factorTitle.append('g');
  bar.attr('transform', 'translate(' + gXOffset  + ',' + barHeight + ')');
  var gene = dat[0].gene;
  var weight = 100;
  var decoration = ''
  if(gene == this.data.gene){
    weight = 900;
    decoration = 'underline';
  } 

  bar.append('text')
  .attr('x',0)
  .attr('y', 10)
    //  .attr('dx', '.35em')
    .attr('width', blockWidth)
    .attr('height', barHeight)
    .attr('font-weight',weight)
    .attr('text-align', 'left')
    .attr('text-decoration', decoration)
    .text(gene); 

  };

  ExpressionBar.prototype.refreshScale = function(){
    var axisScale = this.x;
//  console.log(axisScale);
  //Create the Axis
  var xAxis = d3.svg.axis().scale(axisScale).ticks(3);

  var toUpdate = this.svgFootContainer.selectAll("g.x.axis")
  //console.log(toUpdate);
  toUpdate.transition().duration(1000).ease("cubic-in-out").call(xAxis);//ease("sin-in-out")  // https://github.com/mbostock/d3/wiki/Transitions#wiki-d3_ease

}

ExpressionBar.prototype.renderScales = function(i){
  var data = this.renderedData;
  var render_width = this.calculateBarWidth();

  this.svgFootContainer.attr("height", 40);

  var axisScale = this.x;
//  console.log(axisScale);
  //Create the Axis
  var xAxis = d3.svg.axis()
  .scale(axisScale).ticks(3);
  //Create an SVG group Element for the Axis elements and call the xAxis function
  var xAxisGroup = this.svgFootContainer.append("g").attr("class", "x axis")
  .call(xAxis);

  var blockWidth = (this.opt.width - this.opt.labelWidth) / this.totalRenderedGenes;                            
  var gXOffset = (blockWidth * i) + this.opt.labelWidth;                              
  xAxisGroup.attr('transform', 'translate(' + gXOffset  + ',0)');
  xAxisGroup.attr('dx', '.1em')

};

ExpressionBar.prototype.renderFactorTitles = function(){
  this.factorTitle = this.chartHead.append('g');
  this.factorTitle.attr('transform', 'translate(0,' + (this.opt.headerOffset - (this.opt.barHeight * 2 )) + ')');

  var barHeight = this.opt.barHeight;
  var xFact = 0;
  var self = this;
  this.factors.forEach(function(value, key, map){
    self.factorTitle.append('text')
    .attr('y', xFact)
    .attr('dx', '-2.0em')
    .attr('dy', '1em')
    .attr('transform', function(d) {
     return 'rotate(-90)' 
   })
     //.style('font-size','10px') 
     .text(key);
     xFact += self.opt.groupBarWidth;
   });
};

ExpressionBar.prototype.renderTitles = function(){
  var barHeight = this.opt.barHeight
  var self = this;
  var headerOffset = 0;
  this.titleGroup = this.chart.append('g');
  this.titleGroup.attr('transform', 'translate(0,' + barHeight + ')');
  arr = this.renderedData[0];

  var titleSetOffset = this.factors.size  * this.opt.groupBarWidth;
  var factorWidth = this.opt.groupBarWidth - 2; 
  

  for(i in arr){
    var pos = arr[i].renderIndex ; 
    this.titleGroup.append('text')
    .attr('x',titleSetOffset)
    .attr('y', (((pos + 1 ) * barHeight) -5 ) + headerOffset)
    .attr('dx', '.35em')
    .attr('height', barHeight - 2)
    .on('click', function(){self.setFactorColor('renderGroup')})
    .text(arr[i].name + ' (n=' + arr[i].data.length +  ')');
    var xFact = 0;
    this.factors.forEach(function(value, key, map){
      var factorValue = arr[i].factors[key];

      var factorLongName = self.data.longFactorName[key][factorValue];
      var color = self.factorColors[key][factorValue];
      var tooltip = key + ': ' + factorLongName;
      var rect = self.titleGroup.append('rect')
      .attr('x', xFact)
      .attr('y', (pos * barHeight) + headerOffset)
      .attr('height', barHeight - 2)
      .attr('fill', color)
      .attr('width', factorWidth)
      .attr('opacity', 0.0);

      if(typeof factorValue !== 'undefined'){
        rect.on('mouseenter', function(){self.showTooltip(tooltip, this)})
        .on('click', function(){
          self._addSortPriority(key, false);
          self.sortRenderedGroups(self.sortOrder, self.renderedOrder);
          self.setFactorColor(key);
          self.refresh();
        })
        .on('mouseleave', function(){self.hideTooltip()});
        rect.attr('opacity', 1.0);
      }
      
      xFact += self.opt.groupBarWidth;
    });
  }
};

ExpressionBar.prototype.setFactorColor = function(factor){
  this.opt.colorFactor = factor;
};

ExpressionBar.prototype.renderTooltip = function(){
  var barHeight = this.opt.barHeight;
  this.tooltipBox = this.chart.append('rect');
  this.tooltip = this.chart.append('text');
  this.tooltip.attr('x',0)
  .attr('y', 0)
  .attr('height', barHeight -2)
  .attr('fill', 'white')
  .attr('font-size', 10)
  .attr('visibility', 'hidden')
};

ExpressionBar.prototype.showTooltip = function(mouseovertext, evt) {
  var tooltip = this.tooltip;
  var coordinates = [0, 0];
  coordinates = d3.mouse(evt);

  var svgPosition = d3.select(evt).position(this);
  var x = svgPosition.left + 11  ;
  var y = svgPosition.top +  27 ;

  var svg1 = document.getElementById(this.chartSVGid);
  var bBox = svg1.getBBox();

  max =  bBox.height - this.opt.barHeight;
  if(y > max){
    y = max;
  }

  tooltip.attr('x', x);
  tooltip.attr('y', y);
  tooltip.text(mouseovertext);
  var textBox = tooltip.node().getBBox();
  var padding = 2;
  this.tooltipBox.attr('x', textBox.x - padding);
  this.tooltipBox.attr('y', textBox.y - padding);
  this.tooltipBox.attr('width', textBox.width + (padding*2))
  this.tooltipBox.attr('height', textBox.height + (padding*2))
  tooltip.attr('visibility', 'visible');
  this.tooltipBox.attr('visibility', 'visible');
}

ExpressionBar.prototype.hideTooltip = function() {
  this.tooltip.attr('visibility', 'hidden');
  this.tooltipBox.attr('visibility', 'hidden');
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
  this.totalRenderedGenes = data.length;
  //this.totalRenderedGenes = this.totalGenes;
  //console.log( this.totalRenderedGene);
  //console.log(data);
  //if(!this.opt.showHomoeologues){
  //  this.totalRenderedGenes = 1;
  // }
  var barWidth = this.calculateBarWidth();
  this.renderedData = data;
  this.x = d3.scale.linear().range([0, barWidth]);
  this.x.domain([0,this.maxInData()])
  var x=this.x;


  this.totalHeight = barHeight * (data[0].length + 2 )  ;
  chart.attr('height', this.totalHeight );

  this.chartFoot.selectAll("*").remove();
  this.chartHead.selectAll("*").remove();
  
  this.renderFactorTitles();
  this.renderTitles();
  this.barGroup = chart.append('g');
  this.svgFootContainer = d3.select("#"+this.chartSVGidFoot);

  for (var i in data) {
    this.renderGeneBar(i);
    this.renderGeneTitles(i);
    this.renderScales(i);
  }
  this.renderTooltip(); 
  
};


ExpressionBar.prototype.dataLoaded = function(){
  this.setAvailableFactors();
  this.prepareColorsForFactors();
  this.refreshSVG(this);
  this.renderPropertySelector();
  this.renderMergeButton();
  this.renderSortWindow();
  
};


require('biojs-events').mixin(ExpressionBar.prototype);
module.exports.ExpressionBar = ExpressionBar;