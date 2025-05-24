import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";

function Cadastro() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    confirmEmail: "",
    senha: "",
    confirmSenha: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false); 
  const navigate = useNavigate();

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.id = 'cadastro-specific-styles'; 
    styleElement.innerHTML = `
      .login-container-global { 
        padding: 20px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%; 
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
    if (!document.getElementById('cadastro-specific-styles')) {
        document.head.appendChild(styleElement);
    }
    document.body.classList.add("login-body-override");

    return () => {
      const existingStyleElement = document.getElementById('cadastro-specific-styles');
      if (existingStyleElement) {
          document.head.removeChild(existingStyleElement);
      }
      document.body.classList.remove("login-body-override");
    };
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
    if (error) setError(""); 
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);
    setLoading(true);

    if (formData.email !== formData.confirmEmail) {
      setError("Os e-mails não coincidem!");
      setLoading(false);
      return;
    }
    if (formData.senha !== formData.confirmSenha) {
      setError("As senhas não coincidem!");
      setLoading(false);
      return;
    }
    if (formData.senha.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres!");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/api/cadastro", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccess(true);
        setFormData({ nome: "", email: "", confirmEmail: "", senha: "", confirmSenha: "" });
        setTimeout(() => navigate("/login"), 2000); 
      } else {
        setError(data.message || "Erro ao cadastrar. Tente novamente.");
      }
    } catch (err) {
      console.error("Falha ao conectar com o servidor:", err);
      setError("Não foi possível conectar ao servidor. Verifique sua conexão ou tente mais tarde.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginContainer} className="login-container-global">
      <div style={styles.loginCard}>
        <h1 style={styles.logo}>Controla+</h1>

        {/* ATUALIZADO: Container para mensagens com altura mínima */}
        <div style={styles.messageContainer}>
          {error && <p style={styles.errorMessage}>{error}</p>}
          {success && (
            <p style={styles.successMessage}>
              Cadastro realizado com sucesso! Redirecionando para o planejamento...
            </p>
          )}
        </div>

        <form style={styles.loginForm} onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="nome" style={styles.label}>
              Nome
            </label>
            <input
              type="text" id="nome" style={styles.formInput}
              placeholder="Digite seu nome completo"
              value={formData.nome} onChange={handleChange}
              required disabled={loading}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email
            </label>
            <input
              type="email" id="email" style={styles.formInput}
              placeholder="Digite seu email"
              value={formData.email} onChange={handleChange}
              required disabled={loading}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="confirmEmail" style={styles.label}>
              Confirme o email
            </label>
            <input
              type="email" id="confirmEmail" style={styles.formInput}
              placeholder="Repita o email digitado"
              value={formData.confirmEmail} onChange={handleChange}
              required disabled={loading}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="senha" style={styles.label}>
              Senha
            </label>
            <input
              type="password" id="senha" style={styles.formInput}
              placeholder="Crie uma senha segura (mín. 6 caracteres)"
              value={formData.senha} onChange={handleChange}
              required disabled={loading}
            />
          </div>
          <div style={styles.formGroup}>
            <label htmlFor="confirmSenha" style={styles.label}>
              Confirme a senha
            </label>
            <input
              type="password" id="confirmSenha" style={styles.formInput}
              placeholder="Repita a senha criada"
              value={formData.confirmSenha} onChange={handleChange}
              required disabled={loading}
            />
          </div>
          <div style={styles.buttonContainer}>
            <button type="submit" style={styles.loginBtn} disabled={loading}>
              {loading ? "Cadastrando..." : "Finalizar cadastro"}
            </button>
          </div>
        </form>

        <div style={styles.signupContainer}>
          <div style={styles.signupLink}>
            <span>Já tem uma conta?</span>
            <Link to="/login" style={styles.signupLinkAnchor}>
              Faça login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}


const styles = {
  loginContainer: {
    width: "100%",
  },
  loginCard: {
    width: "100%",
    maxWidth: "650px",
    background: "#F9F9F9",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    borderRadius: "30px",
    padding: "60px 90px", 
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

  messageContainer: {
    marginBottom: "20px",
    display: 'flex', 
    alignItems: 'center',
    justifyContent: 'center'
  },
  errorMessage: {
    color: "#ff3333",
    textAlign: "center",
    fontSize: "14px",
    backgroundColor: "rgba(220, 53, 69, 0.1)", 
    padding: "10px", 
    borderRadius: "8px", 
    border: "1px solid rgba(220, 53, 69, 0.2)", 
    width: '100%', 
  },
  successMessage: {
    color: "#4BB543",
    textAlign: "center",
    // marginBottom: "20px", // Removido
    fontSize: "14px",
    backgroundColor: "rgba(40, 167, 69, 0.1)", 
    padding: "10px", 
    borderRadius: "8px", 
    border: "1px solid rgba(40, 167, 69, 0.2)", 
    width: '100%', 
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
    padding: "0 25px",
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
  },
};

if (!document.getElementById('app-color-vars')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'app-color-vars';
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

export default Cadastro;
