import { useState, useEffect } from 'react';
import type { Card, Priority, User } from '../types';
import CardRelations from './CardRelations';
import {
  updateCard,
  deleteCard,
  createChecklist,
  deleteChecklist,
  addChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  createComment,
  deleteComment,
  createLink,
  deleteLink,
  createLabel,
  deleteLabel,
  getUsers,
  assignUserToCard,
  unassignUserFromCard
} from '../api';
import {
  X,
  Calendar,
  Tag,
  CheckSquare,
  MessageSquare,
  Link as LinkIcon,
  Plus,
  Trash2,
  AlertCircle,
  UserPlus
} from 'lucide-react';
import { format } from 'date-fns';

interface Props {
  card: Card;
  onClose: () => void;
  onRefresh: () => void;
}

const priorityColors = {
  LOW: 'bg-green-500',
  MEDIUM: 'bg-yellow-500',
  HIGH: 'bg-orange-500',
  CRITICAL: 'bg-red-500'
};

const priorityLabels = {
  LOW: 'Низкий',
  MEDIUM: 'Средний',
  HIGH: 'Высокий',
  CRITICAL: 'Критичный'
};

const labelColors = [
  '#61BD4F', '#F2D600', '#FF9F1A', '#EB5A46', '#C377E0',
  '#0079BF', '#00C2E0', '#51E898', '#FF78CB', '#344563'
];

