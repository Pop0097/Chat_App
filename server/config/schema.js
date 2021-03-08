/* 
    Creates schemas for the documents in the MongoDB database
*/

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const User = new Schema (
    {
        username: {
            type: String, 
            required: true,
            trim: true,
        },
        password: {
            type: String, 
            required: true,
            trim: true,
        }
    },
    { timestamp: true }
);

const userModel = mongoose.model('users', User);

module.exports = {
    userModel,
};