/*
    File contains a class that can be used for configuring express when needed
*/

class ExpressConfig {
    constructor(app) {
        // We are setting .html as our default template extension
        app.set('view engine', 'html');

        // Files to use
        app.use(require('express').static(require('path').join('public')));
    }
}

module.exports = ExpressConfig;