import { Link } from 'react-router-dom';
import './Login.css';

function Login() {
  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="logo">Controla+</h1>
        
        <form className="login-form">
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              className="form-input" 
              placeholder="Digite aqui o seu email"
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="password">Senha</label>
            <input 
              type="password" 
              id="password" 
              className="form-input" 
              placeholder="Digite aqui a sua senha"
            />
            <Link to="/esqueceu-senha" className='forgot-password'>Esqueceu a Senha?</Link>
          </div>

          <Link to="/gastos" className="login-btn">Entrar</Link>
        </form>
        
        <div className="signup-link">
          <span>Ainda não tem uma conta?</span>
          <Link to="/cadastro" className="signup-link">Cadastre-se aqui!</Link>
        </div>
      </div>
    </div>
  )
}

export default Login;