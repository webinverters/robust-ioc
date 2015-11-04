/**
 * @module index.js
 * @summary: Wires up the library.
 *
 * @description:
 *
 * Author: justin
 * Created On: 2015-03-21.
 * @license Apache-2.0
 */


var containers = {}

function RobustIOC() {}
module.exports = function construct(config, log) {
  var m = new RobustIOC()

  log = log.module('robust-ioc')

  if (_.isString(config)) {
    config = {
      containerName: config
    }
  }
  
  config = config || {}
  config = _.defaults(config, {
    bail: false // by default it just logs warnings
  })

  if (config.containerName && containers[config.containerName]) {
    var container = containers[containerName]
    if (container) return container
  } else {
    config.containerName = 'DefaultContainer'
  }

  // serviceBag contains a list of factory functions for every service.
  // the factory function will either get an existing one or create a new one
  // depending on a variety of factors.
  var serviceBag = {}

  var serviceFactories = {}
  var serviceInstances = {}

  function serviceWrapper(serviceFactory) {
    function manipulateAPIMethod(override) {
      if (override.returns) {
        return sinon.stub().returns(override.returns)
      }
      if (override.rejects) {
        return sinon.stub().rejects(override.rejects)
      }
      if (override.throws) {
        return function() {
          throw override.throws
        }
      }
      if (override.does) {
        return override.does
      }
      if (override.resolves) {
        return sinon.stub().resolves(override.resolves)
      }
    }

    return {
      createNew: function(opts) {
        opts = opts || {}

        var inst
        var params = getParamNames(serviceFactory)
        if (params[0] == 'config') {
          if (params[1] == 'deps') {
            inst = serviceFactory(opts.config || serviceInstances['config'], opts.deps || serviceInstances)
          }
          else {
            var deps = _.map(params, function(serviceName) {
              var svc
              var details = {service: serviceFactory.serviceName, dependency: serviceName}
              try {
                svc = opts[serviceName] || m.get(serviceName)
                if (!svc) log.warn('Service Dependency Missing', details)
              } catch (ex) {
                if (ex.what=='SERVICE_NOT_REGISTERED') {
                  if (!(serviceFactory.optionalDeps && serviceFactory.optionalDeps[serviceName])) {
                    if (config.bail) throw log.errorReport('MISSING_DEPENDENCY', details, ex)
                    log.warn('Missing Dependency', details)
                  }
                }
              }

              return svc
            })

            inst = serviceFactory.apply(serviceFactory, deps)
          }
        }

        if (opts.overrides) {
          _.each(opts.overrides, function(apiOverrides, methodName) {
            inst[methodName] = manipulateAPIMethod(apiOverrides)
          })
        }

        return inst
      }
    }
  }

  m.register = function(serviceName, serviceFactory, opts) {
    if (!_.isFunction(serviceFactory)) {
      //log('Singleton', serviceName)
      serviceInstances[serviceName] = serviceFactory
    } else {
      //log('Factory', serviceName)
      serviceFactories[serviceName] = serviceFactory
      serviceFactory.serviceName = serviceName
    }

    return {
      // use this chain method to mark optional dependencies to suppress warnings.
      optional: function() {
        serviceFactory.optionalDeps = {}
        _.each(arguments, function(depName) {
          serviceFactory.optionalDeps[depName] = true
        })
      }
    }
  }

  m.singleton = function(serviceName, serviceFactory) {
    //log('Singleton', serviceName)
    serviceInstances[serviceName] = serviceFactory
  }

  m.create = function(serviceName, opts) {
    var factory = serviceFactories[serviceName]
    if (!factory) throw log.errorReport('SERVICE_NOT_REGISTERED', {serviceName: serviceName})

    serviceInstances[serviceName] = serviceWrapper(factory).createNew(opts)
    if (!serviceInstances[serviceName]) throw log.errorReport('INVALID_FACTORY', {serviceName: serviceName, opts: opts})
    var ret = m.get(serviceName, opts)
    return ret
  }

  m.get = function(serviceName, opts) {
    if (instanceExists(serviceName)) {
      return serviceInstances[serviceName]
    }
    else {
      var ret = m.create(serviceName, opts)
      count = 0
      return ret
    }
  }

  m.container = function(containerName, plusConfig) {
    if (containers[containerName]) return containers[containerName]

    var newConfig = _.extend({}, config,{containerName: containerName}, plusConfig || {})
    containers[containerName] = module.exports.apply(m, [newConfig, log])
    return containers[containerName]
  }

  function instanceExists(serviceName, opts) {
    // TODO: make the opts part of the check.
    return serviceInstances[serviceName]
  }

  var STRIP_COMMENTS = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/mg;
  var ARGUMENT_NAMES = /([^\s,]+)/g;
  function getParamNames(func) {
    var fnStr = func.toString().replace(STRIP_COMMENTS, '');
    var result = fnStr.slice(fnStr.indexOf('(')+1, fnStr.indexOf(')')).match(ARGUMENT_NAMES);
    if(result === null)
       result = [];
    return result;
  }

  if (config.containerName) {
    containers[config.containerName] = m
  }
  return m
}
