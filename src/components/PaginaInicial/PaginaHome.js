import React, { useState } from "react";
import { Link } from "react-router-dom";
import styles from "./PaginaHome.module.css";

function Gastos() {
  const [salarios, setSalarios] = useState({});
  const [gastos, setGastos] = useState({});
  const [mesSelecionado, setMesSelecionado] = useState("Jan");
  const [salarioInput, setSalarioInput] = useState("");
  const [modalAberto, setModalAberto] = useState(false);
  const [nomeGasto, setNomeGasto] = useState("");
  const [valorGasto, setValorGasto] = useState("");
  const [editandoIndex, setEditandoIndex] = useState(null);

  const meses = [
    "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
    "Jul", "Ago", "Set", "Out", "Nov", "Dez"
  ];

  const salvarSalario = () => {
    setSalarios({ ...salarios, [mesSelecionado]: parseFloat(salarioInput || 0) });
    setSalarioInput("");
  };

  const abrirModal = (index = null) => {
    if (index !== null) {
      const gasto = gastos[mesSelecionado][index];
      setNomeGasto(gasto.nome);
      setValorGasto(gasto.valor);
      setEditandoIndex(index);
    } else {
      setNomeGasto("");
      setValorGasto("");
      setEditandoIndex(null);
    }
    setModalAberto(true);
  };

  const fecharModal = () => {
    setModalAberto(false);
    setEditandoIndex(null);
  };

  const salvarGasto = () => {
    const gastoAtual = gastos[mesSelecionado] || [];
    const novoGasto = { nome: nomeGasto, valor: parseFloat(valorGasto || 0) };

    let novosGastos;
    if (editandoIndex !== null) {
      novosGastos = [...gastoAtual];
      novosGastos[editandoIndex] = novoGasto;
    } else {
      novosGastos = [...gastoAtual, novoGasto];
    }

    setGastos({ ...gastos, [mesSelecionado]: novosGastos });
    fecharModal();
  };

  const excluirGasto = (index) => {
    const gastoAtual = gastos[mesSelecionado] || [];
    const novosGastos = gastoAtual.filter((_, i) => i !== index);
    setGastos({ ...gastos, [mesSelecionado]: novosGastos });
  };

  const totalGastos = (gastos[mesSelecionado] || []).reduce((acc, gasto) => acc + gasto.valor, 0);
  const salarioAtual = salarios[mesSelecionado] || 0;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Controla+</h1>
        <div className={styles.navLinks}>
          <Link to="/PaginaHome" className={styles.link}>Home</Link> {/*FAZER AS ROTAS DESSES LINKS*/}
          <Link to="/ProjecaoFinanceira" className={styles.link}>Projeção</Link>{/*FAZER AS ROTAS DESSES LINKS*/}
          <Link to="/Blog" className={styles.link}>Blog</Link>{/*FAZER AS ROTAS DESSES LINKS*/}
        </div>
      </header>

      <h1 className={styles.titulo}>Gastos Mensais</h1>

      <div className={styles.botoesMeses}>
        {meses.map((mes) => (
          <button
            key={mes}
            className={`${styles.botaoMes} ${mes === mesSelecionado ? styles.ativo : ""}`}
            onClick={() => setMesSelecionado(mes)}
          >
            {mes}
          </button>
        ))}
      </div>

      <div className={styles.inputSalario}>
        <label>Salário do mês:</label>
        <input
          type="number"
          placeholder="Digite seu salário"
          value={salarioInput}
          onChange={(e) => setSalarioInput(e.target.value)}
        />
        <button className={styles.botaoSalvar} onClick={salvarSalario}>
          Salvar Salário
        </button>
      </div>

      <div className={styles.cardsContainer}>
        <div className={styles.card}>
          <h3>Salário</h3>
          <p>R$ {salarioAtual.toFixed(2)}</p>
        </div>
        <div className={styles.card}>
          <h3>Gastos</h3>
          <p>R$ {totalGastos.toFixed(2)}</p>
        </div>
        <div className={styles.card}>
          <h3>Saldo</h3>
          <p>R$ {(salarioAtual - totalGastos).toFixed(2)}</p>
        </div>
      </div>

      <div className={styles.listaGastos}>
        {(gastos[mesSelecionado] || []).map((gasto, index) => (
          <div key={index} className={styles.itemGasto}>
            <div className={styles.infoGasto}>
              <span>{gasto.nome}</span>
              <span>R$ {gasto.valor.toFixed(2)}</span>
            </div>
            <div className={styles.acoesGasto}>
              <button
                className={`${styles.botaoPequeno} ${styles.botaoEditar}`}
                onClick={() => abrirModal(index)}
              >
                Editar
              </button>
              <button
                className={`${styles.botaoPequeno} ${styles.botaoExcluir}`}
                onClick={() => excluirGasto(index)}
              >
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className={styles.botaoAdicionar} onClick={() => abrirModal()}>
        + Adicionar Gastos
      </button>

      {modalAberto && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2>{editandoIndex !== null ? "Editar Gasto" : "Adicionar Gasto"}</h2>
            <input
              type="text"
              placeholder="Nome do gasto"
              value={nomeGasto}
              onChange={(e) => setNomeGasto(e.target.value)}
            />
            <input
              type="number"
              placeholder="Valor (R$)"
              value={valorGasto}
              onChange={(e) => setValorGasto(e.target.value)}
            />
            <button className={styles.botaoSalvar} onClick={salvarGasto}>
              Salvar
            </button>
            <button className={styles.botaoCancelar} onClick={fecharModal}>
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Gastos;
