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
var copyCount = 1

function RobustIOC() {}
module.exports = function construct(config, log) {
  log = log || muzzledlog

  var m = new RobustIOC()

  log = log.module('robust-ioc')

  if (_.isString(config)) {
    config = {
      containerName: config
    }
  }

  config = config || {}
  config = _.defaults(config, {
    bail: false, // by default it just logs warnings
    containerName: 'DefaultContainer'
  })

  if (config.containerName && containers[config.containerName]) {
    return containers[config.containerName]
  }

  m.id = config.containerName

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
        if (params.length == 0) {
          inst = serviceFactory.apply(serviceFactory)
        } else {
          var deps = _.map(params, function(serviceName) {
            var svc, details = {service: serviceFactory.serviceName, dependency: serviceName}
            try {
              if (config.enableMocks) {
                opts[serviceName] = m.getMock(serviceName)
              }
              svc = opts[serviceName] || m.get(serviceName)
              if (!svc) log.warn('Service Dependency Missing', details)
            } catch (ex) {
              if (ex.what=='SERVICE_NOT_REGISTERED') {
                if (!(serviceFactory.optionalDeps && serviceFactory.optionalDeps[serviceName])) {
                  if (config.bail) throw log.errorReport('MISSING_DEPENDENCY', details, ex)
                  log.warn('Missing Dependency', details)
                }
              }
              else {
                log.error('Service Failed Construction.', ex)
                throw ex
              }
            }
            return svc
          })

          inst = serviceFactory.apply(serviceFactory, deps)
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
      serviceFactory.__temporal = (opts && opts.temporal)
    }

    return {
      // use this chain method to mark optional dependencies to suppress warnings.
      optional: function() {
        serviceFactory.optionalDeps = {}
        _.each(arguments, function(depName) {
          serviceFactory.optionalDeps[depName] = true
        })
      },
      temporal: function() {
        serviceFactory.__temporal = true
      }
    }
  }

  m.singleton = function(serviceName, serviceFactory) {
    //log('Singleton', serviceName)
    serviceInstances[serviceName] = serviceFactory
    serviceFactory.__singleton__ = true
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
    // if (serviceFactories[serviceName] && serviceFactories[serviceName].__temporal) {
    if (instanceExists(serviceName)) {
      return serviceInstances[serviceName]
    } else {
      return m.create(serviceName, opts)
    }
  }

  m.container = function(containerName, plusConfig) {
    if (containers[containerName]) return containers[containerName]

    var newConfig = _.extend({}, config,{containerName: containerName}, plusConfig || {})
    containers[containerName] = module.exports.apply(m, [newConfig, log])
    return containers[containerName]
  }

  m.copy = function(copyName) {
    copyName = copyName || (m.id + '-copy' + copyCount++)
    if (containers[copyName]) throw log.errorReport('DUPLICATE_COPY_NAME')
    var copy = m.container(copyName)
    copy.state({
      serviceFactories: _.cloneDeep(serviceFactories),
      serviceInstances: _.cloneDeep(serviceInstances)
    })
    return copy
  }

  m.state = function(state) {
    serviceFactories = state.serviceFactories || {}
    serviceInstances = state.serviceInstances || {}
  }

  m.configure = function(conf) {
    _.merge(config, conf)
  }

  /**
   * Replace a registered factory or singleton.
   *
   * @param  {type} serviceName description
   * @param  {type} modifier    description
   * @return {type}             description
   */
  m.modify = function(serviceName, modifier) {
    var thing = m.get(serviceName)
    if (thing.__singleton__) {
      m.singleton(serviceName, modifier(thing))
    } else {
      m.register(serviceName, modifier(thing))
    }
  }
  // alias of modify()
  m.replace = m.modify


  /**
   * Completely destory all state of this container.
   *
   * @return {type}  description
   */
  m.nuke = function() {
    serviceFactories = {}
    serviceInstances = {}
    containers = {}
    copyCount = 1

    containers[config.containerName] = m
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

  // __deps__ is a magical service name which contains all the dependencies.
  // This is provided for convenience, but may not be a good idea to actually
  // ever use.
  m.singleton('__deps__', serviceInstances)
  return m
}


function muzzledlog() {}
muzzledlog.method = muzzledlog.goal = function() {
  return muzzledlog
}
muzzledlog.info = muzzledlog.error = muzzledlog.warn = muzzledlog.log = muzzledlog.fatal = muzzledlog.module = muzzledlog
