var express = require('express');
var router = express.Router();
//var app = require('../app');

/* GET home page. */
router.get('/', function(req, res, next) {
    var token = res.platform.auth().data();
    var tokenJSON = token.access_token ? token.access_token : '';
    res.render('index', {
        authorizeData: res.platform.authUrl({
            brandId: process.env.RC_APP_BRAND_ID,
            redirectUri: process.env.RC_REDIRECT_URI,
            state: process.env.RC_REDIRECT_STATE
        }),
        redirectUri: process.env.RC_REDIRECT_URI,
        title: 'RingCentral WebRTC CRM Demo App',
        webPhoneTitle: 'Speak to a Person',
        groupPhoneNumber: 'Phone Number: +' + process.env.GROUP_PHONE_NUMBER,
        token: tokenJSON
    });
});

router.get('/rc/redirect', function(req, res) {
    console.log('/rc/redirect called');
});

router.get('/redirect', function(req, res) {
    console.log('/redirect called');
    // Sanity check
    if(req.query) {
        var code = req.query.code;
        var state = req.query.state;
    }
    // Make sure we have both required variables to login
    if(code && state) {
        // Need to authenticate this actually came from RingCentral
        if(state !== process.env.RC_REDIRECT_STATE) {
            console.log('STATES DO NOT MATCH');
            res.status(401).send('Unauthorized');
        } else {
            // Obtain an access_token for this user
            res.platform.login({
                code: req.query.code,
                redirectUri: process.env.RC_REDIRECT_URI
            })
            .then(function(response) {
                console.log('User has logged in with 3-Legged OAuth');
                console.log(response.json());
                res.status(200).send(response.json());
            })
            .catch(function(e) {
                console.error('ERROR ' + e.message || 'Server cannot authorize user');
                res.send(e);
            });
        }
    } else {
        // TODO: Missing the code piece
        res.send('');
    }
});

router.get('/rc/extensions', function(req, res) {
    console.log('requesting extensions');

    // TODO: Handle any sorting requests from the front-end component
    req.app.locals.platform.get('/account/~/extension/')
    .then(function(extensions) {
        console.log('API Returned Extensions...');
        console.log(extensions);
        res.send(extensions.json());
    })
    .catch(function(e) {
        console.error(e);
        throw(e);
    });
});

module.exports = router;
