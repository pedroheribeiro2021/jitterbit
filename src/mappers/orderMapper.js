const calculateOrderTotal = require("../utils/calculateOrderTotal");

/**
 * Converte JSON recebido para formato do banco
 */
function mapOrderRequestToEntity(data) {
  const totalValue = calculateOrderTotal(data.items);

  return {
    order_id: data.order_id,
    value: totalValue,
    creation_date: new Date(data.creation_date),
  };
}

/**
 * Mapeia itens
 */
function mapItems(orderId, items) {
  return items.map((item) => ({
    order_id: orderId,
    product_id: item.product_id,
    quantity: item.quantity,
    price: item.price,
  }));
}

module.exports = {
  mapOrderRequestToEntity,
  mapItems,
};
