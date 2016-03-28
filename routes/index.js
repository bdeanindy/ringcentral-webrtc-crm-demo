var express = require('express');
var router = express.Router();
var app = require('../app');

/* GET home page. */
router.get('/', function(req, res, next) {
    res.render('index', { title: 'RingCentral JS SDK - WebRTC Test App', webPhoneTitle: 'Speak to a Person' });
});

router.get('/accountStatus', function(req, res) {
    app.accountPresence.forEach(function(item, idx, arr) {
        if('Available' === item.presenceStatus) {
            res.status(200).send('available');
        }
    });
    res.status(200).send('unavailable');
});

module.exports = router;
