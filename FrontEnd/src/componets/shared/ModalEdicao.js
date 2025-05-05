import React, { useState } from 'react';
import Input from './Input';
import Label from './Label';
import Select from './Select';
import Button from './Button';
import styles from '../../styles/Projecao.module.css';

const ModalEdicao = ({ item, onSave, onClose }) => {
  const [dadosEditados, setDadosEditados] = useState(item);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDadosEditados(prev => ({ ...prev, [name]: value }));
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
          />
        </div>
        
        <div className={styles['campo-formulario']}>
          <Label>Valor</Label>
          <Input 
            type="number"
            name="valor"
            value={dadosEditados.valor}
            onChange={handleChange}
            step="0.01"
            min="0"
          />
        </div>
      
        <div className={styles['botoes-modal']}>
          <Button onClick={onClose} className={styles['botao-secundario']}>
            Cancelar
          </Button>
          <Button onClick={() => onSave(dadosEditados)}>
            Salvar Alterações
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ModalEdicao;