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

    console.log(userId + " " + socketId);

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

getUserInfo = ({userId, socketId = false}) => {
    let queryProjection = null;
    if (socketId) {
        queryProjection = {
            "socketId": true,
        }
    } else {
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
                $project: queryProjection,
            }]).toArray( (err, result) => {
                if (err) {
                    reject(err);
                }
                
                socketId ? resolve(result[0]['socketId']) : resolve(result);
            })
        } catch (err) {
            reject(err);
        }
    });
}

getChatList = (userId) => {
    return new Promise( async (resolve, reject) => {
        try {
            db.collection('users').aggregate([{
                $match: { // Find all users that match this condition
                    'socketId': {$ne : userId }
                }
            }, {
                $project: {
                    "username" : true,
                    "online" : true,
                    "_id" : false,
                    "id" :'$id',
                }
            }]).toArray( (err, result) => {
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
};