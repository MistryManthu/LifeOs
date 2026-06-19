const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/tasks
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, domain } = req.query;
    const tasks = await prisma.task.findMany({
      where: {
        userId: req.userId,
        ...(status && { status }),
        ...(domain && { domain }),
      },
      orderBy: [{ priority: 'asc' }, { createdAt: 'desc' }],
    });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// POST /api/tasks
router.post('/', authenticate, async (req, res) => {
  try {
    const { title, notes, priority, domain, dueDate, roleId, goalId } = req.body;
    if (!title) return res.status(400).json({ error: 'title required' });

    const task = await prisma.task.create({
      data: {
        title, notes, priority, domain,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        roleId, goalId, userId: req.userId,
      },
    });
    res.status(201).json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// PATCH /api/tasks/:id
router.patch('/:id', authenticate, async (req, res) => {
  try {
    const data = { ...req.body };
    if (data.status === 'DONE') data.completedAt = new Date();

    const task = await prisma.task.update({
      where: { id: req.params.id, userId: req.userId },
      data,
    });
    res.json(task);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update task' });
  }
});

// DELETE /api/tasks/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.task.delete({ where: { id: req.params.id, userId: req.userId } });
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete task' });
  }
});

module.exports = router;
