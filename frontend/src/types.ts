export enum Priority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Label {
  id: string;
  name: string;
  color: string;
  cardId: string;
  createdAt: string;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  position: number;
  checklistId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Checklist {
  id: string;
  title: string;
  cardId: string;
  items: ChecklistItem[];
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  id: string;
  text: string;
  author?: string;
  cardId: string;
  createdAt: string;
  updatedAt: string;
}

export interface Link {
  id: string;
  title?: string;
  url: string;
  cardId: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email?: string;
  avatar?: string;
  color: string;
  createdAt: string;
  updatedAt: string;
}

export interface CardAssignee {
  id: string;
  cardId: string;
  userId: string;
  user: User;
  assignedAt: string;
}

export interface Card {
  id: string;
  title: string;
  description?: string;
  position: number;
  priority: Priority;
  deadline?: string;
  listId: string;
  labels: Label[];
  checklists: Checklist[];
  comments: Comment[];
  links: Link[];
  assignees: CardAssignee[];
  createdAt: string;
  updatedAt: string;
}

export interface List {
  id: string;
  title: string;
  position: number;
  boardId: string;
  cards: Card[];
  createdAt: string;
  updatedAt: string;
}

export interface Board {
  id: string;
  title: string;
  description?: string;
  color: string;
  lists: List[];
  createdAt: string;
  updatedAt: string;
}
