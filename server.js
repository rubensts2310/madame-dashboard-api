const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Configuración CORS
app.use(cors());
app.use(express.json());

// Token de Metricool
const METRICOOL_TOKEN = process.env.METRICOOL_TOKEN || 'ZUDQHAOBTRHFAXWGPFAVPERUZOZLFCDYMYFGZKJUOKNLKOTPITLNDEWFUJVVCYLW';
const BASE_URL = 'https://app.metricool.com/api';

// Función auxiliar para hacer peticiones a Metricool
const metricoolRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${BASE_URL}${endpoint}`, {
      headers: {
        'X-Mc-Auth': METRICOOL_TOKEN,
        'Content-Type': 'application/json'
      },
      params
    });
    return response.data;
  } catch (error) {
    console.error('Metricool API Error:', error.response?.data || error.message);
    throw error;
  }
};

// Endpoint para obtener el userId
app.get('/api/user', async (req, res) => {
  try {
    const data = await metricoolRequest('/admin/simpleProfiles');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para obtener todas las marcas
app.get('/api/brands', async (req, res) => {
  try {
    const data = await metricoolRequest('/admin/simpleProfiles');
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para obtener detalles de una marca
app.get('/api/brands/:blogId', async (req, res) => {
  try {
    const { blogId } = req.params;
    const userIdData = await metricoolRequest('/admin/simpleProfiles');
    const userId = userIdData.data?.[0]?.userId || process.env.METRICOOL_USER_ID;
    
    const data = await metricoolRequest('/admin/profile', { blogId, userId });
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para obtener métricas de una marca
app.get('/api/brands/:blogId/metrics', async (req, res) => {
  try {
    const { blogId } = req.params;
    const { start, end } = req.query;
    
    const userIdData = await metricoolRequest('/admin/simpleProfiles');
    const userId = userIdData.data?.[0]?.userId || process.env.METRICOOL_USER_ID;
    
    // Obtener métricas de diferentes fuentes
    const [impressions, interactions] = await Promise.allSettled([
      metricoolRequest('/stats/timeline/impressions', { blogId, userId, start, end }),
      metricoolRequest('/stats/timeline/interactions', { blogId, userId, start, end })
    ]);
    
    res.json({
      success: true,
      data: {
        impressions: impressions.status === 'fulfilled' ? impressions.value : null,
        interactions: interactions.status === 'fulfilled' ? interactions.value : null
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Proxy genérico para cualquier endpoint de Metricool
app.get('/api/metricool/*', async (req, res) => {
  try {
    const path = req.params[0];
    const data = await metricoolRequest(`/${path}`, req.query);
    res.json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Health check
app.get('/', (req, res) => {
  res.json({ 
    status: 'online', 
    message: 'Madame Dashboard API - Metricool Proxy',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Madame Dashboard API running on port ${PORT}`);
});
