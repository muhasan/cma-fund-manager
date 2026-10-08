import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  FlatUnit,
  Deposit,
  Expense,
  Receipt,
  FundSettings,
  FlatBalanceSummary,
  FiscalYearArchive,
  UserAccount,
} from '../types/index.ts';
import {
  INITIAL_SETTINGS,
  INITIAL_FLATS,
  INITIAL_DEPOSITS,
  INITIAL_EXPENSES,
  INITIAL_RECEIPTS,
  INITIAL_HISTORICAL_ARCHIVES,
  generateVoucherDataUri,
} from '../data/initialData';

interface FundContextType {
  settings: FundSettings;
  flats: FlatUnit[];
  deposits: Deposit[];
  expenses: Expense[];
  receipts: Receipt[];
  historicalArchives: Record<string, FiscalYearArchive>;
  role: 'admin' | 'owner';
  currentUser: UserAccount | null;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  changePassword: (currentPassword: string, newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateMyFlatInfo: (flatId: string, data: Partial<FlatUnit>) => Promise<{ success: boolean; error?: string }>;
  usersList: UserAccount[];
  fetchUsers: () => Promise<void>;
  updateUserAccount: (id: string, data: any) => Promise<void>;
  createUserAccount: (data: any) => Promise<void>;
  deleteUserAccount: (id: string) => Promise<void>;
  selectedFlatId: string;
  setSelectedFlatId: (id: string) => void;
  flatSummaries: FlatBalanceSummary[];
  financialStats: {
    openingBalance: number;
    totalDeposits: number;
    totalExpenses: number;
    currentBalance: number;
    totalOutstanding: number;
    totalCredit: number;
    netCashFlow: number;
    totalShares: number;
  };
  isLoading: boolean;
  availableYears: string[];
  activeFiscalYear: string;
  setActiveFiscalYear: (year: string) => void;
  reloadFundData: () => Promise<void>;

  // Data modification (Admin only)
  addDeposit: (deposit: Omit<Deposit, 'id' | 'createdAt'>) => Promise<void>;
  updateDeposit: (deposit: Deposit) => Promise<void>;
  deleteDeposit: (id: string) => Promise<void>;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>, receiptData?: { fileName: string; fileUrl: string }) => Promise<void>;
  updateExpense: (expense: Expense) => Promise<void>;
  deleteExpense: (id: string) => Promise<void>;
  addReceipt: (receipt: Omit<Receipt, 'id' | 'uploadedAt'>) => void;
  deleteReceipt: (id: string) => void;
  updateReceipt: (receipt: Receipt) => void;
  updateSettings: (newSettings: Partial<FundSettings>) => Promise<void>;
  updateFlat: (flat: FlatUnit) => Promise<void>;
  updateHistoricalArchive: (year: string, data: { openingBalance?: number; notes?: string }) => Promise<void>;
  importPreviousYearData: (
    fiscalYear: string,
    openingBalance: number,
    depositsList: Deposit[],
    expensesList: Expense[],
    notes?: string
  ) => Promise<void>;
  parseAndImportCsv: (
    csvContent: string,
    targetYear: string,
    openingBal: number,
    notes?: string
  ) => Promise<{ success: boolean; message: string; depositsCount: number; expensesCount: number }>;
  deleteHistoricalYear: (year: string) => Promise<void>;
  resetToDefaultData: () => Promise<void>;
  exportCsvData: () => void;
  exportJsonBackup: () => void;
  importJsonBackup: (jsonData: string) => boolean;
}

const FundContext = createContext<FundContextType | undefined>(undefined);

