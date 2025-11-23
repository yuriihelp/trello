import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { List } from '../types';
import { createCard, deleteList, updateList } from '../api';
import CardItem from './CardItem';
import { Plus, Trash2, Edit2 } from 'lucide-react';

interface Props {
  list: List;
  onRefresh: () => void;
}

export default function ListColumn({ list, onRefresh }: Props) {
  const [showNewCard, setShowNewCard] = useState(false);
  const [newCardTitle, setNewCardTitle] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(list.title);

  const { setNodeRef } = useDroppable({ id: list.id });

  const handleCreateCard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCardTitle.trim()) return;

    await createCard({ title: newCardTitle, listId: list.id });
    await onRefresh();
    setNewCardTitle('');
    setShowNewCard(false);
  };

  const handleUpdateTitle = async () => {
    if (editTitle.trim() && editTitle !== list.title) {
      await updateList(list.id, { title: editTitle });
      await onRefresh();
    }
    setIsEditing(false);
  };

  const handleDeleteList = async () => {
    if (confirm('Удалить эту колонку и все карточки в ней?')) {
      await deleteList(list.id);
      await onRefresh();
    }
  };

  return (
    <div ref={setNodeRef} className="flex-shrink-0 w-72 bg-list-bg rounded-lg p-3 flex flex-col max-h-full">
      {/* List Header */}
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={handleUpdateTitle}
            onKeyDown={(e) => e.key === 'Enter' && handleUpdateTitle()}
            className="flex-1 px-2 py-1 rounded border-2 border-blue-500 focus:outline-none"
            autoFocus
          />
        ) : (
          <h3 className="font-semibold text-gray-800 flex-1">{list.title}</h3>
        )}
        <div className="flex gap-1">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="text-gray-500 hover:text-gray-700 p-1"
            title="Редактировать"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={handleDeleteList}
            className="text-red-500 hover:text-red-700 p-1"
            title="Удалить"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 overflow-y-auto space-y-2 mb-2">
        <SortableContext items={list.cards.map((c) => c.id)} strategy={verticalListSortingStrategy}>
          {list.cards.map((card) => (
            <CardItem key={card.id} card={card} />
          ))}
        </SortableContext>
      </div>

      {/* Add Card */}
      {showNewCard ? (
        <form onSubmit={handleCreateCard} className="mt-2">
          <textarea
            value={newCardTitle}
            onChange={(e) => setNewCardTitle(e.target.value)}
            placeholder="Введите название задачи..."
            className="w-full px-3 py-2 mb-2 rounded border-2 border-blue-500 focus:outline-none resize-none"
            rows={3}
            autoFocus
          />
          <div className="flex gap-2">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1 rounded transition"
            >
              Добавить
            </button>
            <button
              type="button"
              onClick={() => setShowNewCard(false)}
              className="text-gray-600 hover:text-gray-800 px-4 py-1"
            >
              ✕
            </button>
          </div>
        </form>
      ) : (
        <button
          onClick={() => setShowNewCard(true)}
          className="w-full bg-white/50 hover:bg-white/80 text-gray-700 p-2 rounded flex items-center gap-2 transition"
        >
          <Plus size={18} />
          <span>Добавить карточку</span>
        </button>
      )}
    </div>
  );
}
