# API de Pedidos

API REST desenvolvida em **Node.js + Express + PostgreSQL** para gerenciamento de pedidos e seus itens.

Este projeto foi desenvolvido como parte de um **teste técnico**, implementando operações completas de CRUD, persistência em banco de dados e documentação com Swagger.

---

# Tecnologias Utilizadas

* Node.js
* Express.js
* PostgreSQL
* JWT (autenticação)
* Swagger (documentação da API)
* dotenv
* CORS

---

# Estrutura do Projeto

```
src
│
├── config
│   └── swagger.js
│
├── controllers
│   └── orderController.js
│
├── database
│   └── postgres.js
│
├── middlewares
│   └── auth.js
│
├── routes
│   └── orderRoutes.js
│
├── utils
│   └── mapper.js
│
├── app.js
└── server.js
```

---

# Pré-requisitos

Antes de executar o projeto, você precisa ter instalado:

* Node.js (versão 18 ou superior)
* PostgreSQL
* npm ou yarn
* Insomnia ou Postman (para testar a API)

---

# Instalação do Projeto

Clone o repositório:

```bash
git clone <url-do-repositorio>
```

Entre na pasta:

```bash
cd pedidos-api
```

Instale as dependências:

```bash
npm install
```

---

# Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto.

Exemplo:

```
PORT=3000

DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=pedidos_db

JWT_SECRET=supersecret
NODE_ENV=development
```

---

# Criação do Banco de Dados

Abra o terminal e acesse o PostgreSQL:

```bash
psql -U postgres
```

Crie o banco:

```sql
CREATE DATABASE pedidos_db;
```

Acesse o banco:

```sql
\c pedidos_db
```

---

# Criação das Tabelas

Execute o seguinte SQL:

```sql
CREATE TABLE orders (
    order_id VARCHAR(50) PRIMARY KEY,
    value NUMERIC(10,2) NOT NULL,
    creation_date TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    order_id VARCHAR(50) REFERENCES orders(order_id) ON DELETE CASCADE,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    price NUMERIC(10,2) NOT NULL
);
```

---

# Executando a Aplicação

Modo desenvolvimento:

```bash
npm run dev
```

ou

```bash
node src/server.js
```

Servidor iniciado em:

```
http://localhost:3000
```

---

# Documentação da API

A documentação Swagger pode ser acessada em:

```
http://localhost:3000/api-docs
```

Ela permite visualizar e testar todos os endpoints da API.

---

# Endpoints da API

## Criar Pedido

POST `/order`

Exemplo de body:

```json
{
  "numeroPedido": "v10089030vdb",
  "valorTotal": 10000,
  "dataCriacao": "2023-07-19T12:24:11.529Z",
  "items": [
    {
      "idItem": 2437,
      "quantidadelItem": 10,
      "valorItem": 1000
    },
    {
      "idItem": 2436,
      "quantidadelItem": 5,
      "valorItem": 450
    }
  ]
}
```

---

## Buscar Pedido por ID

GET

```
/order/{orderId}
```

Exemplo:

```
GET /order/v10089030vdb
```

---

## Listar Pedidos

GET

```
/order/list
```

Suporta paginação:

```
/order/list?page=1&limit=10
```

---

## Atualizar Pedido

PUT

```
/order/{orderId}
```

Exemplo:

```json
{
  "numeroPedido": "v10089030vdb",
  "valorTotal": 5000,
  "dataCriacao": "2023-07-20T13:15:30Z",
  "items": [
    {
      "idItem": 2434,
      "quantidadelItem": 2,
      "valorItem": 1000
    }
  ]
}
```

---

## Remover Pedido

DELETE

```
/order/{orderId}
```

---

# Health Check

Endpoint utilizado para verificar se a API está ativa:

```
GET /health
```

---

# Exemplo de Fluxo de Teste

1. Criar pedido
2. Buscar pedido por ID
3. Listar pedidos
4. Atualizar pedido
5. Deletar pedido

Todos os endpoints podem ser testados diretamente no Swagger ou via ferramentas como **Insomnia/Postman**.

---

# Autor

Projeto desenvolvido para avaliação técnica de backend utilizando **Node.js e PostgreSQL**.
