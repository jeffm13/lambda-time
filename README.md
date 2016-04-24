# lambda-time
[![Build Status](https://travis-ci.org/jeffm13/lambda-time.svg?branch=master)](https://travis-ci.org/jeffm13/lambda-time)
![Dependencies](https://david-dm.org/jeffm13/lambda-time.svg)
[![node](https://img.shields.io/badge/Node.js-4.3.2-brightgreen.svg?maxAge=2592000)]()
[![Coverage Status](https://coveralls.io/repos/github/jeffm13/lambda-time/badge.svg?branch=master)](https://coveralls.io/github/jeffm13/lambda-time?branch=master)

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
The server maintains a table of routes, and routes all events to registered event handlers.

## Event handlers
An event handler responds to an event. It's about as simple as it can be. It takes an event and an AWS Lambda context as arguments, and returns a promise that resolves to a response.  For now, each path/method combination will only support a single handler, and handlers must return a promise.

## Promises
We prefer using bluebird.  If you need another promise implementation, raise an issue.

## Deploying your Lambda

Relatively simple deployments can be executed with gulp using the node-aws-lambda package.  If your project is a bit more ambitious, and can use a continuous integration tool, deployment is probably better handled through the CI environment--especially if your function uses any native packages.  For example, for free open source or private projects that use Travis, a Travis build file can be structured similar to this:
```
language: node_js
node_js:
- 4.3.2
sudo: required
dist: trusty
cache:
  directories: node_modules
before_script:
- npm install -g gulp
script: gulp test
after_success: gulp dist
deploy:
  provider: lambda
  skip_cleanup: true
  edge: true
  access_key_id:
    secure: <encrypted access key goes here>
  secret_access_key:
    secure: <encrypted secret goes here>
  function_name: <name of the Lambda function>
  handler_name: handler
  runtime: nodejs4.3
  role: <lambda execution role>
  zip_file: dist.zip
```
In the example above, the gulpfile.js contains directives pulled from the `node-aws-lambda` package to create a zip file that is uploaded to Lambda.
