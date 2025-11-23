import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Create link
router.post('/', async (req, res) => {
  try {
    const { title, url, cardId } = req.body;
    const link = await prisma.link.create({
      data: { title, url, cardId }
    });
    res.status(201).json(link);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create link' });
  }
});

// Update link
router.put('/:id', async (req, res) => {
  try {
    const { title, url } = req.body;
    const link = await prisma.link.update({
      where: { id: req.params.id },
      data: { title, url }
    });
    res.json(link);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update link' });
  }
});

// Delete link
router.delete('/:id', async (req, res) => {
  try {
    await prisma.link.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete link' });
  }
});

export default router;
