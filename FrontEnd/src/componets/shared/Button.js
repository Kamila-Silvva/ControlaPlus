import React from 'react';
import styles from '../../styles/Projecao.module.css';

const Button = ({ children, variant, className = '', ...props }) => (
  <button
    className={`${styles.botao} ${
      variant === 'destructive' ? styles['botao-perigo'] : styles['botao-principal']
    } ${className}`}
    {...props}
  >
    {children}
  </button>
);

export default Button;