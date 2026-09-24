const prisma = require('../config/db');

// Lista de sistemas operativos válidos
const OperatingSystems = ['WINDOWS', 'MACOS', 'LINUX', 'CHROMEOS'];

// Funciones que se repiten
const getEstacion = async (id) => {
  return await prisma.station.findUnique({
    where: { id: Number(id) },
  });
};
const getClase = async (classId) => {
  return await prisma.class.findUnique({
    where: { id: classId },
  });
};

// GET extra (este muestra todas las estaciones)
const listarTodasEstaciones = async (req, res) => {
  try {
    const estaciones = await prisma.station.findMany({
      include: { reports: true },
    });
    res.status(200).json(estaciones);
  } catch (error) {
    console.error('Error al listar estaciones: ', error.code, error.message);

    res.status(500).json({
      error: 'No fue posible listar las estaciones.',
    });
  }
};

// TODO: este endpoint
// GET /api/stations?classId=:classId
const listarEstaciones = async (req, res) => {
  const { status, q } = req.query;
  let { classId } = req.query;
  if (!classId) {
    res.status(400).json({ error: 'Falta classId' });
  }
  classId = Number(classId);

  try {
    const clase = await getClase(classId);
    if (!clase) {
      return res.status(404).json({
        error: 'No existe una clase con ese ID',
      });
    }

    // Para filtrar por texto, usamos el filtro contains que trae prisma. Referencia:
    // https://www.prisma.io/docs/orm/v6/reference/prisma-client-reference#contains
    const estaciones = await prisma.station.findMany({
      where: {
        classId: classId,
        name: { contains: q },
      },
    });
    res.status(200).json(estaciones);
  } catch (error) {
    console.error('Error al listar estaciones: ', error.code, error.message);

    res.status(500).json({
      error: 'No fue posible listar las estaciones.',
    });
  }
};

// POST /api/stations
const crearEstacion = async (req, res) => {
  try {
    const { code, name, location, operatingSystem, classId } = req.body;

    if (!code || !name || !location || !operatingSystem || !classId) {
      return res.status(400).json({
        error: 'Datos incompletos',
      });
    }
    // Verificar si el sistema operativo es válido
    if (!OperatingSystems.includes(operatingSystem)) {
      return res.status(400).json({
        error: 'Sistema operativo inválido',
      });
    }
    // Verificar si la existe y clase está activa
    const clase = await getClase(classId);
    if (!clase) {
      return res.status(404).json({
        error: 'No existe una clase con ese ID',
      });
    }
    if (!clase.active) {
      return res.status(400).json({
        error: 'Clase inactiva',
      });
    }
    /*
    Nota: La validación "el código ya existe dentro de esa clase" es innecesaria
    aquí, porque el campo `code` en el schema.prisma ya es unique. Así que devuelve
    un error P2002
    */
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
    console.error('Error al crear la estación:', error.code, error.message);

    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Ya existe una estación con ese código en esa clase',
      });
    }
    if (error.code === 'P2003') {
      return res.status(404).json({
        error: 'No existe una clase con ese ID',
      });
    }
    res.status(500).json({
      error: 'No fue posible crear la estación',
    });
  }
};

// GET /api/stations/:id
// TODO: ver lo del parámetro limit
const obtenerEstacion = async (req, res) => {
  try {
    const { id } = req.params;

    const estacion = await getEstacion(id);
    if (!estacion) {
      return res.status(404).json({
        error: 'No existe una estación con ese ID',
      });
    }
    res.status(201).json(estacion);
  } catch (error) {
    console.error('Error al obtener la estación:', error.code, error.message);
    res.status(500).json({
      error: 'No fue posible obtener la estación',
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
    const estacion = await getEstacion(id);
    if (!estacion) {
      return res.status(404).json({
        error: 'No existe una estación con ese ID',
      });
    }

    // Validar que la clase de destino exista y esté activa
    const clase = await getClase(classId);
    if (!clase) {
      return res.status(404).json({
        error: 'Clase de destino no existe',
      });
    }
    if (!clase.active) {
      return res.status(400).json({
        error: 'Clase de destino inactiva',
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
        updatedAt: new Date(),
      },
    });

    res.status(200).json(estacionActualizada);
  } catch (error) {
    console.error(
      'Error al actualizar la estación:',
      error.code,
      error.message
    );

    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Ya existe una estación con ese código',
      });
    }
    res.status(500).json({
      error: 'No fue posible actualizar la estación',
    });
  }
};

// PATCH /api/stations/:id/ignore
const patchEstacion = async (req, res) => {
  try {
    const { id } = req.params;
    const { ignored } = req.body;

    // Primero verificar que la estación exista
    const estacion = await getEstacion(id);
    if (!estacion) {
      return res.status(404).json({
        error: 'No existe una estación con ese ID',
      });
    }
    // Validar que ignore sea booleano
    if (typeof ignored !== 'boolean') {
      return res.status(400).json({
        error: 'No es booleano',
      });
    }

    const estacionActualizada = await prisma.station.update({
      where: { id: Number(id) },
      data: {
        ignored: ignored,
        updatedAt: new Date(),
      },
      select: {
        id: true,
        ignored: true,
        updatedAt: true,
      },
    });

    res.status(200).json(estacionActualizada);
  } catch (error) {
    console.error(
      'Error al actualizar la estación:',
      error.code,
      error.message
    );

    res.status(500).json({
      error: 'No fue posible actualizar la estación',
    });
  }
};

// DELETE /api/stations/:id
const eliminarEstacion = async (req, res) => {
  try {
    const { id } = req.params;

    // Primero verificar que la estación exista
    const estacion = await getEstacion(id);
    if (!estacion) {
      return res.status(404).json({
        error: 'No existe una estación con ese ID',
      });
    }

    // Eliminar estación y sus reportes
    await prisma.station.delete({
      where: { id: Number(id) },
    });
    res.status(204); // No manda respuesta
  } catch (error) {
    console.error('Error al eliminar la estación:', error.code, error.message);

    res.status(500).json({
      error: 'No fue posible eliminar la estación',
    });
  }
};

// POST /api/stations/:id/reports
// TODO: preguntar qué es esto
const registrarHeartbeat = async (req, res) => {};

module.exports = {
  listarEstaciones,
  listarTodasEstaciones,
  crearEstacion,
  obtenerEstacion,
  updateEstacion,
  patchEstacion,
  eliminarEstacion,
  registrarHeartbeat,
};
