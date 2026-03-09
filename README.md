# API de Pedidos

API RESTful para gerenciamento de pedidos desenvolvida com Node.js e PostgreSQL.

## 📋 Funcionalidades

- ✅ Criar pedido
- ✅ Buscar pedido por ID
- ✅ Listar todos os pedidos
- ✅ Atualizar pedido
- ✅ Excluir pedido

## 🛠️ Tecnologias

- Node.js
- Express
- PostgreSQL
- JWT (opcional)

## 🚀 Como executar

1. Clone o repositório
2. Instale as dependências: `npm install`
3. Configure as variáveis de ambiente: `cp .env.example .env`
4. Crie o banco de dados PostgreSQL
5. Execute as migrations: `psql -U postgres -d pedidos_db -f src/sql/schema.sql`
6. Inicie o servidor: `npm run dev`

## 📚 Documentação da API

### Criar pedido
`POST /order`

### Buscar pedido
`GET /order/:orderId`

### Listar pedidos
`GET /order/list`

### Atualizar pedido
`PUT /order/:orderId`

### Deletar pedido
`DELETE /order/:orderId`