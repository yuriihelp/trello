import type { Board, List, Card, Checklist, ChecklistItem, Comment, Link, Label, Priority, User, CardAssignee } from './types';

const API_URL = '/api';

// Boards
export const getBoards = async (): Promise<Board[]> => {
  const res = await fetch(`${API_URL}/boards`);
  return res.json();
};

export const getBoard = async (id: string): Promise<Board> => {
  const res = await fetch(`${API_URL}/boards/${id}`);
  return res.json();
};

export const createBoard = async (data: { title: string; description?: string; color?: string }): Promise<Board> => {
  const res = await fetch(`${API_URL}/boards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateBoard = async (id: string, data: Partial<Board>): Promise<Board> => {
  const res = await fetch(`${API_URL}/boards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteBoard = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/boards/${id}`, { method: 'DELETE' });
};

// Lists
export const createList = async (data: { title: string; boardId: string }): Promise<List> => {
  const res = await fetch(`${API_URL}/lists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateList = async (id: string, data: Partial<List>): Promise<List> => {
  const res = await fetch(`${API_URL}/lists/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteList = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/lists/${id}`, { method: 'DELETE' });
};

export const reorderLists = async (updates: { id: string; position: number }[]): Promise<void> => {
  await fetch(`${API_URL}/lists/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates })
  });
};

// Cards
export const createCard = async (data: {
  title: string;
  description?: string;
  listId: string;
  priority?: Priority;
  deadline?: string;
}): Promise<Card> => {
  const res = await fetch(`${API_URL}/cards`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateCard = async (id: string, data: Partial<Card>): Promise<Card> => {
  const res = await fetch(`${API_URL}/cards/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteCard = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/cards/${id}`, { method: 'DELETE' });
};

export const moveCard = async (id: string, listId: string, position: number): Promise<Card> => {
  const res = await fetch(`${API_URL}/cards/${id}/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ listId, position })
  });
  return res.json();
};

export const reorderCards = async (updates: { id: string; position: number; listId?: string }[]): Promise<void> => {
  await fetch(`${API_URL}/cards/reorder`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ updates })
  });
};

// Checklists
export const createChecklist = async (data: { title: string; cardId: string }): Promise<Checklist> => {
  const res = await fetch(`${API_URL}/checklists`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateChecklist = async (id: string, data: { title: string }): Promise<Checklist> => {
  const res = await fetch(`${API_URL}/checklists/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteChecklist = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/checklists/${id}`, { method: 'DELETE' });
};

export const addChecklistItem = async (checklistId: string, text: string): Promise<ChecklistItem> => {
  const res = await fetch(`${API_URL}/checklists/${checklistId}/items`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return res.json();
};

export const updateChecklistItem = async (id: string, data: { text?: string; completed?: boolean }): Promise<ChecklistItem> => {
  const res = await fetch(`${API_URL}/checklists/items/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteChecklistItem = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/checklists/items/${id}`, { method: 'DELETE' });
};

// Comments
export const createComment = async (data: { text: string; author?: string; cardId: string }): Promise<Comment> => {
  const res = await fetch(`${API_URL}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateComment = async (id: string, text: string): Promise<Comment> => {
  const res = await fetch(`${API_URL}/comments/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text })
  });
  return res.json();
};

export const deleteComment = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/comments/${id}`, { method: 'DELETE' });
};

// Links
export const createLink = async (data: { title?: string; url: string; cardId: string }): Promise<Link> => {
  const res = await fetch(`${API_URL}/links`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateLink = async (id: string, data: { title?: string; url: string }): Promise<Link> => {
  const res = await fetch(`${API_URL}/links/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteLink = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/links/${id}`, { method: 'DELETE' });
};

// Labels
export const createLabel = async (data: { name: string; color: string; cardId: string }): Promise<Label> => {
  const res = await fetch(`${API_URL}/labels`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateLabel = async (id: string, data: { name: string; color: string }): Promise<Label> => {
  const res = await fetch(`${API_URL}/labels/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteLabel = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/labels/${id}`, { method: 'DELETE' });
};

// Users
export const getUsers = async (): Promise<User[]> => {
  const res = await fetch(`${API_URL}/users`);
  return res.json();
};

export const createUser = async (data: { name: string; email?: string; avatar?: string; color?: string }): Promise<User> => {
  const res = await fetch(`${API_URL}/users`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const updateUser = async (id: string, data: Partial<User>): Promise<User> => {
  const res = await fetch(`${API_URL}/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
};

export const deleteUser = async (id: string): Promise<void> => {
  await fetch(`${API_URL}/users/${id}`, { method: 'DELETE' });
};

export const assignUserToCard = async (userId: string, cardId: string): Promise<CardAssignee> => {
  const res = await fetch(`${API_URL}/users/${userId}/assign/${cardId}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  return res.json();
};

export const unassignUserFromCard = async (userId: string, cardId: string): Promise<void> => {
  await fetch(`${API_URL}/users/${userId}/unassign/${cardId}`, { method: 'DELETE' });
};
