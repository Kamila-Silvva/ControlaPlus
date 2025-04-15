import React, { useState } from 'react';

const CadastroFinanceiro = ({ onAdicionar }) => {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState('gasto');
  const [data, setData] = useState('');
  const [frequencia, setFrequencia] = useState('mensal');

  const handleSubmit = (e) => {
    e.preventDefault();

    if ((frequencia === 'anual' || frequencia === 'único') && !data) {
      alert('Por favor, informe a data para frequências anuais ou únicas.');
      return;
    }

    const item = {
      descricao,
      valor: parseFloat(valor),
      tipo,
      data: frequencia === 'anual' || frequencia === 'único' ? data : null,
      frequencia,
    };

    onAdicionar(item);
    setDescricao('');
    setValor('');
    setData('');
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.header}>Cadastro Financeiro</h2>
      
      <form onSubmit={handleSubmit} style={styles.form}>
        <div style={styles.formGroup}>
          <label style={styles.label}>
            Descrição:
            <input
              type="text"
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              style={styles.input}
              required
            />
          </label>
        </div>

        <div style={styles.formGroup}>
          <label style={styles.label}>
            Valor:
            <input
              type="number"
              value={valor}
              onChange={(e) => setValor(e.target.value)}
              style={styles.input}
              required
            />
          </label>
        </div>

        <div style={styles.formRow}>
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Tipo:
              <select 
                value={tipo} 
                onChange={(e) => setTipo(e.target.value)}
                style={styles.select}
              >
                <option value="gasto">Gasto</option>
                <option value="recebimento">Recebimento</option>
              </select>
            </label>
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>
              Frequência:
              <select 
                value={frequencia} 
                onChange={(e) => setFrequencia(e.target.value)}
                style={styles.select}
              >
                <option value="mensal">Mensal</option>
                <option value="trimestral">Trimestral</option>
                <option value="semestral">Semestral</option>
                <option value="anual">Anual</option>
                <option value="único">Único</option>
              </select>
            </label>
          </div>
        </div>

        {(frequencia === 'anual' || frequencia === 'único') && (
          <div style={styles.formGroup}>
            <label style={styles.label}>
              Data:
              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
                style={styles.input}
                required
              />
            </label>
          </div>
        )}

        <button type="submit" style={styles.button}>
          Adicionar
        </button>
      </form>
    </div>
  );
};

const styles = {
  container: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    marginBottom: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  header: {
    color: '#6F7BBF',
    marginTop: 0,
    marginBottom: '20px',
    textAlign: 'center',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formRow: {
    display: 'flex',
    gap: '15px',
  },
  formGroup: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '5px',
    fontSize: '0.9rem',
    color: '#0D0C0B',
  },
  input: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
  },
  select: {
    padding: '10px',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    backgroundColor: 'white',
  },
  button: {
    padding: '12px',
    backgroundColor: '#6F7BBF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
    marginTop: '10px',
    '&:hover': {
      backgroundColor: '#5a67a8',
    },
  },
};

export default CadastroFinanceiro;