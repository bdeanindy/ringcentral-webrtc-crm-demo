'use strict';

var socket = io();
var online;
var rcAccessToken;
var rcSipProvision;
var webPhone;
var session;
var line;
var QUEUE_NUMBER = '15623215778';

// Load jquery if you choose, I have it for convenience of memory
$(function() {
    socket.connect();
    // Cache the variable
    var $webPhoneDialer = $('#webPhoneDialer');
    var $callButton = $('#callButton');

    $callButton.on('click', function() {
        socket.emit('sipProvision');
    });

    // Socket.io
    socket.on('online', function(data, fn) {
        //console.log('online: ', data);
        online = data.online;
        if( true === online ) {
            $callButton.text('Call Me From Your Browser Now');
            $callButton.removeAttr('disabled');
        }
        fn('YES');
    });

    socket.on('rcAuth', function(data, fn) {
        //console.log('New RC Auth Token: ', data);
        rcAccessToken = data.token;
        fn('YES');
    });

    socket.on('sipProvision', function(data, fn) {
        //console.log('New RC WebRTC Sip Provision: ', data);
        rcSipProvision = data.sipInfo[0] || data.sipInfo;;
        //console.log('RingCentral: ', RingCentral);
        webPhone = new RingCentral.WebPhone(data, {
            logLevel:3,
            audioHelper: {
                enabled: true, // enables audio feedback when phone is ringing or making call
                incoming: '/audio/incoming.ogg', // path to audio file for incoming call
                outgoing: '/audio/outgoing.ogg' // path to audio file for outgoing call
            }
        });

        webPhone.userAgent.on('invite', onInvite);
        webPhone.userAgent.on('connecting', onConnecting);
        webPhone.userAgent.on('connected', onConnected);
        webPhone.userAgent.on('disconnected', onDisconnected);
        webPhone.userAgent.on('registered', onRegistered);
        webPhone.userAgent.on('unregistered', onUnregistered);
        webPhone.userAgent.on('registrationFailed', onRegistrationFailed);
        webPhone.userAgent.on('message', onMessage);
    });
});

        /*
        session = webPhone.userAgent.invite('14158905908', {
            media: {
                render: {
                    remote: document.getElementById('remoteVideo'),
                    local: document.getElementById('localVideo')
                }
            },
            fromNumber: '16503514622',
            homeCountryId: '1'
        })
        .then(function(data) {
            console.log('New Call Data: ', data);
        })
        .catch(function(e) {
            console.log(e);
            throw e;
        });
        */

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

function onAccepted(session) {
    console.log('Event: Accepted', session.request);
    console.log('To: ', session.request.to.displayNmae, session.request.to.friendlyName);
    console.log('From: ', session.request.from.displayName, session.request.from.friendlyName);

    var interval = setInterval( function() {
        var time = session.startTime
            ? (Math.round((Date.now() - session.startTime) / 1000) + 's')
            : 'Ringing'
            ;

        $info.text(
            'time: ' + time + '\n' + 'startTime: ' + JSON.stringify(session.startTime, null, 2) + '\n'
        );
    }, 1000);

    function close() {
        clearInterval(interval);
        console.log('TODO: HIDE ME');
    }

    // TODO: RESUME AT -->  https://github.com/ringcentral/ringcentral-web-phone/blob/master/demo/index.js#L245
}

/******************* RING CENTRAL WEB PHONE INTERNAL EVENT HANDLERS ******************/
function onInvite() {
    console.log('onInvite args: ', arguments);
}
function onConnecting() {
    console.log('onConnecting: ', arguments);
}
function onConnected() {
    console.log('onConnected: ', arguments);
}
function onDisconnected() {
    console.log('onDisconnected: ', arguments);
}
function onRegistered() {
    console.log('onRegistered: ', arguments);
    var homeCountry = (extension && extension.regionalSettings && extension.regionalSettings.homeCountry)
        ? extension.regionalSettings.homeCountry.id
        : null
        ;
    var session = webPhone.userAgent.invite(QUEUE_NUMBER, {
        media: {
            render: {
                remote: document.getElementById('remoteVideo'),
                local: document.getElementById('localVideo')
            }
        },
        fromNumber: username,
        homeCountryId: homeCountry
    });

    onAccepted( session );
}
function onUnregistered() {
    console.log('onUnregistered: ', arguments);
}
function onRegistrationFailed() {
    console.log('onRegistrationFailed: ', arguments);
}
function onMessage() {
    console.log('onMessage: ', arguments);
}

// TODO: Once the webPhoneDialer has a valid RC access_token and has registered SIP, enable callSupport button and change display value to 'Call Support'

