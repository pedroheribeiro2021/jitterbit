/**
 * Utilitário para mapeamento de dados entre formato da API e banco de dados
 * @module utils/mapper
 */

/**
 * Remove sufixo do número do pedido (ex: v10089015vdb-01 → v10089015vdb)
 * @param {string} numeroPedido - Número do pedido completo
 * @returns {string} Order ID sem sufixo
 */
const extractOrderId = (numeroPedido) => {
  if (!numeroPedido || typeof numeroPedido !== "string") {
    throw new Error("Número do pedido inválido");
  }

  // Se tiver hífen, pega a parte antes do hífen
  if (numeroPedido.includes("-")) {
    return numeroPedido.split("-")[0];
  }

  return numeroPedido;
};

/**
 * Converte string de data para formato ISO
 * @param {string} dataString - Data em formato string
 * @returns {string} Data no formato ISO
 */
const parseDate = (dataString) => {
  if (!dataString) {
    throw new Error("Data de criação é obrigatória");
  }

  try {
    const date = new Date(dataString);
    if (isNaN(date.getTime())) {
      throw new Error("Data inválida");
    }
    return date.toISOString();
  } catch (error) {
    throw new Error(`Erro ao processar data: ${error.message}`);
  }
};

/**
 * Valida e converte valor para número
 * @param {any} value - Valor a ser convertido
 * @param {string} fieldName - Nome do campo para mensagem de erro
 * @returns {number} Valor numérico
 */
const parseNumber = (value, fieldName) => {
  const num = Number(value);

  if (isNaN(num)) {
    throw new Error(`${fieldName} deve ser um número válido`);
  }

  if (num < 0) {
    throw new Error(`${fieldName} não pode ser negativo`);
  }

  return num;
};

/**
 * Mapeia os dados do pedido recebido para o formato do banco de dados
 * @param {Object} requestData - Dados recebidos na requisição
 * @returns {Object} Dados mapeados para o banco
 */
const mapOrderData = (requestData) => {
  // Validação básica
  if (!requestData) {
    throw new Error("Dados do pedido não fornecidos");
  }

  // Validação de campos obrigatórios
  const requiredFields = ["numeroPedido", "valorTotal", "dataCriacao", "items"];
  const missingFields = requiredFields.filter((field) => !requestData[field]);

  if (missingFields.length > 0) {
    throw new Error(
      `Campos obrigatórios ausentes: ${missingFields.join(", ")}`,
    );
  }

  if (!Array.isArray(requestData.items) || requestData.items.length === 0) {
    throw new Error("Items devem ser um array não vazio");
  }

  try {
    // Extrair orderId
    const orderId = extractOrderId(requestData.numeroPedido);

    // Processar data
    const creationDate = parseDate(requestData.dataCriacao);

    // Processar valor total
    const value = parseNumber(requestData.valorTotal, "valorTotal");

    // Processar items
    const items = requestData.items.map((item, index) => {
      try {
        return {
          productId: parseNumber(item.idItem, `items[${index}].idItem`),
          quantity: parseNumber(
            item.quantidadelItem,
            `items[${index}].quantidadelItem`,
          ),
          price: parseNumber(item.valorItem, `items[${index}].valorItem`),
        };
      } catch (error) {
        throw new Error(`Erro no item ${index + 1}: ${error.message}`);
      }
    });

    // Calcular valor total baseado nos itens (validação)
    const calculatedTotal = items.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0,
    );

    // Se houver diferença significativa, avisar (mas não bloquear)
    if (Math.abs(calculatedTotal - value) > 0.01) {
      console.warn(
        `⚠️ Valor total (${value}) difere do calculado pelos itens (${calculatedTotal})`,
      );
    }

    return {
      orderId,
      value,
      creationDate,
      items,
    };
  } catch (error) {
    throw new Error(`Erro ao mapear dados: ${error.message}`);
  }
};

/**
 * Mapeia dados do banco para formato de resposta da API
 * @param {Object} dbOrder - Pedido do banco
 * @param {Array} dbItems - Itens do banco
 * @returns {Object} Dados formatados para resposta
 */
const mapToResponse = (dbOrder, dbItems = []) => {
  return {
    orderId: dbOrder.order_id,
    value: parseFloat(dbOrder.value),
    creationDate: dbOrder.creation_date,
    items: dbItems.map((item) => ({
      productId: item.product_id,
      quantity: item.quantity,
      price: parseFloat(item.price),
      id: item.id,
    })),
    createdAt: dbOrder.created_at,
    updatedAt: dbOrder.updated_at,
  };
};

module.exports = {
  extractOrderId,
  parseDate,
  parseNumber,
  mapOrderData,
  mapToResponse,
};
