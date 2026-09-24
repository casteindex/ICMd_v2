require('dotenv').config();

const prisma = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Validaciones
const esContrasenaValida = (contrasena) => {
  if (typeof contrasena !== 'string') return false;
  const tieneLongitudMinima = contrasena.length >= 8;
  const tieneMayuscula = /[A-Z]/.test(contrasena);
  const tieneNumero = /\d/.test(contrasena);
  return tieneLongitudMinima && tieneMayuscula && tieneNumero;
};
const esCorreoValido = (correo) => {
  if (typeof correo !== 'string') return false;
  const esValido = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(
    correo
  );
  return esValido;
};

const JWT_SECRET = process.env.JWT_SECRET;
const SALT_ROUNDS = Number(process.env.SALT_ROUNDS);

const obtenerUsuarios = async (req, res) => {
  try {
    const usuarios = await prisma.user.findMany({});
    res.status(200).json(usuarios);
  } catch (error) {
    console.error('Error al listar usuarios: ', error.message, error.code);

    res.status(500).json({
      error: 'No fue posible listar los usuarios.',
    });
  }
};

// Registra únicamente el primer usuario administrador
const crearUsuario = async (req, res) => {
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!name || !email || !password) {
    return res.status(400).json({
      mensaje: 'Todos los campos son obligatorios',
    });
  }
  if (!esContrasenaValida(password)) {
    return res.status(400).json({
      mensaje: 'Contraseña inválida',
    });
  }
  if (!esCorreoValido(email)) {
    return res.status(400).json({
      mensaje: 'Correo inválido',
    });
  }

  const cuenta = await prisma.user.count();
  if (cuenta > 0) {
    return res.status(403).json({
      mensaje: 'El sistema ya tiene un administrador registrado',
    });
  }

  try {
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    console.log('password:', password);
    console.log('rounds:', SALT_ROUNDS);
    console.log('secret:', JWT_SECRET);
    console.log('passwordHash:', passwordHash);

    const usuario = await prisma.user.create({
      data: {
        name: name,
        email: email,
        passwordHash: passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
      },
    });
    res.status(201).json(usuario);
  } catch (error) {
    console.error('Error al crear usuario: ', error.code, error.message);

    if (error.code === 'P2002') {
      return res.status(409).json({
        error: 'Correo ya existe',
      });
    }
  }
};

const iniciarSesion = async (req, res) => {
  const email = req.body.email?.trim().toLowerCase();
  const password = req.body.password;

  if (!email || !password) {
    return res
      .status(400)
      .json({ mensaje: 'Todos los campos son obligatorios' });
  }
  try {
    const usuario = await prisma.user.findUnique({
      where: { email: email },
    });

    // Validar correo y contraseña
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    const match = await bcrypt.compare(password, usuario.passwordHash);
    if (!match) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }

    const token = jwt.sign(
      { id: usuario.id, email: usuario.email },
      JWT_SECRET,
      { expiresIn: '1h' }
    );
    return res.status(200).json({
      token,
      expiresIn: 3600,
      user: {
        id: usuario.id,
        name: usuario.name,
        email: usuario.email,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      mensaje: 'Error interno del servidor',
    });
  }
};

module.exports = {
  obtenerUsuarios,
  crearUsuario,
  iniciarSesion,
};
