// server.js
const express = require("express");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const db = require("./database.js"); // Sua configuração do banco de dados SQLite

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET =
  process.env.JWT_SECRET ||
  "sua-chave-secreta-super-segura-aqui-altere-em-producao";

// Middlewares
app.use(cors());
app.use(express.json());

// Middleware de Autenticação JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) {
    console.log("Token não fornecido ou formato inválido na requisição.");
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log("Erro na verificação do token:", err.message);
      return res.sendStatus(403);
    }
    req.user = user;
    next();
  });
};

// --- ROTAS DE AUTENTICAÇÃO ---
app.post("/api/cadastro", (req, res) => {
  const { nome, email, senha } = req.body;
  if (!nome || !email || !senha) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }
  if (senha.length < 6) {
    return res
      .status(400)
      .json({ message: "A senha deve ter pelo menos 6 caracteres." });
  }
  const checkEmailSql = "SELECT email FROM users WHERE email = ?";
  db.get(checkEmailSql, [email], (err, row) => {
    if (err) {
      console.error("Erro ao verificar email no cadastro:", err.message);
      return res
        .status(500)
        .json({ message: "Erro interno do servidor ao verificar email." });
    }
    if (row) {
      return res
        .status(400)
        .json({ message: "Este email já está cadastrado." });
    }
    bcrypt.hash(senha, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Erro ao fazer hash da senha:", err.message);
        return res
          .status(500)
          .json({ message: "Erro interno do servidor ao processar senha." });
      }
      const insertSql = "INSERT INTO users (nome, email, senha) VALUES (?,?,?)";
      const params = [nome, email, hashedPassword];
      db.run(insertSql, params, function (err) {
        if (err) {
          console.error("Erro ao inserir usuário:", err.message);
          return res
            .status(500)
            .json({ message: "Erro ao cadastrar usuário." });
        }
        res.status(201).json({
          message: "Usuário cadastrado com sucesso!",
          userId: this.lastID,
        });
      });
    });
  });
});

