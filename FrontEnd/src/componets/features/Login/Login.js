import { Link } from "react-router-dom";
import { useEffect } from 'react';

function Login() {
  // Aplica estilos apenas para este componente
  useEffect(() => {
    const styleElement = document.createElement('style');
    styleElement.innerHTML = `
      .login-container-global {
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      
      .login-body-override {
        font-family: 'Public Sans', sans-serif;
        background: linear-gradient(180deg, #9747FF 0%, #BCA2F2 77%, #F9F9F9 99%) !important;
        min-height: 100vh;
        display: flex;
        justify-content: center;
        align-items: center;
      }
    `;
    document.head.appendChild(styleElement);
    
    // Adiciona classe temporária ao body
    document.body.classList.add('login-body-override');
    
    return () => {
      // Remove os estilos quando o componente é desmontado
      document.head.removeChild(styleElement);
      document.body.classList.remove('login-body-override');
    };
  }, []);

  return (
    <div style={styles.loginContainer} className="login-container-global">
      <div style={styles.loginCard}>
        <h1 style={styles.logo}>Controla+</h1>

        <form style={styles.loginForm}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>Email</label>
            <input
              type="email"
              id="email"
              style={styles.formInput}
              placeholder="Digite aqui o seu email"
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>Senha</label>
            <input
              type="password"
              id="password"
              style={styles.formInput}
              placeholder="Digite aqui a sua senha"
            />
            <Link to="/esqueceuSenhaLink" style={styles.forgotPassword}>Esqueceu a Senha?</Link>
          </div>

          <div style={styles.buttonContainer}>
            <Link to="/gastos" style={styles.loginBtn}>Entrar</Link>
          </div>
        </form>

        <div style={styles.signupContainer}>
          <div style={styles.signupLink}>
            <span>Ainda não tem uma conta? </span>
            <Link to="/cadastro" style={styles.signupLinkAnchor}>Cadastre-se aqui!</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  loginContainer: {
    width: '100%'
  },
  loginCard: {
    width: "100%",
    maxWidth: "577px",
    background: "#F9F9F9",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    borderRadius: "30px",
    padding: "60px 80px",
    textAlign: "center",
    margin: '0 auto'
  },
  logo: {
    fontFamily: "'Kalnia', serif",
    fontSize: "48px",
    fontWeight: "400",
    color: "#9747FF",
    marginBottom: "40px", // Um pouco menor que no login
  },
  instructions: {
    marginBottom: "30px",
    textAlign: "center"
  },
  instructionsTitle: {
    fontSize: "24px",
    color: "#0D0C0B",
    marginBottom: "10px",
    fontWeight: "600"
  },
  instructionsText: {
    fontSize: "16px",
    color: "#0D0C0B",
    opacity: 0.8
  },
  loginForm: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
  },
  formGroup: {
    position: "relative",
    textAlign: "left",
  },
  label: {
    display: "block",
    fontSize: "18px",
    marginBottom: "10px",
    color: "#0D0C0B",
  },
  formInput: {
    width: "100%",
    height: "57px",
    background: "#F9F9F9",
    border: "1px solid #0D0C0B",
    borderRadius: "10px",
    padding: "0 20px",
    fontSize: "16px",
    fontFamily: "'Public Sans', sans-serif",
    marginBottom: "0.5rem",
  },
    forgotPassword: {
    display: "block",
    textAlign: "right",
    fontSize: "14px",
    color: "#9747FF",
    textDecoration: "underline",
    marginTop: "0.5rem",
    fontWeight: "600",
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginTop: "1.5rem",
    marginBottom: "1.5rem",
  },
  loginBtn: {
    padding: "15px",
    width: "160px",
    background: "#9747FF",
    color: "#F5F5F5",
    borderRadius: "10px",
    fontFamily: "'Open Sans', sans-serif",
    fontSize: "14px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    transition: "background 0.3s ease",
    textDecoration: "none",
    display: "inline-block",
  },
  signupContainer: {
    borderTop: "1px solid #eee",
    paddingTop: "1.5rem",
    marginTop: "1rem"
  },
  signupLink: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "15px",
    color: "#0D0C0B",
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem"
  },
  signupLinkAnchor: {
    color: "#9747FF",
    fontWeight: "600",
    textDecoration: "underline",
  },
};

export default Login;