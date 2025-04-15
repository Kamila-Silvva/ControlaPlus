import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Home from './components/Home';
import Login from './components/Login/Login';
import Gastos from './components/PaginaInicial/PaginaHome';
import Cadastro from './components/Cadastro/Cadastro';
import EsqueceuSenha1 from './components/EsqueceuSenhaLink/EsqueceuSenhaLink';
import CodigoVerificacao from './components/CodigoVerificacao/CodVerificacao';
import RedefinirSenha from './components/RedefinicaoSenha/RedefinirSenha';
import CompulsaoFinanceira from './components/CompulsaoFinanceira';
import ProgramacaoFinanceira from './components/ProgramacaoFinanceira';
import ProjecaoFinanceira from './components/ProjecaoFinanceira';



function App() {
  return (
    <Router>
       <Routes>
        {/* Definindo as rotas */}
        <Route path="/" element={<Home />} />
        <Route path="/home" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/gastos" element={<Gastos />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/esqueceu-senha" element={<EsqueceuSenha1 />} />
        <Route path="/codigo-verificacao" element={<CodigoVerificacao />} />
        <Route path="/redefinir-senha" element={<RedefinirSenha />} />
        <Route path="/compulsao" element={<CompulsaoFinanceira />} />
        <Route path="/programacao" element={<ProgramacaoFinanceira />} />
        <Route path="/projecao" element={<ProjecaoFinanceira />} />
      </Routes>
    </Router>
  );
}

export default App;
