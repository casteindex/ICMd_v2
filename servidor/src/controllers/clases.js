const prisma = require("../config/db");

const listarClases = async (req, res) => {
  try {
    const clases = await prisma.class.findMany({
      include: {
        stations: true,
      },
    });
    res.json(clases);
  } catch (error) {
    console.error("Error al listar categorias: ", error);

    res.status(500).json({
      error: "No fue posible listar las categorías.",
    });
  }
};

const crearClase = async (req, res) => {
  try {
    // const { code, name, section, location, schedule } = req.body;

    // TODO: hacer las validaciones
    const clase = await prisma.class.create({
      data: {
        code: req.body.code,
        name: req.body.name,
        section: req.body.section,
        location: req.body.location,
        schedule: req.body.schedule,
      },
    });

    res.status(201).json(clase);
  } catch (error) {
    console.error("Error al crear la clase:", error);

    if (error.code === "P2002") {
      return res.status(409).json({
        error: "Ya existe una clase con ese código",
      });
    }

    res.status(500).json({
      error: "No fue posible crear la clase",
    });
  }
};

module.exports = {
  listarClases: listarClases,
  crearClase: crearClase,
};
