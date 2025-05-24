import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Aplica estilos globais para esta tela
  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = "login-specific-styles";
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
        margin: 0; 
      }
    `;
    if (!document.getElementById("login-specific-styles")) {
      document.head.appendChild(styleElement);
    }
    document.body.classList.add("login-body-override");

    return () => {
      const existingStyleElement = document.getElementById(
        "login-specific-styles"
      );
      if (existingStyleElement) {
        document.head.removeChild(existingStyleElement);
      }
      document.body.classList.remove("login-body-override");
    };
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (!email || !senha) {
      setError("Por favor, preencha todos os campos.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, senha }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("currentUser", JSON.stringify(data.user));
        localStorage.setItem("userToken", data.token);

        // ATUALIZADO: Lógica de redirecionamento
        if (data.possuiDadosFinanceiros) {
          navigate("/dashboard");
        } else {
          navigate("/renda"); // Redireciona para o início do fluxo de planejamento
        }
      } else {
        setError(data.message || "Erro ao fazer login. Tente novamente.");
      }
    } catch (err) {
      console.error("Falha ao conectar com o servidor:", err);
      setError("Não foi possível conectar ao servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginContainer} className="login-container-global">
      <div style={styles.loginCard}>
        <h1 style={styles.logo}>Controla+</h1>

        {error && <p style={styles.errorMessage}>{error}</p>}

        <form style={styles.loginForm} onSubmit={handleLogin}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              type="email"
              id="email"
              style={styles.formInput}
              placeholder="Digite aqui o seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Senha
            </label>
            <input
              type="password"
              id="password"
              style={styles.formInput}
              placeholder="Digite aqui a sua senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              required
              disabled={loading}
            />
            <Link to="/esqueceuSenhaLink" style={styles.forgotPassword}>
              Esqueceu a Senha?
            </Link>
          </div>

          <div style={styles.buttonContainer}>
            <button type="submit" style={styles.loginBtn} disabled={loading}>
              {loading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>

        <div style={styles.signupContainer}>
          <div style={styles.signupLink}>
            <span>Ainda não tem uma conta? </span>
            <Link to="/cadastro" style={styles.signupLinkAnchor}>
              Cadastre-se aqui!
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Estilos CSS-in-JS (como você forneceu)
const styles = {
  loginContainer: {
    width: "100%",
  },
  loginCard: {
    width: "100%",
    maxWidth: "577px",
    background: "#F9F9F9",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    borderRadius: "30px",
    padding: "60px 80px",
    textAlign: "center",
    margin: "0 auto",
    display: "flex",
    flexDirection: "column",
  },
  logo: {
    fontFamily: "'Kalnia', serif",
    fontSize: "48px",
    fontWeight: "400",
    color: "#9747FF",
    marginBottom: "40px",
  },
  errorMessage: {
    color: "#dc3545",
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "14px",
    padding: "10px",
    background: "rgba(220, 53, 69, 0.1)",
    borderRadius: "8px",
    border: "1px solid rgba(220, 53, 69, 0.2)",
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
    boxSizing: "border-box",
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
    border: "none",
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
    marginTop: "1rem",
    width: "100%",
  },
  signupLink: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "15px",
    color: "#0D0C0B",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "0.5rem",
  },
  signupLinkAnchor: {
    color: "#9747FF",
    fontWeight: "600",
    textDecoration: "underline",
  },
};

if (!document.getElementById("app-color-vars")) {
  const styleSheet = document.createElement("style");
  styleSheet.id = "app-color-vars";
  styleSheet.innerText = `
      :root {
        --roxo-principal: #9747FF; --roxo-escuro: #6C63FF; --roxo-claro: #a855f7;
        --cinza-escuro: #2F2E41; --cinza-medio: #0D0C0B; --cinza-claro: #F5F5F5;
        --branco: #FFFFFF; --sombra: 0 4px 6px rgba(0, 0, 0, 0.05);
        --cor-sucesso: #28a745; --cor-perigo: #dc3545;
      }
    `;
  document.head.appendChild(styleSheet);
}

export default Login;
