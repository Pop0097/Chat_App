// // Establish a database connection
// const MongoClient = require('mongodb').MongoClient;
// const dotenv = require('dotenv').config();

// // Start client
// const mongoClient = new MongoClient(process.env.ATLAS_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
// });

// let dbInstance = null; // variable that will store database instance

// // Connect to the database
// mongoClient.connect((err, client) => {
//     if (err) {
//         console.error(err);
//     }

//     dbInstance = client.db(process.env.MONGO_DBNAME);
//     console.log("Successfully connected to database");
// });


