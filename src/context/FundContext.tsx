import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  FlatUnit,
  Deposit,
  Expense,
  Receipt,
  FundSettings,
  FlatBalanceSummary,
  FiscalYearArchive,
  PaymentMethod,
  ExpenseCategory,
  BillingFrequency,
} from '../types';
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
  role: 'admin' | 'owner';
  setRole: (role: 'admin' | 'owner') => void;
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
  // Multi-Year & Historical Archives
  historicalArchives: Record<string, FiscalYearArchive>;
  availableYears: string[];
  activeFiscalYear: string;
  setActiveFiscalYear: (year: string) => void;
  importPreviousYearData: (
    fiscalYear: string,
    openingBalance: number,
    depositsList: Deposit[],
    expensesList: Expense[],
    notes?: string
  ) => void;
  parseAndImportCsv: (
    csvContent: string,
    targetYear: string,
    openingBal: number,
    notes?: string
  ) => { success: boolean; message: string; depositsCount: number; expensesCount: number };
  deleteHistoricalYear: (year: string) => void;

  // Transaction Operations
  addDeposit: (deposit: Omit<Deposit, 'id' | 'createdAt'>) => void;
  updateDeposit: (deposit: Deposit) => void;
  deleteDeposit: (id: string) => void;
  addExpense: (expense: Omit<Expense, 'id' | 'createdAt'>, receiptData?: { fileName: string; fileUrl: string }) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  addReceipt: (receipt: Omit<Receipt, 'id' | 'uploadedAt'>) => void;
  deleteReceipt: (id: string) => void;
  updateReceipt: (receipt: Receipt) => void;
  updateSettings: (newSettings: Partial<FundSettings>) => void;
  updateFlat: (flat: FlatUnit) => void;
  resetToDefaultData: () => void;
  exportCsvData: () => void;
  exportJsonBackup: () => void;
  importJsonBackup: (jsonData: string) => boolean;
}

const FundContext = createContext<FundContextType | undefined>(undefined);

const STORAGE_KEYS = {
  SETTINGS: 'acmf_settings_v2',
  FLATS: 'acmf_flats_v2',
  DEPOSITS: 'acmf_deposits_v2',
  EXPENSES: 'acmf_expenses_v2',
  RECEIPTS: 'acmf_receipts_v2',
  ROLE: 'acmf_role_v2',
  SELECTED_FLAT: 'acmf_selected_flat_v2',
  HISTORICAL_ARCHIVES: 'acmf_historical_v2',
  ACTIVE_YEAR: 'acmf_active_year_v2',
};

