import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './Cadastro.module.css';

function Cadastro() {
  const [formData, setFormData] = useState({
    nome: '',
    email: '',
    confirmEmail: '',
    senha: '',
    confirmSenha: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({
      ...formData,
      [id]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validações
    if (formData.email !== formData.confirmEmail) {
      setError('Os e-mails não coincidem!');
      return;
    }

    if (formData.senha !== formData.confirmSenha) {
      setError('As senhas não coincidem!');
      return;
    }

    if (formData.senha.length < 6) {
      setError('A senha deve ter pelo menos 6 caracteres!');
      return;
    }

    // Salva no localStorage
    const userData = {
      nome: formData.nome,
      email: formData.email,
      senha: formData.senha, 
    };

    localStorage.setItem('userData', JSON.stringify(userData));
    setError(''); // Limpa erros anteriores
    navigate('/gastos'); // Redireciona após cadastro
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <h1 className={styles.logo}>Controla+</h1>
        
        {error && <p className={styles.errorMessage}>{error}</p>}
        
        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="nome">Nome</label>
            <input
              type="text"
              id="nome"
              className={styles.formInput}
              placeholder="Digite seu nome completo"
              value={formData.nome}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              className={styles.formInput}
              placeholder="Digite seu email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmEmail">Confirme o email</label>
            <input
              type="email"
              id="confirmEmail"
              className={styles.formInput}
              placeholder="Repita o email digitado"
              value={formData.confirmEmail}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="senha">Senha</label>
            <input
              type="password"
              id="senha"
              className={styles.formInput}
              placeholder="Crie uma senha segura"
              value={formData.senha}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className={styles.formGroup}>
            <label htmlFor="confirmSenha">Confirme a senha</label>
            <input
              type="password"
              id="confirmSenha"
              className={styles.formInput}
              placeholder="Repita a senha criada"
              value={formData.confirmSenha}
              onChange={handleChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Finalizar cadastro
          </button>
        </form>
      </div>
    </div>
  );
}

export default Cadastro;