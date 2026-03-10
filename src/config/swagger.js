/**
 * Configuração do Swagger para documentação da API
 * @module config/swagger
 */

const swaggerJsdoc = require("swagger-jsdoc");

const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API de Pedidos",
      version: "1.0.0",
      description: "API para gerenciamento de pedidos com Node.js e PostgreSQL",
      contact: {
        name: "Suporte",
        email: "suporte@exemplo.com",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor local",
      },
    ],
    tags: [
      {
        name: "Orders",
        description: "Gerenciamento de pedidos",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"],
};

const specs = swaggerJsdoc(options);

module.exports = specs;
