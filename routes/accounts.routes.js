const express = require('express');
const router = express.Router();

const accounts = require('../services/accounts.service');

router.get('/login', accounts.login);
router.put('/signup', accounts.signup);
router.put('/add/wallet', accounts.addWallet);
router.put('/edit/account', accounts.updateAccount);

module.exports = router