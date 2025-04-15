import { Link } from 'react-router-dom';
import './Cadastro.css';

function Cadastro() {
  return (
    <div className="container">
      <div className="form-container">
        <h1 className="logo">Controla+</h1>
        
        <form className="form">
            <div className="form-group">
                <label htmlFor="nome">Nome</label>
                <input 
                  type="text" 
                  id="nome" 
                  className="form-input" 
                  placeholder="Digite seu nome completo"
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className="form-input" 
                  placeholder="Digite seu email"
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="confirm-email">Confirme o email</label>
                <input 
                  type="email" 
                  id="confirm-email" 
                  className="form-input" 
                  placeholder="Repita o email digitado"
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="senha">Senha</label>
                <input 
                  type="password" 
                  id="senha" 
                  className="form-input" 
                  placeholder="Crie uma senha segura"
                />
            </div>
            
            <div className="form-group">
                <label htmlFor="confirm-senha">Confirme a senha</label>
                <input 
                  type="password" 
                  id="confirm-senha" 
                  className="form-input" 
                  placeholder="Repita a senha criada"
                />
            </div>

            <Link to="/gastos" className="submit-button">Finalizar cadastro</Link>
        </form>
      </div>
    </div>
  )
}

export default Cadastro;