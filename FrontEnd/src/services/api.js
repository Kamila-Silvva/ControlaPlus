import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001' // URL base do backend
});

export default {
  // Rendas
  getRendas: () => api.get('/rendas'),
  createRenda: (data) => api.post('/rendas', data),
  updateRenda: (id, data) => api.put(`/rendas/${id}`, data),
  deleteRenda: (id) => api.delete(`/rendas/${id}`),
  
  // Metas
  getMetas: () => api.get('/metas'),
  createMeta: (data) => api.post('/metas', data),
  updateMeta: (id, data) => api.put(`/metas/${id}`, data),
  deleteMeta: (id) => api.delete(`/metas/${id}`),
  
  // Projeção
  getProjecao: () => api.get('/projecao')
};