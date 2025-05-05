import { Link } from 'react-router-dom';
import styles from './CodVerificacao.module.css';

function CodigoVerificacao () {
  return (
    <div className={styles.recoveryContainer}>
      <div className={styles.formBox}>
        <h1 className={styles.logo}>Controla+</h1>
        
        <div className={styles.instructions}>
          <h2>Esqueceu sua senha?</h2>
          <p>Enviamos um código de verificação para seu e-mail. Digite-o abaixo para continuar. Caso não encontre, verifique a caixa de spam.</p>
        </div>
        
        <div className={styles.formGroup}>
          <label htmlFor="email">Código de verificação</label>
          <input type="text" id="email" className={styles.formInput} placeholder="Digite o código"/>
        </div>
        
        <Link to='/redefinir-senha' className={styles.submitCodeBtn}>Verificar</Link>
      </div>
    </div>
  );
}

export default CodigoVerificacao;
