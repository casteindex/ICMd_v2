const getHealth = async (req, res) => {
  try {
    return res.status(200).json({
      status: 'ok',
      timestamp: new Date(),
    });
  } catch (error) {
    console.error('Error al obtener health:', error.code, error.message);

    res.status(500).json({
      status: 'error',
      error: 'Error interno del servidor',
    });
  }
};

module.exports = {
  getHealth,
};
