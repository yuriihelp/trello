import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Get relations for a card
router.get('/card/:cardId', async (req, res) => {
  try {
    const { cardId } = req.params;

    // Get both outgoing and incoming relations
    const [relationsFrom, relationsTo] = await Promise.all([
      prisma.cardRelation.findMany({
        where: { fromCardId: cardId },
        include: {
          toCard: {
            select: {
              id: true,
              number: true,
              boardKey: true,
              title: true,
              listId: true,
              priority: true
            }
          }
        }
      }),
      prisma.cardRelation.findMany({
        where: { toCardId: cardId },
        include: {
          fromCard: {
            select: {
              id: true,
              number: true,
              boardKey: true,
              title: true,
              listId: true,
              priority: true
            }
          }
        }
      })
    ]);

    res.json({ relationsFrom, relationsTo });
  } catch (error) {
    console.error('Failed to get card relations:', error);
    res.status(500).json({ error: 'Failed to get card relations' });
  }
});

// Create a relation between cards
router.post('/', async (req, res) => {
  try {
    const { fromCardId, toCardId, type } = req.body;

    // Validate that cards exist
    const [fromCard, toCard] = await Promise.all([
      prisma.card.findUnique({ where: { id: fromCardId } }),
      prisma.card.findUnique({ where: { id: toCardId } })
    ]);

    if (!fromCard || !toCard) {
      return res.status(404).json({ error: 'One or both cards not found' });
    }

    // Create the relation
    const relation = await prisma.cardRelation.create({
      data: {
        fromCardId,
        toCardId,
        type
      },
      include: {
        fromCard: {
          select: {
            id: true,
            number: true,
            boardKey: true,
            title: true,
            priority: true
          }
        },
        toCard: {
          select: {
            id: true,
            number: true,
            boardKey: true,
            title: true,
            priority: true
          }
        }
      }
    });

    res.status(201).json(relation);
  } catch (error: any) {
    console.error('Failed to create card relation:', error);
    if (error.code === 'P2002') {
      res.status(409).json({ error: 'This relation already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create card relation' });
    }
  }
});

// Delete a relation
router.delete('/:id', async (req, res) => {
  try {
    await prisma.cardRelation.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    console.error('Failed to delete card relation:', error);
    res.status(500).json({ error: 'Failed to delete card relation' });
  }
});

export default router;
