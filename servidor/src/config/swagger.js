const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');

// Opciones de configuración para Swagger UI
const swaggerUiOptions = {
  explorer: true,
  swaggerOptions: {
    persistAuthorization: true,
    displayRequestDuration: true,
    docExpansion: 'list',
    filter: true,
    tryItOutEnabled: true,
  },
  customSiteTitle: 'Documentación API ICMd - Swagger UI',
};

const setupSwagger = (app) => {
  // Ajustar el puerto dinámicamente si cambia en tiempo de ejecución
  const port = process.env.PORT || 3000;
  if (swaggerDocument.servers && swaggerDocument.servers.length > 0) {
    swaggerDocument.servers[0].url = `http://localhost:${port}`;
  }

  // Endpoint para obtener el archivo de especificación OpenAPI en JSON
  app.get('/swagger-docs/swagger.json', (req, res) => {
    res.setHeader('Content-Type', 'application/json');
    res.send(swaggerDocument);
  });

  // Montar Swagger UI en /swagger-docs
  app.use(
    '/swagger-docs',
    swaggerUi.serve,
    swaggerUi.setup(swaggerDocument, swaggerUiOptions)
  );
};

module.exports = {
  swaggerDocument,
  swaggerUiOptions,
  setupSwagger,
};
