import React from 'react';
import { X, Filter, User as UserIcon, Calendar, Tag } from 'lucide-react';
import type { User, Label } from '../types';

interface FiltersProps {
  users: User[];
  labels: Label[];
  filters: {
    userId?: string;
    labelId?: string;
    dateFilter?: 'overdue' | 'today' | 'week' | 'all';
    priority?: string;
  };
  onFilterChange: (filters: any) => void;
  onClearFilters: () => void;
}

const Filters: React.FC<FiltersProps> = ({
  users,
  labels,
  filters,
  onFilterChange,
  onClearFilters,
}) => {
  const hasActiveFilters = filters.userId || filters.labelId || filters.dateFilter !== 'all' || filters.priority;

  const handleUserFilter = (userId: string) => {
    onFilterChange({ ...filters, userId: userId === filters.userId ? undefined : userId });
  };

  const handleLabelFilter = (labelId: string) => {
    onFilterChange({ ...filters, labelId: labelId === filters.labelId ? undefined : labelId });
  };

  const handleDateFilter = (dateFilter: string) => {
    onFilterChange({ ...filters, dateFilter });
  };

  const handlePriorityFilter = (priority: string) => {
    onFilterChange({ ...filters, priority: priority === filters.priority ? undefined : priority });
  };

  const getDateFilterLabel = (filter?: string) => {
    switch (filter) {
      case 'overdue': return 'Просрочено';
      case 'today': return 'Сегодня';
      case 'week': return 'На неделе';
      default: return 'Все';
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      LOW: 'Низкий',
      MEDIUM: 'Средний',
      HIGH: 'Высокий',
      CRITICAL: 'Критический',
    };
    return labels[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      LOW: 'bg-green-100 text-green-800 border-green-300',
      MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      HIGH: 'bg-orange-100 text-orange-800 border-orange-300',
      CRITICAL: 'bg-red-100 text-red-800 border-red-300',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-4 mb-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-slate-600" />
          <h3 className="font-semibold text-slate-700">Фильтры</h3>
          {hasActiveFilters && (
            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
              Активны
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 text-sm text-slate-600 hover:text-slate-800"
          >
            <X size={14} />
            Очистить
          </button>
        )}
      </div>

      <div className="space-y-3">
        {/* Фильтр по пользователям */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <UserIcon size={14} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-600">Исполнитель</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => handleUserFilter(user.id)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  filters.userId === user.id
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center text-white text-xs"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  {user.name}
                </div>
              </button>
            ))}
            {users.length === 0 && (
              <span className="text-sm text-slate-400">Нет пользователей</span>
            )}
          </div>
        </div>

        {/* Фильтр по меткам */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Tag size={14} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-600">Метки</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {labels.map((label) => (
              <button
                key={label.id}
                onClick={() => handleLabelFilter(label.id)}
                className="px-3 py-1.5 rounded-full text-sm border transition-all hover:scale-105"
                style={{
                  backgroundColor: filters.labelId === label.id ? label.color : label.color + '40',
                  borderColor: label.color,
                  color: filters.labelId === label.id ? 'white' : label.color,
                }}
              >
                {label.name}
              </button>
            ))}
            {labels.length === 0 && (
              <span className="text-sm text-slate-400">Нет меток</span>
            )}
          </div>
        </div>

        {/* Фильтр по дате */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={14} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-600">Срок выполнения</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['all', 'overdue', 'today', 'week'].map((filter) => (
              <button
                key={filter}
                onClick={() => handleDateFilter(filter)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  (filters.dateFilter || 'all') === filter
                    ? 'bg-blue-100 text-blue-800 border-blue-300'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {getDateFilterLabel(filter)}
              </button>
            ))}
          </div>
        </div>

        {/* Фильтр по приоритету */}
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Filter size={14} className="text-slate-500" />
            <span className="text-sm font-medium text-slate-600">Приоритет</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'].map((priority) => (
              <button
                key={priority}
                onClick={() => handlePriorityFilter(priority)}
                className={`px-3 py-1.5 rounded-full text-sm border transition-all ${
                  filters.priority === priority
                    ? getPriorityColor(priority)
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {getPriorityLabel(priority)}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Filters;
