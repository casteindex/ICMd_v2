const express = require('express');
const autenticarToken = require('../middleware/token');
const { getResumen } = require('../controllers/dashboard');

const router = express.Router();
router.use('/', autenticarToken);

router.get('/summary', getResumen);

module.exports = router;
