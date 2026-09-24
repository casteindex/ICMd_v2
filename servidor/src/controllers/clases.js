const prisma = require('../config/db');

const listarClases = async (req, res) => {
  const { active } = req.query;
  const filtro =
    active === undefined ? undefined : active === 'true' ? true : false;

  try {
    const clases = await prisma.class.findMany({
      where: { active: filtro },
      include: {
        _count: { select: { stations: true } },
      },
    });
    res.status(200).json(clases);
  } catch (error) {
    console.error('Error al listar clases: ', error.code, error.message);

    res.status(500).json({
      error: 'No fue posible listar las clases.',
    });
  }
};

const crearClase = async (req, res) => {
  const { code, name, section, location, schedule } = req.body;

  try {
    // TODO: hacer las validaciones. No sabemos que es un dato invalido (falta 400 de datos)
    if (!code || !name || !section || !location || !schedule) {
      return res.status(400).json({
        error: 'Datos incompletos. Revise que tenga todos lo campos completos',
      });
    }
    const clase = await prisma.class.create({
      data: {
        code: code,
        name: name,
        section: section,
        location: location,
        schedule: schedule,
      },
    });

    res.status(201).json(clase);
  } catch (error) {
    console.error('Error al crear la clase:', error.code, error.message);

    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Ya existe una clase con ese código',
      });
    }

    res.status(500).json({
      error: 'No fue posible crear la clase',
    });
  }
};

const buscarClase = async (req, res) => {
  const { id } = req.params;
  const idNum = Number(id);
  try {
    if (Number.isNaN(idNum)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    const clase = await prisma.class.findUnique({
      where: { id: idNum },
      include: {
        _count: { select: { stations: true } },
        stations: {
          select: {
            id: true,
            createdAt: true,
            updatedAt: true,
          },
        },
      },
    });
    if (!clase) {
      return res.status(404).json({
        error: 'No existe clase con ese ID',
      });
    }
    res.status(201).json(clase);
  } catch (error) {
    console.error('Error al buscar la clase:', error.code, error.message);
    return res.status(500).json({
      error: 'No fue posible buscar la clase',
    });
  }
};

const actualizarClase = async (req, res) => {
  const { id } = req.params;
  const { code, name, section, location, schedule, active } = req.body;
  try {
    const claseActualizada = await prisma.class.update({
      where: { id: Number(id) },
      data: {
        code,
        name,
        section,
        location,
        schedule,
        active,
        updatedAt: new Date(),
      },
    });
    return res.status(200).json(claseActualizada);
  } catch (error) {
    console.error('Error al actualizar la clase:', error.code, error.message);
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'No existe clase con ese ID',
      });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Codigo invalido, pertenece a otra clase',
      });
    }
  }
};

const eliminarClase = async (req, res) => {
  try {
    const { id } = req.params;
    const idNum = Number(id);

    if (Number.isNaN(idNum)) {
      return res.status(400).json({ error: 'ID inválido' });
    }

    await prisma.class.delete({ where: { id: idNum } });
    res
      .status(204)
      .json({ mensaje: 'Clase eliminada correctamente', id: idNum });
  } catch (error) {
    console.error('Error al eliminar la clase:', error.code, error.message);
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: 'No existe clase con ese ID',
      });
    }
    if (error.code === 'P2003') {
      return res.status(409).json({
        error: 'La clase aun tiene estaciones asociadas, no se puede eliminar',
      });
    }
    return res.status(500).json({
      error: 'No fue posible eliminar la clase',
    });
  }
};

module.exports = {
  listarClases: listarClases,
  crearClase: crearClase,
  eliminarClase: eliminarClase,
  buscarClase: buscarClase,
  actualizarClase: actualizarClase,
};
