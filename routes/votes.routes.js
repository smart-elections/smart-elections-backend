const express = require('express');
const router = express.Router();

const votes = require('../services/votes.service');

router.get('/', votes.getVotes);

module.exports = router