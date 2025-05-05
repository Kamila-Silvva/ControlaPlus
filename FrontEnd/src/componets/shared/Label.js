import React from 'react';
import styles from '../../styles/Projecao.module.css';

const Label = ({ children, ...props }) => (
  <label className={styles.rotulo} {...props}>
    {children}
  </label>
);

export default Label;