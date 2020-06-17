const express = require('express');
const router = express.Router();
const controller = require('../controller/thirdPartyControllers');

const { moviesPosterDescriptionController } = controller;

router.get('/movies', moviesPosterDescriptionController);

module.exports = router;