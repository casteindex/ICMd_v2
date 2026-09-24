const express = require('express');
const {
  listarEstaciones,
  crearEstacion,
  obtenerEstacion,
  updateEstacion,
  patchEstacion,
  eliminarEstacion,
  registrarHeartbeat,
} = require('../controllers/estaciones');

const router = express.Router();

router.get('/', listarEstaciones);
router.post('/', crearEstacion);
router.get('/:id', obtenerEstacion);
router.put('/:id', updateEstacion);
router.patch('/:id', patchEstacion);
router.delete('/:id', eliminarEstacion);
router.post('/:id/reports', registrarHeartbeat);

module.exports = router;
