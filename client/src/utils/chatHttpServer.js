/*
    This file contains API that creates promises to talk to our database
*/

import * as axios from 'axios';

class ChatHttpServer {

    register(userCredential) {
        // Create a new promise
        return new Promise(async (resolve, reject) => {
            try {
                const res = await axios.post('http://localhost:4000/register', userCredential);
                resolve(res.data); // resolve promise if successful
            } catch (err) {
                reject(err); // reject promise if unsuccessful
            }
        });
    }

    checkUsernameAvailability(username) {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await axios.post('http://localhost:4000/usernameAvailable', {
                    username: username
                });
                resolve(res.data);
            } catch (err) {
                reject(err);
            }
        });
    }

    // Stores item in browser session storage
    setLS(key, value) {
        return new Promise((resolve, reject) => {
            try {
                localStorage.setItem(key, value);
                resolve(true);
            } catch (err) {
                reject(err);
            }
        });
    }
}

export default new ChatHttpServer();