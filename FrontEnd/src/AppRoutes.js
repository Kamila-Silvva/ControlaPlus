import React from "react";
import { Routes, Route } from "react-router-dom";

// Componentes de Autenticação e Usuário
import Cadastro from "./componets/features/Cadastro/Cadastro";
import Login from "./componets/features/Login/Login";
import EsqueceuSenhaLink from "./componets/features/EsqueceuSenhaLink/EsqueceuSenhaLink";
import CodigoVerificacao from "./componets/features/CodigoVerificacao/CodVerificacao";
import RedefinirSenha from "./componets/features/RedefinirSenha/RedefinirSenha";

// Componentes do Fluxo Principal de Planejamento
import Renda from "./componets/features/Renda/renda";
import Gastos from "./componets/features/Gastos/gastos";
import Metas from "./componets/features/Metas/metas";
import Projecao from "./componets/features/Projecao/projecao";
import Dashboard from "./componets/features/Dashboard/Dashboard";
import ControleMensal from "./componets/features/ControleMensal/ControleMensal";

function AppRoutes() {
  return (
    <Routes>
      {/* Rota inicial - pode ser a tela de Login ou Renda, dependendo do fluxo desejado */}
      <Route path="/" element={<Login />} />{" "}
      {/* Sugestão: Login como página inicial */}
      {/* Rotas de Autenticação */}
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/esqueceuSenhaLink" element={<EsqueceuSenhaLink />} />
      <Route path="/codigoVerificacao" element={<CodigoVerificacao />} />
      <Route path="/redefinirSenha" element={<RedefinirSenha />} />
      {/* Rotas do Fluxo de Planejamento Financeiro */}
      {/* A ordem aqui sugere um fluxo lógico para o usuário */}
      <Route path="/renda" element={<Renda />} />
      <Route path="/gastos-fixos" element={<Gastos />} />
      <Route path="/metas-investimentos" element={<Metas />} />
      <Route path="/projecao" element={<Projecao />} />
      {/* Dashboard e Controle Mensal */}
      <Route path="/dashboard" element={<Dashboard />} />
      {/* Exemplo de URL: /controle-mensal/Janeiro */}
      <Route path="/controle-mensal/:mes" element={<ControleMensal />} />
      {/* Adicione aqui outras rotas ou uma rota "catch-all" para página não encontrada, se necessário */}
      {/* Exemplo de rota "catch-all": <Route path="*" element={<PaginaNaoEncontrada />} /> */}
    </Routes>
  );
}

export default AppRoutes;