export default function CardModal({ card, onClose, onRefresh }: Props) {
  const [title, setTitle] = useState(card.title);
  const [description, setDescription] = useState(card.description || '');
  const [priority, setPriority] = useState<Priority>(card.priority);
  const [deadline, setDeadline] = useState(
    card.deadline ? format(new Date(card.deadline), "yyyy-MM-dd'T'HH:mm") : ''
  );

  // Checklists
  const [newChecklistTitle, setNewChecklistTitle] = useState('');
  const [newChecklistItemText, setNewChecklistItemText] = useState<{ [key: string]: string }>({});

  // Comments
  const [newCommentText, setNewCommentText] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('');

  // Links
  const [newLinkUrl, setNewLinkUrl] = useState('');
  const [newLinkTitle, setNewLinkTitle] = useState('');

  // Labels
  const [newLabelName, setNewLabelName] = useState('');
  const [newLabelColor, setNewLabelColor] = useState(labelColors[0]);

  // Users
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const users = await getUsers();
    setAllUsers(users);
  };

  const handleAssignUser = async (userId: string) => {
    await assignUserToCard(userId, card.id);
    await onRefresh();
  };

  const handleUnassignUser = async (userId: string) => {
    await unassignUserFromCard(userId, card.id);
    await onRefresh();
  };

  const handleSave = async () => {
    await updateCard(card.id, {
      title,
      description,
      priority,
      deadline: deadline ? new Date(deadline).toISOString() : undefined
    });
    await onRefresh();
  };

  const handleDelete = async () => {
    if (confirm('Удалить эту карточку?')) {
      await deleteCard(card.id);
      await onRefresh();
      onClose();
    }
  };

  // Checklist handlers
  const handleCreateChecklist = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklistTitle.trim()) return;
    await createChecklist({ title: newChecklistTitle, cardId: card.id });
    setNewChecklistTitle('');
    await onRefresh();
  };

  const handleAddChecklistItem = async (checklistId: string) => {
    const text = newChecklistItemText[checklistId];
    if (!text?.trim()) return;
    await addChecklistItem(checklistId, text);
    setNewChecklistItemText({ ...newChecklistItemText, [checklistId]: '' });
    await onRefresh();
  };

  const handleToggleChecklistItem = async (itemId: string, completed: boolean) => {
    await updateChecklistItem(itemId, { completed: !completed });
    await onRefresh();
  };

  // Comment handlers
  const handleCreateComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;
    await createComment({
      text: newCommentText,
      author: commentAuthor || undefined,
      cardId: card.id
    });
    setNewCommentText('');
    await onRefresh();
  };

  // Link handlers
  const handleCreateLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLinkUrl.trim()) return;
    await createLink({
      url: newLinkUrl,
      title: newLinkTitle || undefined,
      cardId: card.id
    });
    setNewLinkUrl('');
    setNewLinkTitle('');
    await onRefresh();
  };

  // Label handlers
  const handleCreateLabel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLabelName.trim()) return;
    await createLabel({
      name: newLabelName,
      color: newLabelColor,
      cardId: card.id
    });
    setNewLabelName('');
    await onRefresh();
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-start justify-center overflow-y-auto p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl my-8">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b">
          <div className="flex-1">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onBlur={handleSave}
              className="text-2xl font-semibold w-full focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1"
            />
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 ml-4">
            <X size={24} />
          </button>
        </div>

        <div className="p-6 grid grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Description */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle size={18} />
                Описание
              </h3>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onBlur={handleSave}
                placeholder="Добавьте описание..."
                className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24"
              />
            </div>

            {/* Checklists */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <CheckSquare size={18} />
                Чеклисты
              </h3>

              {card.checklists.map((checklist) => {
                const completed = checklist.items.filter((i) => i.completed).length;
                const total = checklist.items.length;
                const progress = total > 0 ? (completed / total) * 100 : 0;

                return (
                  <div key={checklist.id} className="mb-4 bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">{checklist.title}</h4>
                      <button
                        onClick={async () => {
                          await deleteChecklist(checklist.id);
                          await onRefresh();
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="mb-3">
                      <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                        <span>
                          {completed}/{total}
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-500 h-2 rounded-full transition-all"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>

                    <div className="space-y-2 mb-2">
                      {checklist.items.map((item) => (
                        <div key={item.id} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleChecklistItem(item.id, item.completed)}
                            className="w-4 h-4 cursor-pointer"
                          />
                          <span className={item.completed ? 'line-through text-gray-500' : ''}>
                            {item.text}
                          </span>
                          <button
                            onClick={async () => {
                              await deleteChecklistItem(item.id);
                              await onRefresh();
                            }}
                            className="ml-auto text-red-500 hover:text-red-700"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>

                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={newChecklistItemText[checklist.id] || ''}
                        onChange={(e) =>
                          setNewChecklistItemText({
                            ...newChecklistItemText,
                            [checklist.id]: e.target.value
                          })
                        }
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleAddChecklistItem(checklist.id);
                          }
                        }}
                        placeholder="Добавить пункт..."
                        className="flex-1 px-3 py-1 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleAddChecklistItem(checklist.id)}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded text-sm"
                      >
                        <Plus size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}

              <form onSubmit={handleCreateChecklist} className="flex gap-2">
                <input
                  type="text"
                  value={newChecklistTitle}
                  onChange={(e) => setNewChecklistTitle(e.target.value)}
                  placeholder="Название чеклиста..."
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2"
                >
                  <Plus size={18} />
                  Добавить чеклист
                </button>
              </form>
            </div>

            {/* Comments */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <MessageSquare size={18} />
                Комментарии
              </h3>

              <div className="space-y-3 mb-4">
                {card.comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {comment.author && (
                          <div className="font-medium text-sm text-gray-700 mb-1">
                            {comment.author}
                          </div>
                        )}
                        <p className="text-gray-800 whitespace-pre-wrap">{comment.text}</p>
                        <div className="text-xs text-gray-500 mt-1">
                          {format(new Date(comment.createdAt), "d MMM yyyy 'в' HH:mm")}
                        </div>
                      </div>
                      <button
                        onClick={async () => {
                          await deleteComment(comment.id);
                          await onRefresh();
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCreateComment} className="space-y-2">
                <input
                  type="text"
                  value={commentAuthor}
                  onChange={(e) => setCommentAuthor(e.target.value)}
                  placeholder="Ваше имя (необязательно)..."
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <textarea
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  placeholder="Написать комментарий..."
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-20"
                />
                <button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                >
                  Отправить
                </button>
              </form>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <LinkIcon size={18} />
                Ссылки
              </h3>

              <div className="space-y-2 mb-4">
                {card.links.map((link) => (
                  <div key={link.id} className="flex items-center gap-2 bg-gray-50 p-2 rounded">
                    <a
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 text-blue-600 hover:underline"
                    >
                      {link.title || link.url}
                    </a>
                    <button
                      onClick={async () => {
                        await deleteLink(link.id);
                        await onRefresh();
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCreateLink} className="space-y-2">
                <input
                  type="text"
                  value={newLinkTitle}
                  onChange={(e) => setNewLinkTitle(e.target.value)}
                  placeholder="Название ссылки (необязательно)..."
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newLinkUrl}
                    onChange={(e) => setNewLinkUrl(e.target.value)}
                    placeholder="https://example.com"
                    className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
                  >
                    <Plus size={18} />
                  </button>
                </div>
              </form>
            </div>

            {/* Card Relations */}
            <CardRelations cardId={card.id} onRefresh={onRefresh} />
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Priority */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <AlertCircle size={18} />
                Приоритет
              </h3>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value as Priority);
                  updateCard(card.id, { priority: e.target.value as Priority }).then(onRefresh);
                }}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(priorityLabels).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
              <div className={`mt-2 h-2 rounded ${priorityColors[priority]}`} />
            </div>

            {/* Deadline */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Calendar size={18} />
                Дедлайн
              </h3>
              <input
                type="datetime-local"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                onBlur={handleSave}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Assigned Users */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <UserPlus size={18} />
                Назначенные
              </h3>

              {/* Current Assignees */}
              <div className="flex flex-wrap gap-2 mb-3">
                {card.assignees && card.assignees.map((assignee) => (
                  <div
                    key={assignee.id}
                    className="flex items-center gap-2 px-3 py-1 rounded-lg border border-gray-200"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium"
                      style={{ backgroundColor: assignee.user.color }}
                    >
                      {assignee.user.name.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-sm">{assignee.user.name}</span>
                    <button
                      onClick={() => handleUnassignUser(assignee.userId)}
                      className="hover:bg-gray-100 rounded p-0.5"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              {/* Available Users */}
              <div className="space-y-1">
                {allUsers
                  .filter((user) => !card.assignees?.some((a) => a.userId === user.id))
                  .map((user) => (
                    <button
                      key={user.id}
                      onClick={() => handleAssignUser(user.id)}
                      className="w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 rounded-lg transition text-left"
                    >
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center text-white text-sm font-medium"
                        style={{ backgroundColor: user.color }}
                      >
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm">{user.name}</span>
                    </button>
                  ))}
              </div>

              {allUsers.length === 0 && (
                <p className="text-sm text-gray-500 italic">
                  Нет доступных пользователей
                </p>
              )}
            </div>

            {/* Labels */}
            <div>
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Tag size={18} />
                Метки
              </h3>

              <div className="flex flex-wrap gap-2 mb-3">
                {card.labels.map((label) => (
                  <div
                    key={label.id}
                    className="flex items-center gap-1 px-2 py-1 rounded text-sm"
                    style={{ backgroundColor: label.color, color: 'white' }}
                  >
                    <span>{label.name}</span>
                    <button
                      onClick={async () => {
                        await deleteLabel(label.id);
                        await onRefresh();
                      }}
                      className="hover:bg-black/20 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleCreateLabel} className="space-y-2">
                <input
                  type="text"
                  value={newLabelName}
                  onChange={(e) => setNewLabelName(e.target.value)}
                  placeholder="Название метки..."
                  className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
                <div className="flex gap-2 flex-wrap">
                  {labelColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewLabelColor(color)}
                      className={`w-8 h-8 rounded ${
                        newLabelColor === color ? 'ring-2 ring-offset-2 ring-blue-500' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  type="submit"
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded text-sm"
                >
                  Добавить метку
                </button>
              </form>
            </div>

            {/* Delete Card */}
            <button
              onClick={handleDelete}
              className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2"
            >
              <Trash2 size={18} />
              Удалить карточку
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
