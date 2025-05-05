import React from 'react';
import styles from '../../styles/Projecao.module.css';

const Select = ({ children, ...props }) => (
  <select className={styles['campo-select']} {...props}>
    {children}
  </select>
);

export default Select;