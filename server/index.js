const express = require('express');
const cors = require('cors');
require('dotenv').config();

const authRoutes       = require('./routes/auth');
const userRoutes       = require('./routes/user');
const blueprintRoutes  = require('./routes/blueprint');
const goalRoutes       = require('./routes/goals');
const dailyLogRoutes   = require('./routes/dailyLogs');
const weeklyRevRoutes  = require('./routes/weeklyReviews');
const memoryRoutes     = require('./routes/memories');
const lifeEventRoutes  = require('./routes/lifeEvents');
const aiRoutes         = require('./routes/ai');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json());

app.use('/api/auth',          authRoutes);
app.use('/api/user',          userRoutes);
app.use('/api/blueprint',     blueprintRoutes);
app.use('/api/goals',         goalRoutes);
app.use('/api/daily-logs',    dailyLogRoutes);
app.use('/api/weekly-reviews',weeklyRevRoutes);
app.use('/api/memories',      memoryRoutes);
app.use('/api/life-events',   lifeEventRoutes);
app.use('/api/ai',            aiRoutes);

app.get('/health', (req, res) => res.json({ status: 'HumanOS Guardian is running 🧠' }));

app.listen(PORT, () => {
  console.log(`✅ HumanOS server running on http://localhost:${PORT}`);
});
