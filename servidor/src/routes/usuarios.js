const express = require('express');
const {
  obtenerUsuarios,
  crearUsuario,
  iniciarSesion,
} = require('../controllers/usuarios');

const router = express.Router();

router.get('/', obtenerUsuarios); // Extra
router.post('/register', crearUsuario);
router.post('/login', iniciarSesion);

module.exports = router;