// ATUALIZADO: Rota de Login agora verifica se o usuário possui dados financeiros
app.post("/api/login", (req, res) => {
  const { email, senha } = req.body;
  if (!email || !senha)
    return res.status(400).json({ message: "Email e senha são obrigatórios." });

  const sql = "SELECT * FROM users WHERE email = ?";
  db.get(sql, [email], (err, user) => {
    if (err) {
      console.error("Erro ao buscar usuário no login:", err.message);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    if (!user)
      return res.status(400).json({ message: "Email ou senha incorretos." });

    bcrypt.compare(senha, user.senha, (err, isMatch) => {
      if (err) {
        console.error("Erro ao comparar senhas:", err.message);
        return res.status(500).json({ message: "Erro ao verificar senha." });
      }
      if (isMatch) {
        const { senha, ...userData } = user;
        const accessToken = jwt.sign(
          { id: user.id, email: user.email },
          JWT_SECRET,
          { expiresIn: "1h" }
        );

        // Verificar se o usuário possui dados financeiros
        const sqlCheckData = `
          SELECT 
            (EXISTS (SELECT 1 FROM rendas WHERE user_id = ? LIMIT 1)) OR
            (EXISTS (SELECT 1 FROM gastos WHERE user_id = ? LIMIT 1)) OR
            (EXISTS (SELECT 1 FROM metas WHERE user_id = ? LIMIT 1))
          AS possuiDados`;

        db.get(sqlCheckData, [user.id, user.id, user.id], (err, row) => {
          if (err) {
            console.error(
              "Erro ao verificar dados financeiros do usuário:",
              err.message
            );
            // Em caso de erro aqui, podemos assumir que não possui dados ou logar o erro e prosseguir
            // Para este exemplo, vamos assumir que não possui dados para forçar o fluxo de planejamento
            return res.status(200).json({
              message:
                "Login bem-sucedido! (Não foi possível verificar dados financeiros)",
              user: userData,
              token: accessToken,
              possuiDadosFinanceiros: false,
            });
          }

          res.status(200).json({
            message: "Login bem-sucedido!",
            user: userData,
            token: accessToken,
            possuiDadosFinanceiros: !!row.possuiDados, // Converte 0/1 para false/true
          });
        });
      } else {
        res.status(400).json({ message: "Email ou senha incorretos." });
      }
    });
  });
});

app.post("/api/solicitar-redefinicao", (req, res) => {
  const { email } = req.body;
  if (!email)
    return res.status(400).json({ message: "O campo email é obrigatório." });
  const sql = "SELECT id, email FROM users WHERE email = ?";
  db.get(sql, [email], (err, user) => {
    if (err) {
      console.error("Erro ao buscar usuário para redefinição:", err.message);
      return res.status(500).json({ message: "Erro interno do servidor." });
    }
    console.log(
      `Solicitação de redefinição para: ${email}. Código simulado: 123456`
    );
    res.status(200).json({
      message:
        "Se o email estiver cadastrado, um código de verificação foi enviado (simulado).",
    });
  });
});

const CODIGO_REDEFINICAO_MOCK = "123456";
app.post("/api/verificar-codigo-redefinicao", (req, res) => {
  const { email, codigo } = req.body;
  if (!codigo)
    return res.status(400).json({ message: "Código é obrigatório." });

  if (codigo === CODIGO_REDEFINICAO_MOCK) {
    console.log(
      `Código verificado com sucesso para solicitação associada a: ${email}`
    );
    res.status(200).json({ message: "Código verificado com sucesso." });
  } else {
    res
      .status(400)
      .json({ message: "Código de verificação inválido ou expirado." });
  }
});

app.post("/api/redefinir-senha", (req, res) => {
  const { email, novaSenha, confirmarSenha } = req.body;
  if (!email || !novaSenha || !confirmarSenha)
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  if (novaSenha.length < 6)
    return res
      .status(400)
      .json({ message: "A nova senha deve ter pelo menos 6 caracteres." });
  if (novaSenha !== confirmarSenha)
    return res.status(400).json({ message: "As senhas não coincidem." });

  db.get("SELECT id FROM users WHERE email = ?", [email], (err, user) => {
    if (err) {
      console.error(
        "Erro ao verificar usuário para redefinição de senha:",
        err.message
      );
      return res.status(500).json({ message: "Erro ao verificar usuário." });
    }
    if (!user)
      return res
        .status(404)
        .json({ message: "Usuário não encontrado para redefinição." });

    bcrypt.hash(novaSenha, 10, (err, hashedPassword) => {
      if (err) {
        console.error("Erro ao fazer hash da nova senha:", err.message);
        return res
          .status(500)
          .json({ message: "Erro interno do servidor ao processar senha." });
      }
      const updateSql = "UPDATE users SET senha = ? WHERE email = ?";
      db.run(updateSql, [hashedPassword, email], function (err) {
        if (err) {
          console.error("Erro ao redefinir senha no banco:", err.message);
          return res.status(500).json({ message: "Erro ao redefinir senha." });
        }
        if (this.changes === 0)
          return res.status(404).json({
            message:
              "Usuário não encontrado para atualizar senha (isso não deveria acontecer).",
          });
        console.log(`Senha redefinida para: ${email}`);
        res.status(200).json({ message: "Senha redefinida com sucesso!" });
      });
    });
  });
});

// --- ROTAS CRUD PARA RENDAS (PROTEGIDAS) ---
app.post("/api/rendas", authenticateToken, (req, res) => {
  const { descricao, valor, frequencia, mesRecebimento } = req.body;
  const userId = req.user.id;
  if (!descricao || valor === undefined || !frequencia)
    return res
      .status(400)
      .json({ message: "Descrição, valor e frequência são obrigatórios." });
  if (frequencia !== "Mensal" && !mesRecebimento)
    return res.status(400).json({
      message: "Mês de recebimento é obrigatório para frequência não mensal.",
    });
  const sql = `INSERT INTO rendas (user_id, descricao, valor, frequencia, mesRecebimento) VALUES (?,?,?,?,?)`;
  const params = [
    userId,
    descricao,
    parseFloat(valor),
    frequencia,
    frequencia === "Mensal" ? null : mesRecebimento,
  ];
  db.run(sql, params, function (err) {
    if (err) {
      console.error("Erro ao criar renda:", err.message);
      return res.status(500).json({ message: "Erro ao criar renda." });
    }
    res.status(201).json({
      id: this.lastID,
      user_id: userId,
      descricao,
      valor: parseFloat(valor),
      frequencia,
      mesRecebimento: params[4],
    });
  });
});

app.get("/api/rendas", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT * FROM rendas WHERE user_id = ?";
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar rendas:", err.message);
      return res.status(500).json({ message: "Erro ao buscar rendas." });
    }
    res.json(rows);
  });
});

