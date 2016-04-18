'use strict';
var Promise = require('bluebird')
var assert = require('assert')
var Joi = require('joi')
var Hoek = require('hoek')
var Boom = require('boom')

var internals = {}

var routerSchema = Joi.object().keys({
  path: Joi.string().required(),
  method: Joi.string().required(),
  handler: Joi.any().required()
});

var eventSchema = Joi.object().keys({
  context: Joi.object().keys({
    'resource-path': Joi.string().required(),
    'http-method': Joi.string().required(),
  }).unknown()
}).unknown();

module.exports = exports = internals.Router = function (options) {

  if (!(this instanceof internals.Router))
    return new internals.Router();

  this.routes = {};
  var opts = options || {};
  return this;
}


internals.Router.prototype.register = function (route) {
  var routes = this.routes;

  Hoek.assert(route, 'route is required');
  var result = Joi.validate(route, routerSchema);
  if (result.error) {
    throw (result.error)
  }

  if (!routes[route.path])
    routes[route.path] = {}
  routes[route.path][route.method.toUpperCase()] = route;
  if (route.initialize && typeof route.initialize == 'function') {
    route.validate(event.context)
  }
}

internals.Router.prototype.handler = function (event, context) {
  var self = this;
  return new Promise((resolve, reject) => {
    Hoek.assert(event, 'event is required');
    Hoek.assert(context, 'context is required');
    var result = Joi.validate(event, eventSchema);
    if (result.error)
      return reject(result.error);

    if (event.context && event.context['resource-path']) {
      let route = this._getRoute(event, context);
      if (route) {
        return route.handler(event, context)
          .then((response) => {
            return resolve(response);
          })
          .catch((error) => {
            return reject(error);
          })
      } else {
        return reject(Boom.notImplemented(event.context['http-method'] + ' handler for path [' + event.context['resource-path'] + '] not registered'));
      }
    } else {
      return reject(Boom.badImplementation('Request context, method, and path are required'));
    }
  })
}

internals.Router.prototype._getRoute = function (event, context) {
  var entry = this.routes[event.context['resource-path']]
  if (entry) {
    return entry[event.context['http-method'].toUpperCase()];
  } else {
    return null;
  }
}