import type { Card } from '../types';

export interface CardFilters {
  userId?: string;
  labelId?: string;
  dateFilter?: 'overdue' | 'today' | 'week' | 'all';
  priority?: string;
}

export const filterCards = (cards: Card[], filters: CardFilters): Card[] => {
  return cards.filter((card) => {
    // Фильтр по пользователю
    if (filters.userId) {
      const hasUser = card.assignees?.some((assignee) => assignee.userId === filters.userId);
      if (!hasUser) return false;
    }

    // Фильтр по метке
    if (filters.labelId) {
      const hasLabel = card.labels?.some((label) => label.id === filters.labelId);
      if (!hasLabel) return false;
    }

    // Фильтр по дате
    if (filters.dateFilter && filters.dateFilter !== 'all') {
      if (!card.deadline) return false;

      const now = new Date();
      const deadline = new Date(card.deadline);
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const cardDate = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());

      switch (filters.dateFilter) {
        case 'overdue':
          if (cardDate >= today) return false;
          break;
        case 'today':
          if (cardDate.getTime() !== today.getTime()) return false;
          break;
        case 'week':
          const weekFromNow = new Date(today);
          weekFromNow.setDate(weekFromNow.getDate() + 7);
          if (cardDate < today || cardDate > weekFromNow) return false;
          break;
      }
    }

    // Фильтр по приоритету
    if (filters.priority) {
      if (card.priority !== filters.priority) return false;
    }

    return true;
  });
};

export const getUniqueLabels = (cards: Card[]) => {
  const labelMap = new Map();
  cards.forEach((card) => {
    card.labels?.forEach((label) => {
      if (!labelMap.has(label.id)) {
        labelMap.set(label.id, label);
      }
    });
  });
  return Array.from(labelMap.values());
};
