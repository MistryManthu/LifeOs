const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/blueprint — get current user's blueprint
router.get('/', authenticate, async (req, res) => {
  try {
    const blueprint = await prisma.humanBlueprint.findUnique({
      where: { userId: req.userId },
    });
    res.json(blueprint);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch blueprint' });
  }
});

// POST /api/blueprint — create blueprint during onboarding
router.post('/', authenticate, async (req, res) => {
  try {
    const existing = await prisma.humanBlueprint.findUnique({ where: { userId: req.userId } });
    if (existing) return res.status(409).json({ error: 'Blueprint already exists. Use PUT to update.' });

    const blueprint = await prisma.humanBlueprint.create({
      data: { ...req.body, userId: req.userId },
    });
    res.status(201).json(blueprint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to create blueprint' });
  }
});

// PUT /api/blueprint — update blueprint (can be done in steps)
router.put('/', authenticate, async (req, res) => {
  try {
    const blueprint = await prisma.humanBlueprint.upsert({
      where: { userId: req.userId },
      update: req.body,
      create: { ...req.body, userId: req.userId },
    });
    res.json(blueprint);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to update blueprint' });
  }
});

// PATCH /api/blueprint/complete — mark blueprint as complete
router.patch('/complete', authenticate, async (req, res) => {
  try {
    const blueprint = await prisma.humanBlueprint.update({
      where: { userId: req.userId },
      data: { isComplete: true, completedAt: new Date() },
    });
    res.json(blueprint);
  } catch (err) {
    res.status(500).json({ error: 'Failed to complete blueprint' });
  }
});

module.exports = router;
