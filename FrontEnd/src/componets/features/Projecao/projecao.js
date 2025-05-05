import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressoContext } from '../../../context/ProgressoContext';
import api from '../../../services/api';
import styles from '../../../styles/Projecao.module.css';

const formatarMoeda = (valor) => {
  return (valor || 0).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

const Projecao = () => {
  const navigate = useNavigate();
  const { etapas, etapaAtual } = useContext(ProgressoContext);
  const [projecao, setProjecao] = useState([]);
  const [mesExpandido, setMesExpandido] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [mostrarPopupAjuste, setMostrarPopupAjuste] = useState(false);
  const [itemParaAjuste, setItemParaAjuste] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarProjecao = async () => {
      try {
        const response = await api.getProjecao();
        setProjecao(response.data.projecao);
        setAlertas(response.data.alertas);
      } catch (error) {
        console.error('Erro ao carregar projeção:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarProjecao();
  }, []);

  const sugerirAjustes = (item) => {
    const isRecorrente = ["Mensal", "Trimestral", "Semestral"].includes(
      item.frequencia
    );

    if (!item.isMeta && isRecorrente) {
      const confirmar = window.confirm(
        `Deseja ajustar "${item.descricao}" em TODOS os meses?`
      );
      if (confirmar) {
        setItemParaAjuste(item);
        setMostrarPopupAjuste(true);
      }
    } else {
      setItemParaAjuste(item);
      setMostrarPopupAjuste(true);
    }
  };

  const toggleExpandirMes = (index) => {
    setMesExpandido(mesExpandido === index ? null : index);
  };

  const voltarEtapa = () => {
    navigate("/metas-investimentos");
  };

  const PopupAjuste = () => {
    const isMeta = itemParaAjuste?.isMeta || false;

    const valorTotalMeta = isMeta
      ? itemParaAjuste?.valorTotal || 0
      : 0;
    const valorGasto = !isMeta ? itemParaAjuste?.valor || 0 : 0;
    const prazoOriginal = itemParaAjuste?.prazoMeses || 1;
    const descricaoOriginal = itemParaAjuste?.descricao || "";

    const [valorTotal, setValorTotal] = useState(valorTotalMeta);
    const [valorGastoEdit, setValorGastoEdit] = useState(valorGasto);
    const [novoPrazo, setNovoPrazo] = useState(prazoOriginal);
    const [erro, setErro] = useState("");

    const valorParcela = parseFloat((valorTotal / novoPrazo).toFixed(2));
    const valorTotalAjustado = parseFloat((valorParcela * novoPrazo).toFixed(2));
    const parcelaOriginal = valorTotalMeta / prazoOriginal;

    const formatCurrency = (value) => {
      return parseFloat(value || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL",
      });
    };

    const handleAjustePrazo = (e) => {
      const prazo = Math.max(1, Number(e.target.value));
      setNovoPrazo(prazo);

      if (prazo > 12) {
        setErro(
          "O prazo máximo é 12 meses. Considere reduzir o valor total para manter parcelas acessíveis."
        );
      } else {
        setErro("");
      }
    };

    const handleAplicar = () => {
      if (isMeta && novoPrazo > 12) {
        setErro("Por favor, ajuste para no máximo 12 meses.");
        return;
      }
      setMostrarPopupAjuste(false);
    };

    return (
      <div className={styles['modal-overlay']}>
        <div className={styles['modal-container']}>
          <h3>{isMeta ? "Ajuste de Meta" : "Editar Gasto Fixo"}</h3>

          {!isMeta &&
            ["Mensal", "Trimestral", "Semestral"].includes(
              itemParaAjuste?.frequencia
            ) && (
              <div className={styles['alerta']}>
                <p>
                  🌍 Este ajuste afetará TODAS as ocorrências deste gasto
                  recorrente
                </p>
              </div>
            )}

          <div className={styles['campo-formulario']}>
            <p className={styles.rotulo}>Descrição:</p>
            <p>{descricaoOriginal}</p>
          </div>

          {isMeta ? (
            <>
              <div className={styles['campo-formulario']}>
                <label className={styles.rotulo}>
                  Valor Total da Meta:
                  <input
                    type="number"
                    value={valorTotal}
                    onChange={(e) =>
                      setValorTotal(Math.max(0, Number(e.target.value)))
                    }
                    className={styles['campo-input']}
                    min="0.01"
                    step="0.01"
                  />
                </label>
              </div>

              <div className={styles['campo-formulario']}>
                <label className={styles.rotulo}>
                  Prazo (meses):
                  <input
                    type="number"
                    value={novoPrazo}
                    onChange={handleAjustePrazo}
                    className={styles['campo-input']}
                    style={{ borderColor: novoPrazo > 12 ? "#ff6b6b" : "" }}
                    min="1"
                    max="12"
                  />
                </label>
                {prazoOriginal >= 12 && (
                  <p
                    style={{
                      color: "#ff6b6b",
                      fontSize: "0.8rem",
                      marginTop: "5px",
                    }}
                  >
                    ⚠️ Prazo já está no máximo anual (12 meses)
                  </p>
                )}
              </div>

              {erro && (
                <div className={styles['alerta']}>
                  <p>⚠️ {erro}</p>
                </div>
              )}

              <div className={styles['campo-formulario']}>
                <p className={styles.rotulo}>Parcela Atual:</p>
                <p>
                  {formatCurrency(parcelaOriginal)}/mês ({prazoOriginal} meses)
                </p>
              </div>

              <div className={styles['campo-formulario']}>
                <p className={styles.rotulo}>Nova Parcela:</p>
                <p style={{ color: novoPrazo > 12 ? "#ff6b6b" : "#4CAF50" }}>
                  {formatCurrency(valorParcela)}/mês ({novoPrazo} meses)
                </p>
              </div>
            </>
          ) : (
            <div className={styles['campo-formulario']}>
              <label className={styles.rotulo}>
                Valor do Gasto:
                <input
                  type="number"
                  value={valorGastoEdit}
                  onChange={(e) =>
                    setValorGastoEdit(Math.max(0, Number(e.target.value)))
                  }
                  className={styles['campo-input']}
                  min="0.01"
                  step="0.01"
                />
              </label>
            </div>
          )}

          <div className={styles['botoes-modal']}>
            <button
              className={styles['botao-voltar']}
              onClick={() => setMostrarPopupAjuste(false)}
            >
              Cancelar
            </button>
            <button
              className={`${styles.botao} ${isMeta && novoPrazo > 12 ? styles.disabled : ""}`}
              onClick={handleAplicar}
              disabled={isMeta && novoPrazo > 12}
            >
              {isMeta ? "Aplicar Ajuste" : "Salvar Valor"}
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return <div className={styles.loading}>Carregando projeção...</div>;
  }

  return (
    <div className={styles.containerPrincipal}>
      {/* Cabeçalho e barra de progresso */}
      <div className={styles.cabecalho}>
        <h1 className={styles.tituloApp}>Controla<span className={styles.destaqueTitulo}>+</span></h1>
        <h2 className={styles.subtitulo}>Projeção</h2>
        <p className={styles.textoDescritivo}>
          Veja como ficará sua situação financeira nos próximos 12 meses.
        </p>
      </div>

      <div className={styles.barraProgresso}>
        {etapas.map((etapa, index) => (
          <div key={index} className={styles.etapaContainer}>
            <div className={`${styles.marcadorEtapa} ${index ===  etapaAtual ? styles['etapa-ativa'] : styles['etapa-inativa']
              }`}
            >
              {index + 1}
            </div>
            <span
              className={`${styles['rotulo-etapa']} ${
                index === etapaAtual ? styles['rotulo-ativo'] : styles['rotulo-inativo']
              }`}
            >
              {etapa}
            </span>
          </div>
        ))}
      </div>

      {alertas.length > 0 && (
        <div className={styles['alertas-container']}>
          <h3 className={styles['alertas-title']}>Atenção!</h3>
          {alertas.map((alerta, index) => (
            <div key={index} className={`${styles.alerta} ${styles[alerta.tipo]}`}>
              <p className={styles['alerta-text']}>
                {alerta.tipo.includes("comprometimento") && (
                  <span style={{ marginRight: "8px" }}>
                    {alerta.tipo === "comprometimento-critico" ? "🔴" : "🟡"}
                  </span>
                )}
                {alerta.mensagem}
              </p>

              {alerta.detalhes && (
                <p className={styles['alerta-detalhes']}>{alerta.detalhes}</p>
              )}

              {alerta.meses && (
                <>
                  <p className={styles['alerta-subtitle']}>Meses afetados:</p>
                  <ul className={styles['alerta-list']}>
                    {alerta.meses.slice(0, 3).map((mes, i) => (
                      <li key={i} className={styles['alerta-list-item']}>
                        {mes.nome}: {mes.porcentagem}% ({mes.nivel})
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          ))}
        </div>
      )}

      <div className={styles['projecao-container']}>
        <h2 className={styles['projecao-header']}>Projeção Financeira Anual</h2>

        <div className={styles['resumo-grid']}>
          <div className={styles['resumo-card']}>
            <h3 className={styles['resumo-card-title']}>Renda Mensal</h3>
            <p className={styles['resumo-card-value']}>
              {formatarMoeda(
                projecao.reduce(
                  (sum, item) => sum + (item?.recebimentos || 0),
                  0
                ) / 12
              )}
            </p>
          </div>
          <div className={styles['resumo-card']}>
            <h3 className={styles['resumo-card-title']}>Despesas Mensais</h3>
            <p className={styles['resumo-card-value']}>
              {formatarMoeda(
                projecao.reduce((sum, item) => sum + (item?.gastos || 0), 0) /
                  12
              )}
            </p>
          </div>
          <div className={styles['resumo-card']}>
            <h3 className={styles['resumo-card-title']}>Saldo Mensal</h3>
            <p
              className={`${styles['resumo-card-value']} ${
                projecao.reduce((sum, item) => sum + (item?.saldo || 0), 0) >= 0
                  ? styles.positivo
                  : styles.negativo
              }`}
            >
              {formatarMoeda(
                projecao.reduce((sum, item) => sum + (item?.saldo || 0), 0) / 12
              )}
            </p>
          </div>
        </div>

        <div className={styles['tabela-container']}>
          <table className={styles['projecao-table']}>
            <thead>
              <tr className={styles['table-header-row']}>
                <th className={styles['table-header']}>Mês</th>
                <th className={styles['table-header']}>Recebimentos</th>
                <th className={styles['table-header']}>Gastos</th>
                <th className={styles['table-header']}>Saldo</th>
                <th className={styles['table-header']}>Detalhes</th>
              </tr>
            </thead>
            <tbody>
              {projecao.map((item, index) => (
                <React.Fragment key={index}>
                  <tr
                    className={`${styles['table-row']} ${
                      item.saldo < 0
                        ? styles['saldo-negativo']
                        : item.recebimentos > 0 &&
                          item.gastos / item.recebimentos > 0.9
                        ? styles['comprometimento-critico']
                        : item.recebimentos > 0 &&
                          item.gastos / item.recebimentos > 0.7
                        ? styles['comprometimento-atencao']
                        : ""
                    }`}
                  >
                    <td className={styles['table-cell']}>{item.mes}</td>
                    <td className={styles['table-cell']}>
                      {formatarMoeda(item.recebimentos)}
                    </td>
                    <td className={styles['table-cell']}>{formatarMoeda(item.gastos)}</td>
                    <td
                      className={`${styles['table-cell']} ${
                        item.saldo >= 0 ? styles.positivo : styles.negativo
                      }`}
                    >
                      {formatarMoeda(item.saldo)}
                    </td>
                    <td className={styles['table-cell']}>
                      <button
                        className={styles['details-button']}
                        onClick={() => toggleExpandirMes(index)}
                      >
                        {mesExpandido === index ? "▲" : "▼"}
                      </button>
                    </td>
                  </tr>
                  {mesExpandido === index && (
                    <tr>
                      <td colSpan="5" className={styles['expanded-cell']}>
                        <div className={styles['details-container']}>
                          <div className={styles['details-section']}>
                            <h4 className={styles['details-title']}>Gastos:</h4>
                            <ul className={styles['details-list']}>
                              {item.gastosDetalhados.map((gasto, i) => (
                                <li key={i} className={styles['details-list-item']}>
                                  <span className={styles['detail-description']}>
                                    {gasto.descricao}
                                  </span>
                                  <span className={styles['detail-value']}>
                                    {formatarMoeda(gasto.valor)}
                                  </span>
                                  <span className={styles['detail-frequency']}>
                                    ({gasto.frequencia}
                                    {gasto.mesPagamento &&
                                      ` | Mês Ref.: ${gasto.mesPagamento}`}
                                    )
                                  </span>
                                  {(item.saldo < 0 ||
                                    (item.recebimentos > 0 &&
                                      item.gastos / item.recebimentos >=
                                        0.7)) && (
                                    <button
                                      className={`${styles['suggestion-button']} ${
                                        !gasto.isMeta &&
                                        [
                                          "Mensal",
                                          "Trimestral",
                                          "Semestral",
                                        ].includes(gasto.frequencia)
                                          ? styles['global-adjust']
                                          : ""
                                      }`}
                                      onClick={() => sugerirAjustes(gasto)}
                                      title={
                                        !gasto.isMeta &&
                                        [
                                          "Mensal",
                                          "Trimestral",
                                          "Semestral",
                                        ].includes(gasto.frequencia)
                                          ? "Este ajuste modificará TODAS as ocorrências deste gasto fixo"
                                          : "Ajuste individual para este registro"
                                      }
                                    >
                                      {(() => {
                                        if (gasto.isMeta)
                                          return "Ajustar Parcela";
                                        if (gasto.frequencia === "Único")
                                          return "Ajustar";
                                        if (gasto.frequencia === "Anual")
                                          return "Ajustar";
                                        return "Ajustar";
                                      })()}
                                    </button>
                                  )}
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className={styles['details-section']}>
                            <h4 className={styles['details-title']}>Recebimentos:</h4>
                            <ul className={styles['details-list']}>
                              {item.recebimentosDetalhados.map(
                                (recebimento, i) => (
                                  <li key={i} className={styles['details-list-item']}>
                                    <span className={styles['detail-description']}>
                                      {recebimento.descricao}
                                    </span>
                                    <span className={styles['detail-value']}>
                                      {formatarMoeda(recebimento.valor)}
                                    </span>
                                    <span className={styles['detail-frequency']}>
                                      ({recebimento.frequencia}
                                      {recebimento.mesRecebimento !==
                                        undefined &&
                                      recebimento.mesRecebimento !== null
                                        ? ` | Mês Ref.: ${recebimento.mesRecebimento}`
                                        : ""}
                                      )
                                    </span>
                                  </li>
                                )
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

        <div className={styles['controle-navegacao']}>
          <button className={styles['botao-voltar']} onClick={voltarEtapa}>
            Voltar
          </button>
          <button
            className={styles['botao-avancar']}
            onClick={() => alert("Projeção concluída!")}
          >
            Concluir
          </button>
        </div>
      </div>

      {mostrarPopupAjuste && <PopupAjuste />}
    </div>
  );
};

export default Projecao;