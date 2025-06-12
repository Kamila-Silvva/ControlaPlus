import React, { useState, useContext, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressoContext } from "../../../context/ProgressoContext";
import Input from "../../shared/Input";
import Label from "../../shared/Label";
import Select from "../../shared/Select";
import ModalGasto from "../../shared/ModalGasto";
import styles from "../../../styles/Projecao.module.css";

const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const CATEGORIAS = [
  "Moradia",
  "Alimentação",
  "Transporte",
  "Educação",
  "Lazer",
  "Saúde",
  "Impostos",
  "Outros",
];

const GastosFixos = () => {
  const navigate = useNavigate();
  const progressoContext = useContext(ProgressoContext);
  const etapas = progressoContext?.etapas;
  const etapaAtual = progressoContext?.etapaAtual;
  const navegarParaEtapa = progressoContext?.navegarParaEtapa;

  const initialState = {
    descricao: "",
    valor: "",
    frequencia: "Mensal",
    mesPagamento: "",
    categoria: CATEGORIAS[0],
  };
  const [form, setForm] = useState(initialState);
  const [itens, setItens] = useState([]);
  const [itemEditando, setItemEditando] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true); 
  const [rendaTotalMensal, setRendaTotalMensal] = useState(0);

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
          "Erro ao buscar rendas para total:",
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
    } catch (err) {
      console.error("Erro ao buscar renda total para GastosFixos:", err);
      return 0;
    }
  }, []);

  useEffect(() => {
    const fetchGastosAndRenda = async () => {
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
        const response = await fetch("http://localhost:3001/api/gastos", {
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          if (response.status === 401 || response.status === 403) {
            localStorage.removeItem("userToken");
            localStorage.removeItem("currentUser");
            navigate("/login");
            throw new Error("Sessão expirada. Faça login novamente.");
          }
          const data = await response.json().catch(() => ({}));
          throw new Error(
            data.message || `Erro ao buscar gastos: ${response.statusText}`
          );
        }
        const data = await response.json();
        setItens(data);
      } catch (err) {
        setError(err.message);
        console.error("Erro ao buscar gastos:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchGastosAndRenda();
  }, [navigate, fetchRendaTotalMensal]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (error) setError(null);
  };

  const adicionarItem = async () => {
    if (!form.descricao.trim()) {
      setError("Insira uma descrição.");
      return;
    }
    const valorNum = parseFloat(form.valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      setError("O valor deve ser um número positivo.");
      return;
    }
    if (form.frequencia !== "Mensal" && !form.mesPagamento) {
      setError("Selecione o mês de pagamento.");
      return;
    }

    const novoGastoPayload = {
      descricao: form.descricao,
      valor: valorNum,
      frequencia: form.frequencia,
      mesPagamento: form.frequencia === "Mensal" ? null : form.mesPagamento,
      categoria: form.categoria,
    };
    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/gastos", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(novoGastoPayload),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Erro ao criar gasto.");
      setItens([...itens, data]);
      setForm(initialState);
      setError(null);
      await fetchRendaTotalMensal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removerItem = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este gasto?")) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/gastos/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Erro ao remover gasto.");
        }
        setItens(itens.filter((item) => item.id !== id));
        setError(null);
        await fetchRendaTotalMensal();
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
      valor: item.valor.toString(),
      mesPagamento: item.mesPagamento || "",
    });
  };

  const salvarEdicao = async (dadosEditados) => {
    const valorNum = parseFloat(dadosEditados.valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      setError("Valor da edição inválido.");
      return;
    }

    const payload = {
      ...dadosEditados,
      valor: valorNum,
      mesPagamento:
        dadosEditados.frequencia === "Mensal"
          ? null
          : dadosEditados.mesPagamento,
    };
    delete payload.isCompulsivo;

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/gastos/${dadosEditados.id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Erro ao atualizar gasto.");
      setItens(
        itens.map((item) => (item.id === dadosEditados.id ? data : item))
      );
      setItemEditando(null);
      setError(null);
      await fetchRendaTotalMensal();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const avancarEtapa = () => {
    navigate("/metas-investimentos");
  };
  const voltarEtapa = () => {
    navigate("/renda");
  };

  const gastosPorCategoria = itens.reduce((acc, gasto) => {
    const categoria = gasto.categoria || "Outros";
    if (!acc[categoria]) acc[categoria] = [];
    acc[categoria].push(gasto);
    return acc;
  }, {});

  const totalGastosFixosMensais = itens.reduce((sum, item) => {
    if (item.frequencia === "Mensal") {
      return sum + item.valor;
    }
    return sum;
  }, 0);

  const saldoDisponivelParaGastos = rendaTotalMensal - totalGastosFixosMensais;

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

  if (loading && itens.length === 0) {
    return (
      <div style={componentStyles.loadingContainer}>Carregando gastos...</div>
    );
  }

  return (
    <div className={styles.containerPrincipal}>
      <div className={styles.cabecalho}>
        <h1 className={styles.tituloApp}>
          Controla<span className={styles.destaqueTitulo}>+</span>
        </h1>
        <h2 className={styles.subtitulo}>Gastos Fixos</h2>
        <p className={styles.textoDescritivo}>
          Liste suas despesas regulares como aluguel, contas de água, luz,
          internet, etc.
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

      <div className={styles["formulario-container"]}>
        <h3 className={styles["titulo-secao"]}>Meus Gastos Fixos</h3>
        {error && (
          <div className={styles["error-message"]}>
            {" "}
            {error}{" "}
            <button
              onClick={() => setError(null)}
              className={styles["fechar-erro"]}
            >
              ×
            </button>{" "}
          </div>
        )}
        {loading && itens.length > 0 && (
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
            <h3 className={styles["resumo-card-title"]}>Receita Total Mensal:</h3>
            <p
              className={`${styles["resumo-card-value"]} ${styles.positivoSaldoProjecao}`}
            >
              {formatarMoeda(rendaTotalMensal)}
            </p>
          </div>
          <div className={styles["resumo-card"]}>
            <h3 className={styles["resumo-card-title"]}>
              Total de Gastos Fixos (Mensais):
            </h3>
            <p
              className={`${styles["resumo-card-value"]} ${styles.negativoSaldoProjecao}`}
            >
              {formatarMoeda(totalGastosFixosMensais)}
            </p>
          </div>
          <div className={styles["resumo-card"]}>
            <h3 className={styles["resumo-card-title"]}>
              Saldo Disponível para Outros Gastos/Metas:
            </h3>
            <p
              className={`${styles["resumo-card-value"]} ${
                saldoDisponivelParaGastos >= 0
                  ? styles.positivoSaldoProjecao
                  : styles.negativoSaldoProjecao
              }`}
            >
              {formatarMoeda(saldoDisponivelParaGastos)}
            </p>
          </div>
        </div>

        <div className={styles["grupo-campos"]}>
          <div className={styles["campo-formulario"]}>
            <Label>Descrição*</Label>
            <Input
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Ex: Aluguel"
              disabled={loading}
            />
          </div>
          <div className={styles["campo-formulario"]}>
            <Label>Valor (R$)*</Label>
            <Input
              type="number"
              name="valor"
              value={form.valor}
              onChange={handleChange}
              placeholder="1200,00"
              step="0.01"
              min="0"
              disabled={loading}
            />
          </div>
          <div className={styles["campo-formulario"]}>
            <Label>Categoria*</Label>
            <Select
              name="categoria"
              value={form.categoria}
              onChange={handleChange}
              disabled={loading}
            >
              {CATEGORIAS.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </Select>
          </div>
          <div className={styles["campo-formulario"]}>
            <Label>Frequência*</Label>
            <Select
              name="frequencia"
              value={form.frequencia}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Mensal">Mensal</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
              <option value="Único">Pagamento Único</option>
            </Select>
          </div>
          {form.frequencia !== "Mensal" && (
            <div className={styles["campo-formulario"]}>
              <Label>Mês do Pagamento*</Label>
              <Select
                name="mesPagamento"
                value={form.mesPagamento}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Selecione</option>
                {[
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
                ].map((mes) => (
                  <option key={mes} value={mes}>
                    {mes}
                  </option>
                ))}
              </Select>
            </div>
          )}
          <button
            onClick={adicionarItem}
            className={styles["botao-adicionar"]}
            disabled={loading}
          >
            {loading ? "Adicionando..." : "Adicionar Gasto"}
          </button>
        </div>

        {Object.keys(gastosPorCategoria).length > 0 && (
          <div className={styles["lista-container"]}>
            <h4 className={styles["titulo-lista"]}>
              Meus Gastos por Categoria
            </h4>
            {Object.entries(gastosPorCategoria).map(([categoria, gastos]) => (
              <div key={categoria} className={styles["categoria-container"]}>
                <h5 className={styles["titulo-categoria"]}>
                  {categoria} - Total:{" "}
                  {formatarMoeda(gastos.reduce((sum, g) => sum + g.valor, 0))}
                </h5>
                <div className={styles["itens-lista"]}>
                  {gastos.map((item) => (
                    <div key={item.id} className={styles["item-lista"]}>
                      <div>
                        <p className={styles["descricao-item"]}>
                          {item.descricao}
                        </p>
                        <p className={styles["detalhes-item"]}>
                          {formatarMoeda(item.valor)} • {item.frequencia}{" "}
                          {item.mesPagamento && `(${item.mesPagamento})`}
                        </p>
                      </div>
                      <div className={styles["botoes-acao"]}>
                        <button
                          onClick={() => editarItem(item)}
                          className={styles["botao-editar"]}
                          disabled={loading}
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => removerItem(item.id)}
                          className={styles["botao-remover"]}
                          disabled={loading}
                        >
                          Remover
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className={styles["controle-navegacao"]}>
          <button
            onClick={voltarEtapa}
            className={styles["botao-voltar"]}
            disabled={loading}
          >
            Voltar (Renda)
          </button>
          <button
            onClick={avancarEtapa}
            className={styles.botao}
            disabled={loading}
          >
            Avançar (Metas)
          </button>
        </div>
      </div>
      {itemEditando && (
        <ModalGasto
          item={itemEditando}
          onSave={salvarEdicao}
          onClose={() => {
            setItemEditando(null);
            setError(null);
          }}
          categorias={CATEGORIAS}
        />
      )}
    </div>
  );
};

export default GastosFixos;
