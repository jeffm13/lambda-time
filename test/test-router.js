'use strict';
/* jshint expr: true */
/*eslint-env node, mocha */

var Lambda = require('../index');
var Boom = require('boom');
var Joi = require('joi');

var router;

var Chai = require('chai');
var assert = Chai.assert;
var expect = Chai.expect;

beforeEach((done) => {
  router = new Lambda();
  done();
});

var context = {
  fail: function(error) {},
  succeed: function(response) {},
  done: function(error, response) {
    if (error) {
      this.fail(error);
    } else {
      this.succeed(response);
    }
  }
};

describe('Router:@unit', () => {
  describe('Registration:@unit', () => {
    it('should fail when invoking with no arguments', () => {
      expect(router.register.bind(router)).to.throw(Error);
    });
    it('should fail when invoking with an empty route', () => {
      expect(router.register.bind(router, {})).to.throw(Error);
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
    it('should fail when invoking with invalid property name', () => {
      var route = {
        methd: 'get',
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
    it('should succeed when invoking with more than one method on the same path', () => {
      var route = {
        path: '/hello',
        method: 'get',
        handler: (event, context) => {
          return "hello, world";
        }
      };
      expect(router.register.bind(router, route)).to.not.throw(Error);
      route.method = 'post';
      expect(router.register.bind(router, route)).to.not.throw(Error);
    });
  });

  describe('Routing:@unit', () => {
    it('should fail when routing a null event', () => {
      var event = null;
      router.route(event, context)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
        });
    });

    it('should fail when routing an event to a router with no routes defined', () => {
      var event = {};
      router.route(event, context)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
        });
    });

    it('should fail when routing an event that has no API gateway context', () => {
      var event = {};
      router.route(event, context)
        .then((response) => {
          expect(response).to.not.exist;
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error.statusCode).to.equal(400);
        });
    });

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
      };
      router.register(route);
      router.route(event, context)
        .then((response) => {
          expect(response).to.exist;
          context.done(null, response);
          done();
        })
        .catch((error) => {
          expect(error).to.not.exist;
          context.done(error, null);
          done();
        });
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
      };
      router.register(route);
      router.route(event, context)
        .then((response) => {
          expect(response).to.not.exist;
          context.done(null, response);
          done();
        })
        .catch((error) => {
          expect(error).to.exist;
          context.done(error, null);
          done();
        });

    });

    it('should fail when request causes handler reject', (done) => {
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
      };
      router.register(route);
      router.route(event, context)
        .then((response) => {
          expect(response).to.not.exist;
          context.done(null, response);
          done();
        })
        .catch((error) => {
          expect(error).to.exist;
          context.done(error, null);
          done();
        });

    });

    it('should transform error when handler rejects with a ValidationError', (done) => {
      var route = {
        path: '/hello',
        method: 'GET',
        handler: (event, context) => {
          return new Promise((resolve, reject) => {
            var schema = Joi.string();
            var result = Joi.validate(1, schema);
            expect(result.error).to.exist;
            return reject(result.error);
          });
        }
      };
      var event = {
        context: {
          'resource-path': '/hello',
          'http-method': 'GET'
        }
      };
      router.register(route);
      router.route(event, context)
        .then((response) => {
          expect(response).to.not.exist;
          context.done(null, response);
          done();
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error.statusCode).to.equal(400);
          context.done(error, null);
          done();
        });

    });

    it('should fail with a badImplementation error when request causes handler to reject', (done) => {
      var route = {
        path: '/hello',
        method: 'GET',
        handler: (event, context) => {
          return new Promise((resolve, reject) => {
            return reject(Boom.badImplementation('this is a bad implementation'));
          });
        }
      };
      var event = {
        context: {
          'resource-path': '/hello',
          'http-method': 'GET'
        }
      };
      router.register(route);
      router.route(event, context)
        .then((response) => {
          expect(response).to.not.exist;
          context.done(null, response);
          done();
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error.statusCode).to.equal(500);
          context.done(error, null);
          done();
        });
    });
    it('should fail with a badImplementation error when request has invalid properties', (done) => {
      var route = {
        path: '/hello',
        method: 'GET',
        handler: (event, context) => {
          return new Promise((resolve, reject) => {
            return reject(Boom.badImplementation('this is a bad implementation'));
          });
        }
      };
      var event = {
        context: {
          'rsource-path': '/hello',
          'http-method': 'GET'
        }
      };
      router.register(route);
      router.route(event, context)
        .then((response) => {
          expect(response).to.not.exist;
          context.done(null, response);
          done();
        })
        .catch((error) => {
          expect(error).to.exist;
          expect(error.statusCode).to.equal(400);
          context.done(error, null);
          done();
        });
    });
  });

});
