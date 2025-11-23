import { useEffect, useState } from 'react';
import { useStore } from './store';
import { getBoards, createBoard } from './api';
import BoardView from './components/BoardView';
import BoardSelector from './components/BoardSelector';
import { Plus } from 'lucide-react';

function App() {
  const { boards, currentBoard, setBoards, setCurrentBoard } = useStore();
  const [showNewBoard, setShowNewBoard] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  useEffect(() => {
    loadBoards();
  }, []);

  const loadBoards = async () => {
    const data = await getBoards();
    setBoards(data);
    if (data.length > 0 && !currentBoard) {
      setCurrentBoard(data[0]);
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

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-blue-500 to-blue-700">
      {/* Header */}
      <header className="bg-black/20 backdrop-blur-sm text-white p-4 flex items-center gap-4">
        <h1 className="text-2xl font-bold">Task Board</h1>

        <BoardSelector />

        <button
          onClick={() => setShowNewBoard(!showNewBoard)}
          className="ml-auto flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          <span>Новая доска</span>
        </button>
      </header>

      {/* New Board Form */}
      {showNewBoard && (
        <div className="bg-white/10 backdrop-blur-sm p-4">
          <form onSubmit={handleCreateBoard} className="flex gap-2 max-w-md">
            <input
              type="text"
              value={newBoardTitle}
              onChange={(e) => setNewBoardTitle(e.target.value)}
              placeholder="Название доски..."
              className="flex-1 px-4 py-2 rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-white"
              autoFocus
            />
            <button
              type="submit"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-2 rounded-lg transition"
            >
              Создать
            </button>
            <button
              type="button"
              onClick={() => setShowNewBoard(false)}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition"
            >
              Отмена
            </button>
          </form>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-hidden">
        {currentBoard ? (
          <BoardView board={currentBoard} onUpdate={setCurrentBoard} />
        ) : (
          <div className="h-full flex items-center justify-center text-white text-xl">
            {boards.length === 0 ? 'Создайте свою первую доску' : 'Выберите доску'}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
