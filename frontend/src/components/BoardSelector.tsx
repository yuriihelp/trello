import { useStore } from '../store';

export default function BoardSelector() {
  const { boards, currentBoard, setCurrentBoard } = useStore();

  return (
    <select
      value={currentBoard?.id || ''}
      onChange={(e) => {
        const board = boards.find((b) => b.id === e.target.value);
        setCurrentBoard(board || null);
      }}
      className="bg-dark-blue-hover text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-white cursor-pointer border border-blue-600"
    >
      {boards.map((board) => (
        <option key={board.id} value={board.id} className="text-gray-900">
          {board.title}
        </option>
      ))}
    </select>
  );
}
