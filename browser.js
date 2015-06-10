// browser globals
if (typeof biojs === 'undefined') {
  biojs = {};
}
if (typeof biojs.vis === 'undefined') {
  biojs.vis = {};
}
// use two namespaces
window.biovisexpressionbar = biojs.vis.expression.bar =
biovisexpressionbar = require('./index');
