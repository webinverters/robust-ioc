/**
 * @module myModule
 * @summary: This module's purpose is to:
 *
 * @description:
 *
 * Author: Justin Mooser
 * Created On: 2015-07-12.
 * @license Apache-2.0
 */

"use strict";

module.exports = function construct(config, crypto) {
  var m = {};
  config = config ? config : {};
  config = _.defaults(config, {
    prefix: ''
  });
  crypto = crypto || require('crypto')

  m.key = function(length) {
    // removing all forward slashes from the random string
    // so that it can be used in URLs
    return config.prefix + crypto.randomBytes(length).toString('base64').substr(0,length).replace(/\//g,'e').replace(/\+/g, 'd').replace(/=/g, 's');
  };

  return m
};
