import { useState, useEffect } from 'react';
import { Link as LinkIcon, X, Plus, AlertCircle, GitBranch } from 'lucide-react';
import type { CardRelation, RelationType } from '../types';
import { getCardRelations, createCardRelation, deleteCardRelation } from '../api';
import { useStore } from '../store';

interface Props {
  cardId: string;
  onRefresh: () => void;
}

const RELATION_LABELS: Record<RelationType, string> = {
  BLOCKS: 'Блокирует',
  BLOCKED_BY: 'Заблокирована',
  RELATES_TO: 'Связана с',
  DUPLICATES: 'Дублирует',
  CLONES: 'Клонирует'
};

const RELATION_COLORS: Record<RelationType, string> = {
  BLOCKS: 'text-red-600 bg-red-50',
  BLOCKED_BY: 'text-orange-600 bg-orange-50',
  RELATES_TO: 'text-blue-600 bg-blue-50',
  DUPLICATES: 'text-purple-600 bg-purple-50',
  CLONES: 'text-green-600 bg-green-50'
};

export default function CardRelations({ cardId, onRefresh }: Props) {
  const { currentBoard, setSelectedCard } = useStore();
  const [relations, setRelations] = useState<{ relationsFrom: CardRelation[]; relationsTo: CardRelation[] }>({
    relationsFrom: [],
    relationsTo: []
  });
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedType, setSelectedType] = useState<RelationType>('BLOCKS');
  const [taskNumber, setTaskNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadRelations();
  }, [cardId]);

  const loadRelations = async () => {
    try {
      const data = await getCardRelations(cardId);
      setRelations(data);
    } catch (error) {
      console.error('Failed to load relations:', error);
    }
  };

  const handleAddRelation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskNumber.trim() || !currentBoard) return;

    setLoading(true);
    setError('');

    try {
      // Find card by task number (e.g., "PROJ-123" or just "123")
      const taskNumberMatch = taskNumber.match(/^(?:([A-Z]+)-)?(\d+)$/);
      if (!taskNumberMatch) {
        setError('Неверный формат номера задачи. Используйте формат: PROJ-123 или 123');
        setLoading(false);
        return;
      }

      const boardKey = taskNumberMatch[1] || currentBoard.lists[0]?.cards[0]?.boardKey;
      const number = parseInt(taskNumberMatch[2]);

      // Find the card
      let targetCard = null;
      for (const list of currentBoard.lists) {
        targetCard = list.cards.find(c => c.number === number && (!taskNumberMatch[1] || c.boardKey === boardKey));
        if (targetCard) break;
      }

      if (!targetCard) {
        setError('Задача не найдена');
        setLoading(false);
        return;
      }

      await createCardRelation({
        fromCardId: cardId,
        toCardId: targetCard.id,
        type: selectedType
      });

      setTaskNumber('');
      setShowAddForm(false);
      await loadRelations();
      onRefresh();
    } catch (error: any) {
      console.error('Failed to create relation:', error);
      if (error.message?.includes('409')) {
        setError('Эта связь уже существует');
      } else {
        setError('Не удалось создать связь');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteRelation = async (relationId: string) => {
    try {
      await deleteCardRelation(relationId);
      await loadRelations();
      onRefresh();
    } catch (error) {
      console.error('Failed to delete relation:', error);
    }
  };

  const handleCardClick = (relatedCardId: string) => {
    // Find and open the related card
    if (!currentBoard) return;

    for (const list of currentBoard.lists) {
      const card = list.cards.find(c => c.id === relatedCardId);
      if (card) {
        setSelectedCard(card);
        break;
      }
    }
  };

  const allRelations = [
    ...relations.relationsFrom.map(r => ({ ...r, direction: 'from' as const })),
    ...relations.relationsTo.map(r => ({ ...r, direction: 'to' as const }))
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="flex items-center gap-2 font-semibold text-gray-700">
          <GitBranch size={18} />
          Связи с задачами
        </h3>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
        >
          <Plus size={16} />
          Добавить связь
        </button>
      </div>

      {showAddForm && (
        <form onSubmit={handleAddRelation} className="bg-gray-50 p-3 rounded-lg space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value as RelationType)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {Object.entries(RELATION_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
            <input
              type="text"
              value={taskNumber}
              onChange={(e) => setTaskNumber(e.target.value)}
              placeholder="PROJ-123 или 123"
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-red-600">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition disabled:opacity-50"
            >
              {loading ? 'Добавление...' : 'Добавить'}
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddForm(false);
                setError('');
                setTaskNumber('');
              }}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-2 rounded-lg transition"
            >
              Отмена
            </button>
          </div>
        </form>
      )}

      {allRelations.length > 0 ? (
        <div className="space-y-2">
          {allRelations.map((relation) => {
            const relatedCard = relation.direction === 'from' ? relation.toCard : relation.fromCard;
            if (!relatedCard) return null;

            const displayType = relation.direction === 'from' ? relation.type :
              relation.type === 'BLOCKS' ? 'BLOCKED_BY' :
              relation.type === 'BLOCKED_BY' ? 'BLOCKS' : relation.type;

            return (
              <div
                key={relation.id}
                className="flex items-center justify-between p-2 bg-white border rounded-lg hover:shadow-sm transition"
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${RELATION_COLORS[displayType]}`}>
                    {RELATION_LABELS[displayType]}
                  </span>
                  <button
                    onClick={() => handleCardClick(relatedCard.id)}
                    className="text-left hover:text-blue-600 transition flex-1"
                  >
                    <span className="font-mono text-sm text-gray-500">{relatedCard.boardKey}-{relatedCard.number}</span>
                    <span className="ml-2 text-gray-700">{relatedCard.title}</span>
                  </button>
                </div>
                <button
                  onClick={() => handleDeleteRelation(relation.id)}
                  className="p-1 hover:bg-gray-100 rounded transition"
                  title="Удалить связь"
                >
                  <X size={16} className="text-gray-400 hover:text-red-600" />
                </button>
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-sm text-gray-500 italic">Нет связей с другими задачами</p>
      )}
    </div>
  );
}
