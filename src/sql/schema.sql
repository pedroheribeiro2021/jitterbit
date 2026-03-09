-- =====================================================
-- SCRIPT DE CRIAÇÃO DO BANCO DE DADOS PARA API DE PEDIDOS
-- =====================================================

-- Remover banco de dados existente (cuidado em produção!)
DROP DATABASE IF EXISTS pedidos_db;

-- Criar banco de dados
CREATE DATABASE pedidos_db;

-- Conectar ao banco de dados
\c pedidos_db;

-- =====================================================
-- TABELA: orders
-- =====================================================
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    value DECIMAL(15, 2) NOT NULL,
    creation_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- TABELA: items
-- =====================================================
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price DECIMAL(15, 2) NOT NULL CHECK (price >= 0),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- =====================================================
-- ÍNDICES PARA MELHOR PERFORMANCE
-- =====================================================
CREATE INDEX idx_items_order_id ON items(order_id);
CREATE INDEX idx_orders_creation_date ON orders(creation_date DESC);

-- =====================================================
-- FUNÇÃO PARA ATUALIZAR TIMESTAMP
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- =====================================================
-- TRIGGER PARA ATUALIZAR updated_at
-- =====================================================
CREATE TRIGGER update_orders_updated_at
    BEFORE UPDATE ON orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- COMENTÁRIOS NAS TABELAS
-- =====================================================
COMMENT ON TABLE orders IS 'Tabela de pedidos';
COMMENT ON TABLE items IS 'Tabela de itens dos pedidos';
COMMENT ON COLUMN orders.order_id IS 'Identificador único do pedido';
COMMENT ON COLUMN orders.value IS 'Valor total do pedido';
COMMENT ON COLUMN orders.creation_date IS 'Data de criação do pedido';
COMMENT ON COLUMN items.product_id IS 'ID do produto';
COMMENT ON COLUMN items.quantity IS 'Quantidade do item';
COMMENT ON COLUMN items.price IS 'Preço unitário do item';

-- =====================================================
-- DADOS DE EXEMPLO (OPCIONAL)
-- =====================================================
INSERT INTO orders (order_id, value, creation_date) VALUES
('v10089016vdb', 10000.00, '2023-07-19T12:24:11.529Z'),
('v10089017vdb', 25000.00, '2023-07-20T10:15:30.000Z');

INSERT INTO items (order_id, product_id, quantity, price) VALUES
('v10089016vdb', 2434, 1, 1000.00),
('v10089016vdb', 2435, 2, 4500.00),
('v10089017vdb', 2436, 3, 8333.33);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================
SELECT 'Banco de dados criado com sucesso!' as status;
SELECT COUNT(*) as total_orders FROM orders;
SELECT COUNT(*) as total_items FROM items;