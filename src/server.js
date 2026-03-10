/**
 * Ponto de entrada da aplicação
 * @module server
 */

require("dotenv").config();
const app = require("./app");
const { testConnection } = require("./database/postgres");

// =====================================================
// CONFIGURAÇÕES
// =====================================================
const PORT = process.env.PORT || 3000;
const ENV = process.env.NODE_ENV || "development";

// =====================================================
// FUNÇÃO PARA INICIAR O SERVIDOR
// =====================================================
const startServer = async () => {
  try {
    // Testar conexão com o banco de dados
    console.log("🔄 Testando conexão com o banco de dados...");
    const dbConnected = await testConnection();

    if (!dbConnected) {
      console.warn("⚠️  Servidor iniciando sem conexão com o banco de dados!");
    } else {
      console.log("✅ Banco de dados conectado!");
    }

    // Iniciar servidor
    const server = app.listen(PORT, () => {
      console.log("\n" + "=".repeat(50));
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`🌍 Ambiente: ${ENV}`);
      console.log(`📅 Iniciado em: ${new Date().toLocaleString()}`);
      console.log("=".repeat(50));
      console.log("\n📌 Endpoints disponíveis:");
      console.log(`   POST   → http://localhost:${PORT}/order`);
      console.log(`   GET    → http://localhost:${PORT}/order/:orderId`);
      console.log(`   GET    → http://localhost:${PORT}/order/list`);
      console.log(`   PUT    → http://localhost:${PORT}/order/:orderId`);
      console.log(`   DELETE → http://localhost:${PORT}/order/:orderId`);
      console.log(`   GET    → http://localhost:${PORT}/health`);
      console.log(`   GET    → http://localhost:${PORT}/`);
      console.log("=".repeat(50) + "\n");
    });

    // Tratamento de erros não capturados
    process.on("uncaughtException", (err) => {
      console.error("💥 Exceção não capturada:", err);
      gracefulShutdown(server);
    });

    process.on("unhandledRejection", (reason, promise) => {
      console.error("💥 Rejeição não tratada em:", promise, "razão:", reason);
    });

    // Tratamento de sinais de encerramento
    process.on("SIGTERM", () => gracefulShutdown(server));
    process.on("SIGINT", () => gracefulShutdown(server));
  } catch (error) {
    console.error("❌ Erro ao iniciar servidor:", error);
    process.exit(1);
  }
};

// =====================================================
// FUNÇÃO PARA ENCERRAMENTO GRACEFUL
// =====================================================
const gracefulShutdown = (server) => {
  console.log(
    "\n🔄 Recebido sinal de encerramento. Iniciando shutdown graceful...",
  );

  server.close(() => {
    console.log("✅ Servidor HTTP fechado.");

    // Fechar conexões do banco de dados
    const { pool } = require("./database/postgres");
    pool.end(() => {
      console.log("✅ Conexões com banco de dados fechadas.");
      console.log("👋 Servidor encerrado.");
      process.exit(0);
    });
  });

  // Forçar encerramento após 10 segundos
  setTimeout(() => {
    console.error("⚠️  Shutdown graceful falhou. Forçando encerramento...");
    process.exit(1);
  }, 10000);
};

// =====================================================
// INICIAR SERVIDOR
// =====================================================
startServer();
