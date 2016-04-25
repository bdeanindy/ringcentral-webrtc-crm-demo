'use strict';

var socket = io('//localhost:3000');
var rcAccessToken;
var rcSipProvision;
var webPhone;
var session;
var line;
var QUEUE_NUMBER = '15623215778';
var SOURCE_NUMBER = '15559994444';
var $webPhoneDialer;
var $callButton;

// Since I'm using Bootstrap which requires jQuery, I'm using jQuery.
// If you aren't using Bootstrap, you don't have to use jQuery
$(function() {
    socket.connect();
    socket.emit('sipProvision');
    // Cache the variable
    $webPhoneDialer = $('#webPhoneDialer');
    $callButton = $('#callButton');

    $callButton.on('click', function() {
        // TODO: If WebPhone is registered, then use it
        // Make a phone call to the Goofy Goobers example Call Queue
        if(!session) {
            placeCall();
        } else {
            session.terminate();
            $callButton.removeClass('btn-danger');
            socket.emit('sipProvision');
        }

    });
    socket.on('rcAuth', function(data) {
        //console.log('New RC Auth Token: ', data);
        rcAccessToken = data.token;
    });

    socket.on('sipProvisionResponse', function(data) {
        $callButton.text('Call Goofy Goobers!');
        $callButton.removeAttr('disabled');
        $callButton.addClass('btn-success');
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

/**************** RING CENTRAL WEB PHONE INTERFACING AND UI METHODS *********************/
function onAccepted(session) {
    //console.log('Call: Accepted', session.request);
    //console.log('To: ', session.request.to.displayNmae, session.request.to.friendlyName);
    //console.log('From: ', session.request.from.displayName, session.request.from.friendlyName);

    session.on('accepted', function() {
        console.log('Accepted');
    });
    session.on('rejected', function() {
        console.log('Rejected');
    });
    session.on('terminated', function() {
        console.log('Terminated');
    });
    session.on('bye', function() {
        console.log('Goodbye');
    });

    session.mediaHandler.on('iceConnection', function() { console.log('ICE: iceConnection'); });
    session.mediaHandler.on('iceConnectionChecking', function() { console.log('Event: ICE: iceConnectionChecking'); });
    session.mediaHandler.on('iceConnectionConnected', function() { console.log('Event: ICE: iceConnectionConnected'); });
    session.mediaHandler.on('iceConnectionCompleted', function() { console.log('Event: ICE: iceConnectionCompleted'); });
    session.mediaHandler.on('iceConnectionFailed', function() { console.log('Event: ICE: iceConnectionFailed'); });
    session.mediaHandler.on('iceConnectionDisconnected', function() { console.log('Event: ICE: iceConnectionDisconnected'); });
    session.mediaHandler.on('iceConnectionClosed', function() { console.log('Event: ICE: iceConnectionClosed'); });
    session.mediaHandler.on('iceGatheringComplete', function() { console.log('Event: ICE: iceGatheringComplete'); });
    session.mediaHandler.on('iceGathering', function() { console.log('Event: ICE: iceGathering'); });
    session.mediaHandler.on('iceCandidate', function() { console.log('Event: ICE: iceCandidate'); });
    session.mediaHandler.on('userMedia', function() { console.log('Event: ICE: userMedia'); });
    session.mediaHandler.on('userMediaRequest', function() { console.log('Event: ICE: userMediaRequest'); });
    session.mediaHandler.on('userMediaFailed', function() { console.log('Event: ICE: userMediaFailed'); });
}

function placeCall() {
    $callButton.addClass('btn-danger');
    $callButton.text('Hang Up');
    session = webPhone.userAgent.invite(QUEUE_NUMBER, {
        media: {
            render: {
                remote: document.getElementById('remoteVideo'),
                local: document.getElementById('localVideo')
            }
        },
        fromNumber: SOURCE_NUMBER
    });

    onAccepted( session );
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

function onRegistered(data) {
    console.log('onRegistered: ', arguments);
    console.log('onRegistered->data.method: ', data.method);
    console.log('onRegistered->data.reason_phrase: ', data.reason_phrase);
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

