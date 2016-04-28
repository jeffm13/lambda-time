'use strict';
var Promise = require('bluebird');
var assert = require('assert');
var Joi = require('joi');
var Hoek = require('hoek');
var Boom = require('boom');

var internals = {};

var routerSchema = Joi.object().keys({
  path: Joi.string().required(),
  method: Joi.string().required(),
  handler: Joi.func().arity(2).required()
});

var eventSchema = Joi.object().keys({
  context: Joi.object().keys({
    'resource-path': Joi.string().required(),
    'http-method': Joi.string().required(),
  }).unknown().required()
}).unknown().required();

module.exports = exports = internals.Router = function(options) {
  this.routes = {};
  var opts = options || {};
  return this;
};


internals.Router.prototype.register = function(route) {
  var routes = this.routes;

  Hoek.assert(route, 'route is required');
  var result = Joi.validate(route, routerSchema);
  if (result.error) {
    throw (result.error);
  }

  if (!routes[route.path]) {
    routes[route.path] = {};
  }
  routes[route.path][route.method.toUpperCase()] = route;
};

internals.Router.prototype.route = function(event, context) {
  var self = this;
  return new Promise((resolve, reject) => {
    if (context == null) {
      let error = processError(Boom.badImplementation('context is required'));
      return reject(error);
    }
    var result = Joi.validate(event, eventSchema);
    if (result.error) {
      let error = processError(result.error);
      return reject(error);
    }

    if (event.context && event.context['resource-path']) {
      let route = this._getRoute(event, context);
      if (route) {
        return route.handler(event, context)
          .then((response) => {
            return resolve(response);
          })
          .catch((error) => {
            var errorStatus = (error.isBoom) ? error.output.payload : error;
            return reject(errorStatus);
          });
      } else {
        let error = processError(Boom.notImplemented(event.context['http-method'] + ' handler for path [' + event.context['resource-path'] + '] not registered'));
        return reject(error);
      }
    } else {
      let error = processError(Boom.badImplementation('Request context, method, and path are required'));
      return reject(error);
    }
  });
};

function processError(error) {
  if (error.isJoi) {
    error = validationError(error);
  }

  if (error.isBoom) {
    error = error.output.payload;
  }
  return error;
}

function validationError(error) {
  var errorValue;
  errorValue = Boom.badRequest('Invalid request input: ' + error.message);
  if (error.details) {
    errorValue.output.payload.details = error.details;
  }
  return errorValue;
}

internals.Router.prototype._getRoute = function(event, context) {
  var entry = this.routes[event.context['resource-path']];
  if (entry) {
    return entry[event.context['http-method'].toUpperCase()];
  } else {
    return null;
  }
};
