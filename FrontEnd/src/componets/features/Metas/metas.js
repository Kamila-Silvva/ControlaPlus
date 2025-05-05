import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressoContext } from '../../../context/ProgressoContext';
import ModalEdicao from '../../shared/ModalMeta';
import api from '../../../services/api';
import styles from '../../../styles/Projecao.module.css';

const formatarMoeda = (valor) => {
  return (valor || 0).toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  });
};

const MetasInvestimentos = () => {
  const navigate = useNavigate();
  const { etapas, etapaAtual } = useContext(ProgressoContext);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("Meta");
  const [prazoMeses, setPrazoMeses] = useState(1);
  const [metas, setMetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemEditando, setItemEditando] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarMetas = async () => {
      try {
        const response = await api.getMetas();
        setMetas(response.data);
        setError(null);
      } catch (error) {
        setError('Erro ao carregar metas');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarMetas();
  }, []);

  const adicionarItem = async () => {
    try {
      if (!descricao.trim()) throw new Error("Insira uma descrição");
      
      const valorTotal = parseFloat(valor);
      if (isNaN(valorTotal)) throw new Error("Valor inválido");
      
      const prazoNumerico = parseInt(prazoMeses);
      if (isNaN(prazoNumerico)) throw new Error("Prazo inválido");

      const response = await api.createMeta({
        descricao,
        valorTotal,
        tipo,
        prazoMeses: prazoNumerico
      });
      
      setMetas([...metas, response.data]);
      setDescricao("");
      setValor("");
      setTipo("Meta");
      setPrazoMeses(1);
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const removerItem = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este item?")) {
      try {
        await api.deleteMeta(id);
        setMetas(metas.filter(item => item.id !== id));
        setError(null);
      } catch (error) {
        setError('Erro ao remover meta');
      }
    }
  };

  const editarItem = (item) => {
    setItemEditando(item);
  };

  const salvarEdicao = async (dadosEditados) => {
    try {
      const valorTotal = parseFloat(dadosEditados.valor);
      const prazoMeses = parseInt(dadosEditados.prazoMeses);
      
      const response = await api.updateMeta(dadosEditados.id, {
        descricao: dadosEditados.descricao,
        valorTotal,
        tipo: dadosEditados.tipo,
        prazoMeses,
        valorParcela: valorTotal / prazoMeses
      });
      
      setMetas(metas.map(item => 
        item.id === dadosEditados.id ? response.data : item
      ));
      setItemEditando(null);
      setError(null);
    } catch (error) {
      setError('Erro ao atualizar meta');
    }
  };

  const avancarEtapa = () => {
    if (metas.length === 0) {
      setError("Adicione pelo menos uma meta ou investimento");
      return;
    }
    navigate('/projecao');
  };

  const voltarEtapa = () => {
    navigate('/gastos-fixos');
  };

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.containerPrincipal}>
      <div className={styles.cabecalho}>
        <h1 className={styles.tituloApp}>Controla<span className={styles.destaqueTitulo}>+</span></h1>
        <h2 className={styles.subtitulo}>Projeção</h2>
        <p className={styles.textoDescritivo}>
          Defina suas metas e investimentos para alcançar seus objetivos financeiros.
        </p>
      </div>

      {error && <div className={styles['error-message']}>{error}</div>}

      <div className={styles.barraProgresso}>
        {etapas.map((etapa, index) => (
          <div key={index} className={styles.etapaContainer}>
            <div className={`${styles.marcadorEtapa} ${index === etapaAtual ? styles['etapa-ativa'] : styles['etapa-inativa']}`}>
              {index + 1}
            </div>
            <span className={`${styles['rotulo-etapa']} ${index === etapaAtual ? styles['rotulo-ativo'] : styles['rotulo-inativo']}`}>
              {etapa}
            </span>
          </div>
        ))}
      </div>

      <div className={styles['formulario-container-metas']}>
        <h3 className={styles['titulo-secao']}>Metas e Investimentos</h3>
        
        <div className={styles['grupo-campos']}>
          <div className={styles['campo-formulario']}>
            <label className={styles.rotulo}>Descrição</label>
            <input 
              className={styles['campo-input']}
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              placeholder="Ex: Viagem para Europa" 
            />
          </div>
          
          <div className={styles['campo-formulario']}>
            <label className={styles.rotulo}>Valor Total (R$)</label>
            <input 
              className={styles['campo-input']}
              type="number" 
              value={valor} 
              onChange={(e) => setValor(e.target.value)} 
              placeholder="10000,00"
              step="0.01"
              min="0"
            />
          </div>
          
          <div className={styles['campo-formulario']}>
            <label className={styles.rotulo}>Tipo</label>
            <select 
              className={styles['campo-select']}
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="Meta">Meta</option>
              <option value="Investimento">Investimento</option>
            </select>
          </div>

          <div className={styles['campo-formulario']}>
            <label className={styles.rotulo}>Prazo (meses)</label>
            <input 
              className={styles['campo-input']}
              type="number"
              value={prazoMeses}
              onChange={(e) => setPrazoMeses(e.target.value)}
              min="1"
            />
          </div>

          <button className={styles['botao-adicionar']} onClick={adicionarItem}>
            Adicionar
          </button>
        </div>

        {metas.length > 0 && (
          <div className={styles['lista-container']}>
            <h4 className={styles['titulo-lista']}>Lista de Metas e Investimentos</h4>
            <div className={styles['itens-lista']}>
              {metas.map((item) => (
                <div key={item.id} className={styles['item-lista']}>
                  <div>
                    <p className={styles['descricao-item']}>
                      {item.descricao} <span className={styles[`badge-${item.tipo.toLowerCase()}`]}>{item.tipo}</span>
                    </p>
                    <p className={styles['detalhes-item']}>
                      <strong>Total:</strong> {formatarMoeda(item.valorTotal)}
                    </p>
                    <p className={styles['detalhes-item']}>
                      <strong>Parcela mensal:</strong> {formatarMoeda(item.valorParcela)} • {item.prazoMeses} meses
                    </p>
                  </div>
                  <div className={styles['botoes-acao']}>
                    <button 
                      className={styles['botao-editar']}
                      onClick={() => editarItem(item)}
                    >
                      Editar
                    </button>
                    <button 
                      className={styles['botao-remover']}
                      onClick={() => removerItem(item.id)}
                    >
                      Remover
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={styles['controle-navegacao']}>
          <button 
            className={styles['botao-voltar']}
            onClick={voltarEtapa}
          >
            Voltar
          </button>
          <button 
            className={styles.botao}
            onClick={avancarEtapa}
            disabled={metas.length === 0}
          >
            Avançar
          </button>
        </div>
      </div>

      {itemEditando && (
        <ModalEdicao
          item={itemEditando}
          onSave={salvarEdicao}
          onClose={() => setItemEditando(null)}
        />
      )}
    </div>
  );
};

export default MetasInvestimentos;