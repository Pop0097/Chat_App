import React, { Component } from 'react';
import {Tabs, Tab} from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

import Login from './login/Login';
import Registration from './registration/Registration';

import './Authentication.css';

class Authentication extends Component {
    state = {
        loadingState: false
    }

    setRenderLoadingState = (loadingState) => {
        this.setState({
            loadingState: loadingState
        });
    }

    render() {
    return (
        <div className="container">            
            <div className="authentication-screen">
                <Tabs variant="pills" defaultActiveKey = "login" >
                <Tab eventKey="login" title="Login">
                    <Login loadingState={this.setRenderLoadingState}/>
                </Tab>
                <Tab eventKey="registration" title="Registration">
                    <Registration loadingState={this.setRenderLoadingState}/>
                </Tab>
                </Tabs>
            </div>
            
            <div className = {`overlay auth-loading ${this.state.loadingState ? '' : 'visibility-hidden'}`}>
                <h1>Loading</h1>
            </div>
        </div>
    );
    }
}

export default withRouter(Authentication);
