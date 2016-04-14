# expression-bar

[![Build Status](https://secure.travis-ci.org/homonecloco/expression-bar.png?branch=master)](http://travis-ci.org/homonecloco/expression-bar)
[![NPM version](https://badge-me.herokuapp.com/api/npm/expression-bar.png)](http://badges.enytc.com/for/npm/expression-bar) 

> Simple barchart to show expression levels across experiments

## Getting Started
Install the module with: `npm install bio-vis-expression-bar`

```javascript

biovisexpressionbar = require("bio-vis-expression-bar");

var expressionbar = require('biovisexpressionbar');
var eb =  new biovisexpressionbar.ExpressionBar({
	target: container_div,
	highlight: 'Traes_4AL_F9DCE24F4.1',
	data: "data/realTestHom.js", 
	groupBy: ["High level Stress-disease", "High level age","High level tissue","High level variety"], 
	renderProperty: 'count', 
	width: '1000',
	fontFamily:'Palatino Linotype, Book Antiqua, Palatino, serif', 
	barHeight: 12
}
```

## Documentation



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


