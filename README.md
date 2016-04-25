# RingCentral WebRTC Call Us Sample Application

## Prerequisites

* A valid RingCentral account with access to Developer Platform
* Your RingCentral Sandbox account configured
* Node.js, Express.js, Bower installed
* A RingCentral Application defined in the Developer Portal (which has VOIP Calling and Interoperability permissions enabled)

## Setup

1. `git clone https://github.com/bdeanindy/ringcentral-webrtc-callus.git`
2. `npm install`
3. `bower install` 
4. Modify the `.env.tmpl` file (used to load environment variables locally from file) according to the properties named
5. Modify the `QUEUE_NUMBER` property to be a call queue in your RingCentral account (the direct number for the queue/group)
6. Make sure your call queue / group has members added to it

## Operate

1. `npm start` to begin the app
2. Visit `http://localhost:3000` in your browser (Chrome is only supported browser for WebRTC currently)
3. When the button turns green, click it to call your Call Queue/Group number using WebRTC directly from the browser
4. When you are done talking, click the `Hang Up` button
