import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Create comment
router.post('/', async (req, res) => {
  try {
    const { text, author, cardId } = req.body;
    const comment = await prisma.comment.create({
      data: { text, author, cardId }
    });
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create comment' });
  }
});

// Update comment
router.put('/:id', async (req, res) => {
  try {
    const { text } = req.body;
    const comment = await prisma.comment.update({
      where: { id: req.params.id },
      data: { text }
    });
    res.json(comment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update comment' });
  }
});

// Delete comment
router.delete('/:id', async (req, res) => {
  try {
    await prisma.comment.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete comment' });
  }
});

export default router;
