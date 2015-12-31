var colorbrewer = require('colorbrewer');
var d3 = require('d3');

var exts = require('./d3Extensions.js')

var HeatMap = function  (parent) {
	this.parent = parent;
	this.data = parent.data;
	this.opt = parent.opt;
	console.log("New HeatMap");
}



HeatMap.prototype.calculateBarWidth = function(){  
  var availableWidth = this.opt.width - this.opt.labelWidth;
  var widthPerBar = (availableWidth / this.parent.totalRenderedGenes ); // 10 px of border. maybe dynamic?
  return widthPerBar;
};

HeatMap.prototype.rangeX = function(){
 var barWidth = this.calculateBarWidth();
 var x = d3.scale.linear().range([barWidth, barWidth]);
 x.domain([0,this.parent.maxInData()]);
 return x;
}

HeatMap.prototype.renderGeneBar = function( i){
  var parent = this.parent;  
  var data = this.parent.data.renderedData;
  var dat = data[i];
  var render_width = this.calculateBarWidth();
  var barHeight = this.opt.barHeight;
  var labelWidth = this.opt.labelWidth;
  var x= this.rangeX();
  var sc = parent.opt.sc;
  var blockWidth = (parent.opt.width - parent.opt.labelWidth) / parent.totalRenderedGenes;
  var gXOffset = (blockWidth * i) + labelWidth;

  var bar = parent.barGroup.append('g');
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
      var tooltip =  parent.opt.renderProperty + ': ' +
        exts.numberWithCommas(da.value) + ', sem: ' + 
        exts.numberWithCommas(da.stdev)  ;
      parent.showTooltip(tooltip, this);
      parent.showHighlightedFactors(da, this);
    }
    )
    .on('mouseleave', function(){
      parent.hideTooltip();
      parent.hideHighlightedFactors();
    });

      rect.data([d]); //Bind the data to the rect
      
    };
  };


  HeatMap.prototype.rangeColor = function(){
   var buckets = 9;
   var colors = colorbrewer.YlGnBu[buckets];
   var colorScale = d3.scale.quantile().
   domain([0, buckets - 1, this.parent.maxInData() ])
   .range(colors);
   return colorScale;

 };


 HeatMap.prototype.refreshBar = function(gene, i){
  var data = this.parent.data.renderedData;
  var dat = data[i];
  var colors = this.rangeColor();
  var barHeight = this.opt.barHeight;
  var headerOffset  = 0;


  var getY = function(d,j){
    return (barHeight * dat[j].renderIndex) + headerOffset;   
  };

  var bar = this.parent.barGroup.selectAll('g').
  filter(function (d, j) { return j == i;});

  var rects = bar.selectAll('rect').transition()
  .duration(1000).ease("cubic-in-out")
  .attr('fill', function(d,j){
    var val = dat[j].value;
    if(isNaN(val)){
     val = 0;
   }
   return colors(val);
 })
  .attr('y', getY )
  .each(function(r,j){
    var d = dat[j];
    var rect = d3.select(this);
    rect.data([d]); 
  });


}; 


module.exports.HeatMap = HeatMap;