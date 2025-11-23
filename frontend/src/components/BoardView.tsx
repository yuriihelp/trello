import { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent
} from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { Board, Card } from '../types';
import { getBoard, createList, reorderCards } from '../api';
import ListColumn from './ListColumn';
import CardItem from './CardItem';
import CardModal from './CardModal';
import { Plus } from 'lucide-react';
import { useStore } from '../store';

interface Props {
  board: Board;
  onUpdate: (board: Board) => void;
}

export default function BoardView({ board, onUpdate }: Props) {
  const [activeCard, setActiveCard] = useState<Card | null>(null);
  const [showNewList, setShowNewList] = useState(false);
  const [newListTitle, setNewListTitle] = useState('');
  const { selectedCard, setSelectedCard } = useStore();

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const card = board.lists
      .flatMap((list) => list.cards)
      .find((c) => c.id === active.id);
    setActiveCard(card || null);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    if (activeId === overId) return;

    const activeList = board.lists.find((list) =>
      list.cards.some((card) => card.id === activeId)
    );
    const overList = board.lists.find(
      (list) => list.id === overId || list.cards.some((card) => card.id === overId)
    );

    if (!activeList || !overList) return;

    if (activeList.id !== overList.id) {
      const activeCards = activeList.cards;
      const overCards = overList.cards;
      const activeIndex = activeCards.findIndex((c) => c.id === activeId);
      const overIndex = overCards.findIndex((c) => c.id === overId);

      let newIndex: number;
      if (overId in overCards) {
        newIndex = overIndex >= 0 ? overIndex : overCards.length;
      } else {
        newIndex = overCards.length;
      }

      const updatedLists = board.lists.map((list) => {
        if (list.id === activeList.id) {
          return {
            ...list,
            cards: activeCards.filter((c) => c.id !== activeId)
          };
        }
        if (list.id === overList.id) {
          const newCards = [...overCards];
          newCards.splice(newIndex, 0, { ...activeCards[activeIndex], listId: overList.id });
          return { ...list, cards: newCards };
        }
        return list;
      });

      onUpdate({ ...board, lists: updatedLists });
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveCard(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeList = board.lists.find((list) =>
      list.cards.some((card) => card.id === activeId)
    );
    const overList = board.lists.find(
      (list) => list.id === overId || list.cards.some((card) => card.id === overId)
    );

    if (!activeList || !overList) return;

    const activeIndex = activeList.cards.findIndex((c) => c.id === activeId);
    const overIndex = overList.cards.findIndex((c) => c.id === overId);

    if (activeList.id === overList.id) {
      if (activeIndex !== overIndex) {
        const newCards = arrayMove(activeList.cards, activeIndex, overIndex);
        const updates = newCards.map((card, index) => ({
          id: card.id,
          position: index
        }));

        await reorderCards(updates);
        await refreshBoard();
      }
    } else {
      const updates = [
        ...activeList.cards
          .filter((c) => c.id !== activeId)
          .map((card, index) => ({ id: card.id, position: index })),
        ...overList.cards.map((card, index) => ({
          id: card.id,
          position: card.id === activeId ? overIndex : index
        })),
        { id: activeId, position: overIndex >= 0 ? overIndex : overList.cards.length, listId: overList.id }
      ];

      await reorderCards(updates);
      await refreshBoard();
    }
  };

  const refreshBoard = async () => {
    const updatedBoard = await getBoard(board.id);
    onUpdate(updatedBoard);
  };

  const handleCreateList = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListTitle.trim()) return;

    await createList({ title: newListTitle, boardId: board.id });
    await refreshBoard();
    setNewListTitle('');
    setShowNewList(false);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="h-full p-4 overflow-x-auto">
          <div className="flex gap-4 h-full">
            <SortableContext items={board.lists.map((list) => list.id)}>
              {board.lists.map((list) => (
                <ListColumn key={list.id} list={list} onRefresh={refreshBoard} />
              ))}
            </SortableContext>

            {/* Add List Button */}
            <div className="flex-shrink-0 w-72">
              {showNewList ? (
                <form onSubmit={handleCreateList} className="bg-list-bg p-3 rounded-lg shadow-sm">
                  <input
                    type="text"
                    value={newListTitle}
                    onChange={(e) => setNewListTitle(e.target.value)}
                    placeholder="Название колонки..."
                    className="w-full px-3 py-2 mb-2 rounded border-2 border-dark-blue focus:outline-none focus:ring-2 focus:ring-dark-blue-hover"
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <button
                      type="submit"
                      className="bg-dark-blue hover:bg-dark-blue-hover text-white px-4 py-1 rounded transition"
                    >
                      Добавить
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowNewList(false)}
                      className="text-gray-600 hover:text-gray-800 px-4 py-1"
                    >
                      ✕
                    </button>
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setShowNewList(true)}
                  className="w-full bg-list-bg hover:bg-gray-200 border border-gray-300 text-gray-700 p-3 rounded-lg flex items-center gap-2 transition shadow-sm"
                >
                  <Plus size={20} />
                  <span>Добавить колонку</span>
                </button>
              )}
            </div>
          </div>
        </div>

        <DragOverlay>{activeCard ? <CardItem card={activeCard} isDragging /> : null}</DragOverlay>
      </DndContext>

      {selectedCard && <CardModal card={selectedCard} onClose={() => setSelectedCard(null)} onRefresh={refreshBoard} />}
    </>
  );
}
