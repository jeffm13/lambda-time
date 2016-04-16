# lambda-time
[![Build Status](https://travis-ci.org/jeffm13/lambda-time.svg?branch=master)](https://travis-ci.org/jeffm13/lambda-time)

Lightweight Node.js utilities to simplify AWS Lambda development activities.  

Most of the Lambda tutorials you'll find out there on the Interweb can handle "Hello, world!" very well.  Need another function? Just add it to Lambda. But when you move past the examples and attempt to create something meaningful, you might ask yourself: "Hmm, managing all these functions separately might become painful, so is it really a good idea?".  Especially when they all require the same shared packages, and when many need to communicate with each other somehow.

With Lambda time, your Lambdas are as big or as small as they need to be.  Common guidance is to create small, focused Lambdas. If you've made it this far in your research, you're likely implementing your lambdas with Node.js.  It's pretty likely that even a relatively large Node.js API implementation will be significantly smaller and lighter than one implemented in Java.  So feel free to combine multiple functions into a single lambda.  Lambda-time makes it pretty easy.

## Event routing

The event router is a knock-off of other common routers out there, but with
a twist.  It favors configuration over code in a way similar to the popular hapi framework, although it's similarity to hapi ends there.  

To define a route, register it when your Lambda is loaded:
```
var Lambda = require('lambda-time');
var Router = new Lamba();

Router.route([
 {
   path: '/greeting',
   method: 'GET',
   handler: function(event) {
     return 'Hello, world';
   }
 }
 ]);

function handler(event, context) {
  Router.handle(event, context);
}
module.exports = handler
```
The server maintains a table of routes, and routes all events to registered handlers. Each route path

## Event handlers
An event handler responds to an event. It's about as simple as it can be. It takes an event and an AWS Lambda context as arguments, and returns a response.  For now, each path/method combination will only support a single handler.

## Deploying your Lambda

TBD
