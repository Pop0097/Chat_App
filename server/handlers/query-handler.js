const CONSTANTS = require('../config/constants');

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

// Creates a new user document with the given data
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

// Checks if the inputted username is unique
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

// Gets a user's document using their unique username 
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

// Makes the user's online status to "online"
makeUserOnline = (userId) => {
    return new Promise( async (resolve, reject) => {
        try {
            db.collection('users').findOneAndUpdate({ _id : ObjectID(userId) }, {  // Gets object_Id type
                "$set": { // Sets values for the parameters
                    'online': 'Y'
                } 
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

// Checks if user is logged in
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

// Adds a socketId to the user's document
addSocketId = ({userId, socketId}) => {
    const data = {
        id : userId,
        value : {
            $set :{
                socketId : socketId,
                online : 'Y',
            }
        }
    };

    // console.log(userId + " " + socketId);

    return new Promise( async (resolve, reject) => {
        try {
            db.collection('users').updateOne( { _id : ObjectID(data.id)} /* Object to find */, data.value /* Values being passed in */, (err, result) => {
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

// Gets the user's information using either their socketId or other identifying information
getUserInfo = ({userId, socketId = false}) => {
    let queryProjection = null;

    if (socketId) { // Socket for the user stores all of their session information, so if we have that we could just look for that
        queryProjection = {
            "socketId": true,
        }
    } else { // If user does not have a socket instance, then we look with these parameters
        queryProjection = {
            "username": true,
            "online": true,
            "_id": true,
            "id": '$_id',
        }
    }

    return new Promise( async (resolve, reject) => {
        try {
            db.collection('users').aggregate([{
                $match: { // Find all users that match this condition
                    _id : ObjectID(userId), 
                }
            }, {
                $project: queryProjection, // Ensure found documents have the specified fields initialized
            }]).toArray((err, result) => { // Convert result into an array
                if (err) {
                    reject(err);
                }
                
                socketId ? resolve(result[0]['socketId']) : resolve(result); // Sends socket ID if defined, else send entire document
            })
        } catch (err) {
            reject(err);
        }
    });
}

// Gets all users who are not the current user
getChatList = (userId) => {
    return new Promise( async (resolve, reject) => {
        try {
            db.collection('users').aggregate([{
                $match: { // Find all users that match this condition
                    '_id': { $ne : ObjectID(userId) }
                }
            }]).toArray((err, result) => {
                if (err) {
                    reject(err);
                }
                resolve(result);
            })
        } catch (err) {
            reject(err);
        }
    });
}

logout = (userId) => {

    const data = {
        $set : {
            'online' : 'N',
        }
    }

    return new Promise (async (resolve, reject) => {
        try {
            db.collection('users').updateOne({ _id : ObjectID(userId) }, data, (err, result) => {
                if (err) {
                    reject(err);
                }

                resolve(result);
            })
        } catch (err) {
            reject(err);
        }
    });
}

getMessages = ({userId, toUserId}) => {
    const data = {
        '$or': [ // Satisfies either condition
            { 
                '$and': [
                    {
                        'toUserId': userId
                    },
                    {
                        'fromUserId': toUserId
                    }
                ]
            },{
                '$and': [ // Satisfies both conditions
                    {
                        'toUserId': toUserId
                    },
                    {
                        'fromUserId': userId
                    }
                ]
            }
        ]
    }

    return new Promise (async (resolve, reject) => {
        try {
            db.collection('messages').find(data).sort({'timestamp':1})
                .toArray((err, result) => {
                    if (err) {
                        reject(err);
                    }
                    resolve(result);
                })
        } catch (err) {
            reject(err);
        }
    });
}

insertMessages = (messagePacket) => {
    return new Promise( async (resolve, reject) => {
        try {
            db.collection('messages').insertOne(messagePacket, (err, result) =>{
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

module.exports = {
    registerUser,
    userNameCheck,
    getUserByUsername,
    makeUserOnline,
    userSessionCheck,
    addSocketId,
    getUserInfo,
    getChatList,
    logout,
    insertMessages,
};