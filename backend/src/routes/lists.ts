import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Create list
router.post('/', async (req, res) => {
  try {
    const { title, boardId } = req.body;

    // Get max position
    const maxPosition = await prisma.list.findFirst({
      where: { boardId },
      orderBy: { position: 'desc' },
      select: { position: true }
    });

    const position = (maxPosition?.position ?? -1) + 1;

    const list = await prisma.list.create({
      data: { title, boardId, position }
    });
    res.status(201).json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create list' });
  }
});

// Update list
router.put('/:id', async (req, res) => {
  try {
    const { title, position } = req.body;
    const list = await prisma.list.update({
      where: { id: req.params.id },
      data: { title, position }
    });
    res.json(list);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update list' });
  }
});

// Delete list
router.delete('/:id', async (req, res) => {
  try {
    await prisma.list.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete list' });
  }
});

// Reorder lists
router.post('/reorder', async (req, res) => {
  try {
    const { updates } = req.body; // [{ id, position }]

    await prisma.$transaction(
      updates.map((update: { id: string; position: number }) =>
        prisma.list.update({
          where: { id: update.id },
          data: { position: update.position }
        })
      )
    );

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder lists' });
  }
});

export default router;
