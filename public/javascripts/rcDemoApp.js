var socket = io.connect();
var supportAvailable = false;

// Make sure we have jQuery before we continue
$(function() {
    //console.log( 'jQuery should now be loaded...' );

    // Socket.io
    socket.on('news', function(data) {
        console.log(data);
    });

    // VARS
    var line;
    var platform;
    /*
    var webPhone = new RingCentral.WebPhone({
        audioHelper: true
    });
    */

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

    // TODO: Once a user agent is logged into the phone number, show the webPhoneDialer
    // TODO: Once the webPhoneDialer has a valid RC access_token and has registered SIP, enable callSupport button and change display value to 'Call Support'

    // Cache the variable
    var $webPhoneDialer = $('#webPhoneDialer');
    var $callButton = $('#callButton');
});
