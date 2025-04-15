import { Link } from 'react-router-dom';
import styles from './EsqueceuSenhaLink.module.css'; // Importando o arquivo CSS Module

function EsqueceuSenhaLink() {
  return (
    <div className={styles.recoveryContainer}>
      <div className={styles.formBox}>
        <h1 className={styles.logo}>Controla+</h1>
        
        <div className={styles.instructions}>
          <h2>Esqueceu sua senha?</h2>
          <p>Siga as instruções para recuperar o acesso.</p>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="email">Email</label>
          <input type="email" id="email" className={styles.formInput} placeholder="Digite seu email cadastrado" />
        </div>
        
        <Link to="/codigo-verificacao" className={styles.submitCodeBtn}>Enviar Código</Link>
      </div>
    </div>
  );
}

export default EsqueceuSenhaLink;
