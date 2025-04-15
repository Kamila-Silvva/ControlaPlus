import { Link } from 'react-router-dom';
import styles from './RedefinirSenha.module.css';

function RedefinirSenha() {
  return (
    <div className={styles.recoveryContainer}>
      <div className={styles.formBox}>
        <h1 className={styles.logo}>Controla+</h1>
        
        
        <div className={styles.instructions}>
          <h2>Esqueceu sua senha?</h2>
          <p>Digite sua nova senha para concluir a recuperação do acesso.</p>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="senha">Senha</label>
          <input type="password" id="senha" className={styles.formInput} placeholder="Digite uma nova senha" />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="confirmarSenha">Confirme sua nova senha</label>
          <input type="password" id="confirmarSenha" className={styles.formInput} placeholder="Confirme sua nova senha" />
        </div>

        <Link to="/login" className={styles.submitCodeBtn}>Redefinir senha</Link>
      </div>
    </div>
  );
}

export default RedefinirSenha;