export const FundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FundSettings>(INITIAL_SETTINGS);
  const [flats, setFlats] = useState<FlatUnit[]>(INITIAL_FLATS);
  const [deposits, setDeposits] = useState<Deposit[]>(INITIAL_DEPOSITS);
  const [expenses, setExpenses] = useState<Expense[]>(INITIAL_EXPENSES);
  const [receipts, setReceipts] = useState<Receipt[]>(INITIAL_RECEIPTS);
  const [historicalArchives, setHistoricalArchives] = useState<Record<string, FiscalYearArchive>>(INITIAL_HISTORICAL_ARCHIVES);
  const [activeFiscalYear, setActiveFiscalYear] = useState<string>('2026');
  const [selectedFlatId, setSelectedFlatId] = useState<string>('AB1');
  const [isLoading, setIsLoading] = useState(true);
  const [usersList, setUsersList] = useState<UserAccount[]>([]);

  // Current User authentication - opens in unauthenticated state unless logged in
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem('apartment_fund_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.id && parsed.username && parsed.username !== 'guest') {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return null; // Require login before opening app
  });

  const role: 'admin' | 'owner' = currentUser?.role === 'admin' ? 'admin' : 'owner';

  // Load backend data
  const reloadFundData = async () => {
    try {
      const res = await fetch('/api/fund-data');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) setSettings(data.settings);
        if (data.flats && data.flats.length > 0) setFlats(data.flats);
        if (data.deposits) setDeposits(data.deposits);
        if (data.expenses) setExpenses(data.expenses);
        if (data.receipts) setReceipts(data.receipts);
        if (data.historicalArchives) setHistoricalArchives(data.historicalArchives);
      }
    } catch (err) {
      console.warn('Backend API query error, using state:', err);
    }
  };

  useEffect(() => {
    async function init() {
      setIsLoading(true);
      await reloadFundData();
      setIsLoading(false);
    }
    init();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/auth/users');
      if (res.ok) {
        const data = await res.json();
        if (data.users) setUsersList(data.users);
      }
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  useEffect(() => {
    if (role === 'admin') {
      fetchUsers();
    }
  }, [role]);

  const login = async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (res.ok && data.success && data.user) {
        setCurrentUser(data.user);
        try {
          localStorage.setItem('apartment_fund_user', JSON.stringify(data.user));
        } catch {
          // ignore
        }
        if (data.user.flatId) {
          setSelectedFlatId(data.user.flatId);
        }
        return { success: true };
      } else {
        return { success: false, error: data.error || 'Invalid credentials' };
      }
    } catch (err: any) {
      console.error('Login error:', err);
      return { success: false, error: err.message || 'Login failed' };
    }
  };

  const logout = () => {
    setCurrentUser(null);
    try {
      localStorage.removeItem('apartment_fund_user');
    } catch {
      // ignore
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'No user signed in' };
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.id,
          currentPassword,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Failed to update password' };
      }
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating password' };
    }
  };

  const updateMyFlatInfo = async (flatId: string, data: Partial<FlatUnit>): Promise<{ success: boolean; error?: string }> => {
    try {
      const res = await fetch(`/api/flats/${flatId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await res.json();
      if (!res.ok || !result.success) {
        return { success: false, error: result.error || 'Failed to update flat details' };
      }
      // Update in state
      setFlats((prev) =>
        prev.map((f) => (f.id === flatId ? { ...f, ...data } : f))
      );
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'Network error updating flat' };
    }
  };

  const updateUserAccount = async (id: string, data: any) => {
    try {
      const res = await fetch(`/api/auth/users/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Failed to update user account:', err);
    }
  };

  const createUserAccount = async (data: any) => {
    try {
      const res = await fetch('/api/auth/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Failed to create user account:', err);
    }
  };

  const deleteUserAccount = async (id: string) => {
    try {
      const res = await fetch(`/api/auth/users/${id}`, { method: 'DELETE' });
      if (res.ok) {
        await fetchUsers();
      }
    } catch (err) {
      console.error('Failed to delete user account:', err);
    }
  };

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add('2026');
    years.add('2025');
    years.add('2024');
    years.add('2023');
    deposits.forEach((d) => {
      if (d.fiscalYear) years.add(d.fiscalYear);
    });
    expenses.forEach((e) => {
      if (e.fiscalYear) years.add(e.fiscalYear);
    });
    Object.keys(historicalArchives).forEach((y) => years.add(y));
    return Array.from(years).sort().reverse();
  }, [historicalArchives, deposits, expenses]);

  const flatSummaries = useMemo<FlatBalanceSummary[]>(() => {
    return flats.map((flat) => {
      const flatDeposits = deposits.filter((d) => d.flatId === flat.id);
      const totalDeposited = flatDeposits.reduce((acc, curr) => acc + (curr.amount || 0), 0);

      const totalExpenseAllocated = expenses.reduce((acc, curr) => {
        const allocated = curr.allocations ? curr.allocations[flat.id] || 0 : 0;
        return acc + allocated;
      }, 0);

      const balance = totalDeposited - totalExpenseAllocated;

      const sortedDeposits = [...flatDeposits].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastDeposit = sortedDeposits[0];

      return {
        flatId: flat.id,
        flatName: flat.name,
        shares: flat.shares,
        ownershipType: flat.ownershipType,
        totalDeposited,
        totalExpenseAllocated,
        balance,
        coOwners: flat.coOwners,
        lastDepositDate: lastDeposit?.date,
        lastDepositAmount: lastDeposit?.amount,
      };
    });
  }, [flats, deposits, expenses]);

  const financialStats = useMemo(() => {
    const totalDeposits = deposits.reduce((sum, d) => sum + (d.amount || 0), 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const openingBalance = settings.openingBalance || 0;
    const currentBalance = openingBalance + totalDeposits - totalExpenses;
    const totalShares = flats.reduce((sum, f) => sum + (f.shares || 0), 0);

    let totalOutstanding = 0;
    let totalCredit = 0;

    flatSummaries.forEach((summary) => {
      if (summary.balance < 0) {
        totalOutstanding += Math.abs(summary.balance);
      } else {
        totalCredit += summary.balance;
      }
    });

    const netCashFlow = totalDeposits - totalExpenses;

    return {
      openingBalance,
      totalDeposits,
      totalExpenses,
      currentBalance,
      totalOutstanding,
      totalCredit,
      netCashFlow,
      totalShares,
    };
  }, [settings.openingBalance, deposits, expenses, flats, flatSummaries]);

  // Data modification operations with full PostgreSQL persistence
  const addDeposit = async (depositData: Omit<Deposit, 'id' | 'createdAt'>) => {
    const tempId = `dep-${Date.now()}`;
    const newDep: Deposit = {
      ...depositData,
      id: tempId,
      fiscalYear: depositData.fiscalYear || activeFiscalYear || '2026',
      createdAt: new Date().toISOString(),
    };
    setDeposits((prev) => [newDep, ...prev]);

    try {
      const res = await fetch('/api/deposits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newDep),
      });
      if (res.ok) {
        const json = await res.json();
        if (json.id) {
          setDeposits((prev) => prev.map((d) => (d.id === tempId ? { ...d, id: json.id } : d)));
        }
      }
    } catch (err) {
      console.error('Failed to save deposit to backend:', err);
    }
  };

  const updateDeposit = async (updated: Deposit) => {
    setDeposits((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
    try {
      await fetch(`/api/deposits/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to update deposit in backend:', err);
    }
  };

  const deleteDeposit = async (id: string) => {
    setDeposits((prev) => prev.filter((d) => d.id !== id));
    try {
      await fetch(`/api/deposits/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete deposit from backend:', err);
    }
  };

  const addExpense = async (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    receiptData?: { fileName: string; fileUrl: string }
  ) => {
    const expId = `exp-${Date.now()}`;
    const newExp: Expense = {
      ...expenseData,
      id: expId,
      fiscalYear: expenseData.fiscalYear || activeFiscalYear || '2026',
      createdAt: new Date().toISOString(),
      receiptFileName: receiptData?.fileName || expenseData.receiptFileName,
      receiptUrl: receiptData?.fileUrl || expenseData.receiptUrl,
      receiptVerified: true,
    };
    setExpenses((prev) => [newExp, ...prev]);

    const receiptUrl =
      receiptData?.fileUrl ||
      expenseData.receiptUrl ||
      generateVoucherDataUri(
        expenseData.description,
        expenseData.vendorName || 'Vendor/Supplier',
        expenseData.date,
        expenseData.amount,
        `VCH-${Date.now().toString().slice(-6)}`
      );

    const newReceipt: Receipt = {
      id: `rcp-${Date.now()}`,
      expenseId: expId,
      title: expenseData.description,
      vendorName: expenseData.vendorName || 'Authorized Vendor',
      date: expenseData.date,
      amount: expenseData.amount,
      fileUrl: receiptUrl,
      fileName: receiptData?.fileName || expenseData.receiptFileName || 'Expense_Voucher.pdf',
      fileType: receiptData?.fileUrl?.startsWith('data:image') ? 'image/jpeg' : 'application/pdf',
      category: expenseData.category,
      uploadedAt: new Date().toISOString(),
      uploadedBy: `${settings.adminName}`,
      verified: true,
      notes: expenseData.notes,
    };
    setReceipts((prev) => [newReceipt, ...prev]);

    try {
      await fetch('/api/expenses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expense: newExp,
          receipt: receiptData,
        }),
      });
    } catch (err) {
      console.error('Failed to save expense to backend:', err);
    }
  };

  const updateExpense = async (updated: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
    try {
      await fetch(`/api/expenses/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to update expense in backend:', err);
    }
  };

  const deleteExpense = async (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setReceipts((prev) => prev.filter((r) => r.expenseId !== id));
    try {
      await fetch(`/api/expenses/${id}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete expense from backend:', err);
    }
  };

  const addReceipt = (receiptData: Omit<Receipt, 'id' | 'uploadedAt'>) => {
    const newReceipt: Receipt = {
      ...receiptData,
      id: `rcp-${Date.now()}`,
      uploadedAt: new Date().toISOString(),
    };
    setReceipts((prev) => [newReceipt, ...prev]);
  };

  const deleteReceipt = (id: string) => {
    setReceipts((prev) => prev.filter((r) => r.id !== id));
  };

  const updateReceipt = (updated: Receipt) => {
    setReceipts((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
  };

  const updateSettings = async (newSettings: Partial<FundSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
    try {
      await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
    } catch (err) {
      console.error('Failed to update settings in backend:', err);
    }
  };

  const updateFlat = async (updated: FlatUnit) => {
    setFlats((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    try {
      await fetch(`/api/flats/${updated.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.error('Failed to update flat in backend:', err);
    }
  };

  const updateHistoricalArchive = async (year: string, data: { openingBalance?: number; notes?: string }) => {
    setHistoricalArchives((prev) => {
      const existing = prev[year];
      if (!existing) return prev;
      const newOpening = data.openingBalance !== undefined ? data.openingBalance : existing.openingBalance;
      const newClosing = newOpening + existing.totalDeposits - existing.totalExpenses;
      return {
        ...prev,
        [year]: {
          ...existing,
          openingBalance: newOpening,
          closingBalance: newClosing,
          notes: data.notes !== undefined ? data.notes : existing.notes,
        },
      };
    });

    try {
      await fetch(`/api/archives/${year}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
    } catch (err) {
      console.error('Failed to update archive in backend:', err);
    }
  };

  const importPreviousYearData = async (
    fiscalYear: string,
    openingBalance: number,
    depositsList: Deposit[],
    expensesList: Expense[],
    notes?: string
  ) => {
    const totalDeposits = depositsList.reduce((acc, d) => acc + (d.amount || 0), 0);
    const totalExpenses = expensesList.reduce((acc, e) => acc + (e.amount || 0), 0);
    const closingBalance = openingBalance + totalDeposits - totalExpenses;

    const archive: FiscalYearArchive = {
      fiscalYear,
      openingBalance,
      totalDeposits,
      totalExpenses,
      closingBalance,
      deposits: depositsList,
      expenses: expensesList,
      notes: notes || `Historical archive imported for Fiscal Year ${fiscalYear}`,
      importedAt: new Date().toISOString(),
      importedBy: currentUser?.displayName || 'Admin',
    };

    setHistoricalArchives((prev) => ({
      ...prev,
      [fiscalYear]: archive,
    }));

    // If importing for current active year, also append to active transactions
    if (fiscalYear === settings.fiscalYear || fiscalYear === activeFiscalYear) {
      setDeposits((prev) => [...depositsList, ...prev]);
      setExpenses((prev) => [...expensesList, ...prev]);
      setSettings((prev) => ({ ...prev, openingBalance }));
    }

    try {
      await fetch('/api/import-year', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fiscalYear,
          openingBalance,
          deposits: depositsList,
          expenses: expensesList,
          notes,
        }),
      });
      await reloadFundData();
    } catch (err) {
      console.error('Failed to persist year import to PostgreSQL backend:', err);
    }
  };

  const deleteHistoricalYear = async (year: string) => {
    setHistoricalArchives((prev) => {
      const copy = { ...prev };
      delete copy[year];
      return copy;
    });
    setDeposits((prev) => prev.filter((d) => d.fiscalYear !== year));
    setExpenses((prev) => prev.filter((e) => e.fiscalYear !== year));
    try {
      await fetch(`/api/archives/${year}`, { method: 'DELETE' });
    } catch (err) {
      console.error('Failed to delete year archive in backend:', err);
    }
  };

  const parseAndImportCsv = async (
    csvContent: string,
    targetYear: string,
    openingBal: number,
    notes?: string
  ) => {
    try {
      const rawLines = csvContent.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      if (rawLines.length === 0) {
        return { success: false, message: 'CSV file is empty.', depositsCount: 0, expensesCount: 0 };
      }

      const parsedDeposits: Deposit[] = [];
      const parsedExpenses: Expense[] = [];
      let parsingSection: 'none' | 'deposits' | 'expenses' = 'none';

      for (let i = 0; i < rawLines.length; i++) {
        const line = rawLines[i];
        const lower = line.toLowerCase();

        if (lower.includes('list of deposit') || lower.includes('deposits')) {
          parsingSection = 'deposits';
          continue;
        }

        if (lower.includes('list of expense') || lower.includes('expenses')) {
          parsingSection = 'expenses';
          continue;
        }

        const tokens: string[] = [];
        let inQuotes = false;
        let token = '';
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') inQuotes = !inQuotes;
          else if (char === ',' && !inQuotes) {
            tokens.push(token.trim().replace(/^"|"$/g, ''));
            token = '';
          } else {
            token += char;
          }
        }
        tokens.push(token.trim().replace(/^"|"$/g, ''));

        if (
          tokens[0]?.toLowerCase().startsWith('date') ||
          tokens[0]?.toLowerCase().startsWith('total') ||
          tokens.length < 3
        ) {
          continue;
        }

        if (parsingSection === 'deposits') {
          const date = tokens[0] || `${targetYear}-11-01`;
          const description = tokens[1] || 'Deposit Received';
          const flatId = tokens[2]?.trim().toUpperCase() || 'AB1';
          const rawAmt = tokens[3]?.replace(/,/g, '') || '0';
          const amount = parseFloat(rawAmt);

          if (!isNaN(amount) && amount > 0) {
            parsedDeposits.push({
              id: `dep-imp-${Date.now()}-${parsedDeposits.length}`,
              fiscalYear: targetYear,
              date,
              description,
              flatId,
              amount,
              paymentMethod: description.toLowerCase().includes('bkash')
                ? 'bKash'
                : description.toLowerCase().includes('cash')
                ? 'Cash'
                : 'DBBL',
              verified: true,
              createdAt: new Date().toISOString(),
            });
          }
        } else if (parsingSection === 'expenses') {
          const date = tokens[0] || `${targetYear}-06-01`;
          const description = tokens[1] || 'Maintenance Expense';

          let sharesIdx = 2;
          if (tokens[2] === '' || isNaN(parseInt(tokens[2]))) sharesIdx = 3;
          const shares = parseInt(tokens[sharesIdx]) || 10;
          const rawAmt = tokens[sharesIdx + 1]?.replace(/,/g, '') || '0';
          const amount = parseFloat(rawAmt);
          const perFlatBase = parseFloat(tokens[sharesIdx + 2]?.replace(/,/g, '') || '0') || Math.round(amount / shares);

          const allocations: Record<string, number> = {};
          const flatIds = ['AB1', 'A2', 'B2', 'A3', 'B3', 'A4', 'B4', 'AB5'];
          const startFlatCol = sharesIdx + 3;

          flatIds.forEach((fId, fIdx) => {
            const allocVal = parseFloat(tokens[startFlatCol + fIdx]?.replace(/,/g, '') || '');
            if (!isNaN(allocVal)) {
              allocations[fId] = allocVal;
            } else {
              const weight = fId === 'AB1' || fId === 'AB5' ? 2 : 1;
              allocations[fId] = Math.round((amount / 10) * weight);
            }
          });

          if (!isNaN(amount) && amount > 0) {
            let cat: any = 'adhoc';
            const descLower = description.toLowerCase();
            if (descLower.includes('paint')) cat = 'painting_renovation';
            else if (descLower.includes('generator')) cat = 'generator';
            else if (descLower.includes('lift')) cat = 'lift';
            else if (descLower.includes('tax')) cat = 'tax';
            else if (descLower.includes('pump') || descLower.includes('capacitor')) cat = 'water_pump';
            else if (descLower.includes('cctv') || descLower.includes('camera')) cat = 'security_cctv';
            else if (descLower.includes('tank') || descLower.includes('cleaning')) cat = 'cleaning';
            else if (descLower.includes('fire')) cat = 'fire_safety';

            parsedExpenses.push({
              id: `exp-imp-${Date.now()}-${parsedExpenses.length}`,
              fiscalYear: targetYear,
              date,
              description,
              category: cat,
              billingFrequency: 'yearly',
              numberOfShares: shares,
              amount,
              perFlatBase,
              allocations,
              receiptVerified: true,
              createdAt: new Date().toISOString(),
            });
          }
        }
      }

      if (parsedDeposits.length === 0 && parsedExpenses.length === 0) {
        return {
          success: false,
          message: 'No valid deposit or expense records could be parsed from the CSV structure.',
          depositsCount: 0,
          expensesCount: 0,
        };
      }

      await importPreviousYearData(
        targetYear,
        openingBal,
        parsedDeposits,
        parsedExpenses,
        notes || `Imported via CSV file on ${new Date().toLocaleDateString()}`
      );

      return {
        success: true,
        message: `Successfully imported ${parsedDeposits.length} deposits and ${parsedExpenses.length} expenses into FY ${targetYear}.`,
        depositsCount: parsedDeposits.length,
        expensesCount: parsedExpenses.length,
      };
    } catch (err: any) {
      console.error('Error parsing CSV', err);
      return {
        success: false,
        message: `Error parsing CSV: ${err.message || 'Malformed file'}`,
        depositsCount: 0,
        expensesCount: 0,
      };
    }
  };

  const resetToDefaultData = async () => {
    setSettings({ ...INITIAL_SETTINGS, openingBalance: 0.00 });
    setFlats(INITIAL_FLATS);
    setDeposits([]);
    setExpenses([]);
    setReceipts([]);
    setHistoricalArchives({});
    try {
      await fetch('/api/reset-blank', { method: 'POST' });
    } catch (err) {
      console.error('Failed to reset PostgreSQL database:', err);
    }
  };

  const exportCsvData = () => {
    const lines: string[] = [];

    lines.push('List of Deposits,,,,,,Balance From Last Year,Total Fund Received,Total Spent,Current Balance,,,,');
    lines.push('Date,Description,Flat,Amount,Balance,,,,,,,,,');

    deposits.forEach((dep) => {
      const summary = flatSummaries.find((s) => s.flatId === dep.flatId);
      lines.push(
        `"${dep.date}","${dep.description.replace(/"/g, '""')}","${dep.flatId}","${dep.amount.toFixed(2)}","${(summary?.balance || 0).toFixed(2)}",,"${settings.openingBalance.toFixed(2)}","${financialStats.totalDeposits.toFixed(2)}","${financialStats.totalExpenses.toFixed(2)}","${financialStats.currentBalance.toFixed(2)}",,,,`
      );
    });

    lines.push(`Total,,,"${financialStats.totalDeposits.toFixed(2)}","-${financialStats.totalOutstanding.toFixed(2)}",,,,,,,,,`);
    lines.push(',,,,,,,,,,,,,');
    lines.push(',,,,,,,,,,,,,');
    lines.push('List of Expense,,,,,,,,,,,,,');
    lines.push('Date,Description,,Number of Share,Amount,Per Flat,AB1,A2,B2,A3,B3,A4,B4,AB5');

    expenses.forEach((exp) => {
      const ab1 = exp.allocations?.AB1 || 0;
      const a2 = exp.allocations?.A2 || 0;
      const b2 = exp.allocations?.B2 || 0;
      const a3 = exp.allocations?.A3 || 0;
      const b3 = exp.allocations?.B3 || 0;
      const a4 = exp.allocations?.A4 || 0;
      const b4 = exp.allocations?.B4 || 0;
      const ab5 = exp.allocations?.AB5 || 0;
      lines.push(
        `"${exp.date}","${exp.description.replace(/"/g, '""')}",,${exp.numberOfShares},"${exp.amount.toFixed(2)}",${exp.perFlatBase},${ab1},${a2},${b2},${a3},${b3},${a4},${b4},${ab5}`
      );
    });

    const ab1Tot = expenses.reduce((s, e) => s + (e.allocations?.AB1 || 0), 0);
    const a2Tot = expenses.reduce((s, e) => s + (e.allocations?.A2 || 0), 0);
    const b2Tot = expenses.reduce((s, e) => s + (e.allocations?.B2 || 0), 0);
    const a3Tot = expenses.reduce((s, e) => s + (e.allocations?.A3 || 0), 0);
    const b3Tot = expenses.reduce((s, e) => s + (e.allocations?.B3 || 0), 0);
    const a4Tot = expenses.reduce((s, e) => s + (e.allocations?.A4 || 0), 0);
    const b4Tot = expenses.reduce((s, e) => s + (e.allocations?.B4 || 0), 0);
    const ab5Tot = expenses.reduce((s, e) => s + (e.allocations?.AB5 || 0), 0);

    lines.push(
      `Total,,,,"${financialStats.totalExpenses.toFixed(2)}",,"${ab1Tot.toFixed(2)}","${a2Tot.toFixed(2)}","${b2Tot.toFixed(2)}","${a3Tot.toFixed(2)}","${b3Tot.toFixed(2)}","${a4Tot.toFixed(2)}","${b4Tot.toFixed(2)}","${ab5Tot.toFixed(2)}"`
    );

    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Common_Fund_Audit_${settings.fiscalYear}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportJsonBackup = () => {
    const backup = {
      exportedAt: new Date().toISOString(),
      version: '3.0',
      database: 'PostgreSQL',
      settings,
      flats,
      deposits,
      expenses,
      receipts,
      historicalArchives,
    };
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Apartment_Fund_Postgres_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const importJsonBackup = (jsonData: string): boolean => {
    try {
      const parsed = JSON.parse(jsonData);
      if (parsed.settings) setSettings(parsed.settings);
      if (parsed.flats) setFlats(parsed.flats);
      if (parsed.deposits) setDeposits(parsed.deposits);
      if (parsed.expenses) setExpenses(parsed.expenses);
      if (parsed.receipts) setReceipts(parsed.receipts);
      if (parsed.historicalArchives) setHistoricalArchives(parsed.historicalArchives);
      return true;
    } catch (err) {
      console.error('Failed to import JSON backup', err);
      return false;
    }
  };

  return (
    <FundContext.Provider
      value={{
        settings,
        flats,
        deposits,
        expenses,
        receipts,
        historicalArchives,
        role,
        currentUser,
        login,
        logout,
        changePassword,
        updateMyFlatInfo,
        usersList,
        fetchUsers,
        updateUserAccount,
        createUserAccount,
        deleteUserAccount,
        selectedFlatId,
        setSelectedFlatId,
        flatSummaries,
        financialStats,
        isLoading,
        availableYears,
        activeFiscalYear,
        setActiveFiscalYear,
        reloadFundData,
        addDeposit,
        updateDeposit,
        deleteDeposit,
        addExpense,
        updateExpense,
        deleteExpense,
        addReceipt,
        deleteReceipt,
        updateReceipt,
        updateSettings,
        updateFlat,
        updateHistoricalArchive,
        importPreviousYearData,
        parseAndImportCsv,
        deleteHistoricalYear,
        resetToDefaultData,
        exportCsvData,
        exportJsonBackup,
        importJsonBackup,
      }}
    >
      {children}
    </FundContext.Provider>
  );
};

export const useFund = () => {
  const context = useContext(FundContext);
  if (!context) {
    throw new Error('useFund must be used within a FundProvider');
  }
  return context;
};
