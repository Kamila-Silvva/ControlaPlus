import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// Helper para chamadas API com token
const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

// --- SUB-COMPONENTES DE UI (SimpleBarChart, MetaProgressBar - sem alterações na definição) ---
const SimpleBarChart = ({
  title,
  data,
  color,
  noDataMessage = "Sem dados suficientes.",
}) => {
  const maxValue = Math.max(...data.map((d) => d.value), 0);
  return (
    <div style={styles.chartContainer}>
      <h3 style={styles.chartTitle}>{title}</h3>
      {data.length > 0 ? (
        data.map((item) => (
          <div key={item.label} style={styles.barWrapper}>
            <span style={styles.barLabel}>{item.label}</span>
            <div style={styles.barBackground}>
              <div
                style={{
                  ...styles.barFill,
                  width:
                    maxValue > 0 ? `${(item.value / maxValue) * 100}%` : "0%",
                  backgroundColor: color,
                }}
              />
            </div>
            <span style={styles.barValue}>{item.formattedValue}</span>
          </div>
        ))
      ) : (
        <p style={styles.emptyStateText}>{noDataMessage}</p>
      )}
    </div>
  );
};

const MetaProgressBar = ({ descricao, valorPago, valorTotal, cor }) => {
  const percentual = valorTotal > 0 ? (valorPago / valorTotal) * 100 : 0;
  const formatarMoeda = (valor) =>
    (valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  return (
    <div style={styles.metaItemContainer}>
      <div style={styles.metaItemHeader}>
        <span style={styles.metaItemLabel}>{descricao}</span>
        <span style={styles.metaItemPercentage}>{percentual.toFixed(0)}%</span>
      </div>
      <div style={styles.barBackground}>
        <div
          style={{
            ...styles.barFill,
            width: `${Math.min(100, percentual)}%`,
            backgroundColor: cor,
          }}
        />
      </div>
      <div style={styles.metaItemValues}>
        <span>{formatarMoeda(valorPago)}</span>
        <span>{formatarMoeda(valorTotal)}</span>
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL DO DASHBOARD ---
const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [goalProgressList, setGoalProgressList] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [topEmotions, setTopEmotions] = useState([]);
  const [saldosMensaisReais, setSaldosMensaisReais] = useState({}); // Mudou de projetados para reais
  const [nomeUsuario, setNomeUsuario] = useState("");
  const [error, setError] = useState("");

  const formatarMoeda = (valor) =>
    (valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  const meses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro",
  ];

  const carregarDadosDoDashboard = useCallback(async () => {
    console.log(
      "Dashboard: Recarregando dados do backend (via useCallback)..."
    );
    setLoading(true);
    setError("");

    const token = localStorage.getItem("userToken");
    const usuarioAtual = JSON.parse(localStorage.getItem("currentUser"));

    if (usuarioAtual && usuarioAtual.nome) {
      setNomeUsuario(usuarioAtual.nome.split(" ")[0]); // Pega o primeiro nome
    }

    if (!token) {
      navigate("/login"); // Se não há token, redireciona para login
      return;
    }

    try {
      // Busca dados da projeção (rendas, gastos, metas) do backend
      const projecaoResponse = await fetch(
        "http://localhost:3001/api/dados-completos-usuario",
        {
          headers: getAuthHeaders(),
        }
      );
      if (!projecaoResponse.ok) {
        if (
          projecaoResponse.status === 401 ||
          projecaoResponse.status === 403
        ) {
          localStorage.removeItem("userToken");
          localStorage.removeItem("currentUser");
          navigate("/login");
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        const errData = await projecaoResponse
          .json()
          .catch(() => ({
            message: "Erro ao processar resposta do servidor.",
          })); // Adicionado fallback
        throw new Error(
          errData.message ||
            `Erro ao buscar dados da projeção: ${projecaoResponse.statusText}`
        );
      }
      const dadosProjecao = await projecaoResponse.json();
      const { metasInvestimentos = [] } = dadosProjecao; // Adicionado fallback para metasInvestimentos

      // ATUALIZADO: Buscar TODOS os registros mensais do backend
      const todosRegistrosResponse = await fetch(
        "http://localhost:3001/api/todos-registros-mensais",
        { headers: getAuthHeaders() }
      );
      if (!todosRegistrosResponse.ok) {
        if (
          todosRegistrosResponse.status === 401 ||
          todosRegistrosResponse.status === 403
        ) {
          localStorage.removeItem("userToken");
          localStorage.removeItem("currentUser");
          navigate("/login");
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        const errData = await todosRegistrosResponse
          .json()
          .catch(() => ({
            message: "Erro ao processar resposta do servidor.",
          }));
        throw new Error(
          errData.message || "Falha ao buscar todos os registros mensais"
        );
      }
      const registrosMensais = await todosRegistrosResponse.json(); // Objeto: { "Janeiro": [], "Fevereiro": [] ... }

      const progressoIndividualMetas = metasInvestimentos.map((meta) => {
        let parcelasPagasReais = 0;
        Object.values(registrosMensais).forEach((registrosDeUmMes) => {
          (registrosDeUmMes || []).forEach((registro) => {
            if (
              registro.originalId === `meta-${meta.id}` &&
              registro.tipo === "gasto"
            ) {
              // Compara com displayId da meta
              parcelasPagasReais++;
            }
          });
        });
        const valorParcela =
          meta.prazoMeses > 0 ? meta.valorTotal / meta.prazoMeses : 0;
        const valorPagoReal = parcelasPagasReais * valorParcela;
        return {
          id: meta.id,
          descricao: meta.descricao,
          valorPago: valorPagoReal,
          valorTotal: meta.valorTotal,
        };
      });
      setGoalProgressList(progressoIndividualMetas);

      const todosGastosReais = Object.values(registrosMensais)
        .flat()
        .filter((r) => r && r.tipo === "gasto");

      const gastosPorCategoria = todosGastosReais
        .filter((g) => !g.isCompulsivo && g.categoria)
        .reduce((acc, gasto) => {
          acc[gasto.categoria] = (acc[gasto.categoria] || 0) + gasto.valor;
          return acc;
        }, {});
      const topCategoriasData = Object.entries(gastosPorCategoria)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([label, value]) => ({
          label,
          value,
          formattedValue: formatarMoeda(value),
        }));
      setTopCategories(topCategoriasData);

      const gastosPorEmocao = todosGastosReais
        .filter((g) => g.isCompulsivo && g.emocao)
        .reduce((acc, gasto) => {
          acc[gasto.emocao] = (acc[gasto.emocao] || 0) + gasto.valor;
          return acc;
        }, {});
      const topEmocoesData = Object.entries(gastosPorEmocao)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 3)
        .map(([label, value]) => ({
          label,
          value,
          formattedValue: formatarMoeda(value),
        }));
      setTopEmotions(topEmocoesData);

      const saldosCalculados = {};
      meses.forEach((nomeDoMes) => {
        // Backend retorna chaves com primeira letra maiúscula para registrosMensais
        const registrosDoMes = registrosMensais[nomeDoMes] || [];
        const receitaRealMes = registrosDoMes
          .filter((r) => r && r.tipo === "receita")
          .reduce((sum, r) => sum + r.valor, 0);
        const gastoRealMes = registrosDoMes
          .filter((r) => r && r.tipo === "gasto")
          .reduce((sum, r) => sum + r.valor, 0);
        saldosCalculados[nomeDoMes] = receitaRealMes - gastoRealMes;
      });
      setSaldosMensaisReais(saldosCalculados);
    } catch (err) {
      setError(err.message);
      console.error("Dashboard Erro:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    carregarDadosDoDashboard();

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        console.log("Dashboard: Aba ficou visível, recarregando...");
        carregarDadosDoDashboard();
      }
    };

    const handleRegistrosMensaisUpdated = (event) => {
      console.log(
        "Dashboard: Evento 'registrosMensaisUpdated' recebido, recarregando."
      );
      carregarDadosDoDashboard();
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener(
      "registrosMensaisUpdated",
      handleRegistrosMensaisUpdated
    );

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener(
        "registrosMensaisUpdated",
        handleRegistrosMensaisUpdated
      );
    };
  }, [carregarDadosDoDashboard]);

  const handleLogout = () => {
    localStorage.removeItem("userToken");
    localStorage.removeItem("currentUser");
    navigate("/login");
  };

  if (loading) {
    return <div style={styles.loadingContainer}>Carregando Dashboard...</div>;
  }
  if (error) {
    return (
      <div style={{ ...styles.card, ...styles.errorCard }}>
        <p>{error}</p>
        <button
          onClick={carregarDadosDoDashboard}
          style={styles.buttonTryAgain}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <div>
          <h1 style={styles.mainTitle}>Seu Painel, {nomeUsuario}!</h1>
          <p style={styles.headerSubtitle}>
            Insights rápidos e acesso ao seu controle mensal.
          </p>
        </div>
        <div style={styles.headerActions}>
          <button
            onClick={() => navigate("/projecao")}
            style={styles.actionButton}
          >
            Alterar Projeção
          </button>
          <button
            onClick={handleLogout}
            style={{ ...styles.actionButton, ...styles.logoutButton }}
          >
            Sair
          </button>
        </div>
      </header>

      <div style={styles.insightsGrid}>
        <div style={styles.card}>
          <h3 style={styles.cardTitle}>Progresso das Metas</h3>
          {goalProgressList.length > 0 ? (
            goalProgressList.map((meta) => (
              <MetaProgressBar
                key={meta.id}
                descricao={meta.descricao}
                valorPago={meta.valorPago}
                valorTotal={meta.valorTotal}
                cor="var(--roxo-principal)"
              />
            ))
          ) : (
            <p style={styles.emptyStateText}>Nenhuma meta definida ainda.</p>
          )}
        </div>

        <div style={styles.card}>
          <SimpleBarChart
            title="Top 3 Categorias de Gastos (Realizados)"
            data={topCategories}
            color="var(--roxo-claro)"
            noDataMessage="Nenhum gasto (não compulsivo) registrado."
          />
        </div>
        <div style={styles.card}>
          <SimpleBarChart
            title="Principais Gatilhos Emocionais"
            data={topEmotions}
            color="var(--cor-perigo)"
            noDataMessage="Nenhum gasto compulsivo registrado."
          />
        </div>
      </div>

      <h2 style={styles.sectionTitle}>Acessar Controle Mensal</h2>
      <div style={styles.monthsGrid}>
        {meses.map((mes) => (
          <div
            key={mes}
            style={styles.monthCard}
            onClick={() => navigate(`/controle-mensal/${mes.toLowerCase()}`)}
          >
            <h3 style={styles.monthCardTitle}>{mes}</h3>
            <p style={styles.monthCardSubtitle}>Saldo do Mês (Realizado):</p>
            <span
              style={{
                ...styles.monthCardValue,
                color:
                  (saldosMensaisReais[mes] || 0) >= 0
                    ? "var(--cor-sucesso)"
                    : "var(--cor-perigo)",
              }}
            >
              {formatarMoeda(saldosMensaisReais[mes] || 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- ESTILOS CSS-IN-JS ---
const styles = {
  container: {
    padding: "2rem",
    maxWidth: "1400px",
    margin: "0 auto",
    fontFamily: "Arial, sans-serif",
    color: "var(--cinza-escuro)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "3rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid var(--cinza-claro)",
  },
  mainTitle: {
    fontSize: "2rem",
    color: "var(--roxo-escuro)",
    margin: 0,
  },
  headerSubtitle: {
    margin: "0.25rem 0 0 0",
    fontSize: "1rem",
    color: "var(--cinza-medio)",
  },
  headerActions: {
    display: "flex",
    gap: "1rem",
  },
  actionButton: {
    backgroundColor: "var(--roxo-principal)",
    color: "var(--branco)",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem 1.4rem",
    fontSize: "0.9rem",
    fontWeight: "600",
    cursor: "pointer",
    boxShadow: "var(--sombra)",
    transition: "background-color 0.2s",
  },
  logoutButton: {
    backgroundColor: "var(--cor-perigo)",
  },
  insightsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
    gap: "2rem",
    marginBottom: "3rem",
  },
  card: {
    backgroundColor: "var(--branco)",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "var(--sombra)",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  cardTitle: {
    margin: "0 0 1rem 0",
    fontSize: "1.1rem",
    color: "var(--cinza-escuro)",
    fontWeight: "600",
  },
  sectionTitle: {
    textAlign: "center",
    fontSize: "1.8rem",
    color: "var(--roxo-escuro)",
    margin: "4rem 0 2rem 0",
  },
  monthsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
    gap: "1.5rem",
  },
  monthCard: {
    backgroundColor: "var(--branco)",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "var(--sombra)",
    textAlign: "center",
    cursor: "pointer",
    transition: "transform 0.2s, box-shadow 0.2s",
  },
  monthCardTitle: {
    margin: "0 0 0.5rem 0",
    color: "var(--roxo-principal)",
    fontSize: "1.2rem",
  },
  monthCardSubtitle: { margin: "0", fontSize: "0.8rem", color: "#666" },
  monthCardValue: { fontSize: "1.2rem", fontWeight: "bold" },
  chartContainer: { display: "flex", flexDirection: "column", gap: "0.8rem" },
  chartTitle: {
    margin: "0 0 0.5rem 0",
    fontSize: "1.1rem",
    color: "var(--cinza-escuro)",
    fontWeight: "600",
  },
  barWrapper: { display: "flex", alignItems: "center", gap: "8px" },
  barLabel: {
    width: "90px",
    fontSize: "0.8rem",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  barBackground: {
    flex: 1,
    height: "18px",
    backgroundColor: "#f0f0f0",
    borderRadius: "4px",
  },
  barFill: {
    height: "100%",
    borderRadius: "4px",
    transition: "width 0.3s ease",
  },
  barValue: {
    width: "70px",
    textAlign: "right",
    fontSize: "0.8rem",
    fontWeight: "bold",
  },
  metaItemContainer: { marginBottom: "1rem" },
  metaItemHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: "0.3rem",
  },
  metaItemLabel: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "var(--cinza-medio)",
  },
  metaItemPercentage: {
    fontSize: "0.85rem",
    fontWeight: "bold",
    color: "var(--roxo-principal)",
  },
  metaItemValues: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "0.8rem",
    color: "#666",
    marginTop: "0.3rem",
  },
  emptyStateText: {
    color: "#999",
    fontSize: "0.9rem",
    textAlign: "center",
    padding: "1rem 0",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "1.5rem",
    color: "var(--roxo-escuro)",
  },
  errorCard: {
    textAlign: "center",
    color: "var(--cor-perigo)",
    borderColor: "var(--cor-perigo)",
    borderWidth: "1px",
    borderStyle: "solid",
    backgroundColor: "var(--branco)",
    padding: "1.5rem",
    borderRadius: "12px",
    boxShadow: "var(--sombra)",
    margin: "2rem auto",
    maxWidth: "600px",
  },
  buttonTryAgain: {
    backgroundColor: "var(--roxo-principal)",
    color: "var(--branco)",
    border: "none",
    borderRadius: "8px",
    padding: "0.7rem 1.3rem",
    fontSize: "0.9rem",
    fontWeight: "bold",
    cursor: "pointer",
    marginTop: "1rem",
    transition: "background-color 0.2s ease",
  },
};

// Injetor de variáveis CSS
if (!document.getElementById("app-color-vars")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "app-color-vars";
  styleSheet.innerText = `
      :root {
        --roxo-principal: #9747FF; --roxo-escuro: #6C63FF; --roxo-claro: #a855f7;
        --cinza-escuro: #2F2E41; --cinza-medio: #0D0C0B; --cinza-claro: #F5F5F5;
        --branco: #FFFFFF; --sombra: 0 4px 6px rgba(0, 0, 0, 0.05);
        --cor-sucesso: #28a745; --cor-perigo: #dc3545;
      }
    `;
  document.head.appendChild(styleSheet);
}

export default Dashboard;
