import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Вспомогательные функции
async function getNextCardNumber(listId: string): Promise<number> {
  const max = await prisma.card.findFirst({
    where: { listId },
    orderBy: { number: 'desc' },
    select: { number: true }
  });
  return (max?.number ?? 0) + 1;
}

async function getBoardKeyByList(listId: string): Promise<string> {
  const list = await prisma.list.findUnique({
    where: { id: listId },
    include: { board: true } // включаем Board
  });
  if (!list) throw new Error('List not found');
  return list.board.key; // теперь берём ключ из Board
}

// Create card
router.post('/', async (req, res) => {
  try {
    const { title, description, listId, priority, deadline } = req.body;

    const position = (await prisma.card.findFirst({
      where: { listId },
      orderBy: { position: 'desc' },
      select: { position: true }
    }))?.position ?? -1 + 1;

    const card = await prisma.card.create({
      data: {
        title,
        description,
        listId,
        position,
        priority: priority || 'MEDIUM',
        deadline: deadline ? new Date(deadline) : null,
        number: await getNextCardNumber(listId),
        boardKey: await getBoardKeyByList(listId)
      },
      include: {
        labels: true,
        checklists: { include: { items: true } },
        comments: true,
        links: true,
        assignees: { include: { user: true } }
      }
    });
    res.status(201).json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create card' });
  }
});

// Update card
router.put('/:id', async (req, res) => {
  try {
    const { title, description, priority, deadline, position, listId } = req.body;
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: {
        title,
        description,
        priority,
        deadline: deadline ? new Date(deadline) : null,
        position,
        listId
      },
      include: {
        labels: true,
        checklists: { include: { items: true } },
        comments: true,
        links: true,
        assignees: { include: { user: true } }
      }
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update card' });
  }
});

// Delete card
router.delete('/:id', async (req, res) => {
  try {
    await prisma.card.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete card' });
  }
});

// Move card to another list
router.post('/:id/move', async (req, res) => {
  try {
    const { listId, position } = req.body;
    const card = await prisma.card.update({
      where: { id: req.params.id },
      data: { listId, position },
      include: {
        labels: true,
        checklists: { include: { items: true } },
        comments: true,
        links: true,
        assignees: { include: { user: true } }
      }
    });
    res.json(card);
  } catch (error) {
    res.status(500).json({ error: 'Failed to move card' });
  }
});

// Reorder cards
router.post('/reorder', async (req, res) => {
  try {
    const { updates } = req.body; // [{ id, position, listId }]
    await prisma.$transaction(
      updates.map((update: { id: string; position: number; listId?: string }) =>
        prisma.card.update({
          where: { id: update.id },
          data: { position: update.position, ...(update.listId && { listId: update.listId }) }
        })
      )
    );
    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to reorder cards' });
  }
});

export default router;
