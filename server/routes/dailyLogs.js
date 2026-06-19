const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/daily-logs
router.get('/', authenticate, async (req, res) => {
  try {
    const logs = await prisma.dailyLog.findMany({
      where: { userId: req.userId },
      orderBy: { date: 'desc' },
      take: 30,
    });
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' });
  }
});

// GET /api/daily-logs/today
router.get('/today', authenticate, async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const log = await prisma.dailyLog.findFirst({
      where: { userId: req.userId, date: { gte: today, lt: tomorrow } },
      include: { tasks: true },
    });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch today log' });
  }
});

// POST /api/daily-logs — create morning check-in
router.post('/', authenticate, async (req, res) => {
  try {
    const { energyLevel, mood, topPriorities, aiSuggestion } = req.body;
    if (!energyLevel || !mood)
      return res.status(400).json({ error: 'energyLevel and mood required' });

    const log = await prisma.dailyLog.create({
      data: { energyLevel, mood, topPriorities, aiSuggestion, userId: req.userId },
    });
    res.status(201).json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create daily log' });
  }
});

// PATCH /api/daily-logs/:id — update evening note
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const log = await prisma.dailyLog.update({
      where: { id: req.params.id, userId: req.userId },
      data: req.body,
    });
    res.json(log);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update log' });
  }
});

module.exports = router;
