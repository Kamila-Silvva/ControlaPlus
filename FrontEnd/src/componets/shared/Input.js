import React from 'react';
import styles from '../../styles/Projecao.module.css';

const Input = ({ ...props }) => (
  <input 
    className={styles['campo-input']}
    {...props} 
  />
);

export default Input;