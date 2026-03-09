/**
 * Rotas da API de pedidos
 * @module routes/orderRoutes
 */

const express = require("express");
const router = express.Router();
const orderController = require("../controllers/orderController");

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
router.post("/order", orderController.createOrder);

/**
 * @route   GET /order/:orderId
 * @desc    Obter pedido por ID
 * @access  Public
 * @param   {string} orderId - ID do pedido
 * @returns {Object} Pedido encontrado
 */
router.get("/order/:orderId", orderController.getOrderById);

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
router.get("/order/list", orderController.listOrders);

/**
 * @route   PUT /order/:orderId
 * @desc    Atualizar pedido existente
 * @access  Public
 * @param   {string} orderId - ID do pedido
 * @body    { numeroPedido, valorTotal, dataCriacao, items }
 * @returns {Object} Pedido atualizado
 */
router.put("/order/:orderId", orderController.updateOrder);

/**
 * @route   DELETE /order/:orderId
 * @desc    Deletar pedido
 * @access  Public
 * @param   {string} orderId - ID do pedido
 * @returns {Object} Mensagem de confirmação
 */
router.delete("/order/:orderId", orderController.deleteOrder);

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

module.exports = router;
