import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressoContext } from '../../../context/ProgressoContext';
import Button from '../../shared/Button';
import Input from '../../shared/Input';
import Label from '../../shared/Label';
import Select from '../../shared/Select';
import ModalEdicao from '../../shared/ModalGasto';
import api from '../../../services/api';
import styles from '../../../styles/Projecao.module.css';

const GastosFixos = () => {
  const navigate = useNavigate();
  const { etapas, etapaAtual } = useContext(ProgressoContext);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [frequencia, setFrequencia] = useState("Mensal");
  const [mesPagamento, setMesPagamento] = useState("");
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemEditando, setItemEditando] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const carregarGastos = async () => {
      try {
        const response = await api.getGastos();
        setItens(response.data);
        setError(null);
      } catch (error) {
        setError('Erro ao carregar gastos');
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    carregarGastos();
  }, []);

  const adicionarItem = async () => {
    try {
      if (!descricao.trim()) throw new Error("Insira uma descrição");
      if (!valor || isNaN(valor)) throw new Error("Valor inválido");
      if (frequencia !== "Mensal" && !mesPagamento) throw new Error("Selecione o mês");

      const response = await api.createGasto({
        descricao, 
        valor: parseFloat(valor),
        frequencia,
        mesPagamento: frequencia === "Mensal" ? null : mesPagamento
      });
      
      setItens([...itens, response.data]);
      setDescricao("");
      setValor("");
      setFrequencia("Mensal");
      setMesPagamento("");
      setError(null);
    } catch (error) {
      setError(error.message);
    }
  };

  const removerItem = async (id) => {
    if (window.confirm("Confirmar remoção?")) {
      try {
        await api.deleteGasto(id);
        setItens(itens.filter(item => item.id !== id));
        setError(null);
      } catch (error) {
        setError('Erro ao remover');
      }
    }
  };

  const editarItem = (item) => {
    setItemEditando(item);
  };

  const salvarEdicao = async (dadosEditados) => {
    try {
      const response = await api.updateGasto(dadosEditados.id, {
        descricao: dadosEditados.descricao,
        valor: parseFloat(dadosEditados.valor),
        frequencia: dadosEditados.frequencia,
        mesPagamento: dadosEditados.frequencia === "Mensal" ? null : dadosEditados.mesPagamento
      });
      
      setItens(itens.map(item => 
        item.id === dadosEditados.id ? response.data : item
      ));
      setItemEditando(null);
      setError(null);
    } catch (error) {
      setError('Erro ao atualizar');
    }
  };

  const avancarEtapa = () => {
    if (itens.length === 0) {
      setError("Adicione pelo menos um gasto");
      return;
    }
    navigate('/metas-investimentos');
  };

  const voltarEtapa = () => {
    navigate('/renda');
  };

  if (loading) return <div className={styles.loading}>Carregando...</div>;

  return (
    <div className={styles.containerPrincipal}>
      {/* Cabeçalho e barra de progresso */}
      <div className={styles.cabecalho}>
        <h1 className={styles.tituloApp}>Controla<span className={styles.destaqueTitulo}>+</span></h1>
        <h2 className={styles.subtitulo}>Projeção</h2>
        <p className={styles.textoDescritivo}>
          Respire fundo. Organizar suas finanças é o primeiro passo para aliviar a compulsão.
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

      {/* Formulário principal */}
      <div className={styles['formulario-container']}>
        <h3 className={styles['titulo-secao']}>Gastos Fixos</h3>
        
        <div className={styles['grupo-campos']}>
          {/* Campos do formulário */}
          <div className={styles['campo-formulario']}>
            <Label>Descrição</Label>
            <Input 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              placeholder="Ex: Aluguel" 
            />
          </div>
          
          <div className={styles['campo-formulario']}>
            <Label>Valor (R$)</Label>
            <Input 
              type="number" 
              value={valor} 
              onChange={(e) => setValor(e.target.value)} 
              placeholder="1000,00"
              step="0.01"
              min="0"
            />
          </div>
          
          <div className={styles['campo-formulario']}>
            <Label>Frequência</Label>
            <Select 
              value={frequencia} 
              onChange={(e) => setFrequencia(e.target.value)}
            >
              <option value="Mensal">Mensal</option>
              <option value="Trimestral">Trimestral</option>
              <option value="Semestral">Semestral</option>
              <option value="Anual">Anual</option>
              <option value="Único">Pagamento Único</option>
            </Select>
          </div>

          {frequencia !== "Mensal" && (
            <div className={styles['campo-formulario']}>
              <Label>Mês do Pagamento</Label>
              <Select
                value={mesPagamento}
                onChange={(e) => setMesPagamento(e.target.value)}
              >
                <option value="">Selecione</option>
                {[
                  "Janeiro", "Fevereiro", "Março", "Abril", 
                  "Maio", "Junho", "Julho", "Agosto",
                  "Setembro", "Outubro", "Novembro", "Dezembro"
                ].map((mes, i) => (
                  <option key={i} value={mes}>{mes}</option>
                ))}
              </Select>
            </div>
          )}

          <Button onClick={adicionarItem} className={styles['botao-adicionar']}>
            Adicionar
          </Button>
        </div>

        {/* Lista de itens */}
        {itens.length > 0 && (
          <div className={styles['lista-container']}>
            <h4 className={styles['titulo-lista']}>Lista de Gastos Fixos</h4>
            <div className={styles['itens-lista']}>
              {itens.map((item) => (
                <div key={item.id} className={styles['item-lista']}>
                  <div>
                    <p className={styles['descricao-item']}>{item.descricao}</p>
                    <p className={styles['detalhes-item']}>
                      {new Intl.NumberFormat('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      }).format(item.valor)} • {item.frequencia}
                      {item.mesPagamento && ` • ${item.mesPagamento}`}
                    </p>
                  </div>
                  <div className={styles['botoes-acao']}>
                    <Button onClick={() => editarItem(item)} className={styles['botao-editar']}>
                      Editar
                    </Button>
                    <Button variant="destructive" onClick={() => removerItem(item.id)} className={styles['botao-remover']}>
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navegação */}
        <div className={styles['controle-navegacao']}>
          <Button onClick={voltarEtapa} className={styles['botao-voltar']}>
            Voltar
          </Button>
          <Button onClick={avancarEtapa} className={styles.botao} disabled={itens.length === 0}>
            Avançar
          </Button>
        </div>
      </div>

      {/* Modal de edição */}
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

export default GastosFixos;