const path = require('path');
const queryHandler = require('../handlers/query-handler');
const CONSANTS = require('../config/constants');
const { request } = require('http');

class Socket {
    constructor(socket) {
        this.io = socket;
    }

    socketEvents() {
        this.io.on('connection', (socket) => {
            /* Get the user's Chat list	*/
			socket.on('chat-list', async (data) => {
				if (data.userId == '') {
					this.io.emit('chat-list-response', {
						error : true,
						message : CONSTANTS.USER_NOT_FOUND
					});
				} else{
					try {
						const [UserInfoResponse, chatlistResponse] = await Promise.all([
							queryHandler.getUserInfo( {
								userId: data.userId,
								socketId: false
							}),

							queryHandler.getChatList(socket.id)
                        ]);

                        console.log("Here");

						this.io.to(socket.id).emit('chat-list-response', {
							error : false,
							singleUser : false,
							chatList : chatlistResponse
						});

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

        });
    }

    socketConfig() {
        console.log("Configuring Socket");
        
        this.io.use( async (socket, next) => {
            try {
                // Add socketId to the user's database
                await queryHandler.addSocketId({
					userId: socket.request._query['userId'],
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