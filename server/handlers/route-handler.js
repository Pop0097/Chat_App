/*
    Contains all of the controllers and REST APIs that will be ued
*/

const CONSTANTS = require('../config/constants');
const passwordHash = require('../utils/password-hash');

/*** DATABSE CONNECTION STARTS ***/

// Establish a database connection
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID;
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

/*** HELPERS BEGIN ***/

// Some processes require promises to ensure that they go through properly
// Such processes are defined here

registerUser = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            db.collection('users').insertOne(data, (err, result) =>{
                if( err ){
                    reject(err);
                }
                resolve(result);
            });
        } catch (error) {
            reject(error)
        }	
    });
}

userNameCheck = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            db.collection('users').find(data).count( (error, result) => {
                if( error ){
                    reject(error);
                }
                resolve(result);
            });
        } catch (error) {
            reject(error)
        }
    });
}

getUserByUsername = (username) => {
    return new Promise( async (resolve, reject) => {
        try {
            db.collection('users').find({ username :  username })
                .toArray( (error, result) => { // Converts found items to an array of objects
                    if( error ){
                        reject(error);
                    }
                    resolve(result[0]); // Only returns first occurence
                });
        } catch (error) {
            reject(error)
        }	
    });
}

makeUserOnline = (userId) => {
    return new Promise( async (resolve, reject) => {
        try {
            db.collection('users').findAndModify({ _id : ObjectID(userId) },[], {  // Gets object_Id type
                "$set": { // Sets values for the parameters
                    'online': 'Y'
                } 
            },{ 
                new: true, 
                upsert: true // If set to true, creates a new document when no document matches the query criteria. 
            }, (err, result) => { // Error catching
                if( err ){
                    reject(err);
                }
                resolve(result.value);
            });
        } catch (error) {
            reject(error)
        }	
    });
}

userSessionCheck = (data) => {
    return new Promise( async (resolve, reject) => {
        try {
            // Finds user with same Id that is online
            db.collection('users').findOne( { _id : ObjectID(data.userId), online : 'Y'}, (err, result) => {
                if( err ){
                    reject(err);
                }
                resolve(result);
            });	
        } catch (error) {
            reject(error)
        }
    });
}

/*** HELPERS END ***/

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

            const result = await registerUser(data); // Insert user in our collection

            console.log(result);
            console.log(result._id);
            console.log(result.ops[0]._id);

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
            const count = await userNameCheck({ username : username });
            
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
            const result = await getUserByUsername(data.username);

            if (null === result || undefined === result) {
                res.status(CONSTANTS.SERVER_NOT_FOUND_HTTP_CODE).json({
                    error: true,
                    message: CONSTANTS.USER_LOGIN_FAILED,
                });
            } else {

                if (passwordHash.compareHash(data.password, result.password)) {
                    console.log("Changing User state");

                    await makeUserOnline(result._id);

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
            const result = await userSessionCheck({ userId : userId});

            console.log(result.username);

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