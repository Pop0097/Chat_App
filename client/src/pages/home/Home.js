import React, { Component } from 'react'
import { withRouter } from 'react-router-dom';

import ChatHttpServer from '../../utils/chatHttpServer';

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
            }

            this.setRenderLoadingState(false);
        } catch (err) {
            this.setRenderLoadingState(false);
            this.props.history.push('/');
        }
    }

    render() {
        return (
            <div className="App">
                {/* <div className = {`${this.state.isOverlayVisible ? 'overlay': 'visibility-hidden' } `}>
                    <h1>Loading</h1>
                </div> */}
                <header className="app-header">
                <nav className="navbar navbar-expand-md">
                    <h4>Hello {this.state.username} </h4>
                </nav>
                </header>

            </div>
        )
    }
}

export default withRouter(Home);
