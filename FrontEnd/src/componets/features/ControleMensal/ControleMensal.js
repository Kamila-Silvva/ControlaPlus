import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";

// --- CONSTANTES E HELPERS ---
const EMOCOES = [
  "Ansiedade",
  "Estresse",
  "Tristeza",
  "Tédio",
  "Comemoração",
  "Impulso",
  "Outro",
];
const CATEGORIAS_GASTOS = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Educação",
  "Lazer",
  "Saúde",
  "Impostos",
  "Outros",
];
const MESES_NOMES = [
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

const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const formatarDataParaExibicao = (dataString) => {
  if (!dataString) return "N/A";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dataString)) return dataString;
  if (!/^\d{4}-\d{2}-\d{2}$/.test(dataString)) return dataString;
  const [ano, mesNum, dia] = dataString.split("-");
  return `${dia}/${mesNum}/${ano}`;
};

// --- NOVO SUB-COMPONENTE: POPUP DE PARABÉNS ---
const PopupParabens = ({ onClose }) => {
  return (
    <div style={styles.confettiOverlay} onClick={onClose}>
      <div style={styles.confettiModal} onClick={(e) => e.stopPropagation()}>
        <span style={styles.confettiEmoji} role="img" aria-label="Confetes">
          🎉
        </span>
        <h2 style={styles.confettiTitle}>Parabéns!</h2>
        <p style={styles.confettiText}>
          Você reduziu significativamente seus gastos impulsivos em relação ao
          mês anterior!
        </p>
        <p style={styles.confettiTextStrong}>Continue assim! ✨</p>
        <button style={styles.confettiCloseButton} onClick={onClose}>
          Legal!
        </button>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.confetti,
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 1.5}s`,
              backgroundColor: `hsl(${Math.random() * 360}, 70%, 70%)`,
              transform: `rotate(${Math.random() * 360}deg)`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

// --- COMPONENTE PRINCIPAL ---
const ControleMensal = () => {
  const { mes: mesParam } = useParams();
  const navigate = useNavigate();

  const [planejados, setPlanejados] = useState({ receitas: [], gastos: [] });
  const [realizados, setRealizados] = useState([]);
  const [modalState, setModalState] = useState({
    isOpen: false,
    data: null,
    mode: null,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mensagensContextuais, setMensagensContextuais] = useState([]);
  const [mostrarPopupParabens, setMostrarPopupParabens] = useState(false);

  const nomeMesFormatado = useMemo(() => {
    if (!mesParam) return "";
    return mesParam.charAt(0).toUpperCase() + mesParam.slice(1);
  }, [mesParam]);

  const calcularResumos = (realizadosAtuais, planejadosAtuais) => {
    const receitasReais = (realizadosAtuais || [])
      .filter((r) => r.tipo === "receita")
      .reduce((t, r) => t + r.valor, 0);
    const gastosReais = (realizadosAtuais || [])
      .filter((r) => r.tipo === "gasto")
      .reduce((t, r) => t + r.valor, 0);
    const gastosCompulsivos = (realizadosAtuais || [])
      .filter((r) => r.isCompulsivo)
      .reduce((t, r) => t + r.valor, 0);
    const receitasProjetadas = (planejadosAtuais.receitas || []).reduce(
      (t, r) => t + (r.valor || 0),
      0
    );
    const gastosProjetados = (planejadosAtuais.gastos || []).reduce(
      (t, g) => t + (g.valor || 0),
      0
    );
    return {
      receitasReais,
      gastosReais,
      gastosCompulsivos,
      receitasProjetadas,
      gastosProjetados,
    };
  };

  const gerarAlertasContextuais = useCallback(
    (resumosAtuais, todosRegistros, mesAtualNome) => {
      const novasMensagens = [];
      if (!resumosAtuais || !todosRegistros) return;
      const { gastosReais, gastosCompulsivos, gastosProjetados } =
        resumosAtuais;
      const anoAtual = new Date().getFullYear();
      const chaveParabensLocalStorage = `parabensVisto_${anoAtual}_${mesAtualNome}`;

      if (gastosReais > 0 && gastosCompulsivos / gastosReais > 0.3) {
        novasMensagens.push({
          id: "compulsivoAlto",
          tipo: "avisoCompulsivo",
          texto:
            "Percebemos um volume considerável de gastos impulsivos. Que tal refletir sobre eles? Se precisar, buscar apoio pode ser um bom caminho. ❤️",
        });
      }

      if (gastosProjetados > 0 && gastosReais > gastosProjetados * 1.2) {
        novasMensagens.push({
          id: "acimaProjecao",
          tipo: "avisoProjecao",
          texto:
            "Seus gastos estão um pouco acima do planejado. Gostaria de revisar sua projeção para os próximos meses?",
        });
      }

      const indiceMesAtual = MESES_NOMES.indexOf(mesAtualNome);
      if (indiceMesAtual > 0) {
        const nomeMesAnterior = MESES_NOMES[indiceMesAtual - 1];
        const registrosMesAnterior = todosRegistros[nomeMesAnterior] || [];
        const compulsivosMesAnterior = registrosMesAnterior
          .filter((r) => r.isCompulsivo)
          .reduce((t, r) => t + r.valor, 0);

        if (
          compulsivosMesAnterior > 0 &&
          gastosCompulsivos < compulsivosMesAnterior * 0.7
        ) {
          if (localStorage.getItem(chaveParabensLocalStorage) !== "true") {
            setMostrarPopupParabens(true);
            localStorage.setItem(chaveParabensLocalStorage, "true");
          } else {
            // Adiciona uma mensagem mais sutil se o popup já foi visto este mês/ano
            novasMensagens.push({
              id: "manutencaoCompulsivo",
              tipo: "avisoSucessoContinuo",
              texto:
                "👍 Ótimo trabalho mantendo os gastos impulsivos sob controle este mês!",
            });
          }
        }
      }
      setMensagensContextuais(novasMensagens);
    },
    []
  ); // setMostrarPopupParabens é estável

  const fetchDadosControleMensal = useCallback(async () => {
    if (!mesParam) {
      setError("Mês não especificado.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    setMensagensContextuais([]);
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/login");
      setLoading(false);
      return;
    }

    try {
      const [planejadosData, realizadosData, todosRegistrosData] =
        await Promise.all([
          fetch("http://localhost:3001/api/dados-completos-usuario", {
            headers: getAuthHeaders(),
          }).then((res) => {
            if (!res.ok) {
              if (res.status === 401 || res.status === 403)
                throw new Error("Sessão expirada. Faça login.");
              return res
                .json()
                .then((errData) => {
                  throw new Error(
                    errData.message ||
                      `Falha ao buscar dados de planejamento (${res.status})`
                  );
                })
                .catch(() => {
                  throw new Error(
                    `Falha ao buscar dados de planejamento (${res.status})`
                  );
                });
            }
            return res.json();
          }),
          fetch(
            `http://localhost:3001/api/registros-mensais/${mesParam.toLowerCase()}`,
            { headers: getAuthHeaders() }
          ).then((res) => {
            if (!res.ok) {
              if (res.status === 401 || res.status === 403)
                throw new Error("Sessão expirada. Faça login.");
              return res
                .json()
                .then((errData) => {
                  throw new Error(
                    errData.message ||
                      `Falha ao buscar lançamentos realizados (${res.status})`
                  );
                })
                .catch(() => {
                  throw new Error(
                    `Falha ao buscar lançamentos realizados (${res.status})`
                  );
                });
            }
            return res.json();
          }),
          fetch(`http://localhost:3001/api/todos-registros-mensais`, {
            headers: getAuthHeaders(),
          }).then((res) => {
            if (!res.ok) {
              if (res.status === 401 || res.status === 403)
                throw new Error("Sessão expirada. Faça login.");
              return res
                .json()
                .then((errData) => {
                  throw new Error(
                    errData.message ||
                      `Falha ao buscar todos os registros (${res.status})`
                  );
                })
                .catch(() => {
                  throw new Error(
                    `Falha ao buscar todos os registros (${res.status})`
                  );
                });
            }
            return res.json();
          }),
        ]);

      const {
        rendas = [],
        gastosFixos = [],
        metasInvestimentos = [],
      } = planejadosData;

      const receitasPlanejadas = rendas
        .filter(
          (r) =>
            r.frequencia === "Mensal" || r.mesRecebimento === nomeMesFormatado
        )
        .map((r) => ({
          ...r,
          displayId: `receita-${r.id}`,
          tipoOriginal: "receita",
        }));

      const gastosPlanejados = gastosFixos
        .filter(
          (g) =>
            g.frequencia === "Mensal" || g.mesPagamento === nomeMesFormatado
        )
        .map((g) => ({
          ...g,
          displayId: `gasto-${g.id}`,
          tipoOriginal: "gasto",
        }));

      const metasPlanejadas = metasInvestimentos.map((m) => ({
        id: m.id,
        displayId: `meta-${m.id}`,
        descricao: `Meta: ${m.descricao}`,
        valor: m.valorTotal && m.prazoMeses ? m.valorTotal / m.prazoMeses : 0,
        categoria: "Metas",
        isMeta: true,
        tipoOriginal: "gasto",
        frequencia: "Mensal",
        valorTotal: m.valorTotal,
        prazoMeses: m.prazoMeses,
      }));

      setPlanejados({
        receitas: receitasPlanejadas,
        gastos: [...gastosPlanejados, ...metasPlanejadas],
      });
      setRealizados(realizadosData);

      const resumosCalculados = calcularResumos(realizadosData, {
        receitas: receitasPlanejadas,
        gastos: [...gastosPlanejados, ...metasPlanejadas],
      });
      gerarAlertasContextuais(
        resumosCalculados,
        todosRegistrosData,
        nomeMesFormatado
      );
    } catch (err) {
      setError(err.message);
      if (err.message.includes("Sessão expirada")) {
        localStorage.removeItem("userToken");
        localStorage.removeItem("currentUser");
        navigate("/login");
      }
      console.error("Erro ao carregar dados do Controle Mensal:", err);
    } finally {
      setLoading(false);
    }
  }, [mesParam, navigate, nomeMesFormatado, gerarAlertasContextuais]); // Adicionado gerarAlertasContextuais

  useEffect(() => {
    fetchDadosControleMensal();
  }, [fetchDadosControleMensal]);

  const resumos = useMemo(
    () => calcularResumos(realizados, planejados),
    [realizados, planejados]
  );

  const abrirModal = (mode, data = null) =>
    setModalState({ isOpen: true, mode, data });
  const fecharModal = () =>
    setModalState({ isOpen: false, data: null, mode: null });

  const handleSalvarLancamento = async (dadosDoModal) => {
    setLoading(true);
    setError(null);
    let endpoint = "";
    let method = "POST";
    let payload = {};
    let isEditing = modalState.mode === "editar_realizado";

    if (isEditing) {
      endpoint = `http://localhost:3001/api/registros-mensais/${mesParam.toLowerCase()}/${
        modalState.data.id
      }`;
      method = "PUT";
      payload = {
        ...modalState.data,
        ...dadosDoModal,
        valor: parseFloat(dadosDoModal.valor),
      };
    } else {
      endpoint = `http://localhost:3001/api/registros-mensais/${mesParam.toLowerCase()}`;
      method = "POST";
      let tipoLancamento = "gasto";
      let categoriaLancamento = "Outros";

      if (modalState.mode === "registrar") {
        const itemPlanejadoOriginal =
          planejados.receitas.find(
            (p) => p.displayId === modalState.data.displayId
          ) ||
          planejados.gastos.find(
            (p) => p.displayId === modalState.data.displayId
          );
        if (itemPlanejadoOriginal) {
          tipoLancamento = itemPlanejadoOriginal.tipoOriginal || "gasto";
          categoriaLancamento =
            itemPlanejadoOriginal.categoria ||
            (itemPlanejadoOriginal.isMeta ? "Metas" : "Outros");
        }
        payload = {
          id: `realizado-${modalState.data.displayId}-${Date.now()}`,
          descricao: modalState.data.descricao,
          categoria: categoriaLancamento,
          tipo: tipoLancamento,
          originalId: modalState.data.displayId,
          ...dadosDoModal,
          valor: parseFloat(dadosDoModal.valor),
        };
      } else if (modalState.mode === "nova_receita") {
        payload = {
          id: `extra-receita-${Date.now()}`,
          tipo: "receita",
          ...dadosDoModal,
          valor: parseFloat(dadosDoModal.valor),
        };
      } else {
        payload = {
          id: `extra-gasto-${Date.now()}`,
          tipo: "gasto",
          ...dadosDoModal,
          valor: parseFloat(dadosDoModal.valor),
        };
      }
    }

    try {
      const response = await fetch(endpoint, {
        method: method,
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });
      const dataResponse = await response.json();
      if (!response.ok)
        throw new Error(dataResponse.message || "Erro ao salvar lançamento.");

      await fetchDadosControleMensal();
      window.dispatchEvent(
        new CustomEvent("registrosMensaisUpdated", {
          detail: { mes: mesParam },
        })
      );
      fecharModal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoverLancamento = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este lançamento?")) {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `http://localhost:3001/api/registros-mensais/${mesParam.toLowerCase()}/${id}`,
          { method: "DELETE", headers: getAuthHeaders() }
        );
        if (!response.ok) {
          const dataError = await response.json().catch(() => ({}));
          throw new Error(dataError.message || "Erro ao remover lançamento.");
        }
        await fetchDadosControleMensal();
        window.dispatchEvent(
          new CustomEvent("registrosMensaisUpdated", {
            detail: { mes: mesParam },
          })
        );
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const formatarMoeda = (valor) =>
    (valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  if (
    loading &&
    realizados.length === 0 &&
    planejados.receitas.length === 0 &&
    planejados.gastos.length === 0
  ) {
    return (
      <div style={styles.loadingContainer}>
        Carregando dados de {nomeMesFormatado}...
      </div>
    );
  }
  if (
    error &&
    !(
      loading &&
      realizados.length === 0 &&
      planejados.receitas.length === 0 &&
      planejados.gastos.length === 0
    )
  ) {
    return (
      <div style={styles.errorDisplay}>
        <p>Erro: {error}</p>
        <button
          onClick={fetchDadosControleMensal}
          style={styles.buttonTryAgain}
        >
          Tentar Novamente
        </button>
      </div>
    );
  }

  const idsPlanejadosJaRealizados = new Set(
    realizados.map((r) => r.originalId)
  );
  const receitasRealizadasFiltradas = realizados.filter(
    (r) => r.tipo === "receita"
  );
  const gastosRealizadosFiltrados = realizados.filter(
    (r) => r.tipo === "gasto" && !r.isCompulsivo
  );
  const gastosCompulsivosFiltrados = realizados.filter((r) => r.isCompulsivo);

  return (
    <div style={styles.container}>
      <header style={styles.header}>
        <h1 style={styles.title}>Controle de {nomeMesFormatado}</h1>
        <button
          onClick={() => navigate("/dashboard")}
          style={styles.backButton}
        >
          Voltar ao Dashboard
        </button>
      </header>
      {loading && (
        <p style={{ textAlign: "center", color: "var(--roxo-principal)" }}>
          Atualizando dados...
        </p>
      )}

      {mensagensContextuais.length > 0 && (
        <div style={styles.mensagensContainer}>
          {mensagensContextuais.map((msg) => (
            <div
              key={msg.id}
              style={{ ...styles.mensagemCard, ...styles[msg.tipo] }}
            >
              <p>{msg.texto}</p>
              {msg.tipo === "avisoProjecao" && (
                <button
                  onClick={() => navigate("/projecao")}
                  style={styles.botaoRevisarProjecao}
                >
                  Revisar Projeção
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      <div style={styles.cardContainer}>
        <ResumoCard
          label="Receita Planejada"
          value={formatarMoeda(resumos.receitasProjetadas)}
        />
        <ResumoCard
          label="Receita"
          value={formatarMoeda(resumos.receitasReais)}
          isPositive
        />
        <ResumoCard
          label="Gastos Planejados"
          value={formatarMoeda(resumos.gastosProjetados)}
        />
        <ResumoCard
          label="Gastos"
          value={formatarMoeda(resumos.gastosReais)}
          isNegative
        />
        <ResumoCard
          label="Gastos Compulsivos"
          value={formatarMoeda(resumos.gastosCompulsivos)}
          isNegative
        />
      </div>

      <TabelaItens
        titulo="Planejamento do Mês"
        itens={[...planejados.receitas, ...planejados.gastos]}
        colunas={["Descrição", "Valor Planejado", "Ação"]}
        idsJaRealizados={idsPlanejadosJaRealizados}
        onRegistrar={(item) => abrirModal("registrar", item)}
        loading={loading}
        itemIdentifier="displayId"
      />
      <TabelaItens
        titulo="Receitas"
        itens={receitasRealizadasFiltradas}
        colunas={["Descrição", "Data", "Valor", "Ações"]}
        isRealizado={true}
        onAdd={() => abrirModal("nova_receita")}
        onEdit={(item) => abrirModal("editar_realizado", item)}
        onRemove={handleRemoverLancamento}
        loading={loading}
        formatarDataParaExibicao={formatarDataParaExibicao}
      />
      <TabelaItens
        titulo="Gastos"
        itens={gastosRealizadosFiltrados}
        colunas={["Descrição", "Data", "Categoria", "Valor", "Ações"]}
        isRealizado={true}
        onAdd={() => abrirModal("novo_gasto")}
        onEdit={(item) => abrirModal("editar_realizado", item)}
        onRemove={handleRemoverLancamento}
        loading={loading}
        formatarDataParaExibicao={formatarDataParaExibicao}
      />
      <TabelaItens
        titulo="Gastos Compulsivos"
        itens={gastosCompulsivosFiltrados}
        colunas={["Descrição", "Data", "Categoria", "Valor", "Emoção", "Ações"]}
        isRealizado={true}
        onEdit={(item) => abrirModal("editar_realizado", item)}
        onRemove={handleRemoverLancamento}
        loading={loading}
        formatarDataParaExibicao={formatarDataParaExibicao}
      />

      {modalState.isOpen && (
        <ModalAdicao
          modalState={modalState}
          onClose={fecharModal}
          onSave={handleSalvarLancamento}
          nomeMesFormatado={nomeMesFormatado}
        />
      )}
      {mostrarPopupParabens && (
        <PopupParabens onClose={() => setMostrarPopupParabens(false)} />
      )}
    </div>
  );
};

// --- SUB-COMPONENTES ---
function ResumoCard({ label, value, isPositive, isNegative }) {
  let valueStyle = { ...styles.cardValue, color: "var(--roxo-escuro)" };
  if (isPositive) valueStyle.color = "var(--cor-sucesso)";
  if (isNegative) valueStyle.color = "var(--cor-perigo)";
  return (
    <div style={styles.card}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={valueStyle}>{value}</p>
    </div>
  );
}

function TabelaItens({
  titulo,
  itens,
  colunas,
  idsJaRealizados,
  onRegistrar,
  onAdd,
  isRealizado = false,
  onEdit,
  onRemove,
  loading,
  formatarDataParaExibicao,
  itemIdentifier = "id",
}) {
  const formatarMoeda = (valor) =>
    (valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  return (
    <div style={styles.tableContainer}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={styles.tableTitle}>{titulo}</h3>
        {onAdd && (
          <button style={styles.addButton} onClick={onAdd} disabled={loading}>
            + Adicionar
          </button>
        )}
      </div>
      <table style={styles.table}>
        <thead>
          <tr>
            {colunas.map((col, i) => (
              <th key={i} style={styles.th}>
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {itens.length === 0 ? (
            <tr>
              <td colSpan={colunas.length} style={styles.tdEmpty}>
                Nenhum lançamento.
              </td>
            </tr>
          ) : (
            itens.map((item) => {
              const identifier = item[itemIdentifier];
              const jaRegistrado =
                idsJaRealizados && idsJaRealizados.has(identifier);
              return (
                <tr
                  key={item.displayId || item.id}
                  style={!isRealizado && jaRegistrado ? styles.rowDisabled : {}}
                >
                  <td style={styles.td}>{item.descricao}</td>
                  {colunas.includes("Data") && (
                    <td style={styles.td}>
                      {formatarDataParaExibicao(item.data)}
                    </td>
                  )}
                  {colunas.includes("Categoria") && (
                    <td style={styles.td}>{item.categoria || "N/A"}</td>
                  )}
                  <td style={styles.td}>{formatarMoeda(item.valor)}</td>
                  {colunas.includes("Emoção") && (
                    <td style={styles.td}>{item.emocao}</td>
                  )}
                  {colunas.includes("Ação") || colunas.includes("Ações") ? (
                    <td style={styles.td}>
                      {isRealizado ? (
                        <div style={{ display: "flex", gap: "10px" }}>
                          <button
                            onClick={() => onEdit(item)}
                            style={styles.actionButtonEdit}
                            disabled={loading}
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => onRemove(item.id)}
                            style={styles.actionButtonRemove}
                            disabled={loading}
                          >
                            X
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => onRegistrar(item)}
                          disabled={jaRegistrado || loading}
                          style={styles.registerButton}
                        >
                          {jaRegistrado ? "✓ Registrado" : "Registrar"}
                        </button>
                      )}
                    </td>
                  ) : null}
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}

function ModalAdicao({ modalState, onClose, onSave, nomeMesFormatado }) {
  const { mode, data } = modalState;
  const isEditing = mode === "editar_realizado";
  const isRegistering = mode === "registrar";
  const isNewReceipt = mode === "nova_receita";
  const isNewExpense = mode === "novo_gasto";

  const getInitialFormData = useCallback(() => {
    const today = new Date().toISOString().split("T")[0];
    if (isEditing)
      return {
        ...data,
        valor: data.valor ? data.valor.toString() : "",
        data: data.data || today,
      };
    if (isRegistering)
      return {
        data: today,
        valor: data.valor ? data.valor.toString() : "",
        descricao: data.descricao,
      };
    return {
      data: today,
      valor: "",
      descricao: "",
      categoria: CATEGORIAS_GASTOS[0],
      isCompulsivo: false,
      emocao: "",
    };
  }, [isEditing, isRegistering, data]);

  const [formData, setFormData] = useState(getInitialFormData);

  const { minDate, maxDate } = useMemo(() => {
    if (!nomeMesFormatado) return { minDate: "", maxDate: "" };
    const anoAtual = new Date().getFullYear();
    const mesIndex = MESES_NOMES.indexOf(nomeMesFormatado);
    if (mesIndex === -1) return { minDate: "", maxDate: "" };
    const primeiroDia = new Date(anoAtual, mesIndex, 1);
    const ultimoDia = new Date(anoAtual, mesIndex + 1, 0);
    return {
      minDate: primeiroDia.toISOString().split("T")[0],
      maxDate: ultimoDia.toISOString().split("T")[0],
    };
  }, [nomeMesFormatado]);

  useEffect(() => {
    let initialData = getInitialFormData();
    if (minDate && maxDate) {
      const today = new Date().toISOString().split("T")[0];
      if (mode !== "editar_realizado" || !initialData.data) {
        if (today < minDate) initialData.data = minDate;
        else if (today > maxDate) initialData.data = maxDate;
      } else if (initialData.data < minDate || initialData.data > maxDate) {
        initialData.data = minDate;
      }
    }
    setFormData(initialData);
  }, [modalState, getInitialFormData, minDate, maxDate, mode]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSalvar = () => {
    const valorFloat = parseFloat(formData.valor);
    if (
      isNaN(valorFloat) ||
      !formData.data ||
      (!isRegistering && !formData.descricao && !isEditing)
    ) {
      alert("Preencha todos os campos obrigatórios com valores válidos!");
      return;
    }
    if (formData.data < minDate || formData.data > maxDate) {
      alert(`A data deve estar dentro do mês de ${nomeMesFormatado}.`);
      return;
    }
    if (showExpenseFields && formData.isCompulsivo && !formData.emocao) {
      alert("Selecione a emoção para gastos compulsivos!");
      return;
    }
    onSave({ ...formData, valor: valorFloat });
  };

  const getTitle = () => {
    if (isEditing) return `Editar "${data.descricao}"`;
    if (isRegistering) return `Registrar "${data.descricao}"`;
    if (isNewReceipt) return "Adicionar Nova Receita";
    return "Adicionar Novo Gasto";
  };

  const showExpenseFields = isEditing ? data.tipo === "gasto" : isNewExpense;

  return (
    <div style={styles.modalOverlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2 style={styles.modalTitle}>{getTitle()}</h2>

        {!isRegistering && (
          <div style={styles.formGroup}>
            <label style={styles.modalLabel}>Descrição:</label>
            <input
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              style={styles.modalInput}
            />
          </div>
        )}
        <div style={styles.formGroup}>
          <label style={styles.modalLabel}>Valor Real:</label>
          <input
            name="valor"
            value={formData.valor}
            onChange={handleChange}
            type="number"
            style={styles.modalInput}
            step="0.01"
          />
        </div>
        <div style={styles.formGroup}>
          <label style={styles.modalLabel}>Data:</label>
          <input
            name="data"
            value={formData.data}
            onChange={handleChange}
            type="date"
            style={styles.modalInput}
            min={minDate}
            max={maxDate}
          />
        </div>

        {showExpenseFields && (
          <>
            <div style={styles.formGroup}>
              <label style={styles.modalLabel}>Categoria:</label>
              <select
                name="categoria"
                value={formData.categoria}
                onChange={handleChange}
                style={styles.modalSelect}
              >
                {CATEGORIAS_GASTOS.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div style={styles.modalCheckboxContainer}>
              <input
                type="checkbox"
                name="isCompulsivo"
                checked={formData.isCompulsivo}
                onChange={handleChange}
                id="modalCompulsivoCheck"
              />
              <label htmlFor="modalCompulsivoCheck" style={styles.modalLabel}>
                É um gasto compulsivo?
              </label>
            </div>
            {formData.isCompulsivo && (
              <div style={styles.formGroup}>
                <label style={styles.modalLabel}>
                  Motivado por qual emoção?
                </label>
                <select
                  name="emocao"
                  value={formData.emocao}
                  onChange={handleChange}
                  style={styles.modalSelect}
                >
                  <option value="">Selecione...</option>
                  {EMOCOES.map((e) => (
                    <option key={e} value={e}>
                      {e}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </>
        )}
        <div style={styles.modalButtonContainer}>
          <button style={styles.buttonCancelModal} onClick={onClose}>
            Cancelar
          </button>
          <button style={styles.buttonSaveModal} onClick={handleSalvar}>
            Salvar
          </button>
        </div>
      </div>
    </div>
  );
}

// --- ESTILOS CSS-IN-JS ---
const styles = {
  container: {
    padding: "30px 20px",
    maxWidth: "1200px",
    margin: "0 auto",
    fontFamily: "'Public Sans', sans-serif",
    color: "var(--cinza-escuro)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "2.5rem",
    paddingBottom: "1rem",
    borderBottom: "1px solid var(--cinza-claro)",
  },
  title: {
    fontSize: "2rem",
    color: "var(--roxo-escuro)",
    margin: 0,
    fontWeight: 600,
  },
  backButton: {
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
  cardContainer: {
    display: "flex",
    justifyContent: "space-around",
    flexWrap: "wrap",
    gap: "1rem",
    marginBottom: "2.5rem",
  },
  card: {
    flex: "1 1 180px",
    backgroundColor: "var(--branco)",
    padding: "20px",
    borderRadius: "12px",
    textAlign: "center",
    boxShadow: "var(--sombra)",
    border: "1px solid var(--cinza-claro)",
  },
  cardLabel: {
    fontSize: "0.875rem",
    color: "var(--cinza-medio)",
    margin: "0 0 5px 0",
    fontWeight: 400,
  },
  cardValue: { fontSize: "1.5rem", fontWeight: "600", margin: "0" },
  tableContainer: {
    marginBottom: "2.5rem",
    backgroundColor: "var(--branco)",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "var(--sombra)",
  },
  tableTitle: {
    marginBottom: "1rem",
    fontWeight: "600",
    fontSize: "1.5rem",
    color: "var(--cinza-escuro)",
    paddingBottom: "0.5rem",
  },
  table: { width: "100%", borderCollapse: "collapse" },
  th: {
    borderBottom: "2px solid var(--roxo-claro)",
    padding: "12px 10px",
    textAlign: "left",
    color: "var(--roxo-principal)",
    fontWeight: 600,
    fontSize: "0.9rem",
  },
  td: {
    borderBottom: "1px solid #eee",
    padding: "12px 10px",
    verticalAlign: "middle",
    fontSize: "0.9rem",
  },
  tdEmpty: {
    textAlign: "center",
    color: "#999",
    padding: "20px",
    fontStyle: "italic",
  },
  addButton: {
    padding: "8px 16px",
    backgroundColor: "var(--roxo-principal)",
    color: "white",
    border: "none",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.9rem",
  },
  registerButton: {
    padding: "6px 12px",
    border: "1px solid var(--roxo-principal)",
    color: "var(--roxo-principal)",
    backgroundColor: "transparent",
    borderRadius: "6px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "0.85rem",
  },
  rowDisabled: {
    backgroundColor: "#f9f9f9",
    color: "#aaa",
    textDecoration: "line-through",
  },
  actionButtonEdit: {
    padding: "0.4rem 1rem",
    fontSize: "0.875rem",
    backgroundColor: "rgba(151, 71, 255, 0.9)",
    color: "var(--branco)",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s ease",
    marginRight: "8px",
  },
  actionButtonRemove: {
    padding: "0.5rem 0.8rem",
    fontSize: "0.875rem",
    backgroundColor: "var(--cor-perigo)",
    color: "var(--branco)",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
    fontWeight: "bold",
    transition: "background-color 0.2s ease",
  },
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(47, 46, 65, 0.5)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
    backdropFilter: "blur(4px)",
  },
  modal: {
    backgroundColor: "var(--branco)",
    padding: "2.5rem",
    borderRadius: "12px",
    width: "90%",
    maxWidth: "500px",
    boxShadow: "0 10px 25px rgba(0, 0, 0, 0.1)",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  modalTitle: {
    fontSize: "1.5rem",
    fontWeight: 600,
    color: "var(--cinza-escuro)",
    marginBottom: "2rem",
    textAlign: "center",
  },
  formGroup: { marginBottom: "1rem" },
  modalLabel: {
    display: "block",
    fontSize: "0.875rem",
    fontWeight: 300,
    color: "var(--cinza-escuro)",
    marginBottom: "0.25rem",
  },
  modalInput: {
    width: "100%",
    padding: "12px",
    boxSizing: "border-box",
    borderRadius: "8px",
    border: "1px solid rgba(47, 46, 65, 0.2)",
    fontSize: "0.875rem",
    fontFamily: "'Public Sans', sans-serif",
    backgroundColor: "transparent",
  },
  modalSelect: {
    width: "100%",
    padding: "12px",
    boxSizing: "border-box",
    borderRadius: "8px",
    border: "1px solid rgba(47, 46, 65, 0.2)",
    fontSize: "0.875rem",
    fontFamily: "'Public Sans', sans-serif",
    backgroundColor: "var(--branco)",
  },
  modalCheckboxContainer: {
    display: "flex",
    alignItems: "center",
    gap: "0.5rem",
    margin: "1rem 0",
  },
  modalButtonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    gap: "1rem",
    marginTop: "2rem",
  },
  buttonCancelModal: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "rgb(133, 32, 32)",
    color: "#f9f9f9",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "bold",
    fontFamily: "'Open Sans', sans-serif",
    fontSize: "1rem",
    transition: "all 0.3s ease",
  },
  buttonSaveModal: {
    padding: "0.75rem 1.5rem",
    backgroundColor: "var(--roxo-principal)",
    color: "var(--branco)",
    border: "none",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: "600",
    fontFamily: "'Open Sans', sans-serif",
    fontSize: "1rem",
    transition: "all 0.3s ease",
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100vh",
    fontSize: "1.5rem",
    color: "var(--roxo-escuro)",
  },
  errorDisplay: {
    backgroundColor: "var(--branco)",
    padding: "2rem",
    borderRadius: "12px",
    boxShadow: "var(--sombra)",
    textAlign: "center",
    color: "var(--cor-perigo)",
    margin: "2rem auto",
    maxWidth: "600px",
    border: "1px solid var(--cor-perigo)",
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
  mensagensContainer: {
    margin: "2rem 0",
    display: "flex",
    flexDirection: "column",
    gap: "1rem",
  },
  mensagemCard: {
    padding: "1rem",
    borderRadius: "8px",
    boxShadow: "var(--sombra)",
    fontSize: "0.95rem",
    lineHeight: "1.5",
  },
  avisoCompulsivo: {
    backgroundColor: "#fff3e0",
    borderLeft: "5px solid #ff9800",
    color: "#e65100",
  },
  avisoProjecao: {
    backgroundColor: "#e3f2fd",
    borderLeft: "5px solid #2196f3",
    color: "#0d47a1",
  },
  botaoRevisarProjecao: {
    display: "inline-block",
    marginTop: "10px",
    padding: "8px 15px",
    backgroundColor: "var(--roxo-claro)",
    color: "var(--branco)",
    textDecoration: "none",
    borderRadius: "6px",
    fontWeight: "bold",
  },
  confettiOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.7)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2000,
    backdropFilter: "blur(5px)",
  },
  confettiModal: {
    backgroundColor: "var(--branco)",
    padding: "2.5rem 3rem",
    borderRadius: "15px",
    textAlign: "center",
    boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
    position: "relative",
    overflow: "hidden",
    animation: "confettiPopIn 0.4s cubic-bezier(0.68, -0.55, 0.27, 1.55)",
    maxWidth: "450px",
  },
  confettiEmoji: { fontSize: "3.5rem", display: "block", marginBottom: "1rem" },
  confettiTitle: {
    fontSize: "1.8rem",
    fontWeight: 700,
    color: "var(--roxo-escuro)",
    marginBottom: "1rem",
  },
  confettiText: {
    fontSize: "1rem",
    color: "var(--cinza-medio)",
    marginBottom: "0.5rem",
    lineHeight: 1.6,
  },
  confettiTextStrong: {
    fontSize: "1.1rem",
    fontWeight: "bold",
    color: "var(--roxo-principal)",
    marginBottom: "1.5rem",
  },
  confettiCloseButton: {
    backgroundColor: "var(--roxo-principal)",
    color: "var(--branco)",
    border: "none",
    borderRadius: "8px",
    padding: "0.8rem 2rem",
    fontSize: "1rem",
    fontWeight: "bold",
    cursor: "pointer",
    transition: "background-color 0.2s ease",
    marginTop: "1rem",
  },
  confetti: {
    position: "absolute",
    width: "8px",
    height: "16px",
    opacity: 0,
    animation: "confettiFall 1.5s ease-out forwards",
  },
};

if (!document.getElementById("app-styles-global")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "app-styles-global";
  styleSheet.innerText = `
      :root { 
        --roxo-principal: #9747FF; --roxo-escuro: #6C63FF; --roxo-claro: #a855f7;
        --cinza-escuro: #2F2E41; --cinza-medio: #0D0C0B; --cinza-claro: #F5F5F5;
        --branco: #FFFFFF; --sombra: 0 4px 6px rgba(0, 0, 0, 0.05);
        --cor-sucesso: #28a745; --cor-perigo: #dc3545;
      }
      @keyframes confettiPopIn {
        0% { transform: scale(0.5); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
      @keyframes confettiFall {
        0% { transform: translateY(-100px) rotate(0deg); opacity: 1; }
        100% { transform: translateY(150%) rotate(720deg); opacity: 0; }
      }
    `;
  document.head.appendChild(styleSheet);
}

export default ControleMensal;
