import React, { createContext, useState, useEffect, useCallback, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
export const ProgressoContext = createContext();
export const ProgressoProvider = ({ children }) => {

  const etapas = useMemo(
    () => ["Receita", "Gastos Fixos", "Metas e Investimentos", "Projeção"],
    []
  );
  const location = useLocation();
  const navigate = useNavigate();


  const rotasEtapas = useMemo(
    () => ({
      Receita: "/renda",
      "Gastos Fixos": "/gastos-fixos",
      "Metas e Investimentos": "/metas-investimentos",
      Projeção: "/projecao",
    }),
    []
  );

  const getEtapaAtual = useCallback(() => {
    switch (location.pathname) {
      case "/":
      case "/renda":
        return 0;
      case "/gastos-fixos":
        return 1;
      case "/metas-investimentos":
        return 2;
      case "/projecao":
        return 3;
      default:
        return 0;
    }
  }, [location.pathname]);

  const [etapaAtual, setEtapaAtual] = useState(getEtapaAtual());

  useEffect(() => {
    setEtapaAtual(getEtapaAtual());
  }, [getEtapaAtual]);

  const navegarParaEtapa = useCallback(
    (nomeEtapa) => {
      const indexEtapa = etapas.indexOf(nomeEtapa);
      const rotaAlvo = rotasEtapas[nomeEtapa];

      if (indexEtapa !== -1 && rotaAlvo && indexEtapa !== etapaAtual) {
        setEtapaAtual(indexEtapa);
        navigate(rotaAlvo);
      }
    },
    [etapas, rotasEtapas, navigate, etapaAtual]
  );

  return (
    <ProgressoContext.Provider
      value={{
        etapas,
        etapaAtual,
        navegarParaEtapa,
      }}
    >
      {children}
    </ProgressoContext.Provider>
  );
};
