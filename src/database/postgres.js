/**
 * Módulo de conexão com PostgreSQL
 * @module database/postgres
 */

const { Pool } = require("pg");
require("dotenv").config();

// Configuração do pool de conexões
const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Configurações do pool
  max: 20, // máximo de conexões simultâneas
  idleTimeoutMillis: 30000, // tempo máximo que uma conexão pode ficar ociosa
  connectionTimeoutMillis: 2000, // tempo máximo para estabelecer conexão

  // Validação de conexão
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Evento de erro no pool
pool.on("error", (err) => {
  console.error("Erro inesperado no pool de conexões:", err);
  process.exit(-1);
});

/**
 * Testa a conexão com o banco de dados
 * @returns {Promise<boolean>} True se conectado com sucesso
 */
const testConnection = async () => {
  try {
    const client = await pool.connect();
    console.log("✅ Conexão com PostgreSQL estabelecida com sucesso!");

    // Testar query simples
    const result = await client.query("SELECT NOW() as current_time");
    console.log(`🕒 Horário do banco: ${result.rows[0].current_time}`);

    client.release();
    return true;
  } catch (error) {
    console.error("❌ Erro ao conectar ao PostgreSQL:", error.message);
    return false;
  }
};

/**
 * Executa uma query no banco de dados
 * @param {string} text - SQL query
 * @param {Array} params - Parâmetros da query
 * @returns {Promise<Object>} Resultado da query
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;

    // Log em desenvolvimento
    if (process.env.NODE_ENV === "development") {
      console.log("📊 Query executada:", {
        text,
        duration: `${duration}ms`,
        rows: result.rowCount,
      });
    }

    return result;
  } catch (error) {
    console.error("❌ Erro na query:", { text, error: error.message });
    throw error;
  }
};

module.exports = {
  pool,
  query,
  testConnection,
};