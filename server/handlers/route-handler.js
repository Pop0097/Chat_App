/*
    Contains all of the controllers and REST APIs that will be ued
*/

const CONSTANTS = require('../config/constants');
const passwordHash = require('../utils/password-hash');

/*** DATABSE CONNECTION STARTS ***/

// Establish a database connection
const MongoClient = require('mongodb').MongoClient;
const dotenv = require('dotenv').config();

// Start client
const mongoClient = new MongoClient(process.env.ATLAS_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
});

let db = null; // variable that will store database instance

// Connect to the database
mongoClient.connect((err, client) => {
    if (err) {
        console.error(err);
    }

    db = client.db(process.env.MONGO_DBNAME);
    console.log("Successfully connected to database");
});

/*** DATABSE CONNECTION ENDS ***/

registerRouteHandler = async (req, res) => {
    // Create a structure with the passed in data
    const data = {
        username: (req.body.username).toLowerCase(),
        password: req.body.password
    };

    try {
        // First check if inputted data is valid. If not, then end process
        if ('' === data.username) {
            res.status(CONSTANTS.SERVER_ERROR_HTTP_CODE).json({
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

            const inserted = db.collection('users').insert(data);

            res.status(CONSTANTS.SERVER_OK_HTTP_CODE).json({
                error: false,
                message: CONSTANTS.USER_REGISTRATION_OK,
                insertedObject: inserted,
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
            const count = await db.collection('users').find({ username : username }).count();
            // console.log(count);
    
            // Returns error if exists
            if (count === 0) {   
                res.status(200).json({
                    error: false,
                    message: CONSTANTS.USERNAME_AVAILABLE_OK
                });
            } else {
                res.status(200).json({
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

module.exports = {
    registerRouteHandler,
    userNameCheckHandler,
}