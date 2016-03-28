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
app.io = require('socket.io')(); 
app.io.on('connection', function(socket) {
    socket.emit('news', {hello: 'world'});
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
app.accountPresence = [];

platform
    .login({
        username: process.env.RC_USERNAME,
        extension: process.env.RC_EXTENSION,
        password: process.env.RC_PASSWORD 
    })
    .then(getExtensions)
    .then(createSubscription)
    .catch(function(e) {
        console.error('RC LOGIN ERROR: ', e);
        throw e;
    });

platform.on(platform.events.loginSuccess, function(evt) {
    
});

function getExtensions() {
    return platform
        .get('/account/~/extension')
        .then(function(extensions) {
            var data = extensions.json();
            //console.log(' getExtension RESPONSE DATA: ', data);
            return data.records.map(function(ext) {
                var detailedPresenceURI = '/account/~/extension/' + ext.id + '/presence?detailedTelephonyState=true';
                platform.get(detailedPresenceURI).then(function(presence) {
                    app.accountPresence.push(presence.json());
                    console.log('ACCOUNT PRESENCE: ', app.accountPresence);
                })
                .catch(function(e) {
                    console.error(e);
                    throw(e);
                });;
                return detailedPresenceURI;
            });
        })
        .catch(function(e) {
            console.error(e);
            throw e;
        });
}

function createSubscription(eventFilters) {
    return subscription
        .setEventFilters(eventFilters)
        .register()
        .then(function(response) {
            // TODO: Handle create/renew/loginSuccess/loginFail
            //console.log('SUBSCRIPTION RESPONSE: ', response);
            registeredSubscriptions.push(response);
        })
        .catch(function(e) {
            console.error(e);
            throw e;
        });
}

subscription.on(subscription.events.notification, function(msg) {
    if(msg.event.indexOf('/presence') > -1) {
        // TODO: Update the account presence
        console.log('NEW SUBSCRIPTION MESSAGE FOR PRESENCE: ', msg);
    } else if(msg.event.indexOf('/message-store') > -1) {
        console.log('NEW SUBSCRIPTION MESSAGE FOR MESSAGE STORE: ', msg);
    } else {
        console.log('NEW SUBSCRIPTION MESSAGE: ', msg);
    }
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

module.exports = app;
