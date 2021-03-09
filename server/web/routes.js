/*
    Creates the routes that will be accessed by the client
*/

const routeHandler = require('../handlers/route-handler');

const express = require('express');
const router = express.Router();

router.post('/register', routeHandler.registerRouteHandler);
router.post('/usernameAvailable', routeHandler.userNameCheckHandler);
router.post('/login', routeHandler.loginRouteHandler);
router.post('/userSessionCheck', routeHandler.userSessionCheckRouteHandler);

module.exports = router;
