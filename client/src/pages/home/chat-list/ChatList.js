import React, { Component } from 'react'

import ChatSocketServer from '../../../utils/chatSocketServer';
import './ChatList.css';

export default class ChatList extends Component {

    constructor(props) {
        super(props);

        this.state = {
            loading: true,
            selectedUserUsername: null,
            chatListUsers: [],
        };

        this.createChatListUsers = this.createChatListUsers.bind(this);
    }

    componentDidMount() {
        const userId = this.props.userId;
        ChatSocketServer.getChatList(userId); // Update the list of the user 
        ChatSocketServer.eventEmitter.on('chat-list-response', this.createChatListUsers); // When chat-list-response is triggered, we run createChatListUsers
    }

    componentWillUnmount() {
        ChatSocketServer.eventEmitter.removeListener('chat-list-response', this.createChatListUsers);
    }
    
    createChatListUsers = (chatListResponse) => {    
        console.log(chatListResponse);

        if (!chatListResponse.error) { // Success
            let chatListUsers = this.state.chatListUsers; // Lists all users

            if (chatListResponse.singleUser) { // If a user logs in
                // console.log("single user" + " " + chatListUsers.length);

                // Prevents the websocket from pasting the current user many times
                if (chatListResponse.chatList[0].id === this.props.userId) {
                    console.log("Current user");
                    return;
                }

                let found = false;
                
                // If logged in user already present, just change their status
                for (var i = 0; i < chatListUsers.length && !found; i++) { 
                    console.log(this.state.chatListUsers[i].username + " " + chatListResponse.chatList[0].username);
                    if (chatListUsers[i].username === chatListResponse.chatList[0].username) {
                        found = true;
                        chatListUsers[i].online = chatListResponse.chatList[0].online;
                    }
                }
                
                // If logged in user isn't present, append them to the array
                if (!found) {
                    // console.log("Adding new user");
                    chatListUsers = [...chatListUsers, ...chatListResponse.chatList];
                }
            } else if (chatListResponse.userDisconnected) { // If a user has logged out

                // console.log("Disconnected");

                let found = false;
                
                // Sees if removed user is already present in list. If they are, don't add a new one
                for (var i = 0; i < chatListUsers.length && !found; i++) {
                    if (chatListUsers[i]._id === chatListResponse.userid) {
                        found = true;
                        chatListUsers[i].online = 'N';
                    }
                }

            } else {
                // console.log("General");

                /* Updating entire chat list if user logs in. */
                chatListUsers = chatListResponse.chatList;
            }

            this.setState({
                chatListUsers: chatListUsers // Updates list of users
            });
        } else {  // Error
            alert('Unable to load Chat list, Redirecting to Login.');
        }
        
        this.setState({
            loading: false,
        });
    }

    selectedUser = (user) => {
        this.setState({
            selectedUserUsername: user.username
        });

        this.props.updateSelectedUser(user); // Send data to home.js
    }

    render() {
        return (
            <>
                <ul className={`user-list ${this.state.chatListUsers.length === 0 ? 'visibility-hidden' : ''}`} >
                    {
                        this.state.chatListUsers.map((user, index) => 
                            <li 
                            key={index} 
                            className={this.state.selectedUserUsername === user.username ? 'active' : ''}
                            onClick={() => this.selectedUser(user)}
                            >
                                {user.username}
                                <span className={user.online === 'Y' ? 'online' : 'offline'}></span>
                            </li>
                        )
                    }
                </ul>
                <div className={`alert 
                    ${this.state.loading ? 'alert-info' : ''} 
                    ${this.state.chatListUsers.length > 0 ? 'visibility-hidden' : ''}`
                }>
                    { this.state.loading|| this.state.chatListUsers.length.length === 0 ? 'Loading your chat list.' : 'No User Available to chat.'}
                </div>
            </>
        )
    }
}
