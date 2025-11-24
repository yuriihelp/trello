import { useEffect, useState, useMemo } from 'react';
import { useStore } from './store';
import { getBoards, createBoard, getUsers } from './api';
import BoardView from './components/BoardView';
import BoardSelector from './components/BoardSelector';
import UserManager from './components/UserManager';
import Filters from './components/Filters';
import { Plus, Users, Filter as FilterIcon } from 'lucide-react';
import type { User, Label } from './types';
import type { CardFilters } from './utils/filterCards';

function App() {
  const { boards, currentBoard, setBoards, setCurrentBoard } = useStore();
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showUserManager, setShowUserManager] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<CardFilters>({
    dateFilter: 'all',
  });

  useEffect(() => {
    loadBoards();
    loadUsers();
  }, []);

  const loadBoards = async () => {
    const data = await getBoards();
    setBoards(data);
    if (data.length > 0 && !currentBoard) {
      setCurrentBoard(data[0]);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error('Failed to load users:', error);
    }
  };

  const handleCreateBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBoardTitle.trim()) return;

    const board = await createBoard({ title: newBoardTitle });
    setBoards([...boards, board]);
    setCurrentBoard(board);
    setNewBoardTitle('');
    setShowNewBoard(false);
  };

  // Extract unique labels from current board cards
  const availableLabels = useMemo<Label[]>(() => {
    if (!currentBoard) return [];

    const labelMap = new Map<string, Label>();
    currentBoard.lists.forEach(list => {
      list.cards.forEach(card => {
        card.labels?.forEach(label => {
          if (!labelMap.has(label.id)) {
            labelMap.set(label.id, label);
          }
        });
      });
    });

    return Array.from(labelMap.values());
  }, [currentBoard]);

  const clearFilters = () => {
    setFilters({ dateFilter: 'all' });
  };

  const hasActiveFilters = filters.userId || filters.labelId || filters.dateFilter !== 'all' || filters.priority;

  return (
    <div className="h-screen flex flex-col bg-board-bg">
      {/* Header */}
      <header className="bg-dark-blue text-white p-4 flex items-center gap-4 shadow-md">
        <h1 className="text-2xl font-bold">Task Board</h1>

        <BoardSelector />

        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              hasActiveFilters || showFilters
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-dark-blue-hover hover:bg-blue-700'
            }`}
          >
            <FilterIcon size={20} />
            <span>Фильтры</span>
            {hasActiveFilters && !showFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-white text-dark-blue text-xs rounded-full">
                ●
              </span>
            )}
          </button>

          <button
            onClick={() => setShowUserManager(true)}
            className="flex items-center gap-2 bg-dark-blue-hover hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            <Users size={20} />
            <span>Пользователи</span>
          </button>

          <button
            onClick={() => setShowNewBoard(!showNewBoard)}
            className="flex items-center gap-2 bg-dark-blue-hover hover:bg-blue-700 px-4 py-2 rounded-lg transition"
          >
            <Plus size={20} />
            <span>Новая доска</span>
          </button>
        </div>
      </header>

      {/* New Board Form */}
      {showNewBoard && (
        <div className="bg-white border-b border-gray-200 p-4 shadow-sm">
          <form onSubmit={handleCreateBoard} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Название доски..."
              className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-900 focus:outline-none focus:ring-2 focus:ring-dark-blue focus:border-transparent"
              autoFocus
            />
            <button
              type="submit"
              className="bg-success hover:bg-green-600 text-white px-6 py-2 rounded-lg transition"
            >
              Создать
            </button>
            <button
              type="button"
              onClick={() => setShowNewBoard(false)}
              className="bg-danger hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Отмена
            </button>
          </form>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {currentBoard ? (
          <div className="h-full flex flex-col">
            <div className="flex-shrink-0 overflow-y-auto max-h-64">
              {showFilters && (
                <div className="p-4">
                  <Filters
                    users={users}
                    labels={availableLabels}
                    filters={filters}
                    onFilterChange={setFilters}
                    onClearFilters={clearFilters}
                  />
                </div>
              )}
            </div>
            <div className="flex-1 overflow-hidden">
              <BoardView
                board={currentBoard}
                onUpdate={setCurrentBoard}
                filters={filters}
              />
            </div>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-gray-500 text-xl">
            {boards.length === 0 ? 'Создайте свою первую доску' : 'Выберите доску'}
          </div>
        )}
      </main>

      {/* User Manager Modal */}
      {showUserManager && <UserManager onClose={() => setShowUserManager(false)} />}
    </div>
  );
}

export default App;
