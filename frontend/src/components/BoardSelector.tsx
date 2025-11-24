import { useStore } from '../store';
import type { Board } from '../types';

interface Props {
  onBoardSelect?: (board: Board) => void;
}

export default function BoardSelector({ onBoardSelect }: Props) {
  const { boards, currentBoard, setCurrentBoard } = useStore();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const board = boards.find((b) => b.id === e.target.value);
    if (board) {
      setCurrentBoard(board);
      onBoardSelect?.(board);
    }
  };

  return (
    <select
      value={currentBoard?.id || ''}
      onChange={handleChange}
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
