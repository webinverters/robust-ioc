"use strict";

module.exports = function construct(config, deps) {
  var m = {};
  config = config ? config : {};
  config = _.defaults(config, {});

  var log = deps.log.module('controller', deps)
  var userMgr = deps.userMgr

  m.register = function(req, res) {
    var goal =  log.goal('register()', userConf)

    var result = userMgr.createUser(req.body)

    console.log('User created:', result)
  };

  return m
};
