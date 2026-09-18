const prisma = require("../config/db");
const { buscarClase } = requiere("./clases");

// Lista de sistemas operativos válidos
const OperatingSystems = ["WINDOWS", "MACOS", "LINUX", "CHROMEOS"];

// GET /api/stations?classId=:classId
const listarEstaciones = async (req, res) => {};

// POST /api/stations
const crearEstacion = async (req, res) => {
  try {
    const { code, name, location, operatingSystem, classId } = req.body;

    // Verificar si el sistema operativo es válido
    if (!OperatingSystems.includes(operatingSystem)) {
      return res.status(400).json({
        error: "Sistema operativo inválido",
      });
    }

    // TODO: verificar estado de la clase, etc.

    const estacion = await prisma.station.create({
      data: {
        code: code.trim(),
        name: name.trim(),
        location: location.trim(),
        operatingSystem: operatingSystem.trim(),
        classId: Number(classId),
      },
    });

    res.status(201).json(estacion);
  } catch (error) {
    console.error("Error al crear la estación:", error.code, error.message);

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Ya existe una estación con ese código",
      });
    }
    if (error.code === "P2003") {
      return res.status(404).json({
        error: "No existe una clase con ese ID",
      });
    }
    res.status(500).json({
      error: "No fue posible crear la estación",
    });
  }
};

// GET /api/stations/:id
const obtenerEstacion = async (req, res) => {
  try {
    const { id } = req.params;

    const estacion = await prisma.station.findUnique({
      where: { id: Number(id) },
    });
    if (!estacion) {
      return res.status(404).json({
        error: "No existe una estación con ese ID",
      });
    }
    res.status(201).json(estacion);
  } catch (error) {
    console.error("Error al obtener la estación:", error.code, error.message);
    res.status(500).json({
      error: "No fue posible obtener la estación",
    });
  }
};

// PUT /api/stations/:id
const updateEstacion = async (req, res) => {
  try {
    const { id } = req.params;
    // No se va a leer `ignored` porque hay un endpoint para eso
    const { code, name, location, operatingSystem, classId } = req.body;

    // Primero verificar que la estación exista
    const estacion = await prisma.station.findUnique({
      where: { id: Number(id) },
    });
    if (!estacion) {
      return res.status(404).json({
        error: "No existe una estación con ese ID",
      });
    }
    /*
    Prisma no modifica los valores si son undefined (este es el caso
    si no se pasó el valor en el req.body). Referencia:
    https://github.com/prisma/orm/discussions/5592#discussioncomment-358754
    */
    const estacionActualizada = await prisma.station.update({
      where: { id: Number(id) },
      data: {
        code,
        name,
        location,
        operatingSystem,
        classId,
      },
    });

    res.status(201).json(estacionActualizada);
  } catch (error) {
    console.error("Error al obtener la estación:", error.code, error.message);
    res.status(500).json({
      error: "No fue posible actualizar la estación",
    });
  }
};

// PATCH /api/stations/:id/ignore
const patchEstacion = async (req, res) => {};

// DELETE /api/stations/:id
const eliminarEstacion = async (req, res) => {};

// POST /api/stations/:id/reports
const registrarHeartbeat = async (req, res) => {};

module.exports = {
  listarEstaciones,
  crearEstacion,
  obtenerEstacion,
  updateEstacion,
  patchEstacion,
  eliminarEstacion,
  registrarHeartbeat,
};
