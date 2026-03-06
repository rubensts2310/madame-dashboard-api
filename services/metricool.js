const axios = require('axios');

const getMetricoolData = async () => {
  const userId = process.env.METRICOOL_USER_ID;
  const blogId = process.env.METRICOOL_BLOG_ID;
  const token = process.env.METRICOOL_TOKEN;

  if (!userId || !blogId || !token) {
    throw new Error('Missing Metricool credentials');
  }

  try {
    const response = await axios.get(
      `https://api.metricool.com/v1/user/${userId}/blog/${blogId}/metrics`,
      {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching Metricool data:', error.message);
    throw error;
  }
};

module.exports = { getMetricoolData };
