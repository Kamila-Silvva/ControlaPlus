import { Routes, Route } from 'react-router-dom';
import Cadastro from './componets/features/Cadastro/Cadastro';
import Login from './componets/features/Login/Login'
import Renda from './componets/features/Renda/renda'; // Caminho novo
import Gastos from './componets/features/Gastos/gastos'; // Nome do arquivo padronizado
import Metas from './componets/features/Metas/metas'; // Nome padronizado
import Projecao from './componets/features/Projecao/projecao'; // Nome padronizado

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Cadastro />} />
      <Route path="/cadastro" element={<Cadastro />} />
      <Route path="/login" element={<Login />} />
      <Route path="/renda" element={<Renda />} />
      <Route path="/gastos-fixos" element={<Gastos />} />
      <Route path="/metas-investimentos" element={<Metas />} />
      <Route path="/projecao" element={<Projecao />} />
    </Routes>
  );
}

export default AppRoutes;