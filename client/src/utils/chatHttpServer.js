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

    // Removes all items in our browser session storage
    removeLS() {
        return new Promise((resolve, reject) => {
            try {
                localStorage.removeItem('userId');
                localStorage.removeItem('username');
                resolve(true);
            } catch (err) {
                reject(err);
            }
        })
    }

    login(userCredential) {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await axios.post('http://localhost:4000/login', userCredential);
                resolve(res.data);
            } catch (err) {
                reject(err);
            }
        });
    }

    getUserId() {
        return new Promise((resolve, reject) => {
            try {
                resolve(localStorage.getItem('userid'));
            } catch (error) {
                reject(error);
            }
        });
    }

    userSessionCheck(userId) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.post('http://localhost:4000/userSessionCheck', {
                    userId: userId
                });
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        });
    }

    getMessages(userId, toUserId) {
        return new Promise(async (resolve, reject) => {
            try {
                const response = await axios.get('http://localhost:4000/getMessages', {
                    userId: userId,
                    toUserId: toUserId
                });
                resolve(response.data);
            } catch (error) {
                reject(error);
            }
        });
    }
}

export default new ChatHttpServer();