app.put("/api/rendas/:id", authenticateToken, (req, res) => {
  const { descricao, valor, frequencia, mesRecebimento } = req.body;
  const userId = req.user.id;
  const rendaId = req.params.id;
  if (!descricao || valor === undefined || !frequencia)
    return res
      .status(400)
      .json({ message: "Descrição, valor e frequência são obrigatórios." });
  if (frequencia !== "Mensal" && !mesRecebimento)
    return res.status(400).json({
      message: "Mês de recebimento é obrigatório para frequência não mensal.",
    });
  db.get(
    "SELECT id FROM rendas WHERE id = ? AND user_id = ?",
    [rendaId, userId],
    (err, row) => {
      if (err)
        return res.status(500).json({ message: "Erro ao verificar renda." });
      if (!row)
        return res.status(404).json({
          message: "Renda não encontrada ou não pertence a este usuário.",
        });
      const sql = `UPDATE rendas SET descricao = ?, valor = ?, frequencia = ?, mesRecebimento = ? WHERE id = ?`;
      const params = [
        descricao,
        parseFloat(valor),
        frequencia,
        frequencia === "Mensal" ? null : mesRecebimento,
        rendaId,
      ];
      db.run(sql, params, function (err) {
        if (err) {
          console.error("Erro ao atualizar renda:", err.message);
          return res.status(500).json({ message: "Erro ao atualizar renda." });
        }
        if (this.changes === 0)
          return res.status(404).json({
            message:
              "Renda não encontrada para atualizar (apesar da verificação).",
          });
        res.json({
          id: parseInt(rendaId),
          user_id: userId,
          descricao,
          valor: parseFloat(valor),
          frequencia,
          mesRecebimento: params[3],
        });
      });
    }
  );
});

app.delete("/api/rendas/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const rendaId = req.params.id;
  db.get(
    "SELECT id FROM rendas WHERE id = ? AND user_id = ?",
    [rendaId, userId],
    (err, row) => {
      if (err)
        return res.status(500).json({ message: "Erro ao verificar renda." });
      if (!row)
        return res.status(404).json({
          message: "Renda não encontrada ou não pertence a este usuário.",
        });
      const sql = "DELETE FROM rendas WHERE id = ?";
      db.run(sql, [rendaId], function (err) {
        if (err) {
          console.error("Erro ao deletar renda:", err.message);
          return res.status(500).json({ message: "Erro ao deletar renda." });
        }
        if (this.changes === 0)
          return res.status(404).json({
            message:
              "Renda não encontrada para deletar (apesar da verificação).",
          });
        res.status(200).json({ message: "Renda deletada com sucesso." });
      });
    }
  );
});

// --- ROTAS CRUD PARA GASTOS (PROTEGIDAS) ---
app.post("/api/gastos", authenticateToken, (req, res) => {
  const {
    descricao,
    valor,
    frequencia,
    mesPagamento,
    categoria,
    isCompulsivo,
  } = req.body;
  const userId = req.user.id;
  if (!descricao || valor === undefined || !frequencia || !categoria)
    return res.status(400).json({
      message: "Descrição, valor, frequência e categoria são obrigatórios.",
    });
  if (frequencia !== "Mensal" && !mesPagamento)
    return res.status(400).json({
      message: "Mês de pagamento é obrigatório para frequência não mensal.",
    });
  const sql = `INSERT INTO gastos (user_id, descricao, valor, frequencia, mesPagamento, categoria, isCompulsivo) VALUES (?,?,?,?,?,?,?)`;
  const isCompulsivoDb = isCompulsivo ? 1 : 0;
  const params = [
    userId,
    descricao,
    parseFloat(valor),
    frequencia,
    frequencia === "Mensal" ? null : mesPagamento,
    categoria,
    isCompulsivoDb,
  ];
  db.run(sql, params, function (err) {
    if (err) {
      console.error("Erro ao criar gasto:", err.message);
      return res.status(500).json({ message: "Erro ao criar gasto." });
    }
    res.status(201).json({
      id: this.lastID,
      user_id: userId,
      descricao,
      valor: parseFloat(valor),
      frequencia,
      mesPagamento: params[4],
      categoria,
      isCompulsivo: !!isCompulsivo,
    });
  });
});

