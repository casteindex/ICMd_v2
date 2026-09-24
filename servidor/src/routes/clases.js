const express = require('express');
const {
  listarClases,
  crearClase,
  buscarClase,
  actualizarClase,
  eliminarClase,
} = require('../controllers/clases');

const router = express.Router();

router.get('/', listarClases);
router.post('/', crearClase);
router.get('/:id', buscarClase);
router.put('/:id', actualizarClase);
router.delete('/:id', eliminarClase);

module.exports = router;
