import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressoContext } from "../../../context/ProgressoContext";
import styles from "../../../styles/Projecao.module.css";

const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const PopupAjuste = ({
  itemParaAjuste,
  onAplicar,
  onCancelar,
  formatarMoeda,
}) => {
  const isMeta = itemParaAjuste?.isMeta || false;
  const [dadosAjuste, setDadosAjuste] = useState({
    valor: isMeta
      ? (itemParaAjuste?.valorTotal || 0).toString()
      : (itemParaAjuste?.valor || 0).toString(),
    prazoMeses: (itemParaAjuste?.prazoMeses || 1).toString(),
  });
  const [erroPopup, setErroPopup] = useState("");

  const handleAjusteValor = (e) => {
    setDadosAjuste((prev) => ({ ...prev, valor: e.target.value }));
  };

  const handleAjustePrazo = (e) => {
    const prazo = Math.max(1, Number(e.target.value));
    setDadosAjuste((prev) => ({ ...prev, prazoMeses: prazo.toString() }));
    if (isMeta && prazo > 120) {
      setErroPopup(
        "Prazo muito longo. Considere um valor total menor ou um prazo menor."
      );
    } else {
      setErroPopup("");
    }
  };

  const handleAplicarClick = () => {
    if (isMeta && parseInt(dadosAjuste.prazoMeses, 10) > 120) {
      setErroPopup("Prazo máximo para metas é 120 meses.");
      return;
    }
    if (parseFloat(dadosAjuste.valor) <= 0) {
      setErroPopup("O valor deve ser positivo.");
      return;
    }
    onAplicar({
      ...itemParaAjuste,
      valor: parseFloat(dadosAjuste.valor),
      prazoMeses: parseInt(dadosAjuste.prazoMeses, 10),
    });
  };

  return (
    <div className={styles["modal-overlay"]} onClick={onCancelar}>
      <div
        className={styles["modal-container"]}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>{isMeta ? "Ajustar Meta/Investimento" : "Ajustar Gasto Fixo"}</h3>
        {!isMeta &&
          itemParaAjuste?.frequencia &&
          itemParaAjuste.frequencia !== "Mensal" && (
            <div className={styles["alerta"]}>
              <p>🌍 Este ajuste afetará a entrada original deste item.</p>
            </div>
          )}
        <div className={styles["campo-formulario"]}>
          <p className={styles.rotulo}>
            Descrição: <strong>{itemParaAjuste?.descricao || ""}</strong>
          </p>
        </div>
        <div className={styles["campo-formulario"]}>
          <label className={styles.rotulo}>
            {isMeta ? "Novo Valor Total:" : "Novo Valor do Gasto:"}
          </label>
          <input
            type="number"
            value={dadosAjuste.valor}
            onChange={handleAjusteValor}
            name="valor"
            className={styles["campo-input"]}
            min="0.01"
            step="0.01"
          />
        </div>
        {isMeta && (
          <>
            <div className={styles["campo-formulario"]}>
              <label className={styles.rotulo}>Novo Prazo (meses):</label>
              <input
                type="number"
                value={dadosAjuste.prazoMeses}
                onChange={handleAjustePrazo}
                name="prazoMeses"
                className={styles["campo-input"]}
                min="1"
              />
            </div>
            <div className={styles["campo-formulario"]}>
              <p className={styles.rotulo}>Nova Parcela Mensal:</p>
              <p>
                <strong>
                  {formatarMoeda(
                    parseFloat(dadosAjuste.valor) /
                      parseInt(dadosAjuste.prazoMeses, 10) || 0
                  )}
                </strong>
              </p>
            </div>
          </>
        )}
        {erroPopup && (
          <div className={styles["alerta"]}>
            <p>⚠️ {erroPopup}</p>
          </div>
        )}
        <div className={styles["botoes-modal"]}>
          <button className={styles["botao-secundario"]} onClick={onCancelar}>
            Cancelar
          </button>
          <button
            className={styles.botao}
            onClick={handleAplicarClick}
            disabled={!!erroPopup}
          >
            Aplicar Ajuste
          </button>
        </div>
      </div>
    </div>
  );
};

