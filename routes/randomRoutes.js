const express = require('express');
const router = express.Router();
const controller = require('../controller/thirdPartyControllers');

const { randomUsersDataController } = controller;

router.get('/random', randomUsersDataController);

module.exports = router;