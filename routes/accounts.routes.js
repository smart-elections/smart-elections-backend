const express = require('express');
const router = express.Router();

const accounts = require('../services/accounts.service');

router.post('/login', accounts.login);

module.exports = router