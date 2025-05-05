import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProgressoContext } from '../../../context/ProgressoContext';
import Button from '../../shared/Button';
import Input from '../../shared/Input';
import Label from '../../shared/Label';
import Select from '../../shared/Select';
import ModalEdicao from '../../shared/ModalRenda';
import api from '../../../services/api';
import styles from '../../../styles/Projecao.module.css';

const Renda = () => {
  const navigate = useNavigate();
  const { etapas, etapaAtual } = useContext(ProgressoContext);
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [frequencia, setFrequencia] = useState("Mensal");
  const [mesRecebimento, setMesRecebimento] = useState("");
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const [itemEditando, setItemEditando] = useState(null);

  useEffect(() => {
    const carregarRendas = async () => {
      try {
        const response = await api.getRendas();
        setItens(response.data);
      } catch (error) {
        console.error('Erro ao carregar rendas:', error);
      } finally {
        setLoading(false);
      }
    };
    
    carregarRendas();
  }, []);

  const adicionarItem = async () => {
    if (!descricao.trim()) {
      alert("Por favor, insira uma descrição");
      return;
    }
    
    if (!valor || isNaN(valor)) {
      alert("Por favor, insira um valor válido");
      return;
    }
    
    if (frequencia !== "Mensal" && !mesRecebimento) {
      alert("Por favor, selecione o mês de recebimento");
      return;
    }

    try {
      const response = await api.createRenda({
        descricao, 
        valor: parseFloat(valor), 
        frequencia,
        mesRecebimento: frequencia === "Mensal" ? null : mesRecebimento
      });
      
      setItens([...itens, response.data]);
      setDescricao("");
      setValor("");
      setFrequencia("Mensal");
      setMesRecebimento("");
    } catch (error) {
      alert('Erro ao criar renda');
      console.error(error);
    }
  };

  const removerItem = async (id) => {
    if (window.confirm("Tem certeza que deseja remover este item?")) {
      try {
        await api.deleteRenda(id);
        setItens(itens.filter(item => item.id !== id));
      } catch (error) {
        alert('Erro ao remover renda');
        console.error(error);
      }
    }
  };

  const editarItem = (item) => {
    setItemEditando(item);
  };

  const salvarEdicao = async (dadosEditados) => {
    try {
      const response = await api.updateRenda(dadosEditados.id, dadosEditados);
      setItens(itens.map(item => 
        item.id === dadosEditados.id ? response.data : item
      ));
      setItemEditando(null);
    } catch (error) {
      alert('Erro ao atualizar renda');
      console.error(error);
    }
  };

  const avancarEtapa = () => {
    if (itens.length === 0) {
      alert("Adicione pelo menos um item de renda antes de avançar");
      return;
    }
    navigate('/gastos-fixos');
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <div className={styles.containerPrincipal}>
      {/* Cabeçalho */}
      <div className={styles.cabecalho}>
        <h1 className={styles.tituloApp}>Controla<span className={styles.destaqueTitulo}>+</span></h1>
        <h2 className={styles.subtitulo}>Projeção</h2>
        <p className={styles.textoDescritivo}>
          Respire fundo. Organizar suas finanças é o primeiro passo para aliviar a compulsão.
        </p>
      </div>

      {/* Etapas */}
      <div className={styles.barraProgresso}>
        {etapas.map((etapa, index) => (
          <div key={index} className={styles.etapaContainer}>
            <div 
              className={`${styles.marcadorEtapa} ${index === etapaAtual ? styles['etapa-ativa'] : styles['etapa-inativa']}`}
            >
              {index + 1}
            </div>
            <span className={`${styles['rotulo-etapa']} ${index === etapaAtual ? styles['rotulo-ativo'] : styles['rotulo-inativo']}`}>
              {etapa}
            </span>
          </div>
        ))}
      </div>

      {/* Formulário */}
      <div className={styles['formulario-container']}>
        <h3 className={styles['titulo-secao']}>Salários e Recebidos</h3>
        
        <div className={styles['grupo-campos']}>
          <div className={styles['campo-formulario']}>
            <Label>Descrição</Label>
            <Input 
              value={descricao} 
              onChange={(e) => setDescricao(e.target.value)} 
              placeholder="Ex: Bolsa estágio" 
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
              <Label>Mês de Recebimento</Label>
              <Select
                value={mesRecebimento}
                onChange={(e) => setMesRecebimento(e.target.value)}
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
            <h4 className={styles['titulo-lista']}>Lista de Recebidos</h4>
            <div className={styles['itens-lista']}>
              {itens.map((item) => (
                <div key={item.id} className={styles['item-lista']}>
                  <div>
                    <p className={styles['descricao-item']}>
                      {item.descricao || 'Sem descrição'}
                    </p>
                    <p className={styles['detalhes-item']}>
                      <strong>Valor:</strong> {(item.valor || 0).toLocaleString('pt-BR', { 
                        style: 'currency', 
                        currency: 'BRL' 
                      })}
                    </p>
                    <p className={styles['detalhes-item']}>
                      <strong>Frequência:</strong> {item.frequencia || 'Mensal'}
                      {item.mesRecebimento && ` (${item.mesRecebimento})`}
                    </p>
                  </div>
                  <div className={styles['botoes-acao']}>
                    <Button 
                      onClick={() => editarItem(item)}
                      className={styles['botao-editar']}
                    >
                      Editar
                    </Button>
                    <Button 
                      variant="destructive" 
                      onClick={() => removerItem(item.id)}
                      className={styles['botao-remover']}
                    >
                      Remover
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Botão avançar */}
        <div className={styles['controle-avancar']}>
          <Button 
            onClick={avancarEtapa}
            className={styles['botao-avancar']}
          >
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

export default Renda;