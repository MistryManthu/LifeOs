const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');
const guardian = require('../services/ai/guardian');

const router = express.Router();
const prisma = new PrismaClient();

// ─── Context Loader ────────────────────────────────────────────
// Loads everything the Guardian needs. Used by all routes.
const loadGuardianContext = async (userId) => {
  const [user, blueprint, goals, memories, patterns, recentLogs] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId } }),
    prisma.humanBlueprint.findUnique({ where: { userId } }),
    prisma.goal.findMany({ where: { userId, status: 'ACTIVE' }, orderBy: { priority: 'asc' } }),
    prisma.memory.findMany({
      where: { userId, isActive: true },
      orderBy: { importance: 'desc' },
      take: 20,
    }),
    prisma.pattern.findMany({
      where: { userId, isActive: true },
      orderBy: { confidence: 'desc' },
    }),
    prisma.dailyLog.findMany({
      where: { userId },
      orderBy: { date: 'desc' },
      take: 7,
    }),
  ]);

  return { user, blueprint, goals, memories, patterns, recentLogs };
};

// ─── POST /api/ai/morning ──────────────────────────────────────
router.post('/morning', authenticate, async (req, res) => {
  try {
    const { mainObjective, availableHours, topChallenge, energyLevel, mood } = req.body;
    const ctx = await loadGuardianContext(req.userId);

    const suggestion = await guardian.processMorningCheckin({
      ...ctx,
      checkin: { mainObjective, availableHours, topChallenge, energyLevel, mood },
    });

    // Create the daily log with morning data
    const log = await prisma.dailyLog.create({
      data: {
        userId: req.userId,
        mainObjective, availableHours, topChallenge,
        energyLevel, mood,
        morningCompleted: true,
        guardianMorningSuggestion: suggestion,
      },
    });

    res.json({ suggestion, logId: log.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Morning check-in failed' });
  }
});

// ─── POST /api/ai/evening ─────────────────────────────────────
router.post('/evening', authenticate, async (req, res) => {
  try {
    const { logId, completedWork, blockers, eveningEnergy, eveningReflection } = req.body;
    const ctx = await loadGuardianContext(req.userId);

    const observation = await guardian.processEveningCheckin({
      ...ctx,
      checkin: { completedWork, blockers, eveningEnergy, eveningReflection },
    });

    // Update the daily log
    const log = await prisma.dailyLog.update({
      where: { id: logId, userId: req.userId },
      data: {
        completedWork, blockers,
        eveningEnergy, eveningReflection,
        eveningCompleted: true,
      },
    });

    // Async: extract memories from this log
    guardian.extractMemoriesFromLog({
      user: ctx.user,
      blueprint: ctx.blueprint,
      log: { ...log, completedWork, blockers, eveningEnergy, eveningReflection },
    }).then(async (extractedMemories) => {
      if (extractedMemories.length > 0) {
        await prisma.memory.createMany({
          data: extractedMemories.map(m => ({
            userId: req.userId,
            type: m.type,
            content: m.content,
            importance: m.importance,
            sourceType: 'DAILY_CHECKIN',
            sourceId: logId,
          })),
        });

        await prisma.dailyLog.update({
          where: { id: logId },
          data: { memoryExtracted: true },
        });
      }
    }).catch(console.error);

    res.json({ observation, logId: log.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Evening check-in failed' });
  }
});

// ─── POST /api/ai/weekly-review ───────────────────────────────
router.post('/weekly-review', authenticate, async (req, res) => {
  try {
    const { weekStart, weekEnd } = req.body;
    const ctx = await loadGuardianContext(req.userId);

    const weekLogs = await prisma.dailyLog.findMany({
      where: {
        userId: req.userId,
        date: { gte: new Date(weekStart), lte: new Date(weekEnd) },
      },
    });

    const reviewText = await guardian.generateWeeklyReview({
      ...ctx,
      weekLogs,
    });

    // Also run bottleneck detection
    const bottleneckText = await guardian.detectBottleneck(ctx);

    const review = await prisma.weeklyReview.create({
      data: {
        userId: req.userId,
        weekStart: new Date(weekStart),
        weekEnd: new Date(weekEnd),
        fullReview: reviewText,
        weeklyBottleneck: bottleneckText,
        wins: [],
        missedOpportunities: [],
        emergingPatterns: [],
        nextWeekFocus: [],
        domainScores: {},
      },
    });

    res.json({ review: reviewText, bottleneck: bottleneckText, reviewId: review.id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Weekly review failed' });
  }
});

// ─── POST /api/ai/bottleneck ──────────────────────────────────
router.post('/bottleneck', authenticate, async (req, res) => {
  try {
    const ctx = await loadGuardianContext(req.userId);
    const bottleneck = await guardian.detectBottleneck(ctx);
    res.json({ bottleneck });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Bottleneck detection failed' });
  }
});

// ─── POST /api/ai/life-snapshot ───────────────────────────────
router.post('/life-snapshot', authenticate, async (req, res) => {
  try {
    const { user, blueprint, goals } = await loadGuardianContext(req.userId);
    if (!blueprint) return res.status(400).json({ error: 'Blueprint not found. Complete onboarding first.' });

    const snapshot = await guardian.generateLifeSnapshot({ user, blueprint, goals });

    // Store snapshot in blueprint
    await prisma.humanBlueprint.update({
      where: { userId: req.userId },
      data: { guardianSnapshot: snapshot },
    });

    res.json({ snapshot });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Life snapshot failed' });
  }
});

// ─── POST /api/ai/chat ────────────────────────────────────────
router.post('/chat', authenticate, async (req, res) => {
  try {
    const { message } = req.body;
    if (!message) return res.status(400).json({ error: 'message required' });

    const ctx = await loadGuardianContext(req.userId);
    const reply = await guardian.coachChat({ ...ctx, message });

    // Store this as a Guardian insight
    await prisma.agentInsight.create({
      data: {
        userId: req.userId,
        trigger: 'USER_INITIATED',
        fullResponse: reply,
      },
    });

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Guardian chat failed' });
  }
});

module.exports = router;
