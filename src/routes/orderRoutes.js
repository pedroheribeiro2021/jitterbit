/**
 * Rotas da API de pedidos
 * @module routes/orderRoutes
 */

import { Router } from "express";
const router = Router();
import {
  createOrder,
  getOrderById,
  listOrders,
  updateOrder,
  deleteOrder,
} from "../controllers/orderController";
const { authenticateToken, requireAdmin } = require("../middlewares/auth");

// =====================================================
// ROTAS OBRIGATÓRIAS
// =====================================================

/**
 * @route   POST /order
 * @desc    Criar um novo pedido
 * @access  Public
 * @body    { numeroPedido, valorTotal, dataCriacao, items }
 * @returns {Object} Pedido criado
 */
router.post("/order", authenticateToken, createOrder);

/**
 * @route   GET /order/:orderId
 * @desc    Obter pedido por ID
 * @access  Public
 * @param   {string} orderId - ID do pedido
 * @returns {Object} Pedido encontrado
 */
router.get("/order/:orderId", authenticateToken, getOrderById);

// =====================================================
// ROTAS OPCIONAIS
// =====================================================

/**
 * @route   GET /order/list
 * @desc    Listar todos os pedidos com paginação
 * @access  Public
 * @query   {number} page - Número da página (default: 1)
 * @query   {number} limit - Itens por página (default: 10)
 * @returns {Array} Lista de pedidos
 */
router.get("/order/list", authenticateToken, listOrders);

/**
 * @route   PUT /order/:orderId
 * @desc    Atualizar pedido existente
 * @access  Public
 * @param   {string} orderId - ID do pedido
 * @body    { numeroPedido, valorTotal, dataCriacao, items }
 * @returns {Object} Pedido atualizado
 */
router.put("/order/:orderId", authenticateToken, updateOrder);

/**
 * @route   DELETE /order/:orderId
 * @desc    Deletar pedido
 * @access  Public
 * @param   {string} orderId - ID do pedido
 * @returns {Object} Mensagem de confirmação
 */
router.delete("/order/:orderId", authenticateToken, deleteOrder);

// =====================================================
// MIDDLEWARE DE VALIDAÇÃO DE PARÂMETROS (opcional)
// =====================================================
router.param("orderId", (req, res, next, orderId) => {
  // Validar formato do orderId (ex: v10089016vdb)
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

router.post("/login", authController.login);

export default router;
