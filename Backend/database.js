const sqlite3 = require("sqlite3").verbose();
const DBSOURCE = "finance_app.sqlite";

const db = new sqlite3.Database(DBSOURCE, (err) => {
  if (err) {
    console.error(err.message);
    throw err;
  } else {
    console.log("Conectado ao banco de dados SQLite.");
    db.serialize(() => {
      // Para garantir que os comandos rodem em sequência
      // Tabela de Usuários (já deve existir)
      db.run(
        `CREATE TABLE IF NOT EXISTS users (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                nome TEXT NOT NULL,
                email TEXT NOT NULL UNIQUE,
                senha TEXT NOT NULL,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP
            )`,
        (err) => {
          if (err) console.log("Erro ao criar tabela users:", err.message);
          else console.log("Tabela users OK.");
        }
      );

      // NOVO: Tabela de Rendas
      db.run(
        `CREATE TABLE IF NOT EXISTS rendas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                descricao TEXT NOT NULL,
                valor REAL NOT NULL,
                frequencia TEXT NOT NULL,
                mesRecebimento TEXT,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE 
            )`,
        (err) => {
          if (err) console.log("Erro ao criar tabela rendas:", err.message);
          else console.log("Tabela rendas OK.");
        }
      );

      // NOVO: Tabela de Gastos
      db.run(
        `CREATE TABLE IF NOT EXISTS gastos (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                descricao TEXT NOT NULL,
                valor REAL NOT NULL,
                frequencia TEXT NOT NULL,
                mesPagamento TEXT,
                categoria TEXT NOT NULL,
                isCompulsivo BOOLEAN DEFAULT FALSE,
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )`,
        (err) => {
          if (err) console.log("Erro ao criar tabela gastos:", err.message);
          else console.log("Tabela gastos OK.");
        }
      );

      // NOVO: Tabela de Metas
      db.run(
        `CREATE TABLE IF NOT EXISTS metas (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id INTEGER NOT NULL,
                descricao TEXT NOT NULL,
                valorTotal REAL NOT NULL,
                tipo TEXT NOT NULL, -- 'Meta' ou 'Investimento'
                prazoMeses INTEGER NOT NULL,
                valorParcela REAL, -- Calculado, mas pode ser útil armazenar
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )`,
        (err) => {
          if (err) console.log("Erro ao criar tabela metas:", err.message);
          else console.log("Tabela metas OK.");
        }
      );

      // NOVO: Tabela de Registros Mensais Realizados
      // (Onde o usuário confirma/adiciona os lançamentos de cada mês)
      db.run(
        `CREATE TABLE IF NOT EXISTS registros_mensais (
                id TEXT PRIMARY KEY, -- Pode ser um UUID gerado no frontend ou backend
                user_id INTEGER NOT NULL,
                mes TEXT NOT NULL, -- Ex: "Janeiro", "Fevereiro"
                descricao TEXT NOT NULL,
                valor REAL NOT NULL,
                data TEXT NOT NULL, -- Data do lançamento real (YYYY-MM-DD)
                categoria TEXT,
                tipo TEXT NOT NULL, -- 'receita' ou 'gasto'
                isCompulsivo BOOLEAN DEFAULT FALSE,
                emocao TEXT,
                originalId TEXT, -- ID do item planejado, se aplicável
                criado_em DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            )`,
        (err) => {
          if (err)
            console.log("Erro ao criar tabela registros_mensais:", err.message);
          else console.log("Tabela registros_mensais OK.");
        }
      );
    });
  }
});

module.exports = db;
