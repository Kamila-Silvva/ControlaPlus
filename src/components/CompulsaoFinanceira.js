import React, { useState, useEffect, useRef } from 'react';
import { Chart } from 'chart.js/auto';

const CompulsaoFinanceira = () => {
  const [view, setView] = useState('mensal');
  
  // Refs para os elementos canvas
  const graficoCompulsaoMensalRef = useRef(null);
  const graficoGatilhosRef = useRef(null);
  const graficoProgressoAnualRef = useRef(null);
  const graficoHabitosRef = useRef(null);
  
  // Instâncias dos gráficos
  const graficoCompulsaoMensalInstance = useRef(null);
  const graficoGatilhosInstance = useRef(null);
  const graficoProgressoAnualInstance = useRef(null);
  const graficoHabitosInstance = useRef(null);

  // Inicializar gráficos
  useEffect(() => {
    // Função para destruir gráficos existentes
    const destroyCharts = () => {
      if (graficoCompulsaoMensalInstance.current) {
        graficoCompulsaoMensalInstance.current.destroy();
      }
      if (graficoGatilhosInstance.current) {
        graficoGatilhosInstance.current.destroy();
      }
      if (graficoProgressoAnualInstance.current) {
        graficoProgressoAnualInstance.current.destroy();
      }
      if (graficoHabitosInstance.current) {
        graficoHabitosInstance.current.destroy();
      }
    };

    destroyCharts();

    // Criar novos gráficos
    if (graficoCompulsaoMensalRef.current) {
      graficoCompulsaoMensalInstance.current = new Chart(
        graficoCompulsaoMensalRef.current,
        {
          type: 'bar',
          data: {
            labels: ['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'],
            datasets: [{
              label: 'Gastos compulsivos',
              data: [280, 120, 80, 0],
              backgroundColor: '#ff6b81',
              borderRadius: 6
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Gastos Compulsivos por Semana (Março)',
                font: { size: 14 }
              },
              legend: { display: false }
            },
            scales: {
              y: { 
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return 'R$ ' + value;
                  }
                }
              }
            }
          }
        }
      );
    }

    if (graficoGatilhosRef.current) {
      graficoGatilhosInstance.current = new Chart(
        graficoGatilhosRef.current,
        {
          type: 'doughnut',
          data: {
            labels: ['Tédio', 'Estresse', 'Promoções', 'FOMO', 'Outros'],
            datasets: [{
              data: [35, 30, 20, 10, 5],
              backgroundColor: [
                '#6F7BBF',
                '#ff6b81',
                '#F29F80',
                '#FFD166',
                '#9B9B9B'
              ],
              borderWidth: 0
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Principais Gatilhos de Compulsão',
                font: { size: 14 }
              },
              legend: { position: 'bottom' }
            },
            cutout: '65%'
          }
        }
      );
    }

    if (graficoProgressoAnualRef.current) {
      graficoProgressoAnualInstance.current = new Chart(
        graficoProgressoAnualRef.current,
        {
          type: 'line',
          data: {
            labels: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
            datasets: [{
              label: 'Gastos compulsivos',
              data: [850, 600, 120, 950, 400, 300, 200, 350, 180, 150, 100, 50],
              borderColor: '#ff6b81',
              backgroundColor: 'rgba(255, 107, 129, 0.1)',
              tension: 0.3,
              fill: true
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Redução de Gastos Compulsivos em 2023',
                font: { size: 14 }
              },
              legend: { display: false }
            },
            scales: {
              y: { 
                beginAtZero: true,
                ticks: {
                  callback: function(value) {
                    return 'R$ ' + value;
                  }
                }
              }
            }
          }
        }
      );
    }

    if (graficoHabitosRef.current) {
      graficoHabitosInstance.current = new Chart(
        graficoHabitosRef.current,
        {
          type: 'radar',
          data: {
            labels: ['Autocontrole', 'Consciência', 'Planejamento', 'Resistência', 'Economia'],
            datasets: [{
              label: 'Início do Ano',
              data: [30, 40, 25, 20, 35],
              borderColor: '#6F7BBF',
              backgroundColor: 'rgba(111, 123, 191, 0.2)',
              pointBackgroundColor: '#6F7BBF'
            },
            {
              label: 'Agora',
              data: [70, 85, 75, 80, 90],
              borderColor: '#79A3D9',
              backgroundColor: 'rgba(121, 163, 217, 0.2)',
              pointBackgroundColor: '#79A3D9'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              title: {
                display: true,
                text: 'Evolução dos Seus Hábitos Financeiros',
                font: { size: 14 }
              },
              legend: { position: 'bottom' }
            },
            scales: {
              r: {
                angleLines: {
                  display: true
                },
                suggestedMin: 0,
                suggestedMax: 100
              }
            }
          }
        }
      );
    }

    // Função de limpeza
    return () => {
      destroyCharts();
    };
  }, [view]);

  const toggleView = (newView) => {
    setView(newView);
  };

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.headerTitle}>Controla+</h1>
        <p style={styles.headerSubtitle}>Controle sua compulsão financeira</p>
      </div>
      
      {/* Botões de alternância */}
      <div style={styles.toggleView}>
        <button 
          style={{
            ...styles.toggleBtn,
            ...(view === 'mensal' ? styles.toggleBtnActive : {})
          }} 
          onClick={() => toggleView('mensal')}
        >
          Visão Mensal
        </button>
        <button 
          style={{
            ...styles.toggleBtn,
            ...(view === 'anual' ? styles.toggleBtnActive : {})
          }} 
          onClick={() => toggleView('anual')}
        >
          Progresso Anual
        </button>
      </div>
      
      {/* Visão Mensal */}
      <div style={{display: view === 'mensal' ? 'block' : 'none'}}>
        <div style={styles.resumoGrid}>
          <div style={styles.resumoCard}>
            <h3 style={styles.resumoCardTitle}>Dias sem compulsão</h3>
            <div style={styles.contador}>12</div>
            <small>Recorde: 18 dias</small>
          </div>
          <div style={styles.resumoCard}>
            <h3 style={styles.resumoCardTitle}>Gastos compulsivos</h3>
            <p style={styles.resumoCardValue}>R$ 420</p>
            <small>↓ 35% vs mês passado</small>
          </div>
          <div style={styles.resumoCard}>
            <h3 style={styles.resumoCardTitle}>Meta de controle</h3>
            <p style={styles.resumoCardValue}>R$ 300/500</p>
            <div style={styles.metaBar}>
              <div style={{...styles.metaProgress, width: '60%'}}></div>
            </div>
            <small>60% alcançado</small>
          </div>
        </div>
        
        <div style={styles.alertaUrgente}>
          ⚠️ ATENÇÃO: Você gastou R$ 150 com compras por impulso nos últimos 3 dias
        </div>
        
        <div style={styles.alertaPositivo}>
          ✅ Você evitou 5 compras por impulso esta semana, economizando R$ 320
        </div>
        
        <div style={styles.graficoContainer}>
          <canvas ref={graficoCompulsaoMensalRef}></canvas>
        </div>
        
        <div style={styles.graficoContainer}>
          <canvas ref={graficoGatilhosRef}></canvas>
        </div>
        
        <div style={styles.botoes}>
          <button style={styles.botaoUrgente}>Registrar Compulsão</button>
          <button style={styles.botao}>Registrar Vitória</button>
        </div>
        <p style={styles.dica}>Clique no botão sempre que resistir a uma compulsão!</p>
      </div>
      
      {/* Visão Anual */}
      <div style={{display: view === 'anual' ? 'block' : 'none'}}>
        <div style={styles.resumoGrid}>
          <div style={styles.resumoCard}>
            <h3 style={styles.resumoCardTitle}>Meses sob controle</h3>
            <div style={styles.contador}>5/12</div>
            <small>Meta: 10 meses</small>
          </div>
          <div style={styles.resumoCard}>
            <h3 style={styles.resumoCardTitle}>Economia anual</h3>
            <p style={styles.resumoCardValue}>R$ 3.240</p>
            <small>+18% vs ano passado</small>
          </div>
          <div style={styles.resumoCard}>
            <h3 style={styles.resumoCardTitle}>Redução compulsão</h3>
            <p style={styles.resumoCardValue}>42%</p>
            <div style={styles.metaBar}>
              <div style={{...styles.metaProgress, width: '42%'}}></div>
            </div>
            <small>Meta: 60% menos compulsão</small>
          </div>
        </div>
        
        <div style={styles.graficoContainer}>
          <canvas ref={graficoProgressoAnualRef}></canvas>
        </div>
        
        <div style={styles.graficoContainer}>
          <canvas ref={graficoHabitosRef}></canvas>
        </div>
        
        <div style={styles.alertaPositivo}>
          🎉 Seu melhor mês foi março, com apenas R$ 120 em gastos compulsivos!
        </div>
        
        <div style={styles.alertaNegativo}>
          📅 Abril foi seu mês mais difícil - vamos analisar os gatilhos?
        </div>
        
        <div style={styles.botoes}>
          <button style={styles.botao}>Ver Minhas Conquistas</button>
          <button style={styles.botao}>Analisar Gatilhos</button>
        </div>
      </div>
    </div>
  );
};

