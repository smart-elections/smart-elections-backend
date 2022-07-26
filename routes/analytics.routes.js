const express = require('express');
const router = express.Router();

const analytics = require('../services/analytics.service');

router.get('/registered_voters', analytics.getNbrOfRegisteredVoters);
router.get('/voters', analytics.getNbrOfVoters);
router.get('/election_winner', analytics.getElectionWinner);

module.exports = router