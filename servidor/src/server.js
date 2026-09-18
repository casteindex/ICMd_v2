const express = require("express");
const { listarClases, crearClase } = require("./controllers/clases");
const {
  listarEstaciones,
  crearEstacion,
  obtenerEstacion,
  updateEstacion,
  patchEstacion,
  eliminarEstacion,
  registrarHeartbeat,
} = require("./controllers/estaciones");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/classes", listarClases);
app.post("/api/classes", crearClase);

// app.get("/api/stations?classId=:classId", listarEstaciones);
app.post("/api/stations", crearEstacion);
app.get("/api/stations/:id", obtenerEstacion);
app.put("/api/stations/:id", updateEstacion);
app.patch("/api/stations/:id/ignore", patchEstacion);
app.delete("/api/stations/:id", eliminarEstacion);
app.post("/api/stations/:id/reports", registrarHeartbeat);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
