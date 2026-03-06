const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Mock data for social platforms
const generateMetrics = (platform) => {
  const data = {
    facebook: {
      platform: 'facebook',
      followers: 45230,
      followersChange: 2.3,
      impressions: 125400,
      impressionsChange: 5.1,
      engagement: 3.8,
      engagementChange: 0.4,
      videoViews: 18200,
      videoViewsChange: 12.5,
      avgWatchTime: 45,
      avgWatchTimeChange: 3.2,
      postsPublished: 24,
      postsPublishedChange: -2
    },
    instagram: {
      platform: 'instagram',
      followers: 32100,
      followersChange: 4.7,
      impressions: 98700,
      impressionsChange: 8.2,
      engagement: 5.2,
      engagementChange: 1.1,
      videoViews: 24500,
      videoViewsChange: 18.3,
      avgWatchTime: 32,
      avgWatchTimeChange: 5.1,
      postsPublished: 31,
      postsPublishedChange: 3
    },
    youtube: {
      platform: 'youtube',
      followers: 12800,
      followersChange: 8.9,
      impressions: 54200,
      impressionsChange: 15.4,
      engagement: 6.7,
      engagementChange: 2.3,
      videoViews: 48900,
      videoViewsChange: 22.1,
      avgWatchTime: 312,
      avgWatchTimeChange: 18.7,
      postsPublished: 8,
      postsPublishedChange: 0
    },
    tiktok: {
      platform: 'tiktok',
      followers: 28600,
      followersChange: 15.2,
      impressions: 215300,
      impressionsChange: 32.8,
      engagement: 9.4,
      engagementChange: 3.7,
      videoViews: 198400,
      videoViewsChange: 45.6,
      avgWatchTime: 28,
      avgWatchTimeChange: 8.9,
      postsPublished: 45,
      postsPublishedChange: 12
    }
  };
  return platform ? data[platform] : data;
};

const generateHistory = (platform) => {
  const days = 30;
  const history = [];
  for (let i = days; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    history.push({
      date: date.toISOString().split('T')[0],
      followers: Math.floor(Math.random() * 1000) + 30000,
      impressions: Math.floor(Math.random() * 20000) + 80000,
      engagement: (Math.random() * 3 + 3).toFixed(2),
      videoViews: Math.floor(Math.random() * 10000) + 15000
    });
  }
  return history;
};

const generateTopContent = (platform) => {
  const contents = [];
  for (let i = 1; i <= 5; i++) {
    contents.push({
      id: i,
      platform: platform || 'all',
      title: `Post ${i} - ${platform || 'Megalabs'}`,
      type: i % 2 === 0 ? 'video' : 'image',
      likes: Math.floor(Math.random() * 5000) + 500,
      comments: Math.floor(Math.random() * 500) + 50,
      shares: Math.floor(Math.random() * 300) + 30,
      views: Math.floor(Math.random() * 50000) + 5000,
      engagementRate: (Math.random() * 5 + 2).toFixed(2),
      publishedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString()
    });
  }
  return contents;
};

const generateDemographics = () => ({
  ageGroups: [
    { range: '18-24', percentage: 28 },
    { range: '25-34', percentage: 35 },
    { range: '35-44', percentage: 22 },
    { range: '45-54', percentage: 10 },
    { range: '55+', percentage: 5 }
  ],
  gender: { male: 52, female: 45, other: 3 },
  topCountries: [
    { country: 'Guatemala', percentage: 45 },
    { country: 'Mexico', percentage: 20 },
    { country: 'Colombia', percentage: 12 },
    { country: 'USA', percentage: 10 },
    { country: 'otros', percentage: 13 }
  ]
});

// ROUTES
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.get('/api/metrics', (req, res) => {
  res.json({ success: true, data: generateMetrics(), timestamp: new Date().toISOString() });
});

app.get('/api/metrics/:platform', (req, res) => {
  const { platform } = req.params;
  const validPlatforms = ['facebook', 'instagram', 'youtube', 'tiktok'];
  if (!validPlatforms.includes(platform)) {
    return res.status(404).json({ success: false, error: 'Platform not found' });
  }
  res.json({ success: true, data: generateMetrics(platform), timestamp: new Date().toISOString() });
});

app.get('/api/history', (req, res) => {
  const { platform } = req.query;
  res.json({ success: true, data: generateHistory(platform), timestamp: new Date().toISOString() });
});

app.get('/api/content/top', (req, res) => {
  const { platform } = req.query;
  res.json({ success: true, data: generateTopContent(platform), timestamp: new Date().toISOString() });
});

app.get('/api/demographics', (req, res) => {
  res.json({ success: true, data: generateDemographics(), timestamp: new Date().toISOString() });
});

app.get('/api/comparison', (req, res) => {
  const all = generateMetrics();
  const comparison = Object.values(all).map(p => ({
    platform: p.platform,
    followers: p.followers,
    impressions: p.impressions,
    engagement: p.engagement,
    videoViews: p.videoViews
  }));
  res.json({ success: true, data: comparison, timestamp: new Date().toISOString() });
});

app.get('/api/kpis', (req, res) => {
  const all = generateMetrics();
  const totals = Object.values(all).reduce((acc, p) => ({
    totalFollowers: acc.totalFollowers + p.followers,
    totalImpressions: acc.totalImpressions + p.impressions,
    totalVideoViews: acc.totalVideoViews + p.videoViews,
    avgEngagement: acc.avgEngagement + p.engagement / 4
  }), { totalFollowers: 0, totalImpressions: 0, totalVideoViews: 0, avgEngagement: 0 });
  res.json({ success: true, data: totals, timestamp: new Date().toISOString() });
});

app.post('/api/refresh', (req, res) => {
  res.json({ success: true, message: 'Data refreshed', timestamp: new Date().toISOString() });
});

app.listen(PORT, () => {
  console.log(`Madame Dashboard API running on port ${PORT}`);
});
