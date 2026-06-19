const express = require('express');
const { PrismaClient } = require('@prisma/client');
const { authenticate } = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/roles — get all roles for logged-in user
router.get('/', authenticate, async (req, res) => {
  try {
    const roles = await prisma.role.findMany({ where: { userId: req.userId } });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch roles' });
  }
});

// POST /api/roles — create a role
router.post('/', authenticate, async (req, res) => {
  try {
    const { name, domain, emoji } = req.body;
    if (!name || !domain) return res.status(400).json({ error: 'name and domain required' });

    const role = await prisma.role.create({
      data: { name, domain, emoji, userId: req.userId },
    });
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create role' });
  }
});

// DELETE /api/roles/:id
router.delete('/:id', authenticate, async (req, res) => {
  try {
    await prisma.role.delete({
      where: { id: req.params.id, userId: req.userId },
    });
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete role' });
  }
});

module.exports = router;
