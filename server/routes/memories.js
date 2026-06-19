const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/memories — get all active memories
router.get('/', authenticate, async (req, res) => {
  try {
    const { type } = req.query;
    const memories = await prisma.memory.findMany({
      where: {
        userId: req.userId,
        isActive: true,
        ...(type && { type }),
      },
      orderBy: [{ importance: 'desc' }, { createdAt: 'desc' }],
    });
    res.json(memories);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch memories' });
  }
});

// POST /api/memories — manually add a memory (user says "remember this")
router.post('/', authenticate, async (req, res) => {
  try {
    const { type, content, importance } = req.body;
    if (!type || !content) return res.status(400).json({ error: 'type and content required' });

    const memory = await prisma.memory.create({
      data: {
        userId: req.userId,
        type, content,
        importance: importance || 5,
        sourceType: 'USER_CORRECTION',
      },
    });
    res.status(201).json(memory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to add memory' });
  }
});

// PATCH /api/memories/:id — user corrects a memory ("that's wrong")
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const memory = await prisma.memory.update({
      where: { id: req.params.id, userId: req.userId },
      data: req.body,
    });
    res.json(memory);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update memory' });
  }
});

// DELETE /api/memories/:id — user deletes a memory (Right to Deletion)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.memory.update({
      where: { id: req.params.id, userId: req.userId },
      data: { isActive: false },
    });
    res.json({ message: 'Memory removed' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete memory' });
  }
});

// GET /api/memories/patterns — get behavior patterns
router.get('/patterns', authenticate, async (req, res) => {
  try {
    const patterns = await prisma.pattern.findMany({
      where: { userId: req.userId, isActive: true },
      orderBy: { confidence: 'desc' },
    });
    res.json(patterns);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch patterns' });
  }
});

module.exports = router;
