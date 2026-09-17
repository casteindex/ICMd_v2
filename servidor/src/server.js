const express = require("express");
const { listarClases, crearClase } = require("./controllers/clases");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/api/classes", listarClases);
app.post("/api/classes", crearClase);

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
