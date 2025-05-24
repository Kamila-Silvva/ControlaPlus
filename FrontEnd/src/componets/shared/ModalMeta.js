import React, { useState, useEffect } from 'react';
import Input from './Input';
import Label from './Label';
import Select from './Select';
import Button from './Button';
import styles from '../../styles/Projecao.module.css';

const ModalMeta = ({ item, onSave, onClose }) => {
  const [dadosEditados, setDadosEditados] = useState({
    descricao: '',
    valor: 0,
    tipo: 'Meta',
    prazoMeses: 1
  });

  useEffect(() => {
    if (item) {
      setDadosEditados({
        id: item.id,
        descricao: item.descricao || '',
        valor: item.valorTotal || 0,
        tipo: item.tipo || 'Meta',
        prazoMeses: item.prazoMeses || 1
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
    
    if (!dadosEditados.prazoMeses || isNaN(dadosEditados.prazoMeses)) {
      alert("Por favor, insira um prazo válido");
      return;
    }

    onSave(dadosEditados);
  };

  return (
    <div className={styles['modal-overlay']}>
      <div className={styles['modal-container']}>
        <h3>Editar Meta/Investimento</h3>
        
        <div className={styles['campo-formulario']}>
          <Label>Descrição</Label>
          <Input 
            name="descricao"
            value={dadosEditados.descricao}
            onChange={handleChange}
            placeholder="Ex: Viagem para Europa"
          />
        </div>
        
        <div className={styles['campo-formulario']}>
          <Label>Valor Total (R$)</Label>
          <Input 
            type="number"
            name="valor"
            value={dadosEditados.valor}
            onChange={handleChange}
            step="0.01"
            min="0"
            placeholder="10000,00"
          />
        </div>
        
        <div className={styles['campo-formulario']}>
          <Label>Tipo</Label>
          <Select 
            name="tipo"
            value={dadosEditados.tipo}
            onChange={handleChange}
          >
            <option value="Meta">Meta</option>
            <option value="Investimento">Investimento</option>
          </Select>
        </div>

        <div className={styles['campo-formulario']}>
          <Label>Prazo (meses)</Label>
          <Input 
            type="number"
            name="prazoMeses"
            value={dadosEditados.prazoMeses}
            onChange={handleChange}
            min="1"
            placeholder="12"
          />
        </div>

        <div className={styles['botoes-modal']}>
          <Button onClick={onClose} variant="secondary" className={styles['botao-secundario']}>
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

export default ModalMeta;