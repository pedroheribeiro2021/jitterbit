/**
 * Middleware de autenticação JWT
 * @module middlewares/auth
 */
const jwt = require('jsonwebtoken');
require("dotenv").config();

// Usuários mockados (em produção, viriam do banco de dados)
const users = [
  {
    id: 1,
    username: "admin",
    password: "admin123", // Em produção, usar hash!
    role: "admin",
  },
  {
    id: 2,
    username: "user",
    password: "user123",
    role: "user",
  },
];

/**
 * Gerar token JWT
 * @param {Object} user - Dados do usuário
 * @returns {string} Token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    },
  );
};

/**
 * Middleware para autenticar token
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({
      error: "Não autorizado",
      message: "Token de autenticação não fornecido",
      timestamp: new Date().toISOString(),
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(403).json({
          error: "Token expirado",
          message: "Faça login novamente",
          timestamp: new Date().toISOString(),
        });
      }

      return res.status(403).json({
        error: "Token inválido",
        message: "Token de autenticação inválido",
        timestamp: new Date().toISOString(),
      });
    }

    req.user = user;
    next();
  });
};

/**
 * Middleware para verificar role de admin
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware
 */
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.status(403).json({
      error: "Acesso negado",
      message: "Apenas administradores podem acessar este recurso",
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Rota de login (para testes)
 * POST /login
 */
const login = (req, res) => {
  const { username, password } = req.body;

  // Validação básica
  if (!username || !password) {
    return res.status(400).json({
      error: "Requisição inválida",
      message: "Username e password são obrigatórios",
      timestamp: new Date().toISOString(),
    });
  }

  // Buscar usuário (mock)
  const user = users.find(
    (u) => u.username === username && u.password === password,
  );

  if (!user) {
    return res.status(401).json({
      error: "Não autorizado",
      message: "Credenciais inválidas",
      timestamp: new Date().toISOString(),
    });
  }

  // Gerar token
  const token = generateToken(user);

  res.status(200).json({
    success: true,
    message: "Login realizado com sucesso",
    data: {
      token,
      user: {
        id: user.id,
        username: user.username
      },
    },
    timestamp: new Date().toISOString(),
  });
};

module.exports = {
  authenticateToken,
  requireAdmin,
  login,
};
