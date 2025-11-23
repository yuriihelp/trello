import { useState, useEffect } from 'react';
import { getUsers, createUser, deleteUser } from '../api';
import type { User } from '../types';
import { Plus, Trash2, Users } from 'lucide-react';

interface Props {
  onClose: () => void;
}

const userColors = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6',
  '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#6366F1'
];

export default function UserManager({ onClose }: Props) {
  const [users, setUsers] = useState<User[]>([]);
  const [showNewUser, setShowNewUser] = useState(false);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [selectedColor, setSelectedColor] = useState(userColors[0]);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    const data = await getUsers();
    setUsers(data);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) return;

    await createUser({
      name: newUserName,
      email: newUserEmail || undefined,
      color: selectedColor
    });

    setNewUserName('');
    setNewUserEmail('');
    setSelectedColor(userColors[0]);
    setShowNewUser(false);
    await loadUsers();
  };

  const handleDeleteUser = async (id: string) => {
    if (confirm('Удалить этого пользователя?')) {
      await deleteUser(id);
      await loadUsers();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Users size={24} />
            Управление пользователями
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="p-6">
          {/* User List */}
          <div className="space-y-2 mb-4">
            {users.map((user) => (
              <div
                key={user.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white text-lg font-medium"
                    style={{ backgroundColor: user.color }}
                  >
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-medium">{user.name}</div>
                    {user.email && <div className="text-sm text-gray-500">{user.email}</div>}
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteUser(user.id)}
                  className="text-red-500 hover:text-red-700 p-2"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Add User Form */}
          {showNewUser ? (
            <form onSubmit={handleCreateUser} className="bg-gray-50 p-4 rounded-lg space-y-3">
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Имя пользователя"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-dark-blue"
                autoFocus
              />
              <input
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="Email (необязательно)"
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-dark-blue"
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Цвет аватара
                </label>
                <div className="flex gap-2 flex-wrap">
                  {userColors.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`w-8 h-8 rounded-full ${
                        selectedColor === color ? 'ring-2 ring-offset-2 ring-dark-blue' : ''
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="bg-dark-blue hover:bg-dark-blue-hover text-white px-4 py-2 rounded transition"
                >
                  Добавить
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewUser(false)}
                  className="text-gray-600 hover:text-gray-800 px-4 py-2"
                >
                  Отмена
                </button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setShowNewUser(true)}
              className="w-full bg-dark-blue hover:bg-dark-blue-hover text-white p-3 rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Plus size={20} />
              <span>Добавить пользователя</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
