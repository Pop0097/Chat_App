/*
    Contains all of the controllers and REST APIs that will be ued
*/

const CONSTANTS = require('../config/constants');
const passwordHash = require('../utils/password-hash');
const helper = require('./query-handler');

const DefinedSchemas = require('../config/schema');
const User = DefinedSchemas.userModel;

registerRouteHandler = (req, res) => {
    // Create a structure with the passed in data
    const data = {
        username: (req.body.username).toLowerCase(),
        password: req.body.password
    };

    // First check if inputted data is valid. If not, then end process
    if ('' === data.username) {
        res.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
            error: true,
            message: CONSTANTS.USERNAME_NOT_FOUND
        });
    } else if ('' === data.password) {
        if ('' === data.username) {
            res.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
                error: true,
                message: CONSTANTS.PASSWORD_NOT_FOUND
            });
        }
    } else {
        // If inputs are valid, try to see if we can create a user. Else give error code. 
        data.online = 'Y';
        data.socketId = '';

        data.password = passwordHash.createHash(data.password);

        const username = data.username;
        const password = data.password; 

        const newUser = new User({username, password});

        if (!newUser) {
            return res.status(400).json({
                error: true,
                message: 'Could not create movie'
            });
        }

        // Saves new user to the database
        newUser.save()
            .then(() => {
                res.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
                    error: false,
                    message: CONSTANTS.USER_REGISTRATION_OK
                });
            })
            .catch((err) => {
                res.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
                    error : true,
                    message : CONSTANTS.SERVER_ERROR_MESSAGE,
                    errorMessage: err
                });
            });

    }
}

module.exports = {
    registerRouteHandler,
}