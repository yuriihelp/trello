import { Router } from 'express';
import prisma from '../prisma';

const router = Router();

// Get all boards
router.get('/', async (req, res) => {
  try {
    const boards = await prisma.board.findMany({
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: {
                labels: true,
                checklists: {
                  include: { items: true }
                },
                comments: {
                  orderBy: { createdAt: 'desc' }
                },
                links: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json(boards);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch boards' });
  }
});

// Get single board
router.get('/:id', async (req, res) => {
  try {
    const board = await prisma.board.findUnique({
      where: { id: req.params.id },
      include: {
        lists: {
          orderBy: { position: 'asc' },
          include: {
            cards: {
              orderBy: { position: 'asc' },
              include: {
                labels: true,
                checklists: {
                  include: { items: true }
                },
                comments: {
                  orderBy: { createdAt: 'desc' }
                },
                links: true
              }
            }
          }
        }
      }
    });
    if (!board) {
      return res.status(404).json({ error: 'Board not found' });
    }
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch board' });
  }
});

// Create board
router.post('/', async (req, res) => {
  try {
    const { title, description, color } = req.body;
    const board = await prisma.board.create({
      data: { title, description, color }
    });
    res.status(201).json(board);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create board' });
  }
});

// Update board
router.put('/:id', async (req, res) => {
  try {
    const { title, description, color } = req.body;
    const board = await prisma.board.update({
      where: { id: req.params.id },
      data: { title, description, color }
    });
    res.json(board);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update board' });
  }
});

// Delete board
router.delete('/:id', async (req, res) => {
  try {
    await prisma.board.delete({
      where: { id: req.params.id }
    });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete board' });
  }
});

export default router;
