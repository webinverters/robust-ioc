"use strict";

module.exports = function construct(config, deps) {
  var m = {};
  config = config ? config : {};
  config = _.defaults(config, {});

  var log = deps.log.module('dal', deps)

  var savedObjects = {}

  m.save = function(object) {
    var goal =  log.goal('save()', userConf)

    savedObjects[object.id] = object
    return p.resolve({
      saved: true
    })
  };

  return m;
};
