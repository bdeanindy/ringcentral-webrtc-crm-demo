'use strict';

require('dotenv').load();

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes');

var app = express();
// Quick hack to mount socket.io properly using the new Express Generator
// Attributed to: https://onedesigncompany.com/news/express-generator-and-socket-io
var server = require('http').Server(app);
var io = require('socket.io')(server);

// New Socket Connection, Let's bootstrap it with the Account Presence
// this will update the Call Me button
io.on('connection', function(socket) {
    // This will broadcast our RingCentral access_token to the client
    socket.emit('rcAuth', {token: app.locals.rcAuth.access_token}, function(data) {
        console.log('rcAuth received: ', data);
    });

    socket.on('sipProvision', function(options) {
        platform
            .post('/client-info/sip-provision', {
                sipInfo: [{transport: 'WSS'}]
            })
            .then(function(res) {
                io.emit('sipProvisionResponse', res.json());
            })
            .catch(function(e) {
                console.error(e);
                throw e;
            });
    });
});

// Setup RingCentral
var RC = require('ringcentral');
var sdk = new RC({
    server: process.env.RC_SERVER,
    appKey: process.env.RC_APP_KEY,
    appSecret: process.env.RC_APP_SECRET 
});

var platform = sdk.platform();
var subscription = sdk.createSubscription();
var registeredSubscriptions = [];
app.locals.accountPresence = [];

platform
    .login({
        username: process.env.RC_USERNAME,
        extension: process.env.RC_EXTENSION,
        password: process.env.RC_PASSWORD 
    })
    .catch(function(e) {
        console.error('RC LOGIN ERROR: ', e);
        throw e;
    });

platform.on(platform.events.loginSuccess, function(data) {
    //console.log('RC PLATFOMR LOGIN SUCCESS DATA: ', data.json());
    app.locals.rcAuth = data.json();
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Add socket.io to res in the event loop
app.use(function(req, res, next) {
    res.io = io;
    next();
});

app.use('/', routes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

// Quick hack to mount socket.io properly using the new Express Generator
module.exports = {app: app, server: server};
