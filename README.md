# lambda-time
[![Build Status](https://travis-ci.org/jeffm13/lambda-time.svg?branch=master)](https://travis-ci.org/jeffm13/lambda-time)
![Dependencies](https://david-dm.org/jeffm13/lambda-time.svg)
[![node](https://img.shields.io/badge/Node.js-4.3.2-brightgreen.svg?maxAge=2592000)]()

[![NPM](https://nodei.co/npm/lambda-time.png)](https://nodei.co/npm/lambda-time/)


Lightweight Node.js utilities to simplify AWS Lambda development activities.  

Most of the Lambda tutorials you'll find out there on the Interweb can handle "Hello, world!" very well.  Need another function? Just add it to Lambda. But when you move past the examples and attempt to create something meaningful, you might ask yourself: "Hmm, managing all these functions separately might become painful, so is it really a good idea?".  Especially when they all require the same shared packages, and when many need to communicate with each other somehow.

With `lambda-time`, your Lambdas are as big or as small as they need to be.  Common guidance is to create small, focused Lambdas. That is generally good advice, but small is as small does. The smaller the Lambda, the more likely it is that you'll need it to cooperate with other Lambdas.

Since it's pretty likely (since you're still reading this) that you're implementing your Lambdas with Node.js.  It's also likely that even a relatively large Node.js API implementation will be significantly smaller and lighter than one implemented in Java.  So feel free to combine multiple functions into a single lambda.  Lambda-time makes it pretty easy.

## Event routing

The event router is a knock-off of other common routers out there, but with a twist.  It favors configuration over code in a way similar to the popular [hapi](http://hapijs.com) framework, although it's similarity to hapi ends with the routing model and some shared dependencies. `lambda-time` is far simpler, smaller, and less capable than `hapi`.  But it works with Lambda.

A route determines what happens when an event is received by Lambda. To define a route, register it when your Lambda is loaded:
```
var Lambda = require('lambda-time');
var Router = new Lamba();

Router.register([
 {
   path: '/greeting',
   method: 'GET',
   handler: function(event) {
     return 'Hello, world';
   }
 }
 ]);

function handler(event, context) {
  Router.route(event, context)
    .then((result) => {
        context.done(null, result);
      });
    .catch((error) => {
        context.done(error);
      })
}
module.exports = handler;
```
The server maintains a table of routes, and routes all events to registered handlers. Each route path

## Event handlers
An event handler responds to an event. It's about as simple as it can be. It takes an event and an AWS Lambda context as arguments, and returns a promise that resolves to a response.  For now, each path/method combination will only support a single handler, and handlers must return a promise.

## Promises
We prefer using bluebird.

## Deploying your Lambda

TBD
