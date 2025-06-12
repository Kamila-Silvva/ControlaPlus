import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressoContext } from "../../../context/ProgressoContext";
import ModalMeta from "../../shared/ModalMeta";
import styles from "../../../styles/Projecao.module.css";

const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const MetasInvestimentos = () => {
  const navigate = useNavigate();
  const progressoContext = useContext(ProgressoContext);
  const etapas = progressoContext?.etapas;
  const etapaAtual = progressoContext?.etapaAtual;
  const navegarParaEtapa = progressoContext?.navegarParaEtapa;

  const initialState = {
    descricao: "",
    valorTotal: "",
    tipo: "Meta",
    prazoMeses: "1",
  };
  const [form, setForm] = useState(initialState);
  const [metas, setMetas] = useState([]);
  const [itemEditando, setItemEditando] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [rendaTotalMensal, setRendaTotalMensal] = useState(0);
  const [gastosFixosTotaisMensais, setGastosFixosTotaisMensais] = useState(0);

  const formatarMoeda = (valor) =>
    (valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  const fetchRendaTotalMensal = useCallback(async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return 0;

    try {
      const response = await fetch("http://localhost:3001/api/rendas", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        console.error(
          "Erro ao buscar rendas para total em Metas:",
          await response.json()
        );
        return 0;
      }
      const rendas = await response.json();
      const totalMensal = rendas.reduce((sum, r) => {
        if (r.frequencia === "Mensal") {
          return sum + r.valor;
        }
        return sum;
      }, 0);
      setRendaTotalMensal(totalMensal);
      return totalMensal;
    } catch (err) {
      console.error("Erro ao buscar renda total para Metas:", err);
      return 0;
    }
  }, []);

  const fetchGastosFixosTotaisMensais = useCallback(async () => {
    const token = localStorage.getItem("userToken");
    if (!token) return 0;

    try {
      const response = await fetch("http://localhost:3001/api/gastos", {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        console.error(
          "Erro ao buscar gastos para total em Metas:",
          await response.json()
        );
        return 0;
      }
      const gastos = await response.json();
      const totalMensal = gastos.reduce((sum, g) => {
        if (g.frequencia === "Mensal") {
          return sum + g.valor;
        }
        return sum;
      }, 0);
      setGastosFixosTotaisMensais(totalMensal);
      return totalMensal;
    } catch (err) {
      console.error("Erro ao buscar gastos fixos totais para Metas:", err);
      return 0;
    }
  }, []);

  useEffect(() => {
    const fetchMetasAndTotals = async () => {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("userToken");
      if (!token) {
        setError("Usuário não autenticado. Redirecionando para login...");
        setTimeout(() => navigate("/login"), 2000);
        setLoading(false);
        return;
      }
      try {
        await fetchRendaTotalMensal();
        await fetchGastosFixosTotaisMensais();

        const response = await fetch("http://localhost:3001/api/metas", {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("userToken");
            localStorage.removeItem("currentUser");
            navigate("/login");
            throw new Error("Sessão expirada. Faça login novamente.");
          }
          const dataError = await response
            .json()
            .catch(() => ({ message: "Erro desconhecido ao buscar metas." }));
          throw new Error(
            dataError.message || `Erro ao buscar metas: ${response.statusText}`
          );
        }
        const data = await response.json();
        setMetas(
          data.map((meta) => ({
            ...meta,
            valorParcela: meta.valorTotal / meta.prazoMeses,
          }))
        );
      } catch (err) {
        setError(err.message);
        console.error("Erro ao buscar metas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchMetasAndTotals();
  }, [navigate, fetchRendaTotalMensal, fetchGastosFixosTotaisMensais]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name === "valor" ? "valorTotal" : name;
    setForm((prev) => ({ ...prev, [fieldName]: value }));
    if (error) setError(null);
  };

  const totalMetasMensaisExistentes = metas.reduce((sum, meta) => {
    return sum + (meta.valorParcela || 0);
  }, 0);

  const totalDespesasMensais =
    gastosFixosTotaisMensais + totalMetasMensaisExistentes;

  const saldoLiquidoMensal = rendaTotalMensal - totalDespesasMensais;

  const adicionarMeta = async () => {
    if (!form.descricao.trim()) {
      setError("Insira uma descrição válida");
      return;
    }
    const valorNum = parseFloat(form.valorTotal);
    const prazoNum = parseInt(form.prazoMeses, 10);
    if (isNaN(valorNum) || valorNum <= 0) {
      setError("O valor total deve ser um número positivo");
      return;
    }
    if (isNaN(prazoNum) || prazoNum <= 0) {
      setError("O prazo deve ser um número inteiro e positivo");
      return;
    }

    const valorParcelaMensalNovaMeta = valorNum / prazoNum;

    if (valorParcelaMensalNovaMeta > saldoLiquidoMensal) {
      setError(
        `A parcela mensal desta nova meta (${formatarMoeda(
          valorParcelaMensalNovaMeta
        )}) excede o saldo disponível (${formatarMoeda(saldoLiquidoMensal)}).`
      );
      return;
    }

    const novaMetaPayload = {
      descricao: form.descricao,
      valorTotal: valorNum,
      tipo: form.tipo,
      prazoMeses: prazoNum,
    };
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/metas", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(novaMetaPayload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao criar meta.");
      setMetas([
        ...metas,
        { ...data, valorParcela: data.valorTotal / data.prazoMeses },
      ]);
      setForm(initialState);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removerMeta = async (id) => {
    if (
      window.confirm("Tem certeza que deseja remover esta meta/investimento?")
    ) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/metas/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const dataError = await response
            .json()
            .catch(() => ({ message: "Erro desconhecido ao remover meta." }));
          throw new Error(dataError.message || "Erro ao remover meta.");
        }
        setMetas(metas.filter((meta) => meta.id !== id));
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const editarItem = (item) => {
    setItemEditando({
      ...item,
      valorTotal: item.valorTotal.toString(),
      prazoMeses: item.prazoMeses.toString(),
    });
  };

  const salvarEdicao = async (dadosEditadosModal) => {
    const valorNum = parseFloat(dadosEditadosModal.valor);
    const prazoNum = parseInt(dadosEditadosModal.prazoMeses, 10);

    if (isNaN(valorNum) || valorNum <= 0) {
      throw new Error("O valor para edição é inválido e deve ser positivo.");
    }
    if (isNaN(prazoNum) || prazoNum <= 0) {
      throw new Error(
        "O prazo para edição é inválido e deve ser um número inteiro positivo."
      );
    }

    const valorParcelaMensalEditada = valorNum / prazoNum;

    const metaAntiga = metas.find((m) => m.id === dadosEditadosModal.id);
    const parcelaAntiga = metaAntiga
      ? metaAntiga.valorTotal / metaAntiga.prazoMeses
      : 0;

    const saldoAjustadoParaValidacaoDaEdicao =
      saldoLiquidoMensal + parcelaAntiga;

    if (valorParcelaMensalEditada > saldoAjustadoParaValidacaoDaEdicao) {
      throw new Error(
        `A nova parcela mensal (${formatarMoeda(
          valorParcelaMensalEditada
        )}) excede o saldo disponível para metas (${formatarMoeda(
          saldoAjustadoParaValidacaoDaEdicao
        )}).`
      );
    }

    const payload = {
      id: dadosEditadosModal.id,
      descricao: dadosEditadosModal.descricao,
      valorTotal: valorNum,
      tipo: dadosEditadosModal.tipo,
      prazoMeses: prazoNum,
    };
    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/metas/${dadosEditadosModal.id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Erro ao atualizar meta.");

      setMetas(
        metas.map((m) =>
          m.id === dadosEditadosModal.id
            ? { ...data, valorParcela: data.valorTotal / data.prazoMeses }
            : m
        )
      );
      setItemEditando(null);
      setError(null);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const avancarEtapa = () => {
    navigate("/projecao");
  };
  const voltarEtapa = () => {
    navigate("/gastos-fixos");
  };

  const componentStyles = {
    loadingContainer: {
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      height: "80vh",
      fontSize: "1.2rem",
      color: "var(--roxo-escuro)",
    },
  };

  if (loading && metas.length === 0) {
    return (
      <div style={componentStyles.loadingContainer}>Carregando metas...</div>
    );
  }

  return (
    <div className={styles.containerPrincipal}>
      <div className={styles.cabecalho}>
        <h1 className={styles.tituloApp}>
          Controla<span className={styles.destaqueTitulo}>+</span>
        </h1>
        <h2 className={styles.subtitulo}>Metas e Investimentos</h2>
        <p className={styles.textoDescritivo}>
          Defina seus objetivos financeiros de curto, médio e longo prazo.
        </p>
      </div>
      {etapas && etapaAtual !== undefined && navegarParaEtapa && (
        <div className={styles.barraProgresso}>
          {etapas.map((etapa, index) => (
            <div
              key={index}
              className={styles.etapaContainer}
              onClick={() => navegarParaEtapa(etapa)}
            >
              <div
                className={`${styles.marcadorEtapa} ${
                  index === etapaAtual
                    ? styles["etapa-ativa"]
                    : styles["etapa-inativa"]
                }`}
              >
                {index + 1}
              </div>
              <span
                className={`${styles["rotulo-etapa"]} ${
                  index === etapaAtual
                    ? styles["rotulo-ativo"]
                    : styles["rotulo-inativo"]
                }`}
              >
                {etapa}
              </span>
            </div>
          ))}
        </div>
      )}
      <div
        className={
          styles["formulario-container-metas"] || styles["formulario-container"]
        }
      >
        <h3 className={styles["titulo-secao"]}>Minhas Metas e Investimentos</h3>
        {error && (
          <div
            className={`${styles.alerta} ${styles["saldo-negativo-projecao"]}`}
            style={{ marginBottom: "1rem" }}
          >
            <p className={styles["alerta-text"]}>⚠️ {error}</p>
          </div>
        )}
        {loading && metas.length > 0 && (
          <p
            style={{
              textAlign: "center",
              margin: "1rem",
              color: "var(--roxo-principal)",
            }}
          >
            Processando...
          </p>
        )}

        <div className={styles["resumo-grid"]}>
          <div className={styles["resumo-card"]}>
            <h3 className={styles["resumo-card-title"]}>
              Receita Total Mensal:
            </h3>
            <p
              className={`${styles["resumo-card-value"]} ${styles.positivoSaldoProjecao}`}
            >
              {formatarMoeda(rendaTotalMensal)}
            </p>
          </div>
          <div className={styles["resumo-card"]}>
            <h3 className={styles["resumo-card-title"]}>
              Total de Despesas (Mensais):
            </h3>{" "}

            <p
              className={`${styles["resumo-card-value"]} ${styles.negativoSaldoProjecao}`}
            >
              {formatarMoeda(totalDespesasMensais)}
            </p>
          </div>
          <div className={styles["resumo-card"]}>
            <h3 className={styles["resumo-card-title"]}>
              Saldo Líquido Mensal:
            </h3>
            <p
              className={`${styles["resumo-card-value"]} ${
                saldoLiquidoMensal >= 0
                  ? styles.positivoSaldoProjecao
                  : styles.negativoSaldoProjecao
              }`}
            >
              {formatarMoeda(saldoLiquidoMensal)}
            </p>
          </div>
        </div>

        <div className={styles["grupo-campos"]}>
          <div className={styles["campo-formulario"]}>
            <label className={styles.rotulo}>Descrição*</label>
            <input
              className={styles["campo-input"]}
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Ex: Viagem para Europa"
              disabled={loading}
            />
          </div>
          <div className={styles["campo-formulario"]}>
            <label className={styles.rotulo}>Valor Total (R$)*</label>
            <input
              type="number"
              className={styles["campo-input"]}
              name="valor"
              value={form.valorTotal}
              onChange={handleChange}
              placeholder="10000.00"
              step="0.01"
              min="0"
              disabled={loading}
            />
          </div>
          <div className={styles["campo-formulario"]}>
            <label className={styles.rotulo}>Tipo*</label>
            <select
              className={styles["campo-select"]}
              name="tipo"
              value={form.tipo}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Meta">Meta</option>
              <option value="Investimento">Investimento</option>
            </select>
          </div>
          <div className={styles["campo-formulario"]}>
            <label className={styles.rotulo}>Prazo (meses)*</label>
            <input
              type="number"
              className={styles["campo-input"]}
              name="prazoMeses"
              value={form.prazoMeses}
              onChange={handleChange}
              min="1"
              disabled={loading}
            />
          </div>
          <button
            className={styles["botao-adicionar"]}
            onClick={adicionarMeta}
            disabled={loading}
          >
            {loading ? "Adicionando..." : "Adicionar"}
          </button>
        </div>

        {metas.length > 0 && (
          <div className={styles["lista-container"]}>
            <h4 className={styles["titulo-lista"]}>
              Suas Metas e Investimentos
            </h4>
            <div className={styles["itens-lista"]}>
              {metas.map((meta) => (
                <div key={meta.id} className={styles["item-lista"]}>
                  <div>
                    <p className={styles["descricao-item"]}>
                      {meta.descricao}{" "}
                      <span
                        className={`${styles.badge} ${
                          meta.tipo === "Meta"
                            ? styles["badge-meta"]
                            : styles["badge-investimento"]
                        }`}
                      >
                        {meta.tipo}
                      </span>
                    </p>
                    <p className={styles["detalhes-item"]}>
                      <strong>Total:</strong> {formatarMoeda(meta.valorTotal)}
                    </p>
                    <p className={styles["detalhes-item"]}>
                      <strong>Parcela mensal:</strong>{" "}
                      {formatarMoeda(meta.valorParcela)}
                    </p>
                    <p className={styles["detalhes-item"]}>
                      <strong>Prazo:</strong> {meta.prazoMeses} meses
                    </p>
                  </div>
                  <div className={styles["botoes-acao"]}>
                    <button
                      className={styles["botao-editar"]}
                      onClick={() => editarItem(meta)}
                      disabled={loading}
                    >
                      Editar
                    </button>
                    <button
                      className={styles["botao-remover"]}
                      onClick={() => removerMeta(meta.id)}
                      disabled={loading}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        <div className={styles["controle-navegacao"]}>
          <button
            className={styles["botao-voltar"]}
            onClick={voltarEtapa}
            disabled={loading}
          >
            Voltar (Gastos)
          </button>
          <button
            className={styles.botao}
            onClick={avancarEtapa}
            disabled={loading || (metas.length === 0 && !error)}
          >
            Avançar (Projeção)
          </button>
        </div>
      </div>
      {itemEditando && (
        <ModalMeta
          item={itemEditando}
          onSave={salvarEdicao}
          onClose={() => {
            setItemEditando(null);
            setError(null);
          }}
        />
      )}
    </div>
  );
};

export default MetasInvestimentos;