app.get("/api/gastos", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT * FROM gastos WHERE user_id = ?";
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar gastos:", err.message);
      return res.status(500).json({ message: "Erro ao buscar gastos." });
    }
    const gastosFormatados = rows.map((gasto) => ({
      ...gasto,
      isCompulsivo: !!gasto.isCompulsivo,
    }));
    res.json(gastosFormatados);
  });
});

app.put("/api/gastos/:id", authenticateToken, (req, res) => {
  const {
    descricao,
    valor,
    frequencia,
    mesPagamento,
    categoria,
    isCompulsivo,
  } = req.body;
  const userId = req.user.id;
  const gastoId = req.params.id;
  if (!descricao || valor === undefined || !frequencia || !categoria)
    return res.status(400).json({
      message: "Descrição, valor, frequência e categoria são obrigatórios.",
    });
  if (frequencia !== "Mensal" && !mesPagamento)
    return res.status(400).json({
      message: "Mês de pagamento é obrigatório para frequência não mensal.",
    });
  db.get(
    "SELECT id FROM gastos WHERE id = ? AND user_id = ?",
    [gastoId, userId],
    (err, row) => {
      if (err)
        return res.status(500).json({ message: "Erro ao verificar gasto." });
      if (!row)
        return res.status(404).json({
          message: "Gasto não encontrado ou não pertence a este usuário.",
        });
      const isCompulsivoDb = isCompulsivo ? 1 : 0;
      const sql = `UPDATE gastos SET descricao = ?, valor = ?, frequencia = ?, mesPagamento = ?, categoria = ?, isCompulsivo = ? WHERE id = ?`;
      const params = [
        descricao,
        parseFloat(valor),
        frequencia,
        frequencia === "Mensal" ? null : mesPagamento,
        categoria,
        isCompulsivoDb,
        gastoId,
      ];
      db.run(sql, params, function (err) {
        if (err) {
          console.error("Erro ao atualizar gasto:", err.message);
          return res.status(500).json({ message: "Erro ao atualizar gasto." });
        }
        if (this.changes === 0)
          return res
            .status(404)
            .json({ message: "Gasto não encontrado para atualizar." });
        res.json({
          id: parseInt(gastoId),
          user_id: userId,
          descricao,
          valor: parseFloat(valor),
          frequencia,
          mesPagamento: params[3],
          categoria,
          isCompulsivo: !!isCompulsivo,
        });
      });
    }
  );
});

app.delete("/api/gastos/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const gastoId = req.params.id;
  db.get(
    "SELECT id FROM gastos WHERE id = ? AND user_id = ?",
    [gastoId, userId],
    (err, row) => {
      if (err)
        return res.status(500).json({ message: "Erro ao verificar gasto." });
      if (!row)
        return res.status(404).json({
          message: "Gasto não encontrado ou não pertence a este usuário.",
        });
      const sql = "DELETE FROM gastos WHERE id = ?";
      db.run(sql, [gastoId], function (err) {
        if (err) {
          console.error("Erro ao deletar gasto:", err.message);
          return res.status(500).json({ message: "Erro ao deletar gasto." });
        }
        if (this.changes === 0)
          return res
            .status(404)
            .json({ message: "Gasto não encontrado para deletar." });
        res.status(200).json({ message: "Gasto deletado com sucesso." });
      });
    }
  );
});

// --- ROTAS CRUD PARA METAS (PROTEGIDAS) ---
app.post("/api/metas", authenticateToken, (req, res) => {
  const { descricao, valorTotal, tipo, prazoMeses } = req.body;
  const userId = req.user.id;
  if (
    !descricao ||
    valorTotal === undefined ||
    !tipo ||
    prazoMeses === undefined
  )
    return res.status(400).json({
      message: "Descrição, valor total, tipo e prazo são obrigatórios.",
    });
  const valorTotalNum = parseFloat(valorTotal);
  const prazoMesesNum = parseInt(prazoMeses, 10);
  if (valorTotalNum <= 0 || prazoMesesNum <= 0)
    return res
      .status(400)
      .json({ message: "Valor total e prazo devem ser positivos." });
  const valorParcelaCalculada = valorTotalNum / prazoMesesNum;
  const sql = `INSERT INTO metas (user_id, descricao, valorTotal, tipo, prazoMeses, valorParcela) VALUES (?,?,?,?,?,?)`;
  const params = [
    userId,
    descricao,
    valorTotalNum,
    tipo,
    prazoMesesNum,
    valorParcelaCalculada,
  ];
  db.run(sql, params, function (err) {
    if (err) {
      console.error("Erro ao criar meta:", err.message);
      return res.status(500).json({ message: "Erro ao criar meta." });
    }
    res.status(201).json({
      id: this.lastID,
      user_id: userId,
      descricao,
      valorTotal: valorTotalNum,
      tipo,
      prazoMeses: prazoMesesNum,
      valorParcela: valorParcelaCalculada,
    });
  });
});

