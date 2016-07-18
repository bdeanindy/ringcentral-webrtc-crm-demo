'use strict';

var socket = io();
var rcAccessToken;
var rcSipProvision;
var webPhone;
var session;
var activeCall;
var QUEUE_NUMBER = '15623215778';
var SOURCE_NUMBER = '16503514622';
var $callButton;
var $activeButton;
var tmpNumberCache;

// RingCentral 3-Legged OAuth
var rcAuthorizationFlow = function rcAuthorizationFlow() {
    // Only do this if we have both items
    if(redirectUri && authorizeUri) {
        var win = window.open(authorizeUri, 'rcAuthWindow', 'width=800, height=600');
        var pollOAuth = window.setInterval(function() {
            try {
                console.log(win.document.URL);
                
                if( win.document.URL.indexOf(redirectUri) != -1 ) {
                    window.clearInterval(pollOAuth);
                    win.close();
                    location.reload()
                }
            } catch(e) {
                console.log(e);
            }
        }, 1000);
    }
};

// Since I'm using Bootstrap which requires jQuery, I'm using jQuery.
// If you aren't using Bootstrap, you don't have to use jQuery
$(function() {
    $.ajax({
        url: '/rc/extensions', 
        success: function(data, state, xhr) {
            console.log('Extensions in the client...');
            console.log(data);
        },
        error: function(xhr, state, err) {
            console.log('Error fetching extensions...');
            console.log(err);
        },
        dataType: 'json'
    });

    var $rcAuthConfigureButton = $('#rcAuthConfigure');
    $rcAuthConfigureButton.on('click', rcAuthorizationFlow);
    // Declare the columns for your repeater
    var columns = [
        {
            label: 'First Name',
            property: 'firstName',
            sortable: true
        },
        {
            label: 'Last Name',
            property: 'lastName',
            sortable: true
        },
        {
            label: 'Phone Number',
            property: 'phone',
            sortable: false
        },
        {
            label: 'Status',
            property: 'status',
            sortable: false
        }
    ];

    // Define the rows for your data
    var items = [];
    var statuses = ['Opportunity', 'Prospect', 'Active', 'Inactive', 'Closed', 'DNC'];
    var firstNames = ['John', 'Joe', 'Sara', 'Ben', 'Dave', 'Amber', 'Chris', 'Ann', 'Jane', 'Sally'];
    var lastNames = ['Smith', 'Johnson', 'Torrocco', 'Krone', 'Jones', 'Dean', 'Terry', 'Farmer', 'Waterman', 'Birch', 'Schmidt', 'Andrews', 'Miller', 'Beard', 'Wang', 'Lee'];


    function getRandomStatus() {
        var min = 0;
        var max = 5;
        var index = Math.floor(Math.random() * (max - min + 1)) + min;
        return statuses[index];
    }

    function getFirstName() {
        return firstNames[Math.floor(Math.random()*firstNames.length)];
    }

    function getLastName() {
        return lastNames[Math.floor(Math.random()*lastNames.length)];
    }

    for(var i = 0; i <= 100; i++) {
        var item = {
            id: i,
            firstName: getFirstName(),
            lastName: getLastName(),
            phone: QUEUE_NUMBER,
            status: getRandomStatus()
        };
        items.push(item);
    }

    function customColumnRenderer(helpers, callback) {
        // Determine which column is being rendered
        var column = helpers.columnAttr;

        // Get the data for this row
        var rowData = helpers.rowData;
        var customMarkup = '';

        // Only override the output for phone column
        // Defaults to phone number display
        switch(column) {
            case 'phone':
                // Let's make our phone button output
                //customMarkup = helpers.item.text();
                customMarkup = '<a class="btn btn-primary btn-success callButton" id="' + rowData.phone + '" disabled="disabled">' + rowData.phone + '</a>';
                break;
            default:
                customMarkup = helpers.item.text();
                break;
        }

        helpers.item.html(customMarkup);

        callback();
    }

    function customRowRenderer(helpers, callback) {
        var item = helpers.item;
        item.attr('id', 'row' + helpers.rowData.id);
        callback();
    }

    // this example uses a static datasource and
    // underscore is used to filter, sort, search, etc.
    function customDataSource(options, callback) {
        var pageIndex = options.pageIndex;
        var pageSize = options.pageSize;

        var data = items;

        // sort by
        data = _.sortBy(data, function(item) {
            return item[options.sortProperty];
        });

        // sort direction
        if (options.sortDirection === 'desc') {
            data = data.reverse();
        }

        // filter
        if (options.filter && options.filter.value !== 'all') {
            data = _.filter(data, function(item) {
                return item.status === options.filter.value;
            });
        }

        // search
        if (options.search && options.search.length > 0) {
            var searchedData = [];
            var searchTerm = options.search.toLowerCase();

            _.each(data, function(item) {
                var values = _.values(item);
                var found = _.find(values, function(val) {

                    if(val.toString().toLowerCase().indexOf(searchTerm) > -1) {
                        searchedData.push(item);
                        return true;
                    }
                });
            });

            data = searchedData;
        }

        var totalItems = data.length;
        var totalPages = Math.ceil(totalItems / pageSize);
        var startIndex = (pageIndex * pageSize) + 1;
        var endIndex = (startIndex + pageSize) - 1;
        if(endIndex > data.length) {
            endIndex = data.length;
        }

        data = data.slice(startIndex-1, endIndex);

        var dataSource = {
            page: pageIndex,
            pages: totalPages,
            count: totalItems,
            start: startIndex,
            end: endIndex,
            columns: columns,
            items: data
        };

        callback(dataSource);
    }

    // Define the data to be displayed in the repeater.
    function staticDataSource(options, callback) {

        // Define the columns for the grid
        var columns = [{
            'label': 'Name', // Column header label.
            'property': 'name', // The JSON property you are binding to.
            'sortable': true // Is the column sortable.
        }, {
            'label': 'Description',
            'property': 'description',
            'sortable': true
        }, {
            'label': 'Status',
            'property': 'status',
            'sortable': true
        }, {
            'label': 'Category',
            'property': 'category',
            'sortable': true
        }];

        // Generate the rows in your dataset.
        // NOTE: The property names of your items should
        // match the column properties defined above.
        function generateDummyData() {
            var items = [];
            var amountOfItems = 100; //Change this number
            var statuses = ['Archived', 'Active', 'Draft'];
            var categories = ['New', 'Old', 'Upcoming'];

            function getRandomStatus() {
                var index = Math.floor(Math.random() * statuses.length);
                return statuses[index];
            }

            function getRandomCategory() {
                var index = Math.floor(Math.random() * categories.length);
                return categories[index];
            }

            for (var i = 1; i <= amountOfItems; i++) {
                var item = {
                    id: i,
                    name: 'Item ' + i,
                    description: 'Desc ' + i,
                    status: getRandomStatus(),
                    category: getRandomCategory()
                }
                items.push(item);
            };

            // Uncomment these to see in your console the
            // JSON payload produced by this function.
            //console.log(JSON.stringify(items));
            //console.table(items);

            return items;
        }

        var items = generateDummyData();

        // These are the visible UI options of the repeater,
        // such as how many items to display per page. They
        // are provided by the Fuel library.
        //console.log(options);

        // Set the values that will be used in your dataSource.
        var pageIndex = options.pageIndex;
        var pageSize = options.pageSize;
        var totalItems = items.length;
        var totalPages = Math.ceil(totalItems / pageSize);
        var startIndex = (pageIndex * pageSize) + 1;
        var endIndex = (startIndex + pageSize) - 1;
        if (endIndex > totalItems) {
            endIndex = totalItems;
        }
        var rows = items.slice(startIndex - 1, endIndex);

        // Define the datasource.
        var dataSource = {
            'page': pageIndex,
            'pages': totalPages,
            'count': totalItems,
            'start': startIndex,
            'end': endIndex,
            'columns': columns,
            'items': rows
        };

        //console.log(dataSource);

        // Pass the datasource back to the repeater.
        callback(dataSource);
    }

    var repeater = $('#myRepeater');
    repeater.repeater({
        list_selectable: false, // (single | multi)
        list_noItemsHTML: 'No items were found, try again',

        // override the column output via a custom renderer.
        // this will allow you to output custom markup for each column.
        list_columnRendered: customColumnRenderer,

        // override the row output via a custom renderer.
        // this example will use this to add an "id" attribute to each row.
        list_rowRendered: customRowRenderer,

        // setup your custom datasource to handle data retrieval;
        // responsible for any paging, sorting, filtering, searching logic
        dataSource: customDataSource
    });
    repeater.repeater('render');

    repeater.on('rendered.fu.repeater', function(){
    });
    

    socket.connect();
    socket.emit('sipProvision');

    // Cache some DOM elements
    $callButton = $('.callButton');

    $callButton.on('click', function(item) {
        var phoneNumberToCall = item.target.id;
        tmpNumberCache = phoneNumberToCall;
        if(!activeCall) {
            $activeButton = $('#' + item.target.id);
            $activeButton.html('Dialing...');
            placeCall(phoneNumberToCall);
        } else {
            session.terminate();
        }

    });
    socket.on('rcAuth', function(data) {
        //console.log('New RC Auth Token: ', data);
        rcAccessToken = data.token;
    });

    socket.on('sipProvisionResponse', function(data) {
        //console.log('New RC WebRTC Sip Provision: ', data);
        rcSipProvision = data.sipInfo[0] || data.sipInfo;;
        //console.log('RingCentral: ', RingCentral);
        webPhone = new RingCentral.WebPhone(data, {
            logLevel:1,
            audioHelper: {
                enabled: true, // enables audio feedback when phone is ringing or making call
                incoming: '/audio/incoming.ogg', // path to audio file for incoming call
                outgoing: '/audio/outgoing.ogg' // path to audio file for outgoing call
            }
        });
        $callButton.removeAttr('disabled');

        webPhone.userAgent.on('invite', onInvite);
        webPhone.userAgent.on('connecting', onConnecting);
        webPhone.userAgent.on('connected', onConnected);
        webPhone.userAgent.on('disconnected', onDisconnected);
        webPhone.userAgent.on('registered', onRegistered);
        webPhone.userAgent.on('unregistered', onUnregistered);
        webPhone.userAgent.on('registrationFailed', onRegistrationFailed);
        webPhone.userAgent.on('message', onMessage);
    });

    /**************** RING CENTRAL WEB PHONE INTERFACING AND UI METHODS *********************/
    function onAccepted(session) {
        //console.log('Call: Accepted', session.request);
        //console.log('To: ', session.request.to.displayNmae, session.request.to.friendlyName);
        //console.log('From: ', session.request.from.displayName, session.request.from.friendlyName);

        session.on('accepted', function() {
            console.log('Accepted');
            activeCall = true;
            $activeButton.addClass('btn-danger');
            $activeButton.removeClass('btn-success');
            $activeButton.text('Hang Up');
        });

        session.on('cancelled', function() {
            console.log('Cancelled');
        });

        session.on('rejected', function() {
            console.log('Rejected');
        });

        session.on('replaced', function(newSession) {
            console.log('Replaced: old session ', session, ' has been replaced with: ', newSession);
            onAccepted(newSession);
        });

        session.on('terminated', function() {
            console.log('Terminated');
            activeCall = false;
            $activeButton.removeClass('btn-danger');
            $activeButton.addClass('btn-success');
            $activeButton.text(tmpNumberCache);
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

    function placeCall(destinationNumber) {
        session = webPhone.userAgent.invite(destinationNumber, {
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
});
