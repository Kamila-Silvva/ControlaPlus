import React, { useState, useContext, useEffect } from "react";
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

  const formatarMoeda = (valor) =>
    (valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  useEffect(() => {
    const fetchMetas = async () => {
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
    fetchMetas();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    const fieldName = name === "valor" ? "valorTotal" : name;
    setForm((prev) => ({ ...prev, [fieldName]: value }));
    if (error) setError(null);
  };

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
      setMetas([...metas, data]); 
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
      setError("O valor para edição é inválido.");
      return;
    }
    if (isNaN(prazoNum) || prazoNum <= 0) {
      setError("O prazo para edição é inválido.");
      return;
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
      setMetas(metas.map((m) => (m.id === dadosEditadosModal.id ? data : m)));
      setItemEditando(null);
      setError(null);
    } catch (err) {
      setError(err.message);
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
      {etapas && etapaAtual !== undefined && (
        <div className={styles.barraProgresso}>
          {etapas.map((etapa, index) => (
            <div key={index} className={styles.etapaContainer}>
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
          <div className={styles["error-message"]}>
            {error}
            <button
              onClick={() => setError(null)}
              className={styles["fechar-erro"]}
            >
              ×
            </button>
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
