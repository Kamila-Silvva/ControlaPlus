import { Link } from "react-router-dom";
import styles from "./Login.module.css";

function Login() {
  return (
    <div className={styles.loginContainer}>
      <div className={styles.loginCard}>
        <h1 className={styles.logo}>Controla+</h1>

        <form className={styles.loginForm}>
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className={styles.formInput}
              placeholder="Digite aqui o seu email"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Senha</label>
            <input
              type="password"
              id="password"
              className={styles.formInput}
              placeholder="Digite aqui a sua senha"
            />
            {/* <Link to="/esqueceu-senha" className={styles.forgotPassword}>Esqueceu a Senha?</Link> */}
          </div>

            <Link to="/gastos" className={styles.loginBtn}>
              Entrar
            </Link>
        </form>

        <div className={styles.signupLink}>
          <span>Ainda não tem uma conta?</span>
          <Link to="/cadastro" className={styles.signupLink}>Cadastre-se aqui!</Link>
        </div> 
      </div>
    </div>
  );
}

export default Login;
