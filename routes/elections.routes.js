const express = require('express');
const router = express.Router();

const elections = require('../services/elections.service');

router.get('/', elections.getElections);

module.exports = router