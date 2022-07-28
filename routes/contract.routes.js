const express = require('express');
const router = express.Router();

const contract = require('../services/contract.service');

router.post('/send/funds', contract.sendFunds);

module.exports = router