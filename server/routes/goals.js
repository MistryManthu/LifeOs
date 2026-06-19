const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/goals
router.get('/', authenticate, async (req, res) => {
  try {
    const goals = await prisma.goal.findMany({
      where: { userId: req.userId },
      include: { tasks: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(goals);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch goals' });
  }
});

// POST /api/goals
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, domain, quarter, year, roleId } = req.body;
    if (!title || !domain || !quarter || !year)
      return res.status(400).json({ error: 'title, domain, quarter, year required' });

    const goal = await prisma.goal.create({
      data: { title, description, domain, quarter, year, roleId, userId: req.userId },
    });
    res.status(201).json(goal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create goal' });
  }
});

// PATCH /api/goals/:id
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const goal = await prisma.goal.update({
      where: { id: req.params.id, userId: req.userId },
      data: req.body,
    });
    res.json(goal);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update goal' });
  }
});

// DELETE /api/goals/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.goal.delete({ where: { id: req.params.id, userId: req.userId } });
    res.json({ message: 'Goal deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete goal' });
  }
});

module.exports = router;
