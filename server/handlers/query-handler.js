const dataBase = require('../config/db');
const CONSTANTS = require('../config/constants');

const DefinedSchemas = require('../config/models');
const User = DefinedSchemas.userModel;

registerUser = async (data) => {

    try {
        const username = data.username;
        const password = data.password; 

        const newUser = new User({username, password});

        if (!newUser) {
            return {
                error: true,
                message: 'Could not create movie'
            };
        }

        await dataBase.client.connect();
        console.log("Connected to server");

        const db = dataBase.client.db(dataBase.dbName);

        console.log("Inserting Data");

        db.collection('users').insertOne(newUser);
    } catch (err) {
        return {
            error : true,
            message : CONSTANTS.SERVER_ERROR_MESSAGE,
            errorMessage: err
        };
    }
}

checkInstanceNumber = async (data) => {
    try {
        await dataBase.client.connect();

        console.log("Connected to server");

        const db = dataBase.client.db(dataBase.dbName);

        console.log("Fetching Data");

        db.collection('users').find(data).count((err, result) => {
            if (err) {
                console.log("Fetching broke");
            }
            console.log("Got data: " + result);
            return result;
        });

    } catch (err) {
        return {
            error : true,
            message : CONSTANTS.SERVER_ERROR_MESSAGE,
            errorMessage: err
        };
    }
}

module.exports = {
    registerUser,
    checkInstanceNumber,
}