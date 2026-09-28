require('dotenv').config();

const { PrismaClient } = require('@prisma/client');
const { PrismaBetterSqlite3 } = require('@prisma/adapter-better-sqlite3');

if (process.env.DATABASE_URL) {
  const dbPath = require.resolve('./config/db');
  require.cache[dbPath] = {
    id: dbPath,
    filename: dbPath,
    loaded: true,
    exports: new PrismaClient({
      adapter: new PrismaBetterSqlite3({
        url: process.env.DATABASE_URL,
      }),
    }),
  };
}

const express = require('express');
const cors = require('cors');
const { setupSwagger } = require('./config/swagger');
const usuariosRouter = require('./routes/usuarios');
const clasesRouter = require('./routes/clases');
const estacionesRouter = require('./routes/estaciones');
const dashboardRouter = require('./routes/dashboard');
const healthRouter = require('./routes/health');

const app = express();

const corsOptions = {
  origin: [
    'http://127.0.0.1:5173',
    'http://localhost:5173',
    'http://127.0.0.1:5500',
    'http://localhost:5500',
  ],
  optionsSuccessStatus: 200,
};

app.use(express.json());
app.use(cors(corsOptions));

//extra: una bitacora de todas las solicitudes que llegan al servidor
app.use((req, res, next) => {
  console.log(`Se recibio una solicitud ${req.method} a la ruta: ${req.url}`);
  next();
});

// Documentación de Swagger UI en /swagger-docs
setupSwagger(app);

app.use('/api/auth', usuariosRouter);
app.use('/api/classes', clasesRouter);
app.use('/api/stations', estacionesRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/health', healthRouter);

module.exports = app;