app.get("/api/metas", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT * FROM metas WHERE user_id = ?";
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar metas:", err.message);
      return res.status(500).json({ message: "Erro ao buscar metas." });
    }
    const metasFormatadas = rows.map((meta) => ({
      ...meta,
      valorParcela:
        meta.valorTotal && meta.prazoMeses > 0
          ? meta.valorTotal / meta.prazoMeses
          : 0,
    }));
    res.json(metasFormatadas);
  });
});

app.put("/api/metas/:id", authenticateToken, (req, res) => {
  const { descricao, valorTotal, tipo, prazoMeses } = req.body;
  const userId = req.user.id;
  const metaId = req.params.id;
  if (
    !descricao ||
    valorTotal === undefined ||
    !tipo ||
    prazoMeses === undefined
  )
    return res.status(400).json({
      message: "Descrição, valor total, tipo e prazo são obrigatórios.",
    });
  const valorTotalNum = parseFloat(valorTotal);
  const prazoMesesNum = parseInt(prazoMeses, 10);
  if (valorTotalNum <= 0 || prazoMesesNum <= 0)
    return res
      .status(400)
      .json({ message: "Valor total e prazo devem ser positivos." });
  const valorParcelaCalculada = valorTotalNum / prazoMesesNum;
  db.get(
    "SELECT id FROM metas WHERE id = ? AND user_id = ?",
    [metaId, userId],
    (err, row) => {
      if (err)
        return res.status(500).json({ message: "Erro ao verificar meta." });
      if (!row)
        return res.status(404).json({
          message: "Meta não encontrada ou não pertence a este usuário.",
        });
      const sql = `UPDATE metas SET descricao = ?, valorTotal = ?, tipo = ?, prazoMeses = ?, valorParcela = ? WHERE id = ?`;
      const params = [
        descricao,
        valorTotalNum,
        tipo,
        prazoMesesNum,
        valorParcelaCalculada,
        metaId,
      ];
      db.run(sql, params, function (err) {
        if (err) {
          console.error("Erro ao atualizar meta:", err.message);
          return res.status(500).json({ message: "Erro ao atualizar meta." });
        }
        if (this.changes === 0)
          return res
            .status(404)
            .json({ message: "Meta não encontrada para atualizar." });
        res.json({
          id: parseInt(metaId),
          user_id: userId,
          descricao,
          valorTotal: valorTotalNum,
          tipo,
          prazoMeses: prazoMesesNum,
          valorParcela: valorParcelaCalculada,
        });
      });
    }
  );
});

app.delete("/api/metas/:id", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const metaId = req.params.id;
  db.get(
    "SELECT id FROM metas WHERE id = ? AND user_id = ?",
    [metaId, userId],
    (err, row) => {
      if (err)
        return res.status(500).json({ message: "Erro ao verificar meta." });
      if (!row)
        return res.status(404).json({
          message: "Meta não encontrada ou não pertence a este usuário.",
        });
      const sql = "DELETE FROM metas WHERE id = ?";
      db.run(sql, [metaId], function (err) {
        if (err) {
          console.error("Erro ao deletar meta:", err.message);
          return res.status(500).json({ message: "Erro ao deletar meta." });
        }
        if (this.changes === 0)
          return res
            .status(404)
            .json({ message: "Meta não encontrada para deletar." });
        res.status(200).json({ message: "Meta deletada com sucesso." });
      });
    }
  );
});

