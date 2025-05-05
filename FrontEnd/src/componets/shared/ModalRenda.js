import React, { useState, useEffect } from 'react';
import Input from './Input';
import Label from './Label';
import Select from './Select';
import Button from './Button';
import styles from '../../styles/Projecao.module.css';

const ModalRenda = ({ item, onSave, onClose }) => {
  const [dadosEditados, setDadosEditados] = useState({
    descricao: '',
    valor: 0,
    frequencia: 'Mensal',
    mesRecebimento: ''
  });

  useEffect(() => {
    if (item) {
      setDadosEditados({
        id: item.id,
        descricao: item.descricao || '',
        valor: item.valor || 0,
        frequencia: item.frequencia || 'Mensal',
        mesRecebimento: item.mesRecebimento || ''
      });
    }
  }, [item]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDadosEditados(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = () => {
    if (!dadosEditados.descricao.trim()) {
      alert("Por favor, insira uma descrição");
      return;
    }
    
    if (!dadosEditados.valor || isNaN(dadosEditados.valor)) {
      alert("Por favor, insira um valor válido");
      return;
    }
    
    if (dadosEditados.frequencia !== "Mensal" && !dadosEditados.mesRecebimento) {
      alert("Por favor, selecione o mês de recebimento");
      return;
    }

    const dadosParaSalvar = {
      ...dadosEditados,
      valor: parseFloat(dadosEditados.valor),
      mesRecebimento: dadosEditados.frequencia === "Mensal" ? null : dadosEditados.mesRecebimento
    };

    onSave(dadosParaSalvar);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-container']}>
        <h3>Editar Item</h3>
        
        <div className={styles['campo-formulario']}>
          <Label>Descrição</Label>
          <Input 
            name="descricao"
            value={dadosEditados.descricao}
            onChange={handleChange}
            placeholder="Ex: Salário"
          />
        </div>
        
        <div className={styles['campo-formulario']}>
          <Label>Valor (R$)</Label>
          <Input 
            type="number"
            name="valor"
            value={dadosEditados.valor}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="Ex: 1500.00"
          />
        </div>
        
        <div className={styles['campo-formulario']}>
          <Label>Frequência</Label>
          <Select
            name="frequencia"
            value={dadosEditados.frequencia}
            onChange={(e) => {
              const novaFrequencia = e.target.value;
              setDadosEditados(prev => ({
                ...prev,
                frequencia: novaFrequencia,
                ...(novaFrequencia === "Mensal" && { mesRecebimento: null })
              }));
            }}
          >
            <option value="Mensal">Mensal</option>
            <option value="Trimestral">Trimestral</option>
            <option value="Semestral">Semestral</option>
            <option value="Anual">Anual</option>
            <option value="Único">Pagamento Único</option>
          </Select>
        </div>

        {dadosEditados.frequencia !== "Mensal" && (
          <div className={styles['campo-formulario']}>
            <Label>Mês de Recebimento</Label>
            <Select
              name="mesRecebimento"
              value={dadosEditados.mesRecebimento || ''}
              onChange={handleChange}
              required={dadosEditados.frequencia !== "Mensal"}
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

        <div className={styles['botoes-modal']}>
          <Button onClick={onClose} variant="secondary">
            Cancelar
          </Button>
          <Button onClick={handleSubmit}>
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalRenda;