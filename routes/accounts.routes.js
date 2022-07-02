const express = require('express');
const router = express.Router();

const accounts = require('../services/accounts.service');

router.get('/login', accounts.login);
router.put('/signup', accounts.signup);

module.exports = router