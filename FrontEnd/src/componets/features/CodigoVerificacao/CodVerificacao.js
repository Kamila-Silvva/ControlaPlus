import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CodigoVerificacao() {
  const [codigo, setCodigo] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.innerHTML = `
      .login-container-global { padding: 20px; display: flex; justify-content: center; align-items: center; }
      .login-body-override { font-family: 'Public Sans', sans-serif; background: linear-gradient(180deg, #9747FF 0%, #BCA2F2 77%, #F9F9F9 99%) !important; min-height: 100vh; display: flex; justify-content: center; align-items: center; }
    `;
    document.head.appendChild(styleElement);
    document.body.classList.add("login-body-override");
    return () => {
      document.head.removeChild(styleElement);
      document.body.classList.remove("login-body-override");
    };
  }, []);

  const handleVerificacao = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    const resetEmail = localStorage.getItem("resetEmail"); 

    if (!codigo) {
      setError("Digite o código recebido!");
      setLoading(false);
      return;
    }
    if (!resetEmail) {
      setError(
        "Sessão de redefinição inválida. Por favor, solicite um novo código."
      );
      setLoading(false);
      setTimeout(() => navigate("/esqueceuSenhaLink"), 2000);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3001/api/verificar-codigo-redefinicao",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: resetEmail, codigo }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => navigate("/RedefinirSenha"), 1500);
      } else {
        setError(data.message || "Código inválido ou expirado.");
      }
    } catch (err) {
      console.error("Erro ao conectar:", err);
      setError("Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  const handleReenviarCodigo = async () => {
    const resetEmail = localStorage.getItem("resetEmail");
    if (!resetEmail) {
      alert(
        "Não foi possível identificar o email para reenviar o código. Por favor, comece novamente."
      );
      navigate("/esqueceuSenhaLink");
      return;
    }
    try {
      await fetch("http://localhost:3001/api/solicitar-redefinicao", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });
      alert(
        "Um novo código de verificação foi enviado para seu email (simulado). Código mock: 123456"
      );
    } catch (error) {
      alert("Erro ao tentar reenviar o código.");
    }
  };

  return (
    <div style={styles.loginContainer} className="login-container-global">
      <div style={styles.loginCard}>
        <h1 style={styles.logo}>Controla+</h1>
        <div style={styles.instructions}>
          <h2 style={styles.instructionsTitle}>Verificação de Código</h2>
          <p style={styles.instructionsText}>
            {success
              ? "Código validado! Redirecionando..."
              : "Digite o código de 6 dígitos enviado para seu e-mail."}
          </p>
        </div>
        {error && <p style={styles.errorMessage}>{error}</p>}
        <form style={styles.loginForm} onSubmit={handleVerificacao}>
          <div style={styles.formGroup}>
            <label htmlFor="codigo" style={styles.label}>
              Código
            </label>
            <input
              type="text"
              id="codigo"
              style={styles.formInput}
              placeholder="Ex: 123456"
              value={codigo}
              onChange={(e) => setCodigo(e.target.value)}
              maxLength="6"
              disabled={loading || success}
              required
            />
          </div>
          <div style={styles.buttonContainer}>
            <button
              type="submit"
              style={{
                ...styles.loginBtn,
                opacity: loading || success ? 0.7 : 1,
              }}
              disabled={loading || success}
            >
              {loading ? "Verificando..." : success ? "Sucesso!" : "Verificar"}
            </button>
          </div>
        </form>
        <div style={styles.signupContainer}>
          <div style={styles.signupLink}>
            <span>Não recebeu o código?</span>
            <button
              style={styles.signupLinkAnchor}
              onClick={handleReenviarCodigo}
              disabled={loading}
            >
              Reenviar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
// Estilos (mantidos)
const styles = {
  loginContainer: { width: "100%" },
  loginCard: {
    width: "100%",
    maxWidth: "486px",
    background: "#F9F9F9",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    borderRadius: "30px",
    padding: "60px 80px",
    textAlign: "center",
    margin: "0 auto",
  },
  logo: {
    fontFamily: "'Kalnia', serif",
    fontSize: "48px",
    fontWeight: "400",
    color: "#9747FF",
    marginBottom: "40px",
  },
  instructions: { marginBottom: "30px", textAlign: "center" },
  instructionsTitle: {
    fontSize: "24px",
    color: "#0D0C0B",
    marginBottom: "10px",
    fontWeight: "600",
  },
  instructionsText: {
    fontSize: "16px",
    color: "#0D0C0B",
    opacity: 0.8,
    lineHeight: "1.5",
  },
  errorMessage: {
    color: "#ff3333",
    textAlign: "center",
    marginBottom: "20px",
    fontSize: "14px",
  },
  loginForm: { display: "flex", flexDirection: "column", gap: "25px" },
  formGroup: { position: "relative", textAlign: "left" },
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
    border: "none",
  },
  signupContainer: {
    borderTop: "1px solid #eee",
    paddingTop: "1.5rem",
    marginTop: "1rem",
  },
  signupLink: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "15px",
    color: "#0D0C0B",
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
  },
  signupLinkAnchor: {
    color: "#9747FF",
    fontWeight: "600",
    textDecoration: "underline",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: 0,
    font: "inherit",
  },
};
// Injetor de CSS Vars
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
export default CodigoVerificacao;
