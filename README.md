# expression-bar

[![Build Status](https://secure.travis-ci.org/homonecloco/expression-bar.png?branch=master)](http://travis-ci.org/homonecloco/expression-bar)
[![NPM version](https://badge-me.herokuapp.com/api/npm/expression-bar.png)](http://badges.enytc.com/for/npm/expression-bar)

> Simple barchart to show expression levels across experiments

## Getting Started

### Install
Install the module with: `npm install bio-vis-expression-bar` or `yarn add bio-vis-expression-bar`

### Integrate
#### HTML
```html
<div class="wrapper" >

  <div  id="bar_expression_viewer"></div>    

</div>

```

#### Javascript
```javascript

biovisexpressionbar = require("bio-vis-expression-bar");

var container_div="bar_expression_viewer";
var parentWidth = $("#bar_expression_viewer").parent().width();
var expressionBar =  new biovisexpressionbar.ExpressionBar({
  target: container_div,
  highlight: 'Traes_4AL_F9DCE24F4.1',
  data: [pass_the_data_in_json_format],
  renderProperty: 'tpm',    
  fontFamily:'Helvetica Neue, Helvetica, Arial, sans-serif',
  groupBy: ["High level stress-disease", "High level age","High level tissue","High level variety"],  
  height: avaHeight,    // *Important*: available height must be passed
  width: parentWidth    // Optional: passing the width available for charts
  plot:'Bar'    // Specifying the chart type (Bar | Heatmap | Ternary (Requires homologues))
}
```
#### Important resize function
This function needs to be provided in the javascript file to make the charts to be dynamic
```javascript

// Resize function
var resizeTimer;
$(window).on('resize', function(e){
  clearTimeout(resizeTimer);  // Making sure that the reload doesn't happen if the window is resized within 1.5 seconds
  resizeTimer = setTimeout(function(){
    var avaHeight = [calculate_the_available_height_for_charts];
    expressionBar.resizeChart(avaHeight);
  }, 1500);
});
```

### Demo
#### While developing
Run ```npm run watch``` or ```yarn run watch``` to keep watching for changes to javascipt while developing <br>
Run ```npm run sniper``` or ```yarn run sniper``` in a different<br>
Go to ```localhost:9090``` in your browser<br>
Navigate to ```snippets/ternary-plot``` ternminal
#### While not developing
Run ```npm run build-browser``` or ```yarn run build-browser``` to bundle the javascipt files <br>
Run ```npm run sniper``` or ```yarn run sniper```<br>
Go to ```localhost:9090``` in your browser<br>
Navigate to ```snippets/ternary-plot```


## Contributing

Please submit all issues and pull requests to the [homonecloco/biojs-vis-expression-bar](https://github.com/homonecloco/biojs-vis-expression-bar) repository!

## Support
If you have any problem or suggestion please open an issue [here](https://github.com/homonecloco/biojs-vis-expression-bar/issues).

## License

The MIT License

Copyright (c) 2015, Ricardo H. Ramirez-Gonzalez

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.
