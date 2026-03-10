/**
 * Rotas da API de pedidos
 */

const express = require("express");
const router = express.Router();

const {
  createOrder,
  getOrderById,
  listOrders,
  updateOrder,
  deleteOrder,
} = require("../controllers/orderController");

const { authenticateToken, login } = require("../middlewares/auth");

// =====================================================
// ROTAS DE AUTENTICAÇÃO
// =====================================================

router.post("/login", login);

// =====================================================
// ROTAS OBRIGATÓRIAS
// =====================================================

router.post("/order", authenticateToken, createOrder);

// IMPORTANTE: LIST vem antes do :orderId
router.get("/order/list", authenticateToken, listOrders);

router.get("/order/:orderId", authenticateToken, getOrderById);

// =====================================================
// ROTAS OPCIONAIS
// =====================================================

router.put("/order/:orderId", authenticateToken, updateOrder);

router.delete("/order/:orderId", authenticateToken, deleteOrder);

// =====================================================
// VALIDAÇÃO orderId
// =====================================================

router.param("orderId", (req, res, next, orderId) => {
  const orderIdRegex = /^[a-zA-Z0-9]+$/;

  if (!orderIdRegex.test(orderId)) {
    return res.status(400).json({
      error: "Requisição inválida",
      message: "Formato de orderId inválido. Use apenas letras e números.",
      timestamp: new Date().toISOString(),
    });
  }

  next();
});

/**
 * @swagger
 * tags:
 *   name: Orders
 *   description: Gerenciamento de pedidos
 */

/**
 * @swagger
 * /order:
 *   post:
 *     summary: Criar um pedido
 *     tags: [Orders]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numeroPedido:
 *                 type: string
 *               valorTotal:
 *                 type: number
 *               dataCriacao:
 *                 type: string
 *                 format: date-time
 *               items:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     idItem:
 *                       type: integer
 *                     quantidadelItem:
 *                       type: integer
 *                     valorItem:
 *                       type: number
 *     responses:
 *       201:
 *         description: Pedido criado com sucesso
 */

/**
 * @swagger
 * /order/{orderId}:
 *   get:
 *     summary: Buscar pedido por ID
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido encontrado
 *       404:
 *         description: Pedido não encontrado
 */

/**
 * @swagger
 * /order/list:
 *   get:
 *     summary: Listar pedidos
 *     tags: [Orders]
 *     responses:
 *       200:
 *         description: Lista de pedidos
 */

/**
 * @swagger
 * /order/{orderId}:
 *   put:
 *     summary: Atualizar pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido atualizado
 */

/**
 * @swagger
 * /order/{orderId}:
 *   delete:
 *     summary: Deletar pedido
 *     tags: [Orders]
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pedido removido
 */

module.exports = router;
