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
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000",
        description: "Servidor de Desenvolvimento",
      },
      {
        url: "https://api.exemplo.com",
        description: "Servidor de Produção",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
      schemas: {
        Order: {
          type: "object",
          required: ["numeroPedido", "valorTotal", "dataCriacao", "items"],
          properties: {
            numeroPedido: {
              type: "string",
              example: "v10089015vdb-01",
            },
            valorTotal: {
              type: "number",
              example: 10000,
            },
            dataCriacao: {
              type: "string",
              format: "date-time",
              example: "2023-07-19T12:24:11.5299601+00:00",
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  idItem: {
                    type: "string",
                    example: "2434",
                  },
                  quantidadelItem: {
                    type: "integer",
                    example: 1,
                  },
                  valorItem: {
                    type: "number",
                    example: 1000,
                  },
                },
              },
            },
          },
        },
        OrderResponse: {
          type: "object",
          properties: {
            orderId: {
              type: "string",
              example: "v10089016vdb",
            },
            value: {
              type: "number",
              example: 10000,
            },
            creationDate: {
              type: "string",
              format: "date-time",
              example: "2023-07-19T12:24:11.529Z",
            },
            items: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  productId: {
                    type: "integer",
                    example: 2434,
                  },
                  quantity: {
                    type: "integer",
                    example: 1,
                  },
                  price: {
                    type: "number",
                    example: 1000,
                  },
                },
              },
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              example: "Erro interno do servidor",
            },
            message: {
              type: "string",
              example: "Descrição do erro",
            },
            timestamp: {
              type: "string",
              format: "date-time",
            },
          },
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    tags: [
      {
        name: "Pedidos",
        description: "Operações relacionadas a pedidos",
      },
      {
        name: "Autenticação",
        description: "Operações de autenticação",
      },
    ],
  },
  apis: ["./src/routes/*.js", "./src/controllers/*.js"], // Caminho para os arquivos com anotações
};

const specs = swaggerJsdoc(options);

module.exports = specs;
