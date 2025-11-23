import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import boardRoutes from './routes/boards';
import listRoutes from './routes/lists';
import cardRoutes from './routes/cards';
import checklistRoutes from './routes/checklists';
import commentRoutes from './routes/comments';
import linkRoutes from './routes/links';
import labelRoutes from './routes/labels';
import userRoutes from './routes/users';

dotenv.config();

const app = express();

// Преобразуем PORT в число, чтобы TS не ругался
const PORT: number = Number(process.env.PORT) || 3001;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/boards', boardRoutes);
app.use('/api/lists', listRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/links', linkRoutes);
app.use('/api/labels', labelRoutes);
app.use('/api/users', userRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on http://0.0.0.0:${PORT}`);
});
