"use strict";

module.exports = function construct(config, deps) {
  var m = {};
  config = config ? config : {};
  config = _.defaults(config, {});

  var log = deps.log.module('user-mgr', deps)
  var dal = deps.dal
  var unique = deps.unique

  m.createUser = function(userConf) {
    var goal =  log.goal('createUser()', userConf)
    
    userConf.id = 'user-'+unique.key(14)

    return dal.save(userConf)
      .then(function() {
        return userConf
      })
  };

  return m;
};
