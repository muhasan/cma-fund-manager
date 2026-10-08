import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import {
  getAllFundData,
  insertDeposit,
  updateDepositDb,
  deleteDepositById,
  insertExpense,
  updateExpenseDb,
  deleteExpenseById,
  updateFundSettingsDb,
  updateFlatDb,
  importFiscalYearBatch,
  updateFiscalYearArchiveDb,
  deleteFiscalYearArchiveDb,
  resetDatabaseToBlankDb,
  authenticateUser,
  getAllUsersDb,
  updateUserDb,
  createUserDb,
  deleteUserDb,
  changeUserPasswordDb,
  ensureUsersSeeded,
} from './src/db/queries.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json({ limit: '20mb' }));
  app.use(express.urlencoded({ extended: true, limit: '20mb' }));

  // Health check endpoints for Cloud Run / load balancers
  app.get('/health', (_req, res) => {
    res.status(200).send('OK');
  });

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Authentication API Routes
  app.post('/api/auth/login', async (req, res) => {
    try {
      const { username, password } = req.body;
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }
      const user = await authenticateUser(username, password);
      if (!user) {
        return res.status(401).json({ error: 'Invalid username or password' });
      }
      res.json({ success: true, user });
    } catch (err: any) {
      console.error('Login error:', err);
      res.status(500).json({ error: err.message || 'Authentication error' });
    }
  });

  app.post('/api/auth/change-password', async (req, res) => {
    try {
      const { userId, currentPassword, newPassword } = req.body;
      if (!userId || !currentPassword || !newPassword) {
        return res.status(400).json({ error: 'User ID, current password, and new password are required' });
      }
      const result = await changeUserPasswordDb(userId, currentPassword, newPassword);
      res.json(result);
    } catch (err: any) {
      console.error('Error changing password:', err);
      res.status(400).json({ error: err.message || 'Failed to change password' });
    }
  });

  app.get('/api/auth/users', async (_req, res) => {
    try {
      const userList = await getAllUsersDb();
      res.json({ users: userList });
    } catch (err: any) {
      console.error('Error fetching users:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch users' });
    }
  });

  app.post('/api/auth/users', async (req, res) => {
    try {
      const id = await createUserDb(req.body);
      res.json({ success: true, id });
    } catch (err: any) {
      console.error('Error creating user:', err);
      res.status(500).json({ error: err.message || 'Failed to create user' });
    }
  });

  app.put('/api/auth/users/:id', async (req, res) => {
    try {
      await updateUserDb(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error updating user:', err);
      res.status(500).json({ error: err.message || 'Failed to update user' });
    }
  });

  app.delete('/api/auth/users/:id', async (req, res) => {
    try {
      await deleteUserDb(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting user:', err);
      res.status(500).json({ error: err.message || 'Failed to delete user' });
    }
  });

  // Data Query Routes
  app.get('/api/fund-data', async (_req, res) => {
    try {
      const data = await getAllFundData();
      res.json(data);
    } catch (err: any) {
      console.error('Error fetching fund data:', err);
      res.status(500).json({ error: err.message || 'Failed to fetch fund data' });
    }
  });

  // Deposits Routes
  app.post('/api/deposits', async (req, res) => {
    try {
      const id = await insertDeposit(req.body);
      res.json({ success: true, id });
    } catch (err: any) {
      console.error('Error creating deposit:', err);
      res.status(500).json({ error: err.message || 'Failed to create deposit' });
    }
  });

  app.put('/api/deposits/:id', async (req, res) => {
    try {
      await updateDepositDb(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error updating deposit:', err);
      res.status(500).json({ error: err.message || 'Failed to update deposit' });
    }
  });

  app.delete('/api/deposits/:id', async (req, res) => {
    try {
      await deleteDepositById(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting deposit:', err);
      res.status(500).json({ error: err.message || 'Failed to delete deposit' });
    }
  });

  // Expenses Routes
  app.post('/api/expenses', async (req, res) => {
    try {
      const { expense, receipt } = req.body;
      const id = await insertExpense(expense, receipt);
      res.json({ success: true, id });
    } catch (err: any) {
      console.error('Error creating expense:', err);
      res.status(500).json({ error: err.message || 'Failed to create expense' });
    }
  });

  app.put('/api/expenses/:id', async (req, res) => {
    try {
      await updateExpenseDb(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error updating expense:', err);
      res.status(500).json({ error: err.message || 'Failed to update expense' });
    }
  });

  app.delete('/api/expenses/:id', async (req, res) => {
    try {
      await deleteExpenseById(req.params.id);
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      res.status(500).json({ error: err.message || 'Failed to delete expense' });
    }
  });

  // Flat & Settings Routes
  app.put('/api/flats/:id', async (req, res) => {
    try {
      await updateFlatDb(req.params.id, req.body);
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error updating flat:', err);
      res.status(500).json({ error: err.message || 'Failed to update flat' });
    }
  });

  app.put('/api/settings', async (req, res) => {
    try {
      await updateFundSettingsDb(req.body);
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error updating settings:', err);
      res.status(500).json({ error: err.message || 'Failed to update settings' });
    }
  });

  // Historical Years & Archives
  app.post('/api/import-year', async (req, res) => {
    try {
      const { fiscalYear, openingBalance, deposits, expenses, notes } = req.body;
      const result = await importFiscalYearBatch(
        fiscalYear,
        parseFloat(openingBalance) || 0,
        deposits || [],
        expenses || [],
        notes
      );
      res.json({ success: true, result });
    } catch (err: any) {
      console.error('Error importing fiscal year batch:', err);
      res.status(500).json({ error: err.message || 'Failed to import year data' });
    }
  });

  app.put('/api/archives/:year', async (req, res) => {
    try {
      const result = await updateFiscalYearArchiveDb(req.params.year, req.body);
      res.json({ success: true, result });
    } catch (err: any) {
      console.error('Error updating fiscal year archive:', err);
      res.status(500).json({ error: err.message || 'Failed to update archive' });
    }
  });

  app.delete('/api/archives/:year', async (req, res) => {
    try {
      await deleteFiscalYearArchiveDb(req.params.year);
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error deleting archive:', err);
      res.status(500).json({ error: err.message || 'Failed to delete archive' });
    }
  });

  app.post('/api/reset-blank', async (_req, res) => {
    try {
      await resetDatabaseToBlankDb();
      res.json({ success: true });
    } catch (err: any) {
      console.error('Error resetting database:', err);
      res.status(500).json({ error: err.message || 'Failed to reset database' });
    }
  });

  // Serve static assets or fallback to Vite
  const distDir = path.resolve(__dirname, 'dist');
  const indexHtml = path.join(distDir, 'index.html');
  const hasDist = fs.existsSync(indexHtml);

  if (hasDist) {
    app.use(express.static(distDir));
    app.get('*', (_req, res) => {
      res.sendFile(indexHtml);
    });
  } else {
    console.log('Pre-built dist not found. Initializing Vite middleware for SPA serving...');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  });
  process.on('uncaughtException', (err) => {
    console.error('Uncaught Exception:', err);
  });

  try {
    await ensureUsersSeeded();
  } catch (err) {
    console.warn('Seeding check warning:', err);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
