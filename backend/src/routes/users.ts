import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Get all users
router.get('/', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { name: 'asc' }
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Create user
router.post('/', async (req, res) => {
  try {
    const { name, email, avatar, color } = req.body;
    const user = await prisma.user.create({
      data: { name, email, avatar, color }
    });
    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create user' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { name, email, avatar, color } = req.body;
    const user = await prisma.user.update({
      where: { id: req.params.id },
      data: { name, email, avatar, color }
    });
    res.json(user);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update user' });
  }
});

// Delete user
router.delete('/:id', async (req, res) => {
  try {
    await prisma.user.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Assign user to card
router.post('/:userId/assign/:cardId', async (req, res) => {
  try {
    const { userId, cardId } = req.params;
    const assignment = await prisma.cardAssignee.create({
      data: { userId, cardId },
      include: { user: true }
    });
    res.status(201).json(assignment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to assign user to card' });
  }
});

// Unassign user from card
router.delete('/:userId/unassign/:cardId', async (req, res) => {
  try {
    const { userId, cardId } = req.params;
    await prisma.cardAssignee.deleteMany({
      where: { userId, cardId }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to unassign user from card' });
  }
});

export default router;
