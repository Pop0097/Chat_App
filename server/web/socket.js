const path = require('path');
const queryHandler = require('../handlers/query-handler');
const CONSANTS = require('../config/constants');
const { request } = require('http');

/*

	The gist of it:

	This is the server side of our socket.io websocket implementation. This module is responsible for communication with our client side of the application.

	We have a configuration method which is responsible for storing our socket.io id in the document of the current user. The .use() method allows us to get an 
	instance of the socket.io server-side object, which is rather handy.

	In the socketEvents() method, we have many actions that are triggered based on the client's calls. Using the .on() function, we wait for a command with the same 
	action_name to be sent. Once one is received, we can then perform actions. We can use .emit("Action_name", ...) to send data to the client. We even use extra 
	api associated with the .emit() function to change the amount of webscket instances that are affected by our actions.

	Before doing anything though, we check this.io.on("connection", (socket) => {}), which connects our server to our websocket and returns an pointer to it so we can 
	access it.

*/

class Socket {
    constructor(socket) {
        this.io = socket;
    }

    socketEvents() {
		
		// The .on command creates a connection to the Socket instance and returns a variable that allows us to access its parameters
        this.io.on('connection', (socket) => { // Server side uses "connection" when connecting to the Socket Instance. Client side would use "connect"

			// To check if your socket instance is connected, you can use "socket.connected" and it will return a boolean if it is connected or not

			socket.on('chat-list', async (data) => {
				if (data.userId == '') {
					// socket.emit sends information between the server and the client. Can also work with client->server communication
					// Each parameter is information that is being sent to the client
					// To learn more about emitting events, refer to here: https://socket.io/docs/v3/emit-cheatsheet/
					this.io.emit('chat-list-response', {
						error : true,
						message : CONSTANTS.USER_NOT_FOUND
					});
				} else{
					try {
						// executes multiple promises in sequence
						const [UserInfoResponse, chatlistResponse] = await Promise.all([
							queryHandler.getUserInfo({
								userId: data.userId,
								socketId: false
							}),

							queryHandler.getChatList(data.userId)
                        ]);
						
						// Adding the "to()" command sends it to all clients with socket.id (and the sender too ofc)
						this.io.to(socket.id).emit('chat-list-response', {
							error : false,
							singleUser : false,
							chatList : chatlistResponse
						});

						// the ".broadcast" command sends it to all clients except the sender
						// The first parameter will be the event name
						socket.broadcast.emit('chat-list-response',{
							error : false,
							singleUser : true,
							chatList : UserInfoResponse
						});
					} catch ( error ) {
						this.io.to(socket.id).emit('chat-list-response',{
							error : true ,
							chatList : []
						});
					}
				}
			});

			socket.on('logout', async (data) => {
				try {
					const userId = data.userId;

					await queryHandler.logout(userId);

					// Send confirmation of logout to client
					this.io.to(socket.id).emit(`logout-response`, {
						error : false,
						message: CONSANTS.USER_LOGGED_OUT,
						userId: data.userId
					});

					// Send to everyone that user has logged out
					socket.broadcast.emit(`chat-list-response`, {
						error : false,
						userDisconnected : true,
						userid : userId
					});
				} catch (err) {
					console.log(err);

					this.io.to(socket.id).emit(`logout-response`, {
						error : true,
						message: CONSANTS.SERVER_ERROR_MESSAGE,
						userId: userId
					});
				}
			});

			socket.on('add-message', async (data) => {
				try {
					if (data.message === '') {
						this.io.to(socket.id).emit('add-message-response', {
							error: true,
							message: CONSANTS.MESSAGE_NOT_FOUND,
						});
					} else if (data.fromUserId === '') {
						this.io.to(socket.id).emit(`add-message-response`,{
							error : true,
							message: CONSANTS.SERVER_ERROR_MESSAGE
						}); 	
					} else if (data.toUserId === '') {
						this.io.to(socket.id).emit(`add-message-response`,{
							error : true,
							message: CONSANTS.SELECT_USER
						}); 
					} 

					const [toSocketId, messageResult] = await Promise.all([
						queryHandler.getUserInfo({
							userId: data.toUserId,
							socketId: false
						}),
						queryHandler.insertMessages(data)	
					]);

					this.io.to(socket.id).emit('add-message-response', data);

				} catch (err) {
					this.io.to(socket.id).emit('add-message-response', {
						error: true,
						message: CONSANTS.MESSAGE_STORE_ERROR,
					});
				}
			});
        });
    }

    socketConfig() {
        console.log("Configuring Socket");
        
        this.io.use( async (socket, next) => {
            try {
                // Add socketId to the user's database
                await queryHandler.addSocketId({
					userId: socket.request._query['userId'], // Accesses the parameters that we stored on the server side in chatSocketServer.js
					socketId: socket.id
				});
				next();
            } catch (err) {
                console.log("SocketConfig Error: " + err);
            }
        });
        this.socketEvents();
    }
}

module.exports = Socket;