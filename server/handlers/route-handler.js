/*
    Contains all of the controllers and REST APIs that will be ued
*/

const CONSTANTS = require('../config/constants');
const passwordHash = require('../utils/password-hash');

const queryHandler = require('./query-handler');

/*
    We create async functions since we will need to use try catch statements and sometimes
    wait for the database to respond
*/
registerRouteHandler = async (req, res) => {
    // Create a structure with the passed in data
    const data = {
        username: (req.body.username).toLowerCase(),
        password: req.body.password
    };

    try {
        // First check if inputted data is valid. If not, then end process
        if ('' === data.username) {
            return res.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
                error: true,
                message: CONSTANTS.USERNAME_NOT_FOUND
            });
        } else if ('' === data.password) {
            res.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
                error: true,
                message: CONSTANTS.PASSWORD_NOT_FOUND
            });
        } else {
            // If inputs are valid, try to see if we can create a user. Else give error code. 
            data.online = 'Y';
            data.socketId = '';
            data.name = '';
            data.email = '';
            data.birthday = new Date();

            data.password = passwordHash.createHash(data.password);

            const result = await queryHandler.registerUser(data); // Insert user in our collection

            // console.log(result);
            // console.log(result._id);
            // console.log(result.ops[0]._id);

            res.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
                error: false,
                userId: result.ops[0]._id,
                message: CONSTANTS.USER_REGISTRATION_OK,
            });
        }
    } catch (err) {
        res.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
            error: true,
            message: CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE,
            errorMessage: err,
        });
    }
}

userNameCheckHandler = async (req, res) => {
    const username = (req.body.username).toLowerCase(); // Gets usernmae

    try {
        if ('' === username) { // Makes sure there is actually an input
            res.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
                error: true,
                message: CONSTANTS.USERNAME_NOT_FOUND
            });
        } else {
            // Use await clause so we only continue on if this process has completed
            const count = await queryHandler.userNameCheck({ username : username });
            
            // console.log(count); // Debugging
    
            // Returns error if exists
            if (count == 0) {   
                res.json({
                    error: false,
                    message: CONSTANTS.USERNAME_AVAILABLE_OK
                });
            } else {
                res.json({
                    error: true,
                    message: CONSTANTS.USERNAME_AVAILABLE_FAILED
                });
            }
        }
    } catch (err) {
        res.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
            error: true,
            message: CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE,
            errorMessage: err,
        });
    }
}

loginRouteHandler = async (req, res) => {
    const data = {
        username: (req.body.username).toLowerCase(),
        password: req.body.password
    };

    try {
        // First check if inputted data is valid. If not, then end process
        if ('' === data.username || null === data.username) {
            return res.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
                error: true,
                message: CONSTANTS.USERNAME_NOT_FOUND
            });
        } else if ('' === data.password || null == data.password) {
            res.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
                error: true,
                message: CONSTANTS.PASSWORD_NOT_FOUND
            });
        } else {
            const result = await queryHandler.getUserByUsername(data.username);

            if (null === result || undefined === result) {
                res.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
                    error: true,
                    message: CONSTANTS.USER_LOGIN_FAILED,
                });
            } else {

                if (passwordHash.compareHash(data.password, result.password)) {
                    console.log("Changing User state");

                    await queryHandler.makeUserOnline(result._id);

                    res.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
                        error : false,
                        userId : result._id,
                        message : CONSTANTS.USER_LOGIN_OK
                    });

                } else {
                    console.log("Not found");
                    res.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
                        error : true,
                        message : CONSTANTS.USER_LOGIN_FAILED
                    });
                }
            }
        }
    } catch (err) {
        console.log("Oopsies");
        res.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
            error: true,
            message: CONSTANTS.SERVER_ERROR_MESSAGE,
            errorMessage: err,
        });
    }
}

userSessionCheckRouteHandler = async (req, res) => {
    let userId = req.body.userId;

    try {
        if ('' === userId) {
            res.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
                error : true,
                message : CONSTANTS.USERID_NOT_FOUND
            });
        } else {
            const result = await queryHandler.userSessionCheck({ userId : userId});

            // console.log(result.username);

            res.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
                error : false,
                username : result.username,
                message : CONSTANTS.USER_LOGIN_OK
            });
        }
    } catch (err) {
        res.status(CONSTANTS.SERVER_NOT_ALLOWED_HTTP_CODE).json({
            error : true,
            message : CONSTANTS.SERVER_ERROR_MESSAGE,
            errorMessage: err,
        });
    }
    
}

module.exports = {
    registerRouteHandler,
    userNameCheckHandler,
    loginRouteHandler,
    userSessionCheckRouteHandler,
}