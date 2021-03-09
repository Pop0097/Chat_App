/*
    Hashes password 
*/

'use strict';
const bcrypt = require('bcrypt');

class PasswordHash{

	createHash(password) {
		return bcrypt.hashSync(password, 10); // Hashes the password (encrypts it)
	}

	compareHash(password, hash) {
		return bcrypt.compareSync(password, hash); // Compares password and hash sees if they are the same
	}
}

module.exports = new PasswordHash();