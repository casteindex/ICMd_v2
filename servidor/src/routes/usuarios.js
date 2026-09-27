const express = require('express');
const autenticarToken = require('../middleware/token');
const {
  obtenerUsuarios,
  crearUsuario,
  iniciarSesion,
} = require('../controllers/usuarios');

const router = express.Router();
router.use('/', autenticarToken);

router.get('/', obtenerUsuarios); // Extra
router.post('/register', crearUsuario);
router.post('/login', iniciarSesion);

module.exports = router;
