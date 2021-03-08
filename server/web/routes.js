/*
    Creates the routes that will be accessed by the client
*/

const routeHandler = require('../handlers/route-handler');

const express = require('express');
const router = express.Router();

router.post('/register', routeHandler.registerRouteHandler);

module.exports = router;
