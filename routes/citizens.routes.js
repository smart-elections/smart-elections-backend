const express = require('express');
const router = express.Router();

const citizens = require('../services/citizens.service');

router.get('/', citizens.getCitizens);
router.post('/add/citizen', citizens.addCitizen);
router.put('/edit/citizen', citizens.editCitizen);

module.exports = router;