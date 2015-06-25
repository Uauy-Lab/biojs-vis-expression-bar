// browser globals
if (typeof biojs === 'undefined') {
  biojs = {};
}
if (typeof biojs.vis === 'undefined') {
  biojs.vis = {};
}

if (typeof biojs.vis.expression === 'undefined') {
  biojs.vis.expression = {};
}
// use two namespaces
 biovisexpressionbar = require('./index');
 biojs.vis.expression.bar = biovisexpressionbar;
 window.biovisexpressionbar = biojs.vis.expression.bar;
