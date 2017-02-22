/**
* @summary: ______.
* @description: _____.
*
* @author: Robustly.io <m0ser>
* @date:   2016-02-26T22:46:08-05:00
* @email:  m0ser@robustly.io
* @lastAuthor:   m0ser
* @lastModified: 2016-02-26T22:46:34-05:00
* @license: Apache-2.0
*/

require('dotenv').load();

global._ = require('lodash')
global.p = require('bluebird')

global.testconfig = {
  unique: {
    prefix: 'testprefix-'
  }
}

global.chai = require("chai");
var chaiAsPromised = require("chai-as-promised");

global._ = require('lodash');
global.p = require('bluebird');
global.path = require('path');
global.util = require('util');

global.sinon = require("sinon");
global.sinonChai = require("sinon-chai");
global.sinonAsPromised = require('sinon-as-promised')(p);

var chaiSubset = require('chai-subset');
chai.use(chaiSubset);
chai.use(chaiAsPromised);
chai.use(sinonChai);
chai.config.includeStack = true;

global.expect = chai.expect;

global.throwEx = function(msg) {
  throw new Error(msg)
}

global.testlog = require('robust-log')({app: 'robust-ioc', env: 'test', component: 'int-tests'})
