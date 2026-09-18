const express = require('express');
const {
  listarClases,
  crearClase,
  buscarClase,
  actualizarClase,
  eliminarClase,
} = require('./controllers/clases');
const {
  listarEstaciones,
  listarTodasEstaciones,
  crearEstacion,
  obtenerEstacion,
  updateEstacion,
  patchEstacion,
  eliminarEstacion,
  registrarHeartbeat,
} = require('./controllers/estaciones');

const app = express();
const PORT = 3000;

app.use(express.json());

app.get('/api/classes', listarClases);
app.post('/api/classes', crearClase);
app.get('/api/classes/:id', buscarClase);
app.put('/api/classes/:id', actualizarClase);
app.delete('/api/classes/:id', eliminarClase);

app.get('/api/allstations', listarTodasEstaciones);
app.get('/api/stations', listarEstaciones);
app.post('/api/stations', crearEstacion);
app.get('/api/stations/:id', obtenerEstacion);
app.put('/api/stations/:id', updateEstacion);
app.patch('/api/stations/:id', patchEstacion);
app.delete('/api/stations/:id', eliminarEstacion);
app.post('/api/stations/:id/reports', registrarHeartbeat);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
