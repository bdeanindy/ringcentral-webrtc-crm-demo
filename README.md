# RingCentral WebRTC Call Us Sample Application

This demo application provides a complete view (server and client-side code) showing how to use the RingCentral WebRTC feature for voice calls from within the browser, and how to handle your API keys properly (making sure not to expose them server-side).

![Screenshot of demo](/docs/ringcentral-webrtc-crm-demo.png)

## Prerequisites

* A valid RingCentral account with access to Developer Platform
* Your RingCentral Sandbox account configured
* Node.js, Express.js, Bower installed (globally)
* A RingCentral Application defined which has VOIP Calling and Interoperability permissions enabled

## Setup

1. Change to the directory where your Git clones reside
2. `git clone https://github.com/bdeanindy/ringcentral-webrtc-callus.git` then `cd ringcentral-webrtc-callus`
3. `npm install`
4. `bower install` 
5. Modify the `.env.tmpl` file (used to load environment variables locally from file) according to the properties named
6. Modify the `QUEUE_NUMBER` property to be a call queue in your RingCentral account (the direct number for the queue/group)
7. Make sure your call queue / group has members added to it

## Operate

1. `npm start` to begin the app
2. Visit `http://localhost:3000` in your browser (Chrome is only supported browser for WebRTC currently)
3. When the button turns green, click it to call your Call Queue/Group number using WebRTC directly from the browser
4. When you are done talking, click the `Hang Up` button
