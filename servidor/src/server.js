const express = require('express');
const usuariosRouter = require('./routes/usuarios');
const clasesRouter = require('./routes/clases');
const estacionesRouter = require('./routes/estaciones');

const app = express();
const PORT = 3000;

app.use(express.json());
app.use('/api/auth', usuariosRouter);
app.use('/api/classes', clasesRouter);
app.use('/api/stations', estacionesRouter);

// Eliminar esto después
const { listarTodasEstaciones } = require('./controllers/estaciones');
app.get('/api/allstations', listarTodasEstaciones);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
