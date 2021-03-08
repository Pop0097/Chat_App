/*
    This file contains all of the application related configurations

    This includes all of the dependencies we want to include 
*/

const expressconfig = require('./express-config');
const bodyParser = require('body-parser');
const cors = require('cors');
const dotenv = require('dotenv');

class AppConfig {
    
    constructor(app) {
        dotenv.config();
        this.app = app;
    }

    includeConfig() {
        // This is our use statements that include our imported dependencies in our application
        this.app.use(bodyParser.json());
        this.app.use(cors());

        new expressconfig(this.app); // Config express
    }
}

module.exports = AppConfig;