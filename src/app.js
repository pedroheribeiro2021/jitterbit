/**
 * Configuração principal da aplicação Express
 * @module app
 */

const express = require("express");
const cors = require("cors");
const orderRoutes = require("./routes/orderRoutes");

const swaggerUi = require("swagger-ui-express");
const swaggerSpecs = require("./config/swagger");

const app = express();

// =====================================================
// MIDDLEWARES GLOBAIS
// =====================================================

// Habilitar CORS
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production" ? ["https://seudominio.com"] : "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// Parse JSON bodies
app.use(express.json({ limit: "10mb" }));

// Parse URL-encoded bodies
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// =====================================================
// LOGGING MIDDLEWARE
// =====================================================
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  const method = req.method;
  const url = req.url;
  const ip = req.ip || req.connection.remoteAddress;

  console.log(`[${timestamp}] ${method} ${url} - IP: ${ip}`);

  // Log do body em desenvolvimento
  if (process.env.NODE_ENV === "development" && req.method !== "GET") {
    console.log("📦 Body:", JSON.stringify(req.body, null, 2));
  }

  next();
});

// =====================================================
// DOCUMENTAÇÃO SWAGGER
// =====================================================
app.use(
  "/api-docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpecs, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "API de Pedidos - Documentação",
  }),
);

// ROTAS DA API
app.use("/", orderRoutes);

// ROTA DE SAÚDE DA API
app.get("/health", (req, res) => {
  res.status(200).json({
    status: "OK",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || "development",
    memory: process.memoryUsage(),
    version: process.env.npm_package_version || "1.0.0",
  });
});

// ROTA DE BEM-VINDO
app.get("/", (req, res) => {
  res.status(200).json({
    name: "API de Pedidos",
    version: process.env.npm_package_version || "1.0.0",
    description: "API para gerenciamento de pedidos",
    documentation: {
      create_order: "POST /order",
      get_order: "GET /order/:orderId",
      list_orders: "GET /order/list",
      update_order: "PUT /order/:orderId",
      delete_order: "DELETE /order/:orderId",
      health: "GET /health",
    },
  });
});

// TRATAMENTO DE ROTAS NÃO ENCONTRADAS (404)
app.use((req, res) => {
  res.status(404).json({
    error: "Rota não encontrada",
    message: `A rota ${req.method} ${req.originalUrl} não existe`,
    timestamp: new Date().toISOString(),
    available_routes: [
      "POST /order",
      "GET /order/:orderId",
      "GET /order/list",
      "PUT /order/:orderId",
      "DELETE /order/:orderId",
      "GET /health",
      "GET /",
    ],
  });
});

// =====================================================
// MIDDLEWARE DE TRATAMENTO DE ERROS GLOBAL
// =====================================================
app.use((err, req, res, next) => {
  console.error("Erro não tratado:", {
    message: err.message,
    stack: err.stack,
    timestamp: new Date().toISOString(),
  });

  // Determinar status code
  const statusCode = err.statusCode || 500;

  // Resposta de erro
  res.status(statusCode).json({
    error: err.name || "Erro interno do servidor",
    message: err.message || "Ocorreu um erro inesperado",
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
});

module.exports = app;