// --- ENDPOINT PARA BUSCAR TODOS OS DADOS PARA A PROJEÇÃO ---
app.get("/api/dados-completos-usuario", authenticateToken, async (req, res) => {
  const userId = req.user.id;
  try {
    const rendasPromise = new Promise((resolve, reject) => {
      db.all("SELECT * FROM rendas WHERE user_id = ?", [userId], (err, rows) =>
        err ? reject(err) : resolve(rows || [])
      );
    });
    const gastosPromise = new Promise((resolve, reject) => {
      db.all("SELECT * FROM gastos WHERE user_id = ?", [userId], (err, rows) =>
        err
          ? reject(err)
          : resolve(
              (rows || []).map((g) => ({
                ...g,
                isCompulsivo: !!g.isCompulsivo,
              }))
            )
      );
    });
    const metasPromise = new Promise((resolve, reject) => {
      db.all("SELECT * FROM metas WHERE user_id = ?", [userId], (err, rows) =>
        err
          ? reject(err)
          : resolve(
              (rows || []).map((m) => ({
                ...m,
                valorParcela:
                  m.prazoMeses > 0 ? m.valorTotal / m.prazoMeses : 0,
              }))
            )
      );
    });
    const [rendas, gastos, metas] = await Promise.all([
      rendasPromise,
      gastosPromise,
      metasPromise,
    ]);
    res.json({ rendas, gastosFixos: gastos, metasInvestimentos: metas });
  } catch (error) {
    console.error("Erro ao buscar dados completos do usuário:", error.message);
    res.status(500).json({ message: "Erro ao buscar dados para projeção." });
  }
});

// --- ROTAS CRUD PARA REGISTROS MENSAIS (CONTROLE MENSAL) ---
app.get("/api/registros-mensais/:mes", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { mes } = req.params;
  if (!mes) return res.status(400).json({ message: "O mês é obrigatório." });
  const nomeMesFormatado = mes.charAt(0).toUpperCase() + mes.slice(1);
  const sql = "SELECT * FROM registros_mensais WHERE user_id = ? AND mes = ?";
  db.all(sql, [userId, nomeMesFormatado], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar registros mensais:", err.message);
      return res
        .status(500)
        .json({ message: "Erro ao buscar registros do mês." });
    }
    const registrosFormatados = (rows || []).map((r) => ({
      ...r,
      isCompulsivo: !!r.isCompulsivo,
    }));
    res.json(registrosFormatados);
  });
});

// NOVO: Endpoint para buscar TODOS os registros mensais de um usuário
app.get("/api/todos-registros-mensais", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const sql = "SELECT * FROM registros_mensais WHERE user_id = ?";
  db.all(sql, [userId], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar todos os registros mensais:", err.message);
      return res
        .status(500)
        .json({ message: "Erro ao buscar todos os registros." });
    }
    // Agrupa por mês para facilitar no frontend (Dashboard)
    const registrosAgrupados = (rows || []).reduce((acc, r) => {
      const mesRegistro = r.mes;
      if (!acc[mesRegistro]) {
        acc[mesRegistro] = [];
      }
      acc[mesRegistro].push({ ...r, isCompulsivo: !!r.isCompulsivo });
      return acc;
    }, {});
    res.json(registrosAgrupados);
  });
});

