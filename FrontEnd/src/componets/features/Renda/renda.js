import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ProgressoContext } from "../../../context/ProgressoContext";
import Input from "../../shared/Input"; 
import Label from "../../shared/Label";
import Select from "../../shared/Select";
import ModalEdicao from "../../shared/ModalRenda"; 
import styles from "../../../styles/Projecao.module.css"; 


const getAuthHeaders = () => {
  const token = localStorage.getItem("userToken");
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${token}`,
  };
};

const Renda = () => {
  const navigate = useNavigate();

  const progressoContext = useContext(ProgressoContext);
  const etapas = progressoContext?.etapas;
  const etapaAtual = progressoContext?.etapaAtual;
  const navegarParaEtapa = progressoContext?.navegarParaEtapa;

  const [form, setForm] = useState({
    descricao: "",
    valor: "",
    frequencia: "Mensal",
    mesRecebimento: "",
  });
  const [itens, setItens] = useState([]);
  const [itemEditando, setItemEditando] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatarMoeda = (valor) =>
    (valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });

  useEffect(() => {
    const fetchRendas = async () => {
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
        const response = await fetch("http://localhost:3001/api/rendas", {
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
            data.message || `Erro ao buscar receitas: ${response.statusText}` 
          );
        }
        const data = await response.json();
        setItens(data);
      } catch (err) {
        setError(err.message);
        console.error("Erro ao buscar receitas:", err); 
      } finally {
        setLoading(false);
      }
    };
    fetchRendas();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prevForm) => ({ ...prevForm, [name]: value }));
    if (error) setError(null);
  };

  const adicionarItem = async () => {
    if (!form.descricao.trim()) {
      setError("Insira uma descrição.");
      return;
    }
    const valorNum = parseFloat(form.valor);
    if (isNaN(valorNum) || valorNum <= 0) {
      setError("Insira um valor numérico positivo.");
      return;
    }
    if (form.frequencia !== "Mensal" && !form.mesRecebimento) {
      setError("Selecione o mês para frequências não mensais.");
      return;
    }

    const novaRendaPayload = {

      descricao: form.descricao,
      valor: valorNum,
      frequencia: form.frequencia,
      mesRecebimento: form.frequencia === "Mensal" ? null : form.mesRecebimento,
    };

    setLoading(true);
    try {
      const response = await fetch("http://localhost:3001/api/rendas", {
        method: "POST",
        headers: getAuthHeaders(),
        body: JSON.stringify(novaRendaPayload),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Erro ao criar receita.");

      setItens([...itens, data]);
      setForm({
        descricao: "",
        valor: "",
        frequencia: "Mensal",
        mesRecebimento: "",
      });
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const removerItem = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este item?")) {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:3001/api/rendas/${id}`, {
          method: "DELETE",
          headers: getAuthHeaders(),
        });
        if (!response.ok) {
          const data = await response.json().catch(() => ({}));
          throw new Error(data.message || "Erro ao remover receita."); 
        }
        setItens(itens.filter((item) => item.id !== id));
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
      valor: item.valor.toString(),
      mesRecebimento: item.mesRecebimento || "",
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
      mesRecebimento:
        dadosEditados.frequencia === "Mensal"
          ? null
          : dadosEditados.mesRecebimento,
    };

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:3001/api/rendas/${dadosEditados.id}`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Erro ao atualizar receita.");

      setItens(
        itens.map((item) => (item.id === dadosEditados.id ? data : item))
      );
      setItemEditando(null);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const avancarEtapa = () => {
    if (itens.length === 0 && !error) {
      setError("Adicione pelo menos um item de receita antes de avançar.");
      return;
    }
    navigate("/gastos-fixos");
  };

  if (loading && itens.length === 0) {
   
    return <div style={styles.loadingContainer}>Carregando receitas...</div>;
  }

  return (
    <div className={styles.containerPrincipal}>
      <div className={styles.cabecalho}>
        <h1 className={styles.tituloApp}>
          Controla<span className={styles.destaqueTitulo}>+</span>
        </h1>
        <h2 className={styles.subtitulo}>Planejamento de Receita</h2>{" "}
        {/* Atualizado */}
        <p className={styles.textoDescritivo}>
          Informe suas fontes de receitas, como salários, bônus ou rendimentos
          extras. {/* Atualizado */}
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

      <div className={styles["formulario-container"]}>
        <h3 className={styles["titulo-secao"]}>Minhas Receitas</h3>{" "}
        {/* Atualizado */}
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
        )}{" "}
        {/* Feedback de loading para ações */}
        <div className={styles["grupo-campos"]}>
          <div className={styles["campo-formulario"]}>
            <Label>Descrição*</Label>
            <Input
              name="descricao"
              value={form.descricao}
              onChange={handleChange}
              placeholder="Ex: Salário Empresa X"
              disabled={loading}
            />
          </div>
          <div className={styles["campo-formulario"]}>
            <Label>Valor (R$)*</Label>
            <Input
              name="valor"
              type="number"
              value={form.valor}
              onChange={handleChange}
              placeholder="2500,00"
              step="0.01"
              min="0"
              disabled={loading}
            />
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
              <Label>Mês de Recebimento*</Label>
              <Select
                name="mesRecebimento"
                value={form.mesRecebimento}
                onChange={handleChange}
                disabled={loading}
              >
                <option value="">Selecione o mês</option>
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
            {loading ? "Adicionando..." : "Adicionar Receita"}{" "}
            {/* Atualizado */}
          </button>
        </div>
        {itens.length > 0 && (
          <div className={styles["lista-container"]}>
            <h4 className={styles["titulo-lista"]}>
              Minhas Receitas Registradas {/* Atualizado */}
            </h4>
            <div className={styles["itens-lista"]}>
              {itens.map((item) => (
                <div key={item.id} className={styles["item-lista"]}>
                  <div>
                    <p className={styles["descricao-item"]}>{item.descricao}</p>
                    <p className={styles["detalhes-item"]}>
                      <strong>Valor:</strong> {formatarMoeda(item.valor)}
                    </p>
                    <p className={styles["detalhes-item"]}>
                      <strong>Frequência:</strong> {item.frequencia}{" "}
                      {item.mesRecebimento && `(${item.mesRecebimento})`}
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
        )}
        <div className={styles["controle-navegacao"]}>
          <button
            onClick={avancarEtapa}
            className={styles.botao}
            disabled={loading || (itens.length === 0 && !error)}
          >
            Avançar para Gastos
          </button>
        </div>
      </div>

      {itemEditando && (
        <ModalEdicao
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

export default Renda;
