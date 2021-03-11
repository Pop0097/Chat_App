import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';

import ChatHttpServer from '../../utils/chatHttpServer';
import ChatSocketServer from '../../utils/chatSocketServer';

import ChatList from './chat-list/ChatList';

import './Home.css';

class Home extends Component {
    userId = null;
    state = {
        username: '____',
        name: '____',
        selectedUser: null,
        isOverlayVisible: true,
    };

    setRenderLoadingState = (loadingState) => {
        this.setState({
            isOverlayVisible: loadingState
        });
    }

    async componentDidMount() {
        try {
            this.setRenderLoadingState(true);

            this.userId = await ChatHttpServer.getUserId();
            
            // alert(this.userId); // Debugging

            const response = await ChatHttpServer.userSessionCheck(this.userId);
            
            if (response.error) { // If no user logged in
                this.props.history.push('/');
            } else { // If user logged in
                this.setState({
                    username: response.username,
                    name: response.name,
                });

                await ChatHttpServer.setLS('username', response.username);
                await ChatSocketServer.establishSocketConnection(this.userId);
            }

            this.setRenderLoadingState(false);
        } catch (err) {
            this.setRenderLoadingState(false);
            this.props.history.push('/');
        }
    }

    // Sets the user that is selected in our ChatList 
    updateSelectedUser = (user) => {
        // console.log(user.username);
        this.setState({
            selectedUser : user,
        });
    }

    getChatListComponent() {
        return this.state.isOverlayVisible ? null : <ChatList userId={this.userId} updateSelectedUser={this.updateSelectedUser}/>
    }

    logout = async () => {
        try {
            await ChatHttpServer.removeLS();
            // alert(this.userId);
            ChatSocketServer.logout({ userId: this.userId });
            ChatSocketServer.eventEmitter.on('logout-response', (loggedOut) => {
                // console.log("Here");
                this.props.history.push('/');
            });
        } catch (err) {
            console.log(err);
            alert('Error logging out.');
            throw err;
        }
    }

    render() {
        return (
            <div className="App">
                <div className = {`${this.state.isOverlayVisible ? 'overlay': 'visibility-hidden' } `}>
                    <h1>Loading</h1>
                </div>

                <header className="app-header">
                    <nav className="navbar navbar-expand-md">
                        <h4>Hello {this.state.username} </h4>
                    </nav>

                    <ul className="nav justify-content-end">
                        <li className="nav-item">
                            <a className="nav-link" href="#" onClick={this.logout}>Logout</a>
                        </li>
                    </ul>
                </header>

                <main role="main" className="container content" >
                    <div className="row chat-content">
                        <div className="col-3 chat-list-container">
                            {this.getChatListComponent()}
                        </div>
                        <div className="col-8 message-container">
                        </div>
                    </div>
                </main>
            </div>
        )
    }
}

export default withRouter(Home);
