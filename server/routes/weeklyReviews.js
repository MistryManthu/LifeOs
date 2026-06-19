const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/weekly-reviews
router.get('/', authenticate, async (req, res) => {
  try {
    const reviews = await prisma.weeklyReview.findMany({
      where: { userId: req.userId },
      orderBy: { weekStart: 'desc' },
      take: 12,
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// POST /api/weekly-reviews
router.post('/', authenticate, async (req, res) => {
  try {
    const { weekStart, weekEnd, aiReview, highlights, improvements, nextWeekFocus, domainScores } = req.body;

    const review = await prisma.weeklyReview.create({
      data: {
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        aiReview, highlights, improvements, nextWeekFocus,
        domainScores: domainScores || {},
        userId: req.userId,
      },
    });
    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

module.exports = router;
