import React, { useState } from 'react';

const ProjecaoFinanceira = ({ gastos, recebimentos, metas }) => {
  const meses = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const [mesExpandido, setMesExpandido] = useState(null);

  const toggleExpandirMes = (index) => {
    setMesExpandido(mesExpandido === index ? null : index);
  };

const calcularGastosMes = (mesIndex) => {
  let total = gastos.reduce((total, gasto) => {
    if (gasto.frequencia === 'mensal') return total + gasto.valor;
    if (gasto.frequencia === 'trimestral' && mesIndex % 3 === 0) return total + gasto.valor;
    if (gasto.frequencia === 'semestral' && (mesIndex === 0 || mesIndex === 6)) return total + gasto.valor;
    if ((gasto.frequencia === 'anual' || gasto.frequencia === 'único') && new Date(gasto.data).getMonth() === mesIndex) {
      return total + gasto.valor;
    }
    return total;
  }, 0);

  // Modificação para considerar apenas o prazo da meta
  const totalMetas = metas.reduce((totalMeta, meta) => {
    // Verifica se o mês atual está dentro do prazo da meta
    if (mesIndex < meta.prazo) {
      return totalMeta + meta.valorMensal;
    }
    return totalMeta;
  }, 0);

  return total + totalMetas;
};
  const calcularRecebimentosMes = (mesIndex) => {
    return recebimentos.reduce((total, recebimento) => {
      if (recebimento.frequencia === 'mensal') return total + recebimento.valor;
      if (recebimento.frequencia === 'trimestral' && mesIndex % 3 === 0) return total + recebimento.valor;
      if (recebimento.frequencia === 'semestral' && (mesIndex === 0 || mesIndex === 6)) return total + recebimento.valor;
      if ((recebimento.frequencia === 'anual' || recebimento.frequencia === 'único') && new Date(recebimento.data).getMonth() === mesIndex) {
        return total + recebimento.valor;
      }
      return total;
    }, 0);
  };

  const filtrarGastosMes = (mesIndex) => {
    const gastosNormais = gastos.filter((gasto) => {
      if (gasto.frequencia === 'mensal') return true;
      if (gasto.frequencia === 'trimestral') return mesIndex % 3 === 0;
      if (gasto.frequencia === 'semestral') return mesIndex === 0 || mesIndex === 6;
      if (gasto.frequencia === 'anual' || gasto.frequencia === 'único') {
        return new Date(gasto.data).getMonth() === mesIndex;
      }
      return false;
    });
  
    const gastosMetas = metas
      .filter(meta => mesIndex < meta.prazo) // Filtra apenas metas que devem aparecer neste mês
      .map((meta) => ({
        descricao: `Meta: ${meta.descricao} (${mesIndex + 1}/${meta.prazo})`,
        valor: meta.valorMensal,
        frequencia: 'mensal',
      }));
  
    return [...gastosNormais, ...gastosMetas];
  };

  const filtrarRecebimentosMes = (mesIndex) => {
    return recebimentos.filter((recebimento) => {
      if (recebimento.frequencia === 'mensal') return true;
      if (recebimento.frequencia === 'trimestral') return mesIndex % 3 === 0;
      if (recebimento.frequencia === 'semestral') return mesIndex === 0 || mesIndex === 6;
      if (recebimento.frequencia === 'anual' || recebimento.frequencia === 'único') {
        return new Date(recebimento.data).getMonth() === mesIndex;
      }
      return false;
    });
  };

  const projecao = meses.map((mes, index) => {
    const recebimentosMes = calcularRecebimentosMes(index);
    const gastosMes = calcularGastosMes(index);
    const saldo = recebimentosMes - gastosMes;

    return {
      mes,
      recebimentos: recebimentosMes,
      gastos: gastosMes,
      saldo,
      gastosDetalhados: filtrarGastosMes(index),
      recebimentosDetalhados: filtrarRecebimentosMes(index),
    };
  });

  return (
    <div className="projecao-container">
      <h2 style={styles.header}>Projeção Financeira Anual</h2>
      
      <div className="resumo-grid" style={styles.resumoGrid}>
        <div className="resumo-card" style={styles.resumoCard}>
          <h3 style={styles.resumoCardTitle}>Receita Total</h3>
          <p style={styles.resumoCardValue}>
            R$ {projecao.reduce((sum, item) => sum + item.recebimentos, 0).toFixed(2)}
          </p>
        </div>
        <div className="resumo-card" style={styles.resumoCard}>
          <h3 style={styles.resumoCardTitle}>Despesa Total</h3>
          <p style={styles.resumoCardValue}>
            R$ {projecao.reduce((sum, item) => sum + item.gastos, 0).toFixed(2)}
          </p>
        </div>
        <div className="resumo-card" style={styles.resumoCard}>
          <h3 style={styles.resumoCardTitle}>Saldo Anual</h3>
          <p style={{...styles.resumoCardValue, color: projecao.reduce((sum, item) => sum + item.saldo, 0) >= 0 ? '#79A3D9' : '#ff6b81'}}>
            R$ {projecao.reduce((sum, item) => sum + item.saldo, 0).toFixed(2)}
          </p>
        </div>
      </div>

      <div className="tabela-container" style={styles.tabelaContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.tableHeaderRow}>
              <th style={styles.tableHeader}>Mês</th>
              <th style={styles.tableHeader}>Recebimentos</th>
              <th style={styles.tableHeader}>Gastos</th>
              <th style={styles.tableHeader}>Saldo</th>
              <th style={styles.tableHeader}>Detalhes</th>
            </tr>
          </thead>
          <tbody>
            {projecao.map((item, index) => (
              <React.Fragment key={index}>
                <tr style={styles.tableRow}>
                  <td style={styles.tableCell}>{item.mes}</td>
                  <td style={styles.tableCell}>R$ {item.recebimentos.toFixed(2)}</td>
                  <td style={styles.tableCell}>R$ {item.gastos.toFixed(2)}</td>
                  <td style={{...styles.tableCell, color: item.saldo >= 0 ? '#79A3D9' : '#ff6b81'}}>
                    R$ {item.saldo.toFixed(2)}
                  </td>
                  <td style={styles.tableCell}>
                    <button 
                      style={styles.detailsButton}
                      onClick={() => toggleExpandirMes(index)}
                    >
                      {mesExpandido === index ? '▲' : '▼'}
                    </button>
                  </td>
                </tr>
                {mesExpandido === index && (
                  <tr>
                    <td colSpan="5" style={styles.expandedCell}>
                      <div style={styles.detailsContainer}>
                        <div style={styles.detailsSection}>
                          <h4 style={styles.detailsTitle}>Gastos:</h4>
                          <ul style={styles.detailsList}>
                            {item.gastosDetalhados.map((gasto, i) => (
                              <li key={i} style={styles.detailsListItem}>
                                <span style={styles.detailDescription}>{gasto.descricao}</span>
                                <span style={styles.detailValue}>R$ {gasto.valor.toFixed(2)}</span>
                                <span style={styles.detailFrequency}>({gasto.frequencia})</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div style={styles.detailsSection}>
                          <h4 style={styles.detailsTitle}>Recebimentos:</h4>
                          <ul style={styles.detailsList}>
                            {item.recebimentosDetalhados.map((recebimento, i) => (
                              <li key={i} style={styles.detailsListItem}>
                                <span style={styles.detailDescription}>{recebimento.descricao}</span>
                                <span style={styles.detailValue}>R$ {recebimento.valor.toFixed(2)}</span>
                                <span style={styles.detailFrequency}>({recebimento.frequencia})</span>
                              </li>
                            ))}
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
  );
};

const styles = {
  header: {
    color: '#6F7BBF',
    textAlign: 'center',
    marginBottom: '20px',
  },
  resumoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '25px',
  },
  resumoCard: {
    backgroundColor: '#F0F0F2',
    borderRadius: '8px',
    padding: '15px',
    textAlign: 'center',
  },
  resumoCardTitle: {
    marginTop: 0,
    fontSize: '1rem',
    color: '#6F7BBF',
  },
  resumoCardValue: {
    marginBottom: 0,
    fontSize: '1.4rem',
    fontWeight: 'bold',
  },
  tabelaContainer: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '15px',
    marginBottom: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tableHeaderRow: {
    backgroundColor: '#F0F0F2',
  },
  tableHeader: {
    padding: '12px',
    textAlign: 'left',
    color: '#6F7BBF',
    borderBottom: '1px solid #ddd',
  },
  tableRow: {
    borderBottom: '1px solid #eee',
    '&:hover': {
      backgroundColor: '#f9f9f9',
    },
  },
  tableCell: {
    padding: '12px',
    borderBottom: '1px solid #eee',
  },
  detailsButton: {
    padding: '5px 10px',
    backgroundColor: '#6F7BBF',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  expandedCell: {
    padding: '15px',
    backgroundColor: '#f9f9f9',
  },
  detailsContainer: {
    display: 'flex',
    gap: '20px',
  },
  detailsSection: {
    flex: 1,
  },
  detailsTitle: {
    color: '#6F7BBF',
    marginTop: 0,
  },
  detailsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
  },
  detailsListItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '8px 0',
    borderBottom: '1px solid #eee',
  },
  detailDescription: {
    flex: 2,
  },
  detailValue: {
    flex: 1,
    textAlign: 'right',
    fontWeight: 'bold',
  },
  detailFrequency: {
    flex: 1,
    textAlign: 'right',
    color: '#666',
    fontSize: '0.8rem',
  },
};

export default ProjecaoFinanceira;