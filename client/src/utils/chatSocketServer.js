/*
    Allows us to communicate with our socket.io connecton in the server
*/

import * as io from 'socket.io-client';
const events = require('events');

/*

    The gist of it:

    This class contains methods that are used to communicate with the server side of our websocket (provided by socket-io)

    The first method: establishSocketConnection() is responsible for creating a connection from our client to our socket intance in the server.
    It also passes in a parameter to be stored on our server side. Note that this connection then produces a new 20-character ID that is unique to our
    new connection.

    We communicate with the server instance of our websocket using this.socket.emit("action_name", ...). This sends a command that the server
    is expecting and will act on. We listen for server reponses using this.socket.on("action_name", ...). 

    We also use an EventEmitter() object to call functions (trigger events) on our client side. We do this by using this.eventEmitter("action_name", ...) and passing
    in any relevant data. Then, on the client side, any parts with ChatSocketServer.eventEmitter.on("action_name", ...) will call the functions that are in their parameters.
    Essentially, this allows us to seamlessly trigger multiple events that are really required for real-time applications where the time of actions are unpredictable.
*/

class ChatSocketServer {
    socket = null;
    eventEmitter = new events.EventEmitter();
    
    establishSocketConnection(userId) {
        try {
            // Initializes the client. Since our server is in a different domain, we need to include it.
            // More initialization commands can be found here: https://socket.io/docs/v3/client-initialization/
            this.socket = io(`http://localhost:4000`, {
                query: `userId=${userId}` // The query parameter stores an object on the server-side of the websocket (We access this in socket.js)
            });
        } catch (error) {
            alert(`Something went wrong; Can't connect to socket server`);
        }
    }

    getChatList(userId) {
        // Sends info to the server
        this.socket.emit('chat-list', {
            userId: userId
        });
        
        // When a response comes in with the name  "chat-list-response", we then run  the internal function
        this.socket.on('chat-list-response', (data) => {
            this.eventEmitter.emit('chat-list-response', data); // Our eventEmitter sends data to our caller (which is in ChatList.js)
        });
    }

    logout(userId) {
        this.socket.emit('logout', userId);
        
        this.socket.on('logout-response', (data) => {
            this.eventEmitter.emit('logout-response', data); // Sends data to client
        })
    }

    sendMessage(message) {
        this.socket.emit('add-message', message); // Only one way communication, not waiting for response
    }

}

export default new ChatSocketServer();