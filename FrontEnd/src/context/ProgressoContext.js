import { createContext, useState, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';

export const ProgressoContext = createContext();

export const ProgressoProvider = ({ children }) => {
  const etapas = ['Renda', 'Gastos Fixos', 'Metas e Investimentos', 'Projeção'];
  const location = useLocation();
  
  const getEtapaAtual = useCallback(() => {
    switch(location.pathname) {
      case '/':
      case '/renda':
        return 0;
      case '/gastos-fixos':
        return 1;
      case '/metas-investimentos':
        return 2;
      case '/projecao':
        return 3;
      default:
        return 0;
    }
  }, [location.pathname]);

  const [etapaAtual, setEtapaAtual] = useState(getEtapaAtual());
  const [metas, setMetas] = useState(() => {
    const metasSalvas = localStorage.getItem('itensMetas');
    return metasSalvas ? JSON.parse(metasSalvas) : [];
  });

  useEffect(() => {
    setEtapaAtual(getEtapaAtual());
  }, [getEtapaAtual]);

  // Atualiza localStorage sempre que metas mudam
  useEffect(() => {
    localStorage.setItem('itensMetas', JSON.stringify(metas));
  }, [metas]);

  return (
    <ProgressoContext.Provider value={{ etapas, etapaAtual, metas, setMetas }}>
      {children}
    </ProgressoContext.Provider>
  );
};