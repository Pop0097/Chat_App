// /*
//     Files handles queries with the database
// */

// const DefinedSchemas = require('../config/schema');
// const User = DefinedSchemas.userModel;

// registerUser = (data) => {
//     const username = data.username;
//     const pwd = data.password; 

//     const newUser = new User(username, pwd);

//     if (!newUser) {
//         reject(err);
//     }

//     // Saves new user to the database
//     newUser.save()
//         .then(() => resolve(result))
//         .catch(() => console.log("Failed to add user"));
// }

// module.exports = {
//     registerUser,
// }

