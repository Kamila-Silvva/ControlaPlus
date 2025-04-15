import React from 'react';
import { Link } from 'react-router-dom';
import './Home.css';

const Home = () => {
  return (
    <div className="home-container">
      <header className="home-header">
        <h1>Controla+</h1>
        <p>Seu aliado no controle financeiro pessoal</p>
      </header>

      <div className="modules-grid">
        <Link to="/compulsao" className="module-card compulsao-module">
          <h2>Controle de Compulsão</h2>
          <p>Acompanhe e reduza seus gastos impulsivos</p>
          <div className="module-stats">
            <span>12 dias sem compulsão</span>
          </div>
        </Link>

        <Link to="/Login" className="module-card programacao-module">
          <h2>Tela de Login</h2>
          <p>Login Cadastro e Redefinição de senha</p>
          <div className="module-stats">
          </div>
        </Link>

        <Link to="/programacao" className="module-card programacao-module">
          <h2>Programação Financeira</h2>
          <p>Planeje seus gastos e recebimentos</p>
          <div className="module-stats">
            <span>R$ 3.240 economizados</span>
          </div>
        </Link>

        <div className="module-card relatorios-module">
          <h2>Relatórios</h2>
          <p>Visualize sua evolução financeira</p>
          <div className="module-stats">
            <span>42% de redução</span>
          </div>
        </div>
        

        <div className="module-card metas-module">
          <h2>Metas</h2>
          <p>Acompanhe seus objetivos financeiros</p>
          <div className="module-stats">
            <span>3 metas ativas</span>
          </div>
        </div>
    

      <div className="module-card metas-module">
          <h2>Home</h2>
          <p>Registre seus gastos Mensais</p>
          <div className="module-stats">
            <span>Resumo dos gastos totais do mês</span>
          </div>
        </div>
      </div>


      <div className="quick-actions">
        <button className="quick-action-btn registrar-gasto">
          Registrar Gasto
        </button>
        <button className="quick-action-btn registrar-recebimento">
          Registrar Recebimento
        </button>
      </div>

      

      <div className="home-alert urgent">
        ⚠️ Atenção: Você gastou R$ 150 com compras por impulso nos últimos 3 dias
      </div>
    </div>
  );
};

export default Home;