export const FundProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<FundSettings>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [flats, setFlats] = useState<FlatUnit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.FLATS);
    return saved ? JSON.parse(saved) : INITIAL_FLATS;
  });

  const [deposits, setDeposits] = useState<Deposit[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DEPOSITS);
    return saved ? JSON.parse(saved) : INITIAL_DEPOSITS;
  });

  const [expenses, setExpenses] = useState<Expense[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.EXPENSES);
    return saved ? JSON.parse(saved) : INITIAL_EXPENSES;
  });

  const [receipts, setReceipts] = useState<Receipt[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.RECEIPTS);
    return saved ? JSON.parse(saved) : INITIAL_RECEIPTS;
  });

  const [historicalArchives, setHistoricalArchives] = useState<Record<string, FiscalYearArchive>>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.HISTORICAL_ARCHIVES);
    return saved ? JSON.parse(saved) : INITIAL_HISTORICAL_ARCHIVES;
  });

  const [activeFiscalYear, setActiveFiscalYearState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_YEAR);
    return saved || '2025-2026';
  });

  const [role, setRoleState] = useState<'admin' | 'owner'>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    return (saved as 'admin' | 'owner') || 'admin';
  });

  const [selectedFlatId, setSelectedFlatIdState] = useState<string>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_FLAT);
    return saved || 'AB1';
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.FLATS, JSON.stringify(flats));
  }, [flats]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.DEPOSITS, JSON.stringify(deposits));
  }, [deposits]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.RECEIPTS, JSON.stringify(receipts));
  }, [receipts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.HISTORICAL_ARCHIVES, JSON.stringify(historicalArchives));
  }, [historicalArchives]);

  const setRole = (newRole: 'admin' | 'owner') => {
    setRoleState(newRole);
    localStorage.setItem(STORAGE_KEYS.ROLE, newRole);
  };

  const setSelectedFlatId = (id: string) => {
    setSelectedFlatIdState(id);
    localStorage.setItem(STORAGE_KEYS.SELECTED_FLAT, id);
  };

  const setActiveFiscalYear = (year: string) => {
    setActiveFiscalYearState(year);
    localStorage.setItem(STORAGE_KEYS.ACTIVE_YEAR, year);
  };

  // Available fiscal years list
  const availableYears = useMemo(() => {
    const years = new Set<string>();
    years.add('2025-2026');
    Object.keys(historicalArchives).forEach((y) => years.add(y));
    return Array.from(years).sort().reverse();
  }, [historicalArchives]);

  // Summaries per flat
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

  // Overall financial stats
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

  // Deposit Actions
  const addDeposit = (depositData: Omit<Deposit, 'id' | 'createdAt'>) => {
    const newDeposit: Deposit = {
      ...depositData,
      id: `dep-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setDeposits((prev) => [newDeposit, ...prev]);
  };

  const updateDeposit = (updated: Deposit) => {
    setDeposits((prev) => prev.map((d) => (d.id === updated.id ? updated : d)));
  };

  const deleteDeposit = (id: string) => {
    setDeposits((prev) => prev.filter((d) => d.id !== id));
  };

  // Expense Actions
  const addExpense = (
    expenseData: Omit<Expense, 'id' | 'createdAt'>,
    receiptData?: { fileName: string; fileUrl: string }
  ) => {
    const expId = `exp-${Date.now()}`;
    const newExpense: Expense = {
      ...expenseData,
      id: expId,
      createdAt: new Date().toISOString(),
      receiptFileName: receiptData?.fileName || expenseData.receiptFileName,
      receiptUrl: receiptData?.fileUrl || expenseData.receiptUrl,
      receiptVerified: true,
    };
    setExpenses((prev) => [newExpense, ...prev]);

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
  };

  const updateExpense = (updated: Expense) => {
    setExpenses((prev) => prev.map((e) => (e.id === updated.id ? updated : e)));
  };

  const deleteExpense = (id: string) => {
    setExpenses((prev) => prev.filter((e) => e.id !== id));
    setReceipts((prev) => prev.filter((r) => r.expenseId !== id));
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

  const updateSettings = (newSettings: Partial<FundSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const updateFlat = (updated: FlatUnit) => {
    setFlats((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
  };

  // Previous Years / Historical Archive Actions (Admin Only)
  const importPreviousYearData = (
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
      importedBy: settings.adminName,
    };

    setHistoricalArchives((prev) => ({
      ...prev,
      [fiscalYear]: archive,
    }));
  };

  const deleteHistoricalYear = (year: string) => {
    setHistoricalArchives((prev) => {
      const copy = { ...prev };
      delete copy[year];
      return copy;
    });
  };

  // Smart CSV parser for historical data
  const parseAndImportCsv = (
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

        // CSV line tokenizer handling quotes
        const tokens: string[] = [];
        let inQuotes = false;
        let token = '';
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') {
            inQuotes = !inQuotes;
          } else if (char === ',' && !inQuotes) {
            tokens.push(token.trim().replace(/^"|"$/g, ''));
            token = '';
          } else {
            token += char;
          }
        }
        tokens.push(token.trim().replace(/^"|"$/g, ''));

        // Skip headers or totals
        if (
          tokens[0]?.toLowerCase().startsWith('date') ||
          tokens[0]?.toLowerCase().startsWith('total') ||
          tokens.length < 3
        ) {
          continue;
        }

        if (parsingSection === 'deposits') {
          // Expect: Date, Description, Flat, Amount
          const date = tokens[0] || new Date().toISOString().slice(0, 10);
          const description = tokens[1] || 'Deposit Received';
          const flatId = tokens[2]?.trim().toUpperCase() || 'AB1';
          const rawAmt = tokens[3]?.replace(/,/g, '') || '0';
          const amount = parseFloat(rawAmt);

          if (!isNaN(amount) && amount > 0) {
            parsedDeposits.push({
              id: `dep-imp-${Date.now()}-${parsedDeposits.length}`,
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
          // Expect: Date, Description, [optional], Shares, Amount, Per Flat, AB1, A2, B2, A3, B3, A4, B4, AB5
          const date = tokens[0] || new Date().toISOString().slice(0, 10);
          const description = tokens[1] || 'Maintenance Expense';
          
          let sharesIdx = 2;
          if (tokens[2] === '' || isNaN(parseInt(tokens[2]))) {
            sharesIdx = 3;
          }
          const shares = parseInt(tokens[sharesIdx]) || 10;
          const rawAmt = tokens[sharesIdx + 1]?.replace(/,/g, '') || '0';
          const amount = parseFloat(rawAmt);
          const perFlatBase = parseFloat(tokens[sharesIdx + 2]?.replace(/,/g, '') || '0') || Math.round(amount / shares);

          // Extract unit allocations if available
          const allocations: Record<string, number> = {};
          const flatIds = ['AB1', 'A2', 'B2', 'A3', 'B3', 'A4', 'B4', 'AB5'];
          const startFlatCol = sharesIdx + 3;

          flatIds.forEach((fId, fIdx) => {
            const allocVal = parseFloat(tokens[startFlatCol + fIdx]?.replace(/,/g, '') || '');
            if (!isNaN(allocVal)) {
              allocations[fId] = allocVal;
            } else {
              // Default 10 share split: AB1=2, AB5=2, rest=1
              const weight = fId === 'AB1' || fId === 'AB5' ? 2 : 1;
              allocations[fId] = Math.round((amount / 10) * weight);
            }
          });

          if (!isNaN(amount) && amount > 0) {
            let cat: ExpenseCategory = 'adhoc';
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

      importPreviousYearData(
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

  const resetToDefaultData = () => {
    setSettings(INITIAL_SETTINGS);
    setFlats(INITIAL_FLATS);
    setDeposits(INITIAL_DEPOSITS);
    setExpenses(INITIAL_EXPENSES);
    setReceipts(INITIAL_RECEIPTS);
    setHistoricalArchives(INITIAL_HISTORICAL_ARCHIVES);
    setActiveFiscalYearState('2025-2026');
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.FLATS);
    localStorage.removeItem(STORAGE_KEYS.DEPOSITS);
    localStorage.removeItem(STORAGE_KEYS.EXPENSES);
    localStorage.removeItem(STORAGE_KEYS.RECEIPTS);
    localStorage.removeItem(STORAGE_KEYS.HISTORICAL_ARCHIVES);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_YEAR);
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
      version: '2.0',
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
    link.setAttribute('download', `Apartment_Fund_Full_5Year_Backup_${new Date().toISOString().slice(0, 10)}.json`);
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
        role,
        setRole,
        selectedFlatId,
        setSelectedFlatId,
        flatSummaries,
        financialStats,
        historicalArchives,
        availableYears,
        activeFiscalYear,
        setActiveFiscalYear,
        importPreviousYearData,
        parseAndImportCsv,
        deleteHistoricalYear,
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
