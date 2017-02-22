/**
* @summary: ______.
* @description: _____.
*
* @author: Robustly.io <m0ser>
* @date:   2016-02-27T18:25:13-05:00
* @email:  m0ser@robustly.io
* @lastAuthor:   m0ser
* @lastModified: 2016-02-27T18:26:40-05:00
* @license: Apache-2.0
*/



var ModuleUnderTest = require('../index')
//var log = require('win-with-logs')({debug:false, app: 'robust-ioc', env: 'test', component: 'int'})

describe('robust-ioc', function() {
  var ioc

  beforeEach(function() {
    testlog.id = 12
    ioc = ModuleUnderTest({}, testlog)

    ioc = ioc.container('int-tests')

    ioc.register('config', testconfig)
    ioc.singleton('log', testlog)

    ioc.register('unique', require('./services/unique')).optional('crypto')
  })

  describe('config.bail', function() {
    it('if true, throws error for missing dependencies', function() {
      ioc = ioc.container('test', {bail: true})
      //ioc.register('unique', require('./services/unique'))
      expect(function() { ioc.create('unique') }).to.throw(/SERVICE_NOT_REGISTERED/)
    })
    it('if false, throws error for missing dependencies', function() {
      ioc = ioc.container('test2')
      ioc.register('unique', require('./services/unique'))
      expect(function() { ioc.create('unique') }).to.not.throw(/MISSING_DEPENDENCY/)
    })
    it('if false, warning is issued for missing dependencies', function() {
      var log = testlog.method('test')
      sinon.spy(log, 'warn')
      ioc = ModuleUnderTest({containerName: 'test3'}, log)
      ioc.register('unique', require('./services/unique'))
      ioc.create('unique', { log: testlog })
      expect(log.warn).to.have.been.calledWith('Missing Dependency')
    })
  })
  describe('get()', function() {
    it('injects dependencies', function() {
      ioc.register('testfactory', function(config) {
        expect(config).to.deep.equal(testconfig)
        return {}
      })
      ioc.get('testfactory')
    })
  })

  describe('create(serviceName, opts)', function() {
    it('returns a new instance of serviceName', function() {
      var unique = ioc.create('unique')
      expect(unique.key(9)).to.be.a('string').of.length(9)
    })

    it('can override service deps', function() {
      var unique = ioc.create('unique', {
        config: {
          prefix: 'test-'
        }
      })
      expect(unique.key(10)).to.contain('test-')
    })

    it('can override service methods with stubs', function() {
      var unique = ioc.create('unique', {
        overrides: {
          key: {
            returns: 'test-key'
          }
        }
      })
      expect(unique.key(10)).to.equal('test-key')
    })

    describe('if service has not been registered', function() {
      it('throws an error report', function() {
        expect(function() { ioc.create('nonexistent') }).to.throw(/SERVICE_NOT_REGISTERED/)
      })
    })
  })

  describe('copy()', function() {
    it('makes a copy of the ioc container', function() {
      ioc = ioc.copy()
      expect(ioc.id).to.equal('int-tests-copy1')
    })

    it('can be a named copy', function() {
      ioc = ioc.copy('test-name')
      expect(ioc.id).to.equal('test-name')
    })

    it('does not override services in the original container', function() {
      var orig = ioc
      ioc = ioc.copy()
      expect(ioc.id).to.equal('int-tests-copy2')
      ioc.singleton('log', function(x) {
        return x
      })
      expect(ioc.get('log')(10)).to.equal(10)
      expect(orig.get('log')(10)).to.not.equal(10)
    })
  })

  describe('modify()', function() {
    it('can modify singletons', function() {
      ioc.singleton('random', function(r) {
        return {
          get: function() { return r }
        }
      })
      expect(ioc.get('random')(10).get()).to.equal(10)
      var src = ioc

      ioc = ioc.copy()
      ioc.modify('random', function(random) {
        return function(r) {
          var orig = random()
          orig.get = function() { return r + 5 }
          return orig
        }
      })

      expect(ioc.get('random')(10).get()).to.equal(15)
      expect(src.get('random')(10).get()).to.equal(10)
    })

    it('can modify factories', function() {
      ioc.register('random', function(r) {
        return {
          get: function() { return r }
        }
      })
      expect(ioc.get('random')(10).get()).to.equal(10)
      var src = ioc

      ioc = ioc.copy()
      ioc.modify('random', function(random) {
        return function(r) {
          var orig = random()
          orig.get = function() { return r + 5 }
          return orig
        }
      })

      expect(ioc.get('random')(10).get()).to.equal(15)
      expect(src.get('random')(10).get()).to.equal(10)
    })
  })
})
