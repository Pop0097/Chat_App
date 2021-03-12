import React, { Component, createRef } from 'react'

import ChatHttpServer from '../../../utils/chatHttpServer';
import ChatSocketServer from '../../../utils/chatSocketServer';

import './Conversation.css';

export default class Conversation extends Component {

    constructor(props) {
        super(props);

        this.state = {
            messageLoading: true,
            conversations: [],
            selectedUser: null,
        };

        this.messageContainer = createRef();
    }

    // Update our state with the data of the selected user
    static getDerivedStateFomProps(props, state) {
        if (state.selectedUser === null || state.selectedUser.id !== props.newSelectedUser.id) {
            return {
                selectedUser: props.newSelectedUser,
            };
        } 
        return null;
    }

    // Calls this every time this component is updated
    componentDidUpdate(prevProps) {
        // Have we selected a user different to that which is displayed in the current Conversation component?
        // This runs after our component's state has updated (or when we have picked a new user in our chat list)
        if (prevProps.newSelectedUser === null || (this.props.newSelectedUser.id !== prevProps.newSelectedUser.id)) {
            this.getMessages();
        }      
    }

    getMessages = async () => {
        try {
            const { userId, newSelectedUser } = this.props;
            const messageResponse = await ChatHttpServer.getMessages(userId, newSelectedUser.id);

            if (!messageResponse.error) {
                this.setState({
                    conversations: messageResponse.messages,
                });
            } else {
                alert('Unable to get messages');
            }

            this.setState({
                messageLoading: false,
            });
        } catch (err) {
            this.setState({
                messageLoading: false,
            });
        }
    }

    // Aligns messages based on userId
    alignMessages(toUserId) {
        const { userId } = this.props;
        return userId !== toUserId;
    }
    
    // Return a JSX component that returns all messages
    getMessageUI () {
        return (
            <ul ref={this.messageContainer} className="message-thread">
            {
                this.state.conversations.map( (conversation, index) => 
                    <li className={`${this.alignMessages(conversation.toUserId) ? 'align-right' : ''}`} key={index}> {conversation.message} </li>
                )
            }
            </ul>
        )
    }
    
    // Placeholder JSX UI when conversation has no messages
    getInitiateConversationUI() {
        if (this.props.newSelectedUser !== null) {
            return (
                <div className="message-thread start-chatting-banner">
                    <p className="heading">
                        You haven't chatted with {this.props.newSelectedUser.username} in a while,
                        <span className="sub-heading"> Say Hi.</span>
                    </p>			
                </div>
            )
        }    
    }

    sendMessage = (event) => {
        if (event.key === 'Enter') {
            const message = event.target.value;
            const { userId, newSelectedUser } = this.props;

            // First validates the message 
            if (message === '' || message === undefined || message === null) {
                alert("Message can't be empty.");
            } else if (userId === '') {
                this.router.navigate(['/']);
            } else if (newSelectedUser === undefined) {
                alert('Select a user to chat.');
            } else { // If all checks pass, we will call function to send the message!
                console.log(newSelectedUser._id);
                this.sendAndUpdateMessages({
                    fromUserId: userId,
                    message: (message).trim(),
                    toUserId: newSelectedUser._id,
                });

                event.target.value = '';
            }
        }
    }
    
    sendAndUpdateMessages(message) {
        try {
            console.log(message);
            // Send message through websocket
            ChatSocketServer.sendMessage(message);
            console.log("Here");
            // Updagte messages by tacking our new message onto the end of the array
            this.setState({
                conversations : [...this.state.conversations, message]
            });
            console.log(this.state.conversations);

            // Scrolls message container so we are at the bottom of our messages list constantly
            this.scrollMessageContainer();
        } catch (error) {
            alert("Can't send your message");
        }
    }
    
    scrollMessageContainer() {
        if (this.messageContainer.current !== null) {
            try {
                setTimeout(() => {
                    this.messageContainer.current.scrollTop = this.messageContainer.current.scrollHeight;
                }, 100);
            } catch (error) {
                console.log(error);
            }
        }
    }
    
    

    render() {
        const { messageLoading, selectedUser } = this.state;

        return (
            <>
                <div className={`message-overlay ${!messageLoading ? 'visibility-hidden' : ''}`}>
                    <h3> {selectedUser !== null && selectedUser.username ? 'Loading Messages' : ' Select a User to chat.' }</h3>
                </div>

                <div className={`message-wrapper ${messageLoading ? 'visibility-hidden' : ''}`}>
                    <div className="message-container">
                        <div className="opposite-user">
                            Chatting with {this.props.newSelectedUser !== null ? this.props.newSelectedUser.username : '----'}
                        </div>

                        {this.state.conversations.length > 0 ? this.getMessageUI() : this.getInitiateConversationUI()}
                    </div>

                    <div className="message-typer">
                        <form>
                            <textarea className="message form-control" placeholder="Type and hit Enter" onKeyPress={this.sendMessage}>
                            </textarea>
                        </form>
                    </div>
                </div>
            </>
        )
    }
}
