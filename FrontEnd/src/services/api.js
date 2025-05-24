import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptores para tratamento global
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config}, error => {
  return Promise.reject(error);
});

api.interceptors.response.use(
  response => {
    // Padroniza a resposta para sempre ter data e status
    return {
      data: response.data,
      status: response.status
    };
  },
  error => {
    // Tratamento avançado de erros
    const errorResponse = {
      message: error.message,
      status: error.response?.status || 500,
      data: error.response?.data || { message: 'Erro desconhecido' }
    };
    
    console.error('Erro na API:', errorResponse);
    return Promise.reject(errorResponse);
  }
);

// Função auxiliar para tratamento de respostas
const handleResponse = (response) => {
  if (response.status >= 200 && response.status < 300) {
    return response.data;
  }
  throw new Error(response.data?.message || 'Erro na requisição');
};

export default {
  // ================= RENDAS =================
  getRendas: () => api.get('/rendas').then(handleResponse),
  createRenda: (data) => api.post('/rendas', {
    ...data,
    valor: parseFloat(data.valor),
    mesRecebimento: data.frequencia === "Mensal" ? null : data.mesRecebimento
  }).then(handleResponse),
  updateRenda: (id, data) => api.put(`/rendas/${id}`, {
    ...data,
    valor: parseFloat(data.valor)
  }).then(handleResponse),
  deleteRenda: (id) => api.delete(`/rendas/${id}`).then(handleResponse),

  // ================= GASTOS =================
  getGastos: () => api.get('/gastos').then(handleResponse),
  createGasto: (data) => api.post('/gastos', {
    ...data,
    valor: parseFloat(data.valor),
    mesPagamento: data.frequencia === "Mensal" ? null : data.mesPagamento
  }).then(handleResponse),
  updateGasto: (id, data) => api.put(`/gastos/${id}`, {
    ...data,
    valor: parseFloat(data.valor)
  }).then(handleResponse),
  deleteGasto: (id) => api.delete(`/gastos/${id}`).then(handleResponse),
  getGastosPorCategoria: () => api.get('/gastos/categorias').then(handleResponse),

  // ================= METAS/INVESTIMENTOS =================
  getMetas: () => api.get('/metas').then(handleResponse),
  createMeta: (data) => api.post('/metas', {
    ...data,
    valorTotal: parseFloat(data.valorTotal),
    prazoMeses: parseInt(data.prazoMeses),
    valorParcela: parseFloat(data.valorTotal) / parseInt(data.prazoMeses)
  }).then(handleResponse),
  updateMeta: (id, data) => api.put(`/metas/${id}`, {
    ...data,
    valorTotal: parseFloat(data.valorTotal),
    prazoMeses: parseInt(data.prazoMeses),
    valorParcela: parseFloat(data.valorTotal) / parseInt(data.prazoMeses)
  }).then(handleResponse),
  deleteMeta: (id) => api.delete(`/metas/${id}`).then(handleResponse),
  getInvestimentos: () => api.get('/metas?tipo=Investimento').then(handleResponse),

  // ================= PROJEÇÃO =================
  getProjecao: () => api.get('/projecao').then(response => {
    // Garante que a resposta tenha a estrutura esperada pelo frontend
    const data = handleResponse(response);
    return {
      projecao: data.projecao || [],
      alertas: data.alertas || [],
      saldoTotal: data.saldoTotal || 0,
      mediaRecebimentos: data.mediaRecebimentos || 0,
      mediaGastos: data.mediaGastos || 0
    };
  }),
  
  getProjecaoMensal: (ano, mes) => api.get(`/projecao/${ano}/${mes}`).then(response => {
    const data = handleResponse(response);
    return {
      ...data,
      mes: data.mes || `${ano}-${mes.toString().padStart(2, '0')}`,
      recebimentos: data.recebimentos || 0,
      gastos: data.gastos || 0,
      saldo: data.saldo || 0,
      recebimentosDetalhados: data.recebimentosDetalhados || [],
      gastosDetalhados: data.gastosDetalhados || []
    };
  }),

  // ================= AUTENTICAÇÃO =================
  login: (credenciais) => api.post('/auth/login', credenciais).then(handleResponse),
  register: (usuario) => api.post('/auth/register', usuario).then(handleResponse),

  // ================= UTILITÁRIOS =================
  getConfiguracoes: () => api.get('/configuracoes').then(handleResponse),
  updateConfiguracoes: (config) => api.put('/configuracoes', config).then(handleResponse)
};