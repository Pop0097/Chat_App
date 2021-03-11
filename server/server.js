/*
    Defines and initializes app's server and starts the application (via starting the server)
*/

'use strict' // Ensures we do not use any undefined variables

const express = require('express'); 
const http = require('http');
const socketio = require('socket.io'); // Required for real-time chat communication

const socketEvents = require('./web/socket');
const routes = require('./web/routes');
const appConfig = require('./config/app-config');
const { throws } = require('assert');

class Server {

    constructor() {
        this.app = express(); 
        this.http = http.Server(this.app); // Uses an HTTP server
        this.socket = socketio(this.http); // Initializes a socketio instance
        this.message = "Hello";

        // Include our app config and routes
        this.appConfig();
        this.includesRoutes();

        // Define our ports and host
        const port = process.env.PORT || 5000;
        const host = process.env.HOST || 'localhost';

        // See if we can connect to our server, and if successful, log it in the console
        this.http.listen(port, host, () => {
            console.log(`listening on http://${host}:${port}`);
        });
    }

    appConfig() {
        new appConfig(this.app).includeConfig();
    }

    includesRoutes() {
        this.app.use('/', routes);
        new socketEvents(this.socket).socketConfig(); // Initializes our Socket class so we can access socketio functionality
    }
}

const app = new Server();

module.exports = app; // Creates new server object

