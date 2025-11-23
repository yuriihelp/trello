import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Card } from '../types';
import { useStore } from '../store';
import { Calendar, CheckSquare, MessageSquare, Link as LinkIcon, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';

interface Props {
  card: Card;
  isDragging?: boolean;
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800 border-green-300',
  MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
  CRITICAL: 'bg-red-100 text-red-800 border-red-300'
};

const priorityLabels = {
  LOW: 'Низкий',
  MEDIUM: 'Средний',
  HIGH: 'Высокий',
  CRITICAL: 'Критичный'
};

export default function CardItem({ card, isDragging }: Props) {
  const { setSelectedCard } = useStore();
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: card.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  };

  const totalChecklistItems = card.checklists.reduce((acc, cl) => acc + cl.items.length, 0);
  const completedChecklistItems = card.checklists.reduce(
    (acc, cl) => acc + cl.items.filter((item) => item.completed).length,
    0
  );

  const isOverdue = card.deadline && new Date(card.deadline) < new Date();

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={() => setSelectedCard(card)}
      className="bg-white rounded-lg p-3 shadow-sm hover:shadow-md cursor-pointer transition border border-gray-200"
    >
      {/* Labels */}
      {card.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {card.labels.map((label) => (
            <span
              key={label.id}
              className="px-2 py-1 rounded text-xs font-medium"
              style={{ backgroundColor: label.color, color: 'white' }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h4 className="text-sm font-medium text-gray-800 mb-2">{card.title}</h4>

      {/* Description preview */}
      {card.description && (
        <p className="text-xs text-gray-600 mb-2 line-clamp-2">{card.description}</p>
      )}

      {/* Priority */}
      <div className="mb-2">
        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium border ${priorityColors[card.priority]}`}>
          <AlertCircle size={12} />
          {priorityLabels[card.priority]}
        </span>
      </div>

      {/* Meta info */}
      <div className="flex flex-wrap gap-3 text-xs text-gray-600">
        {card.deadline && (
          <div className={`flex items-center gap-1 ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
            <Calendar size={14} />
            <span>{format(new Date(card.deadline), 'd MMM', { locale: ru })}</span>
          </div>
        )}

        {totalChecklistItems > 0 && (
          <div className="flex items-center gap-1">
            <CheckSquare size={14} />
            <span>
              {completedChecklistItems}/{totalChecklistItems}
            </span>
          </div>
        )}

        {card.comments.length > 0 && (
          <div className="flex items-center gap-1">
            <MessageSquare size={14} />
            <span>{card.comments.length}</span>
          </div>
        )}

        {card.links.length > 0 && (
          <div className="flex items-center gap-1">
            <LinkIcon size={14} />
            <span>{card.links.length}</span>
          </div>
        )}
      </div>
    </div>
  );
}
