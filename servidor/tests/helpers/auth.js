const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { prisma } = require('./db');

const JWT_SECRET = process.env.JWT_SECRET || 'test-jwt-secret-key-12345';

/**
 * Generates a signed JWT token
 */
function generateToken(payload = {}, options = {}) {
  const defaultPayload = {
    id: 1,
    email: 'admin@unitec.edu',
    ...payload,
  };
  return jwt.sign(defaultPayload, JWT_SECRET, {
    expiresIn: '1h',
    ...options,
  });
}

/**
 * Returns Authorization header object
 */
function getAuthHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Seeds a test admin in test.db and returns { user, token, authHeader }
 */
async function createTestAdmin(overrides = {}) {
  const email = overrides.email || 'admin@unitec.edu';
  const password = overrides.password || 'Unitec2026!';
  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name: overrides.name || 'Admin Test',
      email: email,
      passwordHash: passwordHash,
    },
  });

  const token = generateToken({ id: user.id, email: user.email });
  const authHeader = getAuthHeader(token);

  return { user, token, authHeader, rawPassword: password };
}

module.exports = {
  JWT_SECRET,
  generateToken,
  getAuthHeader,
  createTestAdmin,
};
