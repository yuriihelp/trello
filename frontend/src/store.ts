import { create } from 'zustand';
import type { Board, Card } from './types';

interface AppState {
  boards: Board[];
  currentBoard: Board | null;
  selectedCard: Card | null;
  setBoards: (boards: Board[]) => void;
  setCurrentBoard: (board: Board | null) => void;
  setSelectedCard: (card: Card | null) => void;
  updateBoard: (board: Board) => void;
}

export const useStore = create<AppState>((set) => ({
  boards: [],
  currentBoard: null,
  selectedCard: null,
  setBoards: (boards) => set({ boards }),
  setCurrentBoard: (board) => set({ currentBoard: board }),
  setSelectedCard: (card) => set({ selectedCard: card }),
  updateBoard: (board) => set((state) => ({
    currentBoard: board,
    boards: state.boards.map((b) => (b.id === board.id ? board : b))
  }))
}));
