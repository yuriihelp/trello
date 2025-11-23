import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Create label
router.post('/', async (req, res) => {
  try {
    const { name, color, cardId } = req.body;
    const label = await prisma.label.create({
      data: { name, color, cardId }
    });
    res.status(201).json(label);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create label' });
  }
});

// Update label
router.put('/:id', async (req, res) => {
  try {
    const { name, color } = req.body;
    const label = await prisma.label.update({
      where: { id: req.params.id },
      data: { name, color }
    });
    res.json(label);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update label' });
  }
});

// Delete label
router.delete('/:id', async (req, res) => {
  try {
    await prisma.label.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete label' });
  }
});

export default router;
