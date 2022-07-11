const express = require('express');
const router = express.Router();

const elections = require('../services/elections.service');

router.get('/', elections.getElections);
router.post('/add/election', elections.addElection);
router.put('/edit/election', elections.editElection)

module.exports = router