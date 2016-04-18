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
  fail: function (error) {},
  succeed: function (response) {},
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
    it('should fail when invoking with no path', () => {
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
    it('should fail when routing a null event', () => {
      var event = null;
      router.handler(event, context)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
        })
    })

    it('should fail when routing an event to a router with no routes defined', () => {
      var event = {};
      router.handler(event, context)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
        })
    })

    it('should fail when routing an event that has no API gateway context', () => {
      var event = {};
      router.handler(event, context)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
        })
    })

    it('should succeed when routing an event to a router with a matching route defined', (done) => {
      var route = {
        path: '/hello',
        method: 'get',
        handler: (event, context) => {
          return new Promise((resolve) => {
            return resolve('hello, world');
          });
        }
      };
      var event = {
        context: {
          'resource-path': '/hello',
          'http-method': 'GET'
        }
      }
      router.register(route);
      router.handler(event, context)
        .then((response) => {
          expect(response).to.exist;
          context.done(null, response);
        })
        .catch((error) => {
          expect(error).to.not.exist;
          context.done(error, null);
        });
      done()
    });


    it('should fail when routing an event to a router without a matching route defined', (done) => {
      var route = {
        path: '/goodbye',
        method: 'GET',
        handler: (event, context) => {
          return new Promise((resolve) => {
            return resolve('goodbye, world');
          });
        }
      };
      var event = {
        context: {
          'resource-path': '/hello',
          'http-method': 'GET'
        }
      }
      router.register(route);
      router.handler(event, context)
        .then((response) => {
          expect(response).to.not.exist;
          context.done(null, response);
        })
        .catch((error) => {
          expect(error).to.exist;
          context.done(error, null);
        });
      done()
    });

    it('should fail when request causes handler to reject', (done) => {
      var route = {
        path: '/hello',
        method: 'GET',
        handler: (event, context) => {
          return new Promise((resolve, reject) => {
            return reject('this is a problem');
          });
        }
      };
      var event = {
        context: {
          'resource-path': '/hello',
          'http-method': 'GET'
        }
      }
      router.register(route);
      router.handler(event, context)
        .then((response) => {
          expect(response).to.not.exist;
          context.done(null, response);
        })
        .catch((error) => {
          expect(error).to.exist;
          context.done(error, null);
        });
      done()
    });

  });
});