// Estilos em JavaScript (equivalente ao CSS original)
const styles = {
  container: {
    fontFamily: "'Arial', sans-serif",
    margin: '0 auto',
    padding: '20px',
    color: '#0D0C0B',
    backgroundColor: 'white',
    maxWidth: '800px',
    lineHeight: 1.6,
  },
  header: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  headerTitle: {
    color: '#6F7BBF',
    marginBottom: '5px',
  },
  headerSubtitle: {
    margin: 0,
  },
  toggleView: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginBottom: '20px',
  },
  toggleBtn: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '20px',
    backgroundColor: '#F0F0F2',
    color: '#0D0C0B',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s',
  },
  toggleBtnActive: {
    backgroundColor: '#6F7BBF',
    color: 'white',
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
  contador: {
    fontSize: '2rem',
    color: '#79A3D9',
    fontWeight: 'bold',
    margin: '10px 0',
  },
  metaBar: {
    height: '6px',
    background: '#e0e0e0',
    borderRadius: '3px',
    margin: '8px auto',
    width: '80%',
  },
  metaProgress: {
    height: '100%',
    background: '#79A3D9',
    borderRadius: '3px',
  },
  graficoContainer: {
    background: 'white',
    borderRadius: '8px',
    padding: '15px',
    height: '280px',
    marginBottom: '20px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
  },
  alerta: {
    backgroundColor: '#f8f9fa',
    borderLeft: '4px solid #6F7BBF',
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '0 4px 4px 0',
    fontSize: '0.9rem',
  },
  alertaPositivo: {
    backgroundColor: '#f0f8ff',
    borderLeft: '4px solid #79A3D9',
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '0 4px 4px 0',
    fontSize: '0.9rem',
  },
  alertaNegativo: {
    backgroundColor: '#fff0f0',
    borderLeft: '4px solid #F29F80',
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '0 4px 4px 0',
    fontSize: '0.9rem',
  },
  alertaUrgente: {
    backgroundColor: '#fff0f0',
    borderLeft: '4px solid #ff6b81',
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '0 4px 4px 0',
    fontSize: '0.9rem',
    animation: 'pulse 2s infinite',
  },
  botoes: {
    display: 'flex',
    justifyContent: 'center',
    gap: '10px',
    marginTop: '20px',
  },
  botao: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '20px',
    backgroundColor: '#6F7BBF',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s',
  },
  botaoUrgente: {
    padding: '10px 20px',
    border: 'none',
    borderRadius: '20px',
    backgroundColor: '#ff6b81',
    color: 'white',
    cursor: 'pointer',
    fontSize: '0.9rem',
    transition: 'all 0.3s',
  },
  dica: {
    fontSize: '0.8rem',
    color: '#666',
    textAlign: 'center',
    margin: '5px 0',
    fontStyle: 'italic',
  },
  '@keyframes pulse': {
    '0%': { transform: 'scale(1)' },
    '50%': { transform: 'scale(1.02)' },
    '100%': { transform: 'scale(1)' },
  },
};

export default CompulsaoFinanceira;