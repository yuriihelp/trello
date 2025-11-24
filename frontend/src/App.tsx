import { useEffect, useState, useMemo } from 'react';
import { useStore } from './store';
import { getBoards, createBoard, updateBoard, getUsers } from './api';
import BoardView from './components/BoardView';
import BoardSelector from './components/BoardSelector';
import UserManager from './components/UserManager';
import Filters from './components/Filters';
import { Plus, Users, Filter as FilterIcon, Edit2, Check, X } from 'lucide-react';
import type { User, Label } from './types';
import type { CardFilters } from './utils/filterCards';

function App() {
  const { boards, currentBoard, setBoards, setCurrentBoard, selectedCard, setSelectedCard } = useStore();
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');
  const [showUserManager, setShowUserManager] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [filters, setFilters] = useState<CardFilters>({
    dateFilter: 'all',
  });
  const [editingBoardTitle, setEditingBoardTitle] = useState(false);
  const [boardTitleInput, setBoardTitleInput] = useState('');

  // Load board from URL on mount
  useEffect(() => {
    loadBoards();
    loadUsers();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const boardId = params.get('board');

    if (boardId && boards.length > 0) {
      const board = boards.find(b => b.id === boardId);
      if (board && (!currentBoard || currentBoard.id !== boardId)) {
        setCurrentBoard(board);
      }
    }
  }, [boards]);

  // Load card from URL when board changes
  useEffect(() => {
    if (!currentBoard) return;

    const params = new URLSearchParams(window.location.search);
    const cardId = params.get('card');

    if (cardId) {
      const card = currentBoard.lists
        .flatMap(list => list.cards)
        .find(c => c.id === cardId);

      if (card && (!selectedCard || selectedCard.id !== cardId)) {
        setSelectedCard(card);
      }
    }
  }, [currentBoard]);

  // Listen for browser back/forward navigation
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const cardId = params.get('card');

      if (cardId && currentBoard) {
        const card = currentBoard.lists
          .flatMap(list => list.cards)
          .find(c => c.id === cardId);

        if (card) {
          setSelectedCard(card);
        }
      } else {
        setSelectedCard(null);
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [currentBoard]);

  // Update URL when card is opened/closed
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);

    if (selectedCard) {
      params.set('card', selectedCard.id);
    } else {
      params.delete('card');
    }

    window.history.pushState({}, '', params.toString() ? `?${params.toString()}` : window.location.pathname);
  }, [selectedCard]);

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
    updateBoardURL(board.id);
    setNewBoardTitle('');
    setShowNewBoard(false);
  };

  const updateBoardURL = (boardId: string) => {
    const params = new URLSearchParams(window.location.search);
    params.set('board', boardId);
    window.history.pushState({}, '', `?${params.toString()}`);
  };

  const handleBoardSelect = (board: any) => {
    setCurrentBoard(board);
    updateBoardURL(board.id);
  };

  const handleEditBoardTitle = () => {
    if (currentBoard) {
      setBoardTitleInput(currentBoard.title);
      setEditingBoardTitle(true);
    }
  };

  const handleSaveBoardTitle = async () => {
    if (!currentBoard || !boardTitleInput.trim()) {
      setEditingBoardTitle(false);
      return;
    }

    try {
      const updatedBoard = await updateBoard(currentBoard.id, { title: boardTitleInput });
      setBoards(boards.map(b => b.id === updatedBoard.id ? updatedBoard : b));
      setCurrentBoard(updatedBoard);
      setEditingBoardTitle(false);
    } catch (error) {
      console.error('Failed to update board title:', error);
    }
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
      <header className="bg-dark-blue text-white p-3 md:p-4 flex items-center gap-2 md:gap-4 shadow-md flex-wrap">
        <h1 className="text-xl md:text-2xl font-bold">TAKTA</h1>

        <div className="w-full sm:w-auto order-3 sm:order-none mt-2 sm:mt-0">
          <BoardSelector onBoardSelect={handleBoardSelect} />
        </div>

        {/* Editable Board Title */}
        {currentBoard && (
          <div className="hidden md:flex items-center gap-2">
            {editingBoardTitle ? (
              <>
                <input
                  type="text"
                  value={boardTitleInput}
                  onChange={(e) => setBoardTitleInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveBoardTitle();
                    if (e.key === 'Escape') setEditingBoardTitle(false);
                  }}
                  className="px-3 py-1 rounded bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                />
                <button
                  onClick={handleSaveBoardTitle}
                  className="p-1 hover:bg-blue-700 rounded transition"
                >
                  <Check size={18} />
                </button>
                <button
                  onClick={() => setEditingBoardTitle(false)}
                  className="p-1 hover:bg-blue-700 rounded transition"
                >
                  <X size={18} />
                </button>
              </>
            ) : (
              <button
                onClick={handleEditBoardTitle}
                className="flex items-center gap-2 px-3 py-1 hover:bg-blue-700 rounded transition"
              >
                <span className="font-semibold">{currentBoard.title}</span>
                <Edit2 size={16} />
              </button>
            )}
          </div>
        )}

        <div className="ml-auto flex items-center gap-1 md:gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1 md:gap-2 px-2 md:px-4 py-2 rounded-lg transition ${
              hasActiveFilters || showFilters
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-dark-blue-hover hover:bg-blue-700'
            }`}
          >
            <FilterIcon size={18} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Фильтры</span>
            {hasActiveFilters && !showFilters && (
              <span className="ml-1 px-1.5 py-0.5 bg-white text-dark-blue text-xs rounded-full">
                ●
              </span>
            )}
          </button>

          <button
            onClick={() => setShowUserManager(true)}
            className="flex items-center gap-1 md:gap-2 bg-dark-blue-hover hover:bg-blue-700 px-2 md:px-4 py-2 rounded-lg transition"
          >
            <Users size={18} className="md:w-5 md:h-5" />
            <span className="hidden sm:inline">Пользователи</span>
          </button>

          <button
            onClick={() => setShowNewBoard(!showNewBoard)}
            className="flex items-center gap-1 md:gap-2 bg-dark-blue-hover hover:bg-blue-700 px-2 md:px-4 py-2 rounded-lg transition"
          >
            <Plus size={18} className="md:w-5 md:h-5" />
            <span className="hidden md:inline">Новая доска</span>
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
