const prisma = require('../config/db');
const { getClase } = require('./estaciones');

const getResumen = async (req, res) => {
  try {
    let { classId } = req.query;
    if (!classId) {
      res.status(400).json({ error: 'Falta classId' });
    }
    classId = Number(classId);

    const clase = await getClase(classId);
    if (!clase) {
      return res.status(404).json({
        error: 'No existe una clase con ese ID',
      });
    }

    const estaciones = await prisma.station.findMany({
      where: {
        classId: classId,
      },
      include: {
        reports: {
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    // Encontrar cantidad de cada estado
    const active = 0,
      ok = 0,
      warning = 0,
      critical = 0,
      ignored = 0;
    for (const estacion of estaciones) {
    }
  } catch (error) {}
};

module.exports = {
  getResumen,
};
