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
    const { numeroPedido, valorTotal, dataCriacao, items } = req.body;

    if (!numeroPedido || !valorTotal || !dataCriacao || !items) {
      return res.status(400).json({
        error: "Requisição inválida",
        message:
          "Campos obrigatórios ausentes: numeroPedido, valorTotal, dataCriacao",
      });
    }

    await client.query("BEGIN");

    await client.query(
      `
      INSERT INTO orders (order_id, value, creation_date)
      VALUES ($1,$2,$3)
      `,
      [numeroPedido, valorTotal, dataCriacao],
    );

    for (const item of items) {
      await client.query(
        `
        INSERT INTO items (order_id, product_id, quantity, price)
        VALUES ($1,$2,$3,$4)
        `,
        [numeroPedido, item.idItem, item.quantidadelItem, item.valorItem],
      );
    }

    await client.query("COMMIT");

    res.status(201).json({
      success: true,
      message: "Pedido criado com sucesso",
      data: req.body,
    });
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      error: "Erro ao criar pedido",
      message: error.message,
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
    const { numeroPedido, valorTotal, dataCriacao, items } = req.body;

    if (!numeroPedido || !valorTotal || !dataCriacao) {
      return res.status(400).json({
        error: "Dados inválidos",
        message:
          "Campos obrigatórios ausentes: numeroPedido, valorTotal, dataCriacao",
      });
    }

    await client.query("BEGIN");

    const check = await client.query("SELECT * FROM orders WHERE order_id=$1", [
      orderId,
    ]);

    if (check.rows.length === 0) {
      await client.query("ROLLBACK");

      return res.status(404).json({
        error: "Não encontrado",
        message: `Pedido com ID ${orderId} não encontrado`,
      });
    }

    await client.query(
      `
      UPDATE orders
      SET value=$2, creation_date=$3, updated_at=CURRENT_TIMESTAMP
      WHERE order_id=$1
      `,
      [orderId, valorTotal, dataCriacao],
    );

    await client.query("DELETE FROM items WHERE order_id=$1", [orderId]);

    for (const item of items) {
      await client.query(
        `
        INSERT INTO items (order_id, product_id, quantity, price)
        VALUES ($1,$2,$3,$4)
        `,
        [orderId, item.idItem, item.quantidadelItem, item.valorItem],
      );
    }

    await client.query("COMMIT");

    res.json({
      success: true,
      message: "Pedido atualizado com sucesso",
    });
  } catch (error) {
    await client.query("ROLLBACK");

    res.status(500).json({
      error: "Erro ao atualizar pedido",
      message: error.message,
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
