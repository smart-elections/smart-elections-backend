const express = require('express');
const router = express.Router();

const registered_voters = require('../services/registered-voters.service');

router.get('/', registered_voters.getVoters);


module.exports = router