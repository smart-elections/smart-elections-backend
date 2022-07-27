const express = require('express');
const router = express.Router();

const multer = require("multer");

let storage = multer.memoryStorage();

const upload = multer({ storage: storage });

const candidates = require('../services/candidates.service');

router.get('/', candidates.getCandidates);
router.post('/add/candidate', candidates.addCandidate);
router.put('/edit/candidate', candidates.updateCandidate);

//Upload Candidate Image
router.put("/upload/:id", upload.single("file"), candidates.uploadCandidateImage);

module.exports = router