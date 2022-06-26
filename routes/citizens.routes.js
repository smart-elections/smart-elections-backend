const express = require('express');
const router = express.Router();

const citizens = require('../services/citizens.service');

router.get('/', citizens.getCitizens);

module.exports = router;