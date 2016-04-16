'use strict;'

var Lambda = require('../index')
var router;

var Chai = require('chai');
var assert = Chai.assert;
var expect = Chai.expect;

beforeEach((done) => {
  router = new Lambda();
  done();
})

var context = {
  fail: function (error) {
    console.log("Fail: " + error);
    throw error;
  },
  succeed: function (response) {
    console.log("Success: " + response);
  },
  done: function (error, response) {
    if (error) {
      this.fail(error);
    } else {
      this.succeed(response)
    }
  }
};

describe('Router:@unit', () => {
  describe('Registration:@unit', () => {
    it('should fail when invoking with no arguments', () => {
      expect(router.register.bind(router)).to.throw(Error)
    });
    it('should fail when invoking with an empty route', () => {
      expect(router.register.bind(router, {})).to.throw(Error)
    });
    it('should fail when passing a route that has no handler', () => {
      var route = {
        path: '/hello',
        method: 'get'
      };
      expect(router.register.bind(router, route)).to.throw(Error);
    });
    it('should fail when passing a route that has no handler', () => {
      var route = {
        path: '/hello',
        method: 'get'
      };
      expect(router.register.bind(router, route)).to.throw(Error);
    });
    it('should fail when invoking with no method', () => {
      var route = {
        path: '/hello',
        handler: (event, context) => {
          return "hello, world";
        }
      };
      expect(router.register.bind(router, route)).to.throw(Error);
    });
    it('should succeed when invoking with no path', () => {
      var route = {
        method: 'get',
        handler: (event, context) => {
          return "hello, world";
        }
      };
      expect(router.register.bind(router, route)).to.throw(Error);
    });
    it('should succeed when invoking with a valid route definition', () => {
      var route = {
        path: '/hello',
        method: 'get',
        handler: (event, context) => {
          return "hello, world";
        }
      };
      expect(router.register.bind(router, route)).to.not.throw(Error);
    });
  });
  describe('Routing:@unit', () => {
    it('should fail when routing an event to a router with no routes defined', () => {
      var event = {};
      expect(router.handler.bind(router, event, context)).to.throw(Error);
    })
    it('should succeed when routing an event to a router with the target route defined', (done) => {
      var route = {
        path: '/hello',
        method: 'get',
        handler: (event, context) => {
          return new Promise((resolve) => {
            resolve('hello, world');
          });
        }
      };
      var event = {
        context: {
          path: '/hello',
          method: 'get'
        }
      }
      router.register(route);
      router.handler(event, context);
      done()
    });
  });
});