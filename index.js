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
  handler: Joi.func().required()
});

var eventSchema = Joi.object().keys({
    resource: Joi.string().required(),
    httpMethod: Joi.string().required(),
}).unknown().required();

module.exports = exports = internals.Router = function(options) {
  this.routes = {};
  var opts = options || {};
  return this;
};


internals.Router.prototype.register = function(more_routes) {
  for (var i=0; i < more_routes.length; i++) {
    var route = more_routes[i];
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
  }
};

internals.Router.prototype.route = function(event, context) {
  var self = this;
  return new Promise((resolve, reject) => {
    if (context == null) {
      let error = this._processError(Boom.badImplementation('context is required'));
      return reject(error);
    }
    var result = Joi.validate(event, eventSchema);
    if (result.error) {
      let error = this._processError(result.error);
      return reject(error);
    }

    if (event && event.resource) {
      let route = this._getRoute(event, context);
      if (route) {
        return route.handler(event, context)
          .then((response) => {
            return resolve(response);
          })
          .catch((error) => {
            let newError = this._processError(error);
            return reject(newError);
          });
      } else {
        let error = this._processError(Boom.notImplemented(event.context['http-method'] + ' handler for path [' + event.context['resource-path'] + '] not registered'));
        return reject(error);
      }
    } else {
      let error = this._processError(Boom.badImplementation('Request context, method, and path are required'));
      return reject(error);
    }
  });
};

internals.Router.prototype._processError = function(error) {
  var transformed = error;
  if (error.isJoi) {
    transformed = this._validationError(error);
  }

  if (transformed.isBoom) {
    transformed = transformed.output.payload;
  }
  return transformed;
}

internals.Router.prototype._validationError = function(error) {
  var errorValue;
  errorValue = Boom.badRequest('Invalid request input: ' + error.message);
  if (error.details) {
    errorValue.output.payload.details = error.details;
  }
  return errorValue;
}

internals.Router.prototype._getRoute = function(event, context) {
  var entry = this.routes[event.resource];
  if (entry) {
    return entry[event.httpMethod.toUpperCase()];
  } else {
    return null;
  }
};
