require('dotenv').config();

const express = require('express');
const { setupSwagger } = require('./config/swagger');
const usuariosRouter = require('./routes/usuarios');
const clasesRouter = require('./routes/clases');
const estacionesRouter = require('./routes/estaciones');
const dashboardRouter = require('./routes/dashboard');
const healthRouter = require('./routes/health');

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json());

// Documentación de Swagger UI en /swagger-docs
setupSwagger(app);

app.use('/api/auth', usuariosRouter);
app.use('/api/classes', clasesRouter);
app.use('/api/stations', estacionesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/health', healthRouter);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(
    `Documentación Swagger disponible en http://localhost:${PORT}/swagger-docs`
  );
});
