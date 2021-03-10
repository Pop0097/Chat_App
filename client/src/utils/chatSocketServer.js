import * as io from 'socket.io-client';
const events = require('events');

class ChatSocketServer {
    socket = null;
    eventEmitter = new events.EventEmitter();
    establishSocketConnection(userId) {
        // Establish connection and send userId so session is associated with userId
        try {
            this.socket = io(`http://localhost:4000`, {
                query: `userId=${userId}`
            });
        } catch (error) {
            alert(`Something went wrong; Can't connect to socket server`);
        }
    }

    getChatList(userId) {
        this.socket.emit('chat-list', {
            userId: userId
        });
        
        this.socket.on('chat-list-response', (data) => {
            this.eventEmitter.emit('chat-list-response', data);
        });
    }
}

export default new ChatSocketServer();