const express = require('express');
const { getResumen } = require('../controllers/dashboard');

const router = express.Router();

router.get('/summary', getResumen);

module.exports = router;
