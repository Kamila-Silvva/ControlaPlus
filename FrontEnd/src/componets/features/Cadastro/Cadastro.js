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
      /* Estilos globais para o container e body para este componente */
      .login-container-global {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
        min-height: 100vh; /* Garante que o container ocupe a altura total da viewport */
        padding: 20px; /* Adiciona um padding externo para evitar que o card grude nas bordas */
        box-sizing: border-box; /* Garante que o padding não adicione largura extra */
      }

      .login-body-override {
        font-family: 'Public Sans', sans-serif;
        background: linear-gradient(180deg, #9747FF 0%, #BCA2F2 77%, #F9F9F9 99%) !important;
        min-height: 100vh;
        display: flex; /* Garante que o body possa centralizar o container */
        justify-content: center; /* Centraliza horizontalmente */
        align-items: center; /* Centraliza verticalmente */
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

        {/* Container para mensagens com altura mínima */}
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

// =========================================================================
// NOVOS ESTILOS REFEITOS - FOCO TOTAL NA LARGURA EXATA (COMO FOTO 1)
// =========================================================================
const styles = {
  loginContainer: {
    // Estilos já tratados pelo CSS global injetado no useEffect
  },
  loginCard: {
    // Definindo uma largura exata para o card para ter controle total
    width: "430px", // Experimente 700px, 750px, 800px para a largura total do card
    background: "#F9F9F9",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
    borderRadius: "30px",
    // Reduzindo o padding lateral do card. Isso vai dar MAIS espaço para os inputs.
    // O padding superior/inferior é para o espaçamento do logo e do link inferior.
    padding: "60px 40px", // 60px vertical, 40px horizontal
    textAlign: "center",
    margin: "0 auto", // Centraliza o card
    boxSizing: "border-box", // Garante que padding e borda não aumentem a largura total
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
    justifyContent: 'center',
    // minHeight: '50px', // Altura mínima para mensagens
    width: '100%', // Ocupa toda a largura disponível
    boxSizing: "border-box",
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
    boxSizing: "border-box",
  },
  successMessage: {
    color: "#4BB543",
    textAlign: "center",
    fontSize: "14px",
    backgroundColor: "rgba(40, 167, 69, 0.1)",
    padding: "10px",
    borderRadius: "8px",
    border: "1px solid rgba(40, 167, 69, 0.2)",
    width: '100%',
    boxSizing: "border-box",
  },
  loginForm: {
    display: "flex",
    flexDirection: "column",
    gap: "25px",
    width: "100%", // O formulário ocupará 100% da largura DISPONÍVEL dentro do card
    boxSizing: "border-box",
  },
  formGroup: {
    position: "relative",
    textAlign: "left",
    width: "100%", // Cada grupo de input ocupará 100% da largura do formulário
    boxSizing: "border-box",
  },
  label: {
    display: "block",
    fontSize: "18px",
    marginBottom: "10px",
    color: "#0D0C0B",
  },
  formInput: {
    width: "100%", // O input ocupará 100% da largura do seu formGroup
    height: "57px",
    background: "#F9F9F9",
    border: "1px solid #0D0C0B",
    borderRadius: "10px",
    // Padding interno do input para o texto. Ajuste este valor se o placeholder for cortado
    // ou se quiser mais/menos "respiro" entre o texto e a borda interna do input.
    padding: "0 25px", // Este padding é que controla o espaço do texto dentro do input
    fontSize: "16px",
    fontFamily: "'Public Sans', sans-serif",
    marginBottom: "0.5rem",
    boxSizing: "border-box", // MUITO IMPORTANTE: padding e borda não aumentam a largura total
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "center",
    width: "100%",
    marginTop: "1.5rem",
    marginBottom: "1.5rem",
    boxSizing: "border-box",
  },
  loginBtn: {
    padding: "15px",
    width: "160px", // Largura do botão permanece como desejado.
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
    boxSizing: "border-box",
  },
  signupContainer: {
    borderTop: "1px solid #eee",
    paddingTop: "1.5rem",
    marginTop: "1rem",
    boxSizing: "border-box",
  },
  signupLink: {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "15px",
    color: "#0D0C0B",
    display: "flex",
    justifyContent: "center",
    gap: "0.5rem",
    boxSizing: "border-box",
  },
  signupLinkAnchor: {
    color: "#9747FF",
    fontWeight: "600",
    textDecoration: "underline",
  },
};

// Injeção de variáveis CSS globais (se você já tem isso em outro lugar, pode remover daqui)
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