import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom"; 

function RedefinirSenha() {
  const [formData, setFormData] = useState({
    novaSenha: "",
    confirmarSenha: "",
  });
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

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (formData.novaSenha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres!");
      setLoading(false);
      return;
    }
    if (formData.novaSenha !== formData.confirmarSenha) {
      setError("As senhas não coincidem!");
      setLoading(false);
      return;
    }

    const resetEmail = localStorage.getItem("resetEmail"); 
    if (!resetEmail) {
      setError(
        "Sessão de redefinição inválida ou expirada. Por favor, solicite um novo código."
      );
      setLoading(false);
      setTimeout(() => navigate("/esqueceuSenhaLink"), 2000);
      return;
    }

    try {
      const response = await fetch(
        "http://localhost:3001/api/redefinir-senha",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: resetEmail,
            novaSenha: formData.novaSenha,
            confirmarSenha: formData.confirmarSenha,
          }),
        }
      );
      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        localStorage.removeItem("resetEmail"); 
        setTimeout(() => navigate("/login"), 2000); 
      } else {
        setError(data.message || "Erro ao redefinir senha.");
      }
    } catch (err) {
      console.error("Erro ao conectar:", err);
      setError("Falha na comunicação com o servidor.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginContainer} className="login-container-global">
      <div style={styles.loginCard}>
        <h1 style={styles.logo}>Controla+</h1>
        <div style={styles.instructions}>
          <h2 style={styles.instructionsTitle}>Redefinir senha</h2>
          <p style={styles.instructionsText}>
            {success
              ? "Senha alterada com sucesso! Redirecionando para o login..."
              : "Crie uma nova senha para acessar sua conta."}
          </p>
        </div>
        {error && <p style={styles.errorMessage}>{error}</p>}
        <form style={styles.loginForm} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="novaSenha" style={styles.label}>
              Nova senha
            </label>
            <input
              type="password"
              id="novaSenha"
              style={styles.formInput}
              placeholder="Digite sua nova senha"
              value={formData.novaSenha}
              onChange={handleChange}
              disabled={loading || success}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="confirmarSenha" style={styles.label}>
              Confirme a nova senha
            </label>
            <input
              type="password"
              id="confirmarSenha"
              style={styles.formInput}
              placeholder="Repita a nova senha"
              value={formData.confirmarSenha}
              onChange={handleChange}
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
              {loading
                ? "Processando..."
                : success
                ? "Sucesso!"
                : "Redefinir Senha"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
// Estilos (mantidos)
const styles = {
  loginContainer: { width: "100%" },
  loginCard: {
    width: "100%",
    maxWidth: "577px",
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
export default RedefinirSenha;
