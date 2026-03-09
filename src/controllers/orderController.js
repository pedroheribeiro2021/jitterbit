/**
 * Controlador de pedidos
 * @module controllers/orderController
 */

const db = require("../database/postgres");
const mapper = require("../utils/mapper");

/**
 * Criar um novo pedido
 * POST /order
 */
const createOrder = async (req, res) => {
  const client = await db.pool.connect();

  try {
    // Iniciar transação
    await client.query("BEGIN");

    // Mapear dados recebidos
    const orderData = mapper.mapOrderData(req.body);

    // Verificar se pedido já existe
    const checkQuery = "SELECT order_id FROM orders WHERE order_id = $1";
    const checkResult = await client.query(checkQuery, [orderData.orderId]);

    if (checkResult.rows.length > 0) {
      await client.query("ROLLBACK");
      return res.status(409).json({
        error: "Conflito",
        message: `Já existe um pedido com o ID ${orderData.orderId}`,
        timestamp: new Date().toISOString(),
      });
    }

    // Inserir na tabela orders
    const orderQuery = `
            INSERT INTO orders (order_id, value, creation_date)
            VALUES ($1, $2, $3)
            RETURNING *
        `;

    const orderResult = await client.query(orderQuery, [
      orderData.orderId,
      orderData.value,
      orderData.creationDate,
    ]);

    // Inserir items
    const itemsQuery = `
            INSERT INTO items (order_id, product_id, quantity, price)
            VALUES ($1, $2, $3, $4)
            RETURNING id, product_id, quantity, price
        `;

    const itemsPromises = orderData.items.map((item) =>
      client.query(itemsQuery, [
        orderData.orderId,
        item.productId,
        item.quantity,
        item.price,
      ]),
    );

    const itemsResults = await Promise.all(itemsPromises);

    // Commit da transação
    await client.query("COMMIT");

    // Mapear resposta
    const response = mapper.mapToResponse(
      orderResult.rows[0],
      itemsResults.map((r) => r.rows[0]),
    );

    res.status(201).json({
      success: true,
      message: "Pedido criado com sucesso",
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Rollback em caso de erro
    await client.query("ROLLBACK");

    console.error("❌ Erro ao criar pedido:", {
      error: error.message,
      body: req.body,
      timestamp: new Date().toISOString(),
    });

    // Determinar status code baseado no tipo de erro
    let statusCode = 500;
    let errorMessage = "Erro interno do servidor";

    if (
      error.message.includes("obrigatórios") ||
      error.message.includes("inválido")
    ) {
      statusCode = 400;
      errorMessage = "Dados inválidos";
    }

    res.status(statusCode).json({
      error: errorMessage,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    client.release();
  }
};

/**
 * Obter pedido por ID
 * GET /order/:orderId
 */
const getOrderById = async (req, res) => {
  const { orderId } = req.params;

  try {
    // Validar orderId
    if (!orderId || orderId.trim() === "") {
      return res.status(400).json({
        error: "Requisição inválida",
        message: "ID do pedido é obrigatório",
        timestamp: new Date().toISOString(),
      });
    }

    // Buscar pedido
    const orderQuery = "SELECT * FROM orders WHERE order_id = $1";
    const orderResult = await db.query(orderQuery, [orderId]);

    if (orderResult.rows.length === 0) {
      return res.status(404).json({
        error: "Não encontrado",
        message: `Pedido com ID ${orderId} não encontrado`,
        timestamp: new Date().toISOString(),
      });
    }

    // Buscar items do pedido
    const itemsQuery =
      "SELECT id, product_id, quantity, price FROM items WHERE order_id = $1";
    const itemsResult = await db.query(itemsQuery, [orderId]);

    // Mapear resposta
    const response = mapper.mapToResponse(
      orderResult.rows[0],
      itemsResult.rows,
    );

    res.status(200).json({
      success: true,
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao buscar pedido:", {
      error: error.message,
      orderId: req.params.orderId,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Listar todos os pedidos
 * GET /order/list
 */
const listOrders = async (req, res) => {
  try {
    // Parâmetros de paginação (opcional)
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    // Buscar total de pedidos
    const countQuery = "SELECT COUNT(*) as total FROM orders";
    const countResult = await db.query(countQuery);
    const totalOrders = parseInt(countResult.rows[0].total);

    // Buscar pedidos com paginação
    const ordersQuery = `
            SELECT * FROM orders 
            ORDER BY creation_date DESC 
            LIMIT $1 OFFSET $2
        `;
    const ordersResult = await db.query(ordersQuery, [limit, offset]);

    // Para cada pedido, buscar seus items
    const ordersWithItems = await Promise.all(
      ordersResult.rows.map(async (order) => {
        const itemsQuery =
          "SELECT id, product_id, quantity, price FROM items WHERE order_id = $1";
        const itemsResult = await db.query(itemsQuery, [order.order_id]);
        return mapper.mapToResponse(order, itemsResult.rows);
      }),
    );

    res.status(200).json({
      success: true,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit),
      },
      count: ordersWithItems.length,
      data: ordersWithItems,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Erro ao listar pedidos:", {
      error: error.message,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  }
};

/**
 * Atualizar pedido
 * PUT /order/:orderId
 */
const updateOrder = async (req, res) => {
  const { orderId } = req.params;
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // Validar orderId
    if (!orderId || orderId.trim() === "") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Requisição inválida",
        message: "ID do pedido é obrigatório",
        timestamp: new Date().toISOString(),
      });
    }

    // Verificar se pedido existe
    const checkQuery = "SELECT * FROM orders WHERE order_id = $1";
    const checkResult = await client.query(checkQuery, [orderId]);

    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Não encontrado",
        message: `Pedido com ID ${orderId} não encontrado`,
        timestamp: new Date().toISOString(),
      });
    }

    // Mapear novos dados
    const orderData = mapper.mapOrderData(req.body);

    // Atualizar pedido
    const updateOrderQuery = `
            UPDATE orders 
            SET value = $2, creation_date = $3, updated_at = CURRENT_TIMESTAMP
            WHERE order_id = $1
            RETURNING *
        `;

    const orderResult = await client.query(updateOrderQuery, [
      orderId,
      orderData.value,
      orderData.creationDate,
    ]);

    // Remover items antigos
    await client.query("DELETE FROM items WHERE order_id = $1", [orderId]);

    // Inserir novos items
    const itemsQuery = `
            INSERT INTO items (order_id, product_id, quantity, price)
            VALUES ($1, $2, $3, $4)
            RETURNING id, product_id, quantity, price
        `;

    const itemsPromises = orderData.items.map((item) =>
      client.query(itemsQuery, [
        orderId,
        item.productId,
        item.quantity,
        item.price,
      ]),
    );

    const itemsResults = await Promise.all(itemsPromises);

    await client.query("COMMIT");

    // Mapear resposta
    const response = mapper.mapToResponse(
      orderResult.rows[0],
      itemsResults.map((r) => r.rows[0]),
    );

    res.status(200).json({
      success: true,
      message: "Pedido atualizado com sucesso",
      data: response,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("❌ Erro ao atualizar pedido:", {
      error: error.message,
      orderId: req.params.orderId,
      body: req.body,
      timestamp: new Date().toISOString(),
    });

    let statusCode = 500;
    let errorMessage = "Erro interno do servidor";

    if (
      error.message.includes("obrigatórios") ||
      error.message.includes("inválido")
    ) {
      statusCode = 400;
      errorMessage = "Dados inválidos";
    }

    res.status(statusCode).json({
      error: errorMessage,
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    client.release();
  }
};

/**
 * Deletar pedido
 * DELETE /order/:orderId
 */
const deleteOrder = async (req, res) => {
  const { orderId } = req.params;
  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    // Validar orderId
    if (!orderId || orderId.trim() === "") {
      await client.query("ROLLBACK");
      return res.status(400).json({
        error: "Requisição inválida",
        message: "ID do pedido é obrigatório",
        timestamp: new Date().toISOString(),
      });
    }

    // Verificar se pedido existe
    const checkQuery = "SELECT * FROM orders WHERE order_id = $1";
    const checkResult = await client.query(checkQuery, [orderId]);

    if (checkResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({
        error: "Não encontrado",
        message: `Pedido com ID ${orderId} não encontrado`,
        timestamp: new Date().toISOString(),
      });
    }

    // Deletar items (ON DELETE CASCADE faz isso automaticamente, mas por segurança)
    await client.query("DELETE FROM items WHERE order_id = $1", [orderId]);

    // Deletar pedido
    await client.query("DELETE FROM orders WHERE order_id = $1", [orderId]);

    await client.query("COMMIT");

    res.status(200).json({
      success: true,
      message: `Pedido ${orderId} deletado com sucesso`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("❌ Erro ao deletar pedido:", {
      error: error.message,
      orderId: req.params.orderId,
      timestamp: new Date().toISOString(),
    });

    res.status(500).json({
      error: "Erro interno do servidor",
      message: error.message,
      timestamp: new Date().toISOString(),
    });
  } finally {
    client.release();
  }
};

module.exports = {
  createOrder,
  getOrderById,
  listOrders,
  updateOrder,
  deleteOrder,
};
