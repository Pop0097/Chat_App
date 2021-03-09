import React, { Component } from 'react'
import { Form, Button } from 'react-bootstrap';
import { withRouter } from 'react-router-dom';

import ChatHttpServer from '../../../utils/chatHttpServer';
import './Login.css';

class Login extends Component {

    constructor(props) {
        super(props);

        this.state = {
            username: '',
            password: ''
        };
    }

    handleLogin = async (event) => {
        event.preventDefault();

        this.props.loadingState(true);

        try {
            const res = await ChatHttpServer.login(this.state);
            this.props.loadingState(false);

            if (res.error) {
                alert('Invalid login credentials');
            } else {
                ChatHttpServer.setLS('userid', res.userId);
                this.props.history.push('/home');
            }
        } catch (err) {
            this.props.loadingState(false);
            alert('Invalid login credentials');
        }
    }

    handleInputChange = (event) => {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    render() {
        return (
            <div>
                <Form className="auth-form">
                    <Form.Group controlId="loginUsername">
                        <Form.Control
                            type="text"
                            name = "username"
                            placeholder = "Enter username"
                            onChange = {
                                this.handleInputChange
                            }
                        />
                    </Form.Group>

                    <Form.Group>
                        <Form.Control 
                            type = "password"
                            name = "password"
                            placeholder = "Password"
                            onChange = {
                                this.handleInputChange
                            }
                        />
                    </Form.Group>

                    <Button variant="primary" type="submit" onClick={this.handleLogin}>
                        Login
                    </Button>
                </Form>
            </div>
        )
    }
}

export default withRouter(Login);
