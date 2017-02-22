"use strict";

module.exports = function construct(config, deps) {
  var m = {};
  config = config ? config : {};
  config = _.defaults(config, {});

  var savedObjects = {}

  m.save = function(object) {
    var goal =  deps.log.goal('save()', userConf)

    savedObjects[object.id] = object
    return p.resolve({
      saved: true
    })
  };

  return m;
};
