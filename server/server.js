/*
    Defines and initializes app's server and starts the application (via starting the server)
*/

'use strict' // Ensures we do not use any undefined variables

const express = require('express'); 
const http = require('http');
const socketio = require('socket.io'); // Required for real-time chat communication
const mongoose = require('mongoose');


const socketEvents = require('./web/socket');
const routes = require('./web/routes');
const appConfig = require('./config/app-config');

class Server {

    constructor() {
        this.app = express(); 
        this.http = http.Server(this.app); // Uses an HTTP server
        this.socket = socketio(this.http); // We communicate with Socketio using our http server
    }

    appConfig() {
        new appConfig(this.app).includeConfig();
    }

    includesRoutes() {
        this.app.use('/', routes);
    
        // new socketEvents(this.app).socketConfig();
    }

    appExecute() {
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

        // Connect to our database
        this.uri = process.env.ATLAS_URI;

        mongoose.connect(this.uri, { useNewUrlParser: true, useCreateIndex: true });

        this.connection = mongoose.connection;

        this.connection.once('open', () => {
            console.log('MongoDB database connection established successfully');
        });
    }
}

const app = new Server(); // Creates new server object
app.appExecute(); // Starts the application

