import { Routes, Route } from 'react-router-dom';
import Cadastro from './componets/features/Cadastro/Cadastro';
import Login from './componets/features/Login/Login'
import Renda from './componets/features/Renda/renda'; 
import EsqueceuSenhaLink from './componets/features/EsqueceuSenhaLink/EsqueceuSenhaLink'// Caminho novo
import CodigoVerificacao from './componets/features/CodigoVerificacao/CodVerificacao'// Caminho novo
import RedefinirSenha from './componets/features/RedefinirSenha/RedefinirSenha'// Caminho novo
import Gastos from './componets/features/Gastos/gastos'; // Nome do arquivo padronizado
import Metas from './componets/features/Metas/metas'; // Nome padronizado
import Projecao from './componets/features/Projecao/projecao'; // Nome padronizado
import ResumodeGastos from './componets/features/ResumodeGastos/ResumodeGastos'; // Caminho novo 


function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Renda />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/esqueceuSenhaLink" element={<EsqueceuSenhaLink />} />
      <Route path="/codigoVerificacao" element={<CodigoVerificacao />} />
      <Route path="/redefinirSenha" element={<RedefinirSenha />} />
      <Route path="/renda" element={<Renda />} />
      <Route path="/gastos-fixos" element={<Gastos />} />
      <Route path="/metas-investimentos" element={<Metas />} />
      <Route path="/projecao" element={<Projecao />} />
      <Route path="/resumo" element={<ResumodeGastos />} />
    </Routes>
  );
}

export default AppRoutes;