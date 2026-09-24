const express = require('express');
const { crearUsuario, iniciarSesion } = require('../controllers/usuarios');

const router = express.Router();

router.post('/register', crearUsuario);
router.post('/login', iniciarSesion);

module.exports = router;
