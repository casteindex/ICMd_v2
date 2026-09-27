require('dotenv').config();

const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

const autenticarToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ mensaje: 'Token no proporcionado.' });
  }

  try {
    const usuario = jwt.verify(token, JWT_SECRET);
    req.user = usuario;
    next();
  } catch (error) {
    console.log('No se pudo autenticar el token', error.code, error.message);

    return res.status(403).json({ mensaje: 'Token inválido o expirado.' });
  }
};

module.exports = autenticarToken;
