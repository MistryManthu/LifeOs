const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/life-events
router.get('/', authenticate, async (req, res) => {
  try {
    const events = await prisma.lifeEvent.findMany({
      where: { userId: req.userId },
      orderBy: { eventDate: 'desc' },
    });
    res.json(events);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch life events' });
  }
});

// POST /api/life-events
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, description, eventDate, domain, impactScore, tags } = req.body;
    if (!title || !eventDate) return res.status(400).json({ error: 'title and eventDate required' });

    const event = await prisma.lifeEvent.create({
      data: {
        userId: req.userId,
        title, description,
        eventDate: new Date(eventDate),
        domain, impactScore, tags,
      },
    });

    // Store this as a permanent memory automatically
    await prisma.memory.create({
      data: {
        userId: req.userId,
        type: 'LIFE_EVENT',
        content: `${title}${description ? ': ' + description : ''} (${new Date(eventDate).getFullYear()})`,
        importance: Math.abs(impactScore || 5),
        sourceType: 'LIFE_EVENT',
        sourceId: event.id,
      },
    });

    res.status(201).json(event);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create life event' });
  }
});

// DELETE /api/life-events/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.lifeEvent.delete({ where: { id: req.params.id, userId: req.userId } });
    res.json({ message: 'Life event deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete life event' });
  }
});

module.exports = router;
