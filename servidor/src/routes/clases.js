const express = require('express');
const autenticarToken = require('../middleware/token');
const {
  listarClases,
  crearClase,
  buscarClase,
  actualizarClase,
  eliminarClase,
} = require('../controllers/clases');

const router = express.Router();

// Se puede hacer que el router entero use el middleware. Referencia:
// https://stackoverflow.com/a/58847774
router.use('/', autenticarToken);

router.get('/', listarClases);
router.post('/', crearClase);
router.get('/:id', buscarClase);
router.put('/:id', actualizarClase);
router.delete('/:id', eliminarClase);

module.exports = router;