app.post("/api/registros-mensais/:mes", authenticateToken, (req, res) => {
  const userId = req.user.id;
  const { mes } = req.params;
  const {
    id,
    descricao,
    valor,
    data,
    categoria,
    tipo,
    isCompulsivo,
    emocao,
    originalId,
  } = req.body;
  if (!id || !descricao || valor === undefined || !data || !tipo)
    return res
      .status(400)
      .json({ message: "ID, descrição, valor, data e tipo são obrigatórios." });
  if (isCompulsivo && !emocao)
    return res
      .status(400)
      .json({ message: "Emoção é obrigatória para gastos compulsivos." });

  const nomeMesFormatado = mes.charAt(0).toUpperCase() + mes.slice(1);
  const sql = `INSERT INTO registros_mensais (id, user_id, mes, descricao, valor, data, categoria, tipo, isCompulsivo, emocao, originalId) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
  const params = [
    id,
    userId,
    nomeMesFormatado,
    descricao,
    parseFloat(valor),
    data,
    categoria || null,
    tipo,
    isCompulsivo ? 1 : 0,
    isCompulsivo ? emocao : null,
    originalId || null,
  ];
  db.run(sql, params, function (err) {
    if (err) {
      if (
        err.message.includes("UNIQUE constraint failed: registros_mensais.id")
      )
        return res
          .status(409)
          .json({
            message: "Erro: ID do registro já existe. Tente novamente.",
          });
      console.error("Erro ao adicionar registro mensal:", err.message);
      return res.status(500).json({ message: "Erro ao adicionar lançamento." });
    }
    res
      .status(201)
      .json({
        ...req.body,
        valor: parseFloat(valor),
        id: id,
        mes: nomeMesFormatado,
        user_id: userId,
      });
  });
});

app.put(
  "/api/registros-mensais/:mes/:registroId",
  authenticateToken,
  (req, res) => {
    const userId = req.user.id;
    const { mes, registroId } = req.params;
    const { descricao, valor, data, categoria, tipo, isCompulsivo, emocao } =
      req.body;
    if (!descricao || valor === undefined || !data || !tipo)
      return res.status(400).json({
        message:
          "Descrição, valor, data e tipo são obrigatórios para atualização.",
      });
    if (isCompulsivo && !emocao)
      return res
        .status(400)
        .json({ message: "Emoção é obrigatória para gastos compulsivos." });

    const nomeMesFormatado = mes.charAt(0).toUpperCase() + mes.slice(1);

    db.get(
      "SELECT * FROM registros_mensais WHERE id = ? AND user_id = ? AND mes = ?",
      [registroId, userId, nomeMesFormatado],
      (err, row) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Erro ao verificar registro." });
        if (!row)
          return res
            .status(404)
            .json({
              message:
                "Registro não encontrado ou não pertence a este usuário/mês.",
            });

        const sql = `UPDATE registros_mensais SET descricao = ?, valor = ?, data = ?, categoria = ?, tipo = ?, isCompulsivo = ?, emocao = ? WHERE id = ? AND user_id = ? AND mes = ?`;
        const params = [
          descricao,
          parseFloat(valor),
          data,
          categoria || null,
          tipo,
          isCompulsivo ? 1 : 0,
          isCompulsivo ? emocao : null,
          registroId,
          userId,
          nomeMesFormatado,
        ];
        db.run(sql, params, function (err) {
          if (err) {
            console.error("Erro ao atualizar registro mensal:", err.message);
            return res
              .status(500)
              .json({ message: "Erro ao atualizar lançamento." });
          }
          if (this.changes === 0)
            return res
              .status(404)
              .json({
                message:
                  "Registro não encontrado para atualizar (apesar da verificação).",
              });
          res.status(200).json({
            id: registroId,
            user_id: userId,
            mes: nomeMesFormatado,
            descricao,
            valor: parseFloat(valor),
            data,
            categoria: categoria || null,
            tipo,
            isCompulsivo: !!isCompulsivo,
            emocao: isCompulsivo ? emocao : null,
            originalId: row.originalId,
          });
        });
      }
    );
  }
);

app.delete(
  "/api/registros-mensais/:mes/:registroId",
  authenticateToken,
  (req, res) => {
    const userId = req.user.id;
    const { mes, registroId } = req.params;
    const nomeMesFormatado = mes.charAt(0).toUpperCase() + mes.slice(1);
    db.get(
      "SELECT * FROM registros_mensais WHERE id = ? AND user_id = ? AND mes = ?",
      [registroId, userId, nomeMesFormatado],
      (err, row) => {
        if (err)
          return res
            .status(500)
            .json({ message: "Erro ao verificar registro." });
        if (!row)
          return res
            .status(404)
            .json({
              message:
                "Registro não encontrado ou não pertence a este usuário/mês.",
            });

        const sql =
          "DELETE FROM registros_mensais WHERE id = ? AND user_id = ? AND mes = ?";
        db.run(sql, [registroId, userId, nomeMesFormatado], function (err) {
          if (err) {
            console.error("Erro ao deletar registro mensal:", err.message);
            return res
              .status(500)
              .json({ message: "Erro ao deletar lançamento." });
          }
          if (this.changes === 0)
            return res
              .status(404)
              .json({
                message:
                  "Registro não encontrado para deletar (apesar da verificação).",
              });
          res.status(200).json({ message: "Lançamento deletado com sucesso." });
        });
      }
    );
  }
);

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
