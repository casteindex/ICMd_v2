const prisma = require('../config/db');
const { getClase, calculateStatus } = require('./estaciones');
const getResumen = async (req, res) => {
  try {
    let { classId } = req.query;
    if (!classId) {
      return res.status(400).json({ error: 'Falta classId' });
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

    const estados = estaciones.map(({ reports, ignored, ...station }) => {
      const lastReport = reports[0] ?? null;
      const { calculatedStatus } = calculateStatus(lastReport, ignored);
      return calculatedStatus;
    });

    // Encontrar cantidad de cada estado
    const active = estados.filter((estado) => estado !== 'IGNORADA').length;
    const ok = estados.filter((estado) => estado === 'OK').length;
    const warning = estados.filter((estado) => estado === 'ADVERTENCIA').length;
    const critical = estados.filter((estado) => estado === 'CRITICO').length;
    const ignored = estados.filter((estado) => estado === 'IGNORADA').length;

    res.status(200).json({ classId, active, ok, warning, critical, ignored });
  } catch (error) {
    console.error('Error al mostrar resumen: ', error.code, error.message);
    res.status(500).json({
      error: 'No fue posible mostrar el resumen.',
    });
  }
};

module.exports = {
  getResumen,
};
