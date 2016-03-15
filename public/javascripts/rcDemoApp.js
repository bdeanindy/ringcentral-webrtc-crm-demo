// Make sure we have jQuery before we continue
$(function() {
  //console.log( 'jQuery should now be loaded...' );

  // RC Method
  var serverSideRingOut = function serverSideRingOut( options, callback ) {
    // TODO: Need to make the request to server-side code to make the call
  };

  var clientSideRingOut = function clientSideRingOut( options, callback ) {
    // TODO: Need to make the request client-side to make the call
  };

  var serverSideSms = function serverSideSms() {
    // TODO: Need to make the request to server-side code to send the SMS
  };

  var $ringOutSchedule = $('#ringOutSchedule');
  $ringOutSchedule.on('click', function( evt ) {
    $.post('/rc/ringOut', {
      rcRingOutType: 'schedule'
    }, function( data, msg, xhr ) {
      console.log('Proxied POST request to /rc/ringOut was successful');
      console.log( 'DATA: ', data );
      console.log( 'MSG: ', msg );
    });
  });

  var $sendSMS = $('#sendSMS');
  $sendSMS.on('click', function( evt ) {
    $.post('/rc/sms', {
      targets: [
        {phoneNumber: '', extension: ''}
      ],
      originator: '', // Phone number associated with RingCentral and able to send SMS
      textMsg: '' // The message you want to send
    }, function( data, msg, xhr ) {
      console.log( 'Proxied SMS POST request to /rc/sendSMS was successful' );
      console.log( 'DATA: ', data );
      console.log( 'MSG: ', msg );
    })
  });
});
