require('dotenv').config();

const express = require('express');
const usuariosRouter = require('./routes/usuarios');
const clasesRouter = require('./routes/clases');
const estacionesRouter = require('./routes/estaciones');
const dashboardRouter = require('./routes/dashboard');
const healthRouter = require('./routes/health');

const app = express();
const PORT = Number(process.env.PORT);

app.use(express.json());
app.use('/api/auth', usuariosRouter);
app.use('/api/classes', clasesRouter);
app.use('/api/stations', estacionesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/health', healthRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