const Projecao = () => {
  const navigate = useNavigate();
  // Desestruturar navegarParaEtapa do contexto
  const progressoContext = useContext(ProgressoContext);
  const etapas = progressoContext?.etapas;
  const etapaAtual = progressoContext?.etapaAtual;
  const navegarParaEtapa = progressoContext?.navegarParaEtapa;

  const [projecao, setProjecao] = useState([]);
  const [mesExpandido, setMesExpandido] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [mostrarPopupAjuste, setMostrarPopupAjuste] = useState(false);
  const [itemParaAjuste, setItemParaAjuste] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dadosOriginais, setDadosOriginais] = useState({
    rendas: [],
    gastosFixos: [],
    metasInvestimentos: [],
  });

  const formatarMoeda = (valor) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(valor || 0);

  const gerarAlertas = useCallback((projecaoAtual) => {
    const alertasGerados = [];
    const mesesNegativos = projecaoAtual.filter((p) => p.saldo < 0);
    if (mesesNegativos.length > 0) {
      alertasGerados.push({
        tipo: "saldo-negativo-projecao",
        mensagem: `${mesesNegativos.length} mes${
          mesesNegativos.length > 1 ? "es" : ""
        } com saldo negativo.`,
        meses: mesesNegativos.map((m) => ({ nome: m.mes, valor: m.saldo })),
      });
    }
    const mesesComprometidos = projecaoAtual.filter(
      (p) =>
        p.recebimentos > 0 && p.gastos / p.recebimentos > 0.7 && p.gastos > 0
    );
    if (mesesComprometidos.length > 0) {
      const criticos = mesesComprometidos.filter(
        (p) => p.gastos / p.recebimentos > 0.9
      );
      const atencao = mesesComprometidos.filter(
        (p) =>
          p.gastos / p.recebimentos <= 0.9 && p.gastos / p.recebimentos > 0.7
      );
      if (criticos.length > 0) {
        alertasGerados.push({
          tipo: "comprometimento-critico-projecao",
          mensagem: `${criticos.length} mes${
            criticos.length > 1 ? "es" : ""
          } com mais de 90% da renda comprometida.`,
          meses: criticos.map((m) => ({
            nome: m.mes,
            porcentagem: Math.round((m.gastos / m.recebimentos) * 100),
            nivel: "crítico",
          })),
        });
      }
      if (atencao.length > 0) {
        alertasGerados.push({
          tipo: "comprometimento-atencao-projecao",
          mensagem: `${atencao.length} mes${
            atencao.length > 1 ? "es" : ""
          } com mais de 70% da renda comprometida.`,
          meses: atencao.map((m) => ({
            nome: m.mes,
            porcentagem: Math.round((m.gastos / m.recebimentos) * 100),
            nivel: "atenção",
          })),
        });
      }
    }
    return alertasGerados;
  }, []);

  const calcularProjecaoComDadosAtuais = useCallback(
    (dadosParaProjecao) => {
      setError(null);
      try {
        const {
          rendas = [],
          gastosFixos = [],
          metasInvestimentos = [],
        } = dadosParaProjecao;
        const mesesNomes = [
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

        const novaProjecao = mesesNomes.map(
          (nomeMesAtualDaProjecao, indiceMesAtualDaProjecao) => {
            // Filtra Rendas para o mês atual da projeção
            const recebimentosDoMesProjetado = rendas.filter((item) => {
              if (item.frequencia === "Mensal") return true;
              if (!item.mesRecebimento) return false;
              const indiceMesReferencia = mesesNomes.indexOf(
                item.mesRecebimento
              );
              if (indiceMesReferencia === -1) return false;

              if (item.frequencia === "Único" || item.frequencia === "Anual") {
                return indiceMesReferencia === indiceMesAtualDaProjecao;
              }
              if (item.frequencia === "Semestral") {
                return (
                  indiceMesAtualDaProjecao === indiceMesReferencia ||
                  indiceMesAtualDaProjecao === (indiceMesReferencia + 6) % 12
                );
              }
              if (item.frequencia === "Trimestral") {
                return (
                  indiceMesAtualDaProjecao === indiceMesReferencia ||
                  indiceMesAtualDaProjecao === (indiceMesReferencia + 3) % 12 ||
                  indiceMesAtualDaProjecao === (indiceMesReferencia + 6) % 12 ||
                  indiceMesAtualDaProjecao === (indiceMesReferencia + 9) % 12
                );
              }
              return false;
            });

            const gastosFixosDoMesProjetado = gastosFixos.filter((item) => {
              if (item.frequencia === "Mensal") return true;
              if (!item.mesPagamento) return false;
              const indiceMesReferencia = mesesNomes.indexOf(item.mesPagamento);
              if (indiceMesReferencia === -1) return false;

              if (item.frequencia === "Único" || item.frequencia === "Anual") {
                return indiceMesReferencia === indiceMesAtualDaProjecao;
              }
              if (item.frequencia === "Semestral") {
                return (
                  indiceMesAtualDaProjecao === indiceMesReferencia ||
                  indiceMesAtualDaProjecao === (indiceMesReferencia + 6) % 12
                );
              }
              if (item.frequencia === "Trimestral") {
                return (
                  indiceMesAtualDaProjecao === indiceMesReferencia ||
                  indiceMesAtualDaProjecao === (indiceMesReferencia + 3) % 12 ||
                  indiceMesAtualDaProjecao === (indiceMesReferencia + 6) % 12 ||
                  indiceMesAtualDaProjecao === (indiceMesReferencia + 9) % 12
                );
              }
              return false;
            });

            const metasAtivasNoMes = metasInvestimentos.filter((meta) => {

              return indiceMesAtualDaProjecao < meta.prazoMeses;
            });

            const metasComoGastosNoMes = metasAtivasNoMes.map((meta) => ({
              id: `meta-${meta.id}`,
              originalId: meta.id,
              descricao: `Meta: ${meta.descricao}`,
              valor:
                meta.valorTotal && meta.prazoMeses
                  ? meta.valorTotal / meta.prazoMeses
                  : 0,
              frequencia: "Mensal (Projeção)", 
              isMeta: true,
              categoria: "Metas",
              valorTotal: meta.valorTotal,
              prazoMeses: meta.prazoMeses,
            }));

            const totalRecebimentos = recebimentosDoMesProjetado.reduce(
              (sum, item) => sum + (item.valor || 0),
              0
            );
            const totalGastosFixos = gastosFixosDoMesProjetado.reduce(
              (sum, item) => sum + (item.valor || 0),
              0
            );

            const totalMetasParcelas = metasComoGastosNoMes.reduce(
              (sum, meta) => sum + (meta.valor || 0),
              0
            );

            const totalGastos = totalGastosFixos + totalMetasParcelas;
            const saldo = totalRecebimentos - totalGastos;

            return {
              mes: nomeMesAtualDaProjecao,
              recebimentos: totalRecebimentos,
              gastos: totalGastos,
              saldo,
              recebimentosDetalhados: recebimentosDoMesProjetado,
              gastosDetalhados: [
                ...gastosFixosDoMesProjetado,
                ...metasComoGastosNoMes, 
              ],
            };
          }
        );

        setProjecao(novaProjecao);
        setAlertas(gerarAlertas(novaProjecao));
      } catch (err) {
        setError("Erro ao calcular a projeção financeira.");
        console.error("Erro em calcularProjecaoComDadosAtuais:", err);
      }
    },
    [gerarAlertas]
  );

  const fetchDadosParaProjecao = useCallback(async () => {
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
      const response = await fetch(
        "http://localhost:3001/api/dados-completos-usuario",
        {
          headers: getAuthHeaders(),
        }
      );
      if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem("userToken");
          localStorage.removeItem("currentUser");
          navigate("/login");
          throw new Error("Sessão expirada. Faça login novamente.");
        }
        const dataError = await response.json().catch(() => ({}));
        throw new Error(
          dataError.message ||
            `Erro ao buscar dados para projeção: ${response.statusText}`
        );
      }
      const dados = await response.json();
      setDadosOriginais({
        rendas: dados.rendas || [],
        gastosFixos: dados.gastosFixos || [],
        metasInvestimentos: dados.metasInvestimentos || [],
      });
      calcularProjecaoComDadosAtuais(dados);
    } catch (err) {
      setError(err.message);
      console.error("Erro ao buscar dados para projeção:", err);
    } finally {
      setLoading(false);
    }
  }, [navigate, calcularProjecaoComDadosAtuais]);

  useEffect(() => {
    fetchDadosParaProjecao();
  }, [fetchDadosParaProjecao]);

  const aplicarAjuste = async (dadosAjustados) => {
    setLoading(true);
    setError(null);
    try {
      let endpoint = "";
      let payload = {};
      const idOriginal = dadosAjustados.originalId || dadosAjustados.id;

      if (dadosAjustados.isMeta) {
        endpoint = `http://localhost:3001/api/metas/${idOriginal}`;
        payload = {
          descricao:
            dadosOriginais.metasInvestimentos.find((m) => m.id === idOriginal)
              ?.descricao || dadosAjustados.descricao.replace("Meta: ", ""),
          valorTotal: dadosAjustados.valor,
          tipo: dadosAjustados.tipo || "Meta",
          prazoMeses: dadosAjustados.prazoMeses,
        };
      } else {
        endpoint = `http://localhost:3001/api/gastos/${idOriginal}`;
        payload = {
          descricao: dadosAjustados.descricao,
          valor: dadosAjustados.valor,
          frequencia: dadosAjustados.frequencia,
          mesPagamento: dadosAjustados.mesPagamento,
          categoria: dadosAjustados.categoria,
        };
      }

      const response = await fetch(endpoint, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Erro ao atualizar item no servidor.");
      }

      await fetchDadosParaProjecao();
      setMostrarPopupAjuste(false);
    } catch (error) {
      setError(`Erro ao aplicar ajuste: ${error.message}`);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const sugerirAjustes = (item) => {
    setItemParaAjuste(item);
    setMostrarPopupAjuste(true);
  };
  const toggleExpandirMes = (index) =>
    setMesExpandido(mesExpandido === index ? null : index);
  const voltarEtapa = () => navigate("/metas-investimentos");
  const concluirProjecao = () => navigate("/dashboard");
  const calcularMedia = (campo) => {
    const total = projecao.reduce((sum, item) => sum + (item[campo] || 0), 0);
    return projecao.length > 0 ? total / projecao.length : 0;
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

  if (loading && projecao.length === 0) {
    return (
      <div style={componentStyles.loadingContainer}>Calculando projeção...</div>
    );
  }
  if (error) {
    return (
      <div
        className={
          styles["error-message"] || {
            color: "red",
            padding: "1rem",
            border: "1px solid red",
            textAlign: "center",
          }
        }
      >
        Erro: {error}{" "}
        <button
          onClick={fetchDadosParaProjecao}
          style={{ marginLeft: "10px", padding: "5px 10px" }}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  return (
    <div className={styles.containerPrincipal}>
      <div className={styles.cabecalho}>
        <h1 className={styles.tituloApp}>
          Controla<span className={styles.destaqueTitulo}>+</span>
        </h1>
        <h2 className={styles.subtitulo}>Projeção Financeira Anual</h2>
        <p className={styles.textoDescritivo}>
          Visualize sua saúde financeira ao longo dos próximos 12 meses.
        </p>
      </div>
      {etapas &&
        etapaAtual !== undefined &&
        navegarParaEtapa && ( 
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

      {alertas.length > 0 && (
        <div className={styles["alertas-container"]}>
          <h3 className={styles["alertas-title"]}>Pontos de Atenção</h3>
          {alertas.map((alerta, index) => (
            <div
              key={index}
              className={`${styles.alerta} ${styles[alerta.tipo]}`}
            >
              <p className={styles["alerta-text"]}>{alerta.mensagem}</p>
              {alerta.meses && (
                <ul className={styles["alerta-list"]}>
                  {alerta.meses.slice(0, 3).map((mes, i) => (
                    <li key={i} className={styles["alerta-list-item"]}>
                      <strong>{mes.nome}:</strong>
                      {alerta.tipo === "saldo-negativo-projecao" ? (
                        <span
                          className={
                            styles.negativoSaldoProjecao || {
                              color: "var(--cor-perigo)",
                            }
                          }
                        >
                          {" "}
                          {formatarMoeda(mes.valor)}
                        </span>
                      ) : (
                        ` ${mes.porcentagem}% (${mes.nivel})`
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles["projecao-container"]}>
        <div className={styles["resumo-grid"]}>
          <div className={styles["resumo-card"]}>
            <h3 className={styles["resumo-card-title"]}>Renda Mensal Média</h3>
            <p className={styles["resumo-card-value"]}>
              {formatarMoeda(calcularMedia("recebimentos"))}
            </p>
          </div>
          <div className={styles["resumo-card"]}>
            <h3 className={styles["resumo-card-title"]}>
              Despesa Mensal Média
            </h3>
            <p className={styles["resumo-card-value"]}>
              {formatarMoeda(calcularMedia("gastos"))}
            </p>
          </div>
          <div className={styles["resumo-card"]}>
            <h3 className={styles["resumo-card-title"]}>Saldo Mensal Médio</h3>
            <p
              className={`${styles["resumo-card-value"]} ${
                calcularMedia("saldo") >= 0
                  ? styles.positivoSaldoProjecao || {
                      color: "var(--cor-sucesso)",
                    }
                  : styles.negativoSaldoProjecao || {
                      color: "var(--cor-perigo)",
                    }
              }`}
            >
              {formatarMoeda(calcularMedia("saldo"))}
            </p>
          </div>
        </div>

        <div className={styles["tabela-container"]}>
          <div className={styles["table-responsive"]}>
            <table className={styles["projecao-table"]}>
              <thead>
                <tr className={styles["table-header-row"]}>
                  <th className={styles["table-header"]}>Mês</th>
                  <th className={styles["table-header"]}>Recebimentos</th>
                  <th className={styles["table-header"]}>Gastos</th>
                  <th className={styles["table-header"]}>Saldo</th>
                  <th className={styles["table-header"]}>Detalhes</th>
                </tr>
              </thead>
              <tbody>
                {projecao.map((item, index) => (
                  <React.Fragment key={index}>
                    <tr
                      className={`${styles["table-row"]} 
                                  ${
                                    item.saldo < 0
                                      ? styles["saldo-negativo-row"]
                                      : ""
                                  } 
                                  ${
                                    item.recebimentos > 0 &&
                                    item.gastos / item.recebimentos > 0.9
                                      ? styles["comprometimento-critico-row"]
                                      : ""
                                  }
                                  ${
                                    item.recebimentos > 0 &&
                                    item.gastos / item.recebimentos > 0.7 &&
                                    item.gastos / item.recebimentos <= 0.9
                                      ? styles["comprometimento-atencao-row"]
                                      : ""
                                  }
                                `}
                    >
                      <td className={styles["table-cell"]}>{item.mes}</td>
                      <td className={styles["table-cell"]}>
                        {formatarMoeda(item.recebimentos)}
                      </td>
                      <td className={styles["table-cell"]}>
                        {formatarMoeda(item.gastos)}
                      </td>
                      <td
                        className={`${styles["table-cell"]} ${
                          item.saldo >= 0
                            ? styles.positivoSaldoProjecao || {
                                color: "var(--cor-sucesso)",
                              }
                            : styles.negativoSaldoProjecao || {
                                color: "var(--cor-perigo)",
                              }
                        }`}
                      >
                        {formatarMoeda(item.saldo)}
                      </td>
                      <td className={styles["table-cell"]}>
                        <button
                          className={styles["details-button"]}
                          onClick={() => toggleExpandirMes(index)}
                        >
                          {mesExpandido === index ? "▲" : "▼"}
                        </button>
                      </td>
                    </tr>
                    {mesExpandido === index && (
                      <tr>
                        <td colSpan="5" className={styles["expanded-cell"]}>
                          <div className={styles["details-container"]}>
                            <div className={styles["details-section"]}>
                              <h4 className={styles["details-title"]}>
                                Gastos Detalhados
                              </h4>
                              <ul className={styles["details-list"]}>
                                {item.gastosDetalhados?.length > 0 ? (
                                  item.gastosDetalhados.map((gasto, i) => (
                                    <li
                                      key={gasto.id || `gasto-${i}`}
                                      className={styles["details-list-item"]}
                                    >
                                      <div className={styles["detail-info"]}>
                                        <span>{gasto.descricao}</span>
                                        
                                        {gasto.frequencia &&
                                          !gasto.isMeta &&
                                          gasto.frequencia !== "Mensal" && (
                                            <span
                                              className={
                                                styles.frequenciaDetalhe || {
                                                  fontSize: "0.8em",
                                                  color: "#555",
                                                  marginLeft: "5px",
                                                }
                                              }
                                            >
                                              (ref:{" "}
                                              {gasto.mesPagamento || "N/A"} |{" "}
                                              {gasto.frequencia})
                                            </span>
                                          )}
                                        <span
                                          className={styles["detail-value"]}
                                        >
                                          {formatarMoeda(gasto.valor)}
                                        </span>
                                      </div>
                                      {(item.saldo < 0 ||
                                        (item.recebimentos > 0 &&
                                          item.gastos / item.recebimentos >=
                                            0.7)) && (
                                        <button
                                          className={
                                            styles["suggestion-button"]
                                          }
                                          onClick={() => sugerirAjustes(gasto)}
                                        >
                                          Ajustar
                                        </button>
                                      )}
                                    </li>
                                  ))
                                ) : (
                                  <li>Nenhum gasto detalhado.</li>
                                )}
                              </ul>
                            </div>
                            <div className={styles["details-section"]}>
                              <h4 className={styles["details-title"]}>
                                Recebimentos Detalhados
                              </h4>
                              <ul className={styles["details-list"]}>
                                {item.recebimentosDetalhados?.length > 0 ? (
                                  item.recebimentosDetalhados.map(
                                    (recebimento, i) => (
                                      <li
                                        key={
                                          recebimento.id || `recebimento-${i}`
                                        }
                                        className={styles["details-list-item"]}
                                      >
                                        <div className={styles["detail-info"]}>
                                          <span>{recebimento.descricao}</span>
                                          {recebimento.frequencia &&
                                            recebimento.frequencia !==
                                              "Mensal" && (
                                              <span
                                                className={
                                                  styles.frequenciaDetalhe || {
                                                    fontSize: "0.8em",
                                                    color: "#555",
                                                    marginLeft: "5px",
                                                  }
                                                }
                                              >
                                                (ref:{" "}
                                                {recebimento.mesRecebimento ||
                                                  "N/A"}{" "}
                                                | {recebimento.frequencia})
                                              </span>
                                            )}
                                          <span
                                            className={styles["detail-value"]}
                                          >
                                            {formatarMoeda(recebimento.valor)}
                                          </span>
                                        </div>
                                      </li>
                                    )
                                  )
                                ) : (
                                  <li>Nenhum recebimento detalhado.</li>
                                )}
                              </ul>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className={styles["controle-navegacao"]}>
          <button className={styles["botao-voltar"]} onClick={voltarEtapa}>
            Voltar (Metas)
          </button>
          <button
            className={styles["botao-avancar"]}
            onClick={concluirProjecao}
          >
            Concluir e Ver Dashboard
          </button>
        </div>
      </div>
      {mostrarPopupAjuste && (
        <PopupAjuste
          itemParaAjuste={itemParaAjuste}
          onAplicar={aplicarAjuste}
          onCancelar={() => setMostrarPopupAjuste(false)}
          formatarMoeda={formatarMoeda}
        />
      )}
    </div>
  );
};

export default Projecao;
