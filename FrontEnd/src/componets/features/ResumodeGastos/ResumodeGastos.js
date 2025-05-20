import React, { useState } from 'react';

export default function ResumodeGastos() {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const [gastosProjetados, setGastosProjetados] = useState([]);  // antes gastosFixos
  const [gastosReais, setGastosReais] = useState([]);            // antes gastosVariados
  const [gastosCompulsivos, setGastosCompulsivos] = useState([]);

  const [modalAberto, setModalAberto] = useState(false);
  const [categoriaAtual, setCategoriaAtual] = useState(null);

  const [mesSelecionado, setMesSelecionado] = useState('Março');
  const [descricao, setDescricao] = useState('');
  const [data, setData] = useState('');
  const [valor, setValor] = useState('');
  const [emocao, setEmocao] = useState('');

  function abrirModal(categoria) {
    setCategoriaAtual(categoria);
    setMesSelecionado('Março');
    setDescricao('');
    setData('');
    setValor('');
    setEmocao('');
    setModalAberto(true);
  }

  function salvarGasto() {
    if (!descricao || !data || !valor) {
      alert('Por favor, preencha todos os campos obrigatórios!');
      return;
    }

    let novoGasto;
    if (categoriaAtual === 'projetados') {
      novoGasto = [descricao, data, valor];
      setGastosProjetados([...gastosProjetados, novoGasto]);
    } else if (categoriaAtual === 'reais') {
      novoGasto = [descricao, descricao, data, valor];
      setGastosReais([...gastosReais, novoGasto]);
    } else if (categoriaAtual === 'compulsivos') {
      if (!emocao) {
        alert('Por favor, preencha a emoção para gastos compulsivos!');
        return;
      }
      novoGasto = [descricao, descricao, data, valor, emocao];
      setGastosCompulsivos([...gastosCompulsivos, novoGasto]);
    }

    setModalAberto(false);
  }

  const entradaMensal = 'R$ 4.500,00';
  const despesasProjetadasTotal = gastosProjetados.reduce((acc, item) => acc + parseValor(item[2]), 0);
  const gastosReaisTotal = gastosReais.reduce((acc, item) => acc + parseValor(item[3]), 0);
  const gastosCompulsivosTotal = gastosCompulsivos.reduce((acc, item) => acc + parseValor(item[3]), 0);

  function parseValor(valorStr) {
    if (!valorStr) return 0;
    return Number(valorStr.replace(/[R$\.\s]/g, '').replace(',', '.'));
  }

  function formatValor(num) {
    return 'R$ ' + num.toFixed(2).replace('.', ',');
  }

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Controle Financeiro</h1>

      <div style={styles.cardContainer}>
        <ResumoCard label="Entrada mensal" value={entradaMensal} />
        <ResumoCard label="Gastos Projetados" value={formatValor(despesasProjetadasTotal)} />
        <ResumoCard label="Gastos Reais" value={formatValor(gastosReaisTotal)} />
        <ResumoCard label="Gastos Compulsivos" value={formatValor(gastosCompulsivosTotal)} />
      </div>

      <TabelaGastos
        titulo="Gastos Projetados"
        colunas={['Gasto', 'Data de Vencimento', 'Valor a ser pago']}
        dados={gastosProjetados}
        onAdd={() => abrirModal('projetados')}
      />

      <TabelaGastos
        titulo="Gastos Reais"
        colunas={['Gasto', 'Descrição', 'Data do pagamento', 'Valor']}
        dados={gastosReais}
        onAdd={() => abrirModal('reais')}
      />

      <TabelaGastos
        titulo="Gastos Compulsivos"
        colunas={['Gasto', 'Descrição', 'Data do pagamento', 'Valor', 'Emoção']}
        dados={gastosCompulsivos}
        onAdd={() => abrirModal('compulsivos')}
      />

      {modalAberto && (
        <div style={styles.modalOverlay} onClick={() => setModalAberto(false)}>
          <div style={styles.modal} onClick={e => e.stopPropagation()}>
            <h2>Adicionar gasto - {categoriaAtual === 'projetados' ? 'Gastos Projetados' : categoriaAtual === 'reais' ? 'Gastos Reais' : 'Gastos Compulsivos'}</h2>

            <label>Mês:</label>
            <select style={styles.select} value={mesSelecionado} onChange={e => setMesSelecionado(e.target.value)}>
              {meses.map((m, i) => (
                <option key={i} value={m}>{m}</option>
              ))}
            </select>

            <label>Descrição:</label>
            <input
              type="text"
              style={styles.input}
              value={descricao}
              onChange={e => setDescricao(e.target.value)}
              placeholder="Descrição do gasto"
            />

            <label>Data:</label>
            <input
              type="date"
              style={styles.input}
              value={data}
              onChange={e => setData(e.target.value)}
            />

            <label>Valor:</label>
            <input
              type="text"
              style={styles.input}
              value={valor}
              onChange={e => setValor(e.target.value)}
              placeholder="R$ 0,00"
            />

            {categoriaAtual === 'compulsivos' && (
              <>
                <label>Emoção:</label>
                <input
                  type="text"
                  style={styles.input}
                  value={emocao}
                  onChange={e => setEmocao(e.target.value)}
                  placeholder="Ex: Tédio, Ansiedade"
                />
              </>
            )}

            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button style={styles.button} onClick={salvarGasto}>Salvar</button>
              <button
                style={{ ...styles.button, backgroundColor: '#aaa' }}
                onClick={() => setModalAberto(false)}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ResumoCard({ label, value }) {
  return (
    <div style={styles.card}>
      <p style={styles.cardLabel}>{label}</p>
      <p style={styles.cardValue}>{value}</p>
    </div>
  );
}

function TabelaGastos({ titulo, colunas, dados, onAdd }) {
  return (
    <div style={styles.tableContainer}>
      <h3 style={styles.tableTitle}>{titulo}</h3>
      <table style={styles.table}>
        <thead>
          <tr>
            {colunas.map((col, i) => (
              <th key={i} style={styles.th}>{col}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dados.map((linha, i) => (
            <tr key={i}>
              {linha.map((celula, j) => (
                <td key={j} style={styles.td}>{celula}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <button style={styles.addButton} onClick={onAdd}>Adicionar gastos</button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    padding: '40px 20px',
    maxWidth: '1000px',
    margin: '0 auto',
    fontFamily: 'Arial, sans-serif',
    color: '#333',
  },
  title: {
    textAlign: 'center',
    fontSize: '32px',
    marginBottom: '25px',
  },
  cardContainer: {
    display: 'flex',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: '10px',
    marginBottom: '40px',
  },
  card: {
    flex: '1',
    backgroundColor: '#ECE9FF',
    padding: '20px',
    borderRadius: '10px',
    textAlign: 'center',
    minWidth: '180px',
    boxShadow: '0 2px 8px rgba(108, 99, 255, 0.2)',
  },
  cardLabel: {
    fontSize: '14px',
    color: '#666',
  },
  cardValue: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#6C63FF',
  },
  tableContainer: {
    marginBottom: '40px',
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
  },
  tableTitle: {
    marginBottom: '15px',
    fontWeight: '550',
    fontSize: '22px',
    color: '#362D59',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  th: {
    borderBottom: '2px solid #6C63FF',
    padding: '10px',
    textAlign: 'left',
    color: '#6C63FF',
  },
  td: {
    borderBottom: '1px solid #ccc',
    padding: '10px',
  },
  addButton: {
    marginTop: '15px',
    padding: '10px 20px',
    backgroundColor: '#6C63FF',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: '#fff',
    padding: '30px',
    borderRadius: '12px',
    width: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
  },
  input: {
    width: '100%',
    padding: '8px',
    margin: '8px 0 15px 0',
    boxSizing: 'border-box',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  select: {
    width: '100%',
    padding: '8px',
    marginBottom: '15px',
    borderRadius: '6px',
    border: '1px solid #ccc',
  },
  button: {
    padding: '10px 20px',
    backgroundColor: '#6C63FF',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
  }
};
