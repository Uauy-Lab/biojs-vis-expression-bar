/*
 * expression-bar
 * https://github.com/homonecloco/expression-bar
 *
 * Copyright (c) 2014 Ricardo H. Ramirez-Gonzalez
 * Licensed under the MIT license.
 */

var chai = require('chai');
chai.expect();
chai.should();

var expressionbar = require('../lib/expressionbar.js');

describe('expression-bar module', function(){
  describe('#hello()', function(){
    it('should return a hello', function(){
      expressionbar.hello('biojs').should.equal("hello biojs");
    });
  });
});
