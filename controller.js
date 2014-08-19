/*
//noinspection JSUnresolvedVariable,JSUnusedGlobalSymbols
(function(){
  "use strict";

  //  node requires
  //==============================
  //
  //
  //
  var express = require('express')
    , app = express()
    , portN = 5000
    , path = require('path')
    , Server = require('./server')
    , bodyParser = require('body-parser')
    , serveStatic = require('serve-static')
    , methodOverride = require('method-override');

  //  Express setup.
  //==============================
  //
  //
  //
  app.use('/' , serveStatic(__dirname + '/public/'))
    .use(bodyParser())
    .use(methodOverride());


  app.set('port', process.env.PORT || portN)
    .set('cache', false);

//  stat.use('/' , serveStatic(testsD));
  new Server(app);


})();


*/
