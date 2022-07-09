const express = require('express');
const router = express.Router();

const candidates = require('../services/candidates.service');

router.get('/', candidates.getCandidates);
router.post('/add/candidate', candidates.addCandidate);
router.put('/edit/candidate', candidates.updateCandidate);

module.exports = router