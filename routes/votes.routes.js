const express = require('express');
const router = express.Router();

const votes = require('../services/votes.service');

router.get('/', votes.getVotes);
router.post('/add/vote', votes.addVotes);
router.put('/edit/vote', votes.editVote)

module.exports = router