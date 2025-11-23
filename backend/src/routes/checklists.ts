import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Create checklist
router.post('/', async (req, res) => {
  try {
    const { title, cardId } = req.body;
    const checklist = await prisma.checklist.create({
      data: { title, cardId },
      include: { items: true }
    });
    res.status(201).json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create checklist' });
  }
});

// Update checklist
router.put('/:id', async (req, res) => {
  try {
    const { title } = req.body;
    const checklist = await prisma.checklist.update({
      where: { id: req.params.id },
      data: { title },
      include: { items: true }
    });
    res.json(checklist);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update checklist' });
  }
});

// Delete checklist
router.delete('/:id', async (req, res) => {
  try {
    await prisma.checklist.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete checklist' });
  }
});

// Add checklist item
router.post('/:id/items', async (req, res) => {
  try {
    const { text } = req.body;
    const checklistId = req.params.id;

    // Get max position
    const maxPosition = await prisma.checklistItem.findFirst({
      where: { checklistId },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    const position = (maxPosition?.position ?? -1) + 1;

    const item = await prisma.checklistItem.create({
      data: { text, checklistId, position }
    });
    res.status(201).json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to add checklist item' });
  }
});

// Update checklist item
router.put('/items/:id', async (req, res) => {
  try {
    const { text, completed } = req.body;
    const item = await prisma.checklistItem.update({
      where: { id: req.params.id },
      data: { text, completed }
    });
    res.json(item);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update checklist item' });
  }
});

// Delete checklist item
router.delete('/items/:id', async (req, res) => {
  try {
    await prisma.checklistItem.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete checklist item' });
  }
});

export default router;
