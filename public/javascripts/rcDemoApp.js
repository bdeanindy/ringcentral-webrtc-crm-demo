'use strict';

var socket = io.connect();
var online;
var line;
var rcAccessToken;
var rcSipProvision;
var webPhone;

// Load jquery if you choose, I have it for convenience of memory
$(function() {
    // Cache the variable
    var $webPhoneDialer = $('#webPhoneDialer');
    var $callButton = $('#callButton');

    // Socket.io
    socket.on('online', function(data, fn) {
        console.log('online: ', data);
        online = data.online;
        if( true === online ) {
            $callButton.text('Call Me From Your Browser Now');
            $callButton.removeAttr('disabled');
            socket.emit('sipProvision');
        }
        fn('YES');
    });

    socket.on('rcAuth', function(data, fn) {
        console.log('New RC Auth Token: ', data);
        rcAccessToken = data.token;
        fn('YES');
    });

    socket.on('sipProvision', function(data, fn) {
        console.log('New RC WebRTC Sip Provision: ', data);
        rcSipProvision = data;
        webPhone = new RingCentral.WebPhone(data);
        fn('YES');
    });
});


/**************** RING CENTRAL WEB PHONE AND UI METHODS *********************/
function callStarted(e) {
    line = e;
}

function registerSIP( checkFlags, transport ) {
    transport = transport || 'WSS';
    return platform
        .post('/client-info/sip-provision', {
            sipInfo: [{
                transport: transport
            }]
        })
        .then(function(res) {


            var data = res.json();

            //data.appKey = localStorage.webPhoneAppKey;

            console.log("Sip Provisioning Data from RC API: " + JSON.stringify(data));

            return webPhone.register(data, checkFlags)
                .then(function(){
                    console.log('Registered');
                })
                .catch(function(e) {
                    var err = e && e.status_code && e.reason_phrase
                        ? new Error(e.status_code + ' ' + e.reason_phrase)
                        : (e && e.data)
                                  ? new Error('SIP Error: ' + e.data)
                                  : new Error('SIP Error: ' + (e || 'Unknown error'));
                    console.error('SIP Error: ' + ((e && e.data) || e) + '\n');
                    return Promise.reject(err);
                });

        }).catch(function(e) {
            console.error(e);
            return Promise.reject(e);
        });
}

// TODO: Once the webPhoneDialer has a valid RC access_token and has registered SIP, enable callSupport button and change display value to 'Call Support'

