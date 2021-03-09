import React, { Component } from 'react';
import { Alert, Form, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';
import { DebounceInput } from 'react-debounce-input';

import ChatHttpServer from '../../../utils/chatHttpServer';
import './Registration.css';

class Registration extends Component {

    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: '',
            usernameAvailable: true,
        };
    }

    handleRegistration = async (event) => {
        event.preventDefault();

        if (!this.state.usernameAvailable) {
            alert('Unable to reister. Your username is not unique.');
            return;
        }

        this.props.loadingState(true);
        const response = await ChatHttpServer.register({
            username: this.state.username,
            password: this.state.password,
        });
        this.props.loadingState(false);

        console.log(response);
        
        if (response.error) {
            alert('Unable to reister. Please try again after some time.');
        } else {
            this.state = {
                username: '',
                password: '',
                usernameAvailable: true,
            };

            ChatHttpServer.setLS('userid', response.userId);
            this.props.history.push('/home');
        }
    }

    checkUsernameAvailability = async (event) => {

        console.log(event.target.value + " " + this.state.usernameAvailable);

        if ('' !== event.target.value && undefined !== event.target.value) {
            this.setState({
                username: event.target.value
            });

            this.props.loadingState(true);
            const res = await ChatHttpServer.checkUsernameAvailability(this.state.username);
            this.props.loadingState(false);

            if (res.error) {
                this.setState({
                    usernameAvailable: false,
                });
            } else {
                this.setState({
                    usernameAvailable: true,
                });
            }
        } else if ('' === event.target.value) {
            this.setState({
                usernameAvailable: true,
            });
        }

        console.log(this.state.usernameAvailable);
    }

    handleInputChange = (event) => {
        console.log(event.target.name);
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    render() {
        return (
            <div>
                <Form className="auth-form">
                    <Form.Group controlId="formUsername">
                        <DebounceInput
                            className="form-control"
                            placeholder = "Enter username"
                            minLength={2}
                            debounceTimeout={300}
                            onChange={this.checkUsernameAvailability} 
                        />

                        <Alert className={{
                            'username-availability-warning' : true,
                            'visibility-hidden': this.state.usernameAvailable
                        }}  variant="danger">
                            <strong>{this.state.username}</strong> is already taken, try another username.
                        </Alert>
                    </Form.Group>

                    <Form.Group controlId="formPassword">
                        <Form.Control 
                            type = "password"
                            name = "password"
                            placeholder = "Password"
                            onChange = {this.handleInputChange}
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" onClick={this.handleRegistration}>
                        Register
                    </Button>
                </Form>
            </div>
        )
    }
}

export default withRouter(Registration);
