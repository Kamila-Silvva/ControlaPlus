import React, { useState } from 'react';
import CadastroFinanceiro from './CadastroFinanceiro';
import ProjecaoFinanceira from './ProjecaoFinanceira';

const ProgramacaoFinanceira = () => {
  const [gastos, setGastos] = useState([]);
  const [recebimentos, setRecebimentos] = useState([]);
  const [metas, setMetas] = useState([]);

  const handleAdicionar = (item) => {
    if (item.tipo === 'gasto') {
      setGastos([...gastos, item]);
    } else {
      setRecebimentos([...recebimentos, item]);
    }
  };

  const handleAdicionarMeta = (meta) => {
    setMetas([...metas, meta]);
  };

  return (
    <div style={{
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '20px',
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      backgroundColor: '#f8f9fa'
    }}>
      <h1 style={{
        color: '#2c3e50',
        textAlign: 'center',
        marginBottom: '30px',
        fontSize: '2.2rem',
        fontWeight: '600'
      }}>Programação Financeira</h1>

      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '20px',
        marginBottom: '30px'
      }}>
        {/* Seção Cadastro Financeiro */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '25px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <CadastroFinanceiro onAdicionar={handleAdicionar} />
        </div>

        {/* Seção Adicionar Meta - NOVA VERSÃO */}
        <div style={{
          backgroundColor: 'white',
          borderRadius: '10px',
          padding: '25px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }}>
          <h2 style={{
            color: '#2c3e50',
            marginTop: '0',
            marginBottom: '20px',
            fontSize: '1.5rem',
            fontWeight: '600',
            borderBottom: '2px solid #f0f0f0',
            paddingBottom: '10px'
          }}>Adicionar Meta Financeira</h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const descricao = e.target.descricao.value;
              const valorTotal = parseFloat(e.target.valorTotal.value);
              const prazo = parseInt(e.target.prazo.value);
              const valorMensal = valorTotal / prazo;
              handleAdicionarMeta({ descricao, valorTotal, prazo, valorMensal });
              e.target.reset();
            }}
          >
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
              gap: '20px',
              marginBottom: '20px'
            }}>
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#34495e',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>
                  Descrição:
                </label>
                <input
                  type="text"
                  name="descricao"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    transition: 'border 0.3s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Ex.: Comprar carro"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#34495e',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>
                  Valor Total (R$):
                </label>
                <input
                  type="number"
                  name="valorTotal"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    transition: 'border 0.3s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Ex.: 50000"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '8px',
                  color: '#34495e',
                  fontSize: '0.95rem',
                  fontWeight: '500'
                }}>
                  Prazo (meses):
                </label>
                <input
                  type="number"
                  name="prazo"
                  required
                  style={{
                    width: '100%',
                    padding: '12px 15px',
                    border: '1px solid #e0e0e0',
                    borderRadius: '6px',
                    fontSize: '1rem',
                    transition: 'border 0.3s',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Ex.: 12"
                  min="1"
                />
              </div>
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: '14px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                cursor: 'pointer',
                fontWeight: '600',
                transition: 'background-color 0.3s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#45a049'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#4CAF50'}
            >
              Cadastrar Meta
            </button>
          </form>
        </div>
      </div>

      {/* Seção Projeção Financeira */}
      <div style={{
        backgroundColor: 'white',
        borderRadius: '10px',
        padding: '25px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <ProjecaoFinanceira
          gastos={gastos}
          recebimentos={recebimentos}
          metas={metas}
        />
      </div>
    </div>
  );
};

export default ProgramacaoFinanceira;