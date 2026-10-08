import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { FiscalYearArchive, Deposit, Expense, PaymentMethod, ExpenseCategory, BillingFrequency } from '../types/index.ts';
import { 
  Calendar, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  CheckCircle2, 
  Trash2, 
  FileText, 
  Plus, 
  X, 
  Lock, 
  Building, 
  Database,
  ArrowRight,
  Edit3,
  CreditCard,
  Layers,
  Search,
  Filter
} from 'lucide-react';

export const PreviousYearsManager: React.FC = () => {
  const { 
    historicalArchives, 
    financialStats, 
    settings, 
    role, 
    flats,
    deposits: allDeposits,
    expenses: allExpenses,
    importPreviousYearData, 
    parseAndImportCsv, 
    deleteHistoricalYear,
    addDeposit,
    updateDeposit,
    deleteDeposit,
    addExpense,
    updateExpense,
    deleteExpense,
    updateHistoricalArchive,
  } = useFund();

  const [selectedYear, setSelectedYear] = useState<string>('2023');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Edit Opening Balance Modal
  const [isEditArchiveModalOpen, setIsEditArchiveModalOpen] = useState(false);
  const [editOpeningBalance, setEditOpeningBalance] = useState('0.00');
  const [editArchiveNotes, setEditArchiveNotes] = useState('');

  // Deposit Edit / Add Modal for selected year
  const [isDepositModalOpen, setIsDepositModalOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [depFormDate, setDepFormDate] = useState('');
  const [depFormFlat, setDepFormFlat] = useState('AB1');
  const [depFormAmount, setDepFormAmount] = useState('');
  const [depFormMethod, setDepFormMethod] = useState<PaymentMethod>('DBBL');
  const [depFormDesc, setDepFormDesc] = useState('');
  const [depFormRef, setDepFormRef] = useState('');
  const [depFormPaidBy, setDepFormPaidBy] = useState('');
  const [depFormNotes, setDepFormNotes] = useState('');

  // Expense Edit / Add Modal for selected year
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [expFormDate, setExpFormDate] = useState('');
  const [expFormDesc, setExpFormDesc] = useState('');
  const [expFormAmount, setExpFormAmount] = useState('');
  const [expFormCategory, setExpFormCategory] = useState<ExpenseCategory>('adhoc');
  const [expFormShares, setExpFormShares] = useState(10);
  const [expFormVendor, setExpFormVendor] = useState('');
  const [expFormNotes, setExpFormNotes] = useState('');

  // Sub-tabs in Year Breakdown: 'overview' | 'deposits' | 'expenses'
  const [breakdownView, setBreakdownView] = useState<'all' | 'deposits' | 'expenses'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Import modal form states
  const [targetYear, setTargetYear] = useState('2023');
  const [targetOpeningBalance, setTargetOpeningBalance] = useState('0.00');
  const [targetNotes, setTargetNotes] = useState('');
  const [importMethod, setImportMethod] = useState<'csv' | 'summary'>('csv');
  const [csvContentText, setCsvContentText] = useState('');
  const [csvFileName, setCsvFileName] = useState('');
  const [summaryDeposits, setSummaryDeposits] = useState('0.00');
  const [summaryExpenses, setSummaryExpenses] = useState('0.00');

  // Combined records for 2023, 2024, 2025, 2026
  const primaryYears = ['2026', '2025', '2024', '2023'];

  // Current selected archive or current year stats
  const selectedArchive = historicalArchives[selectedYear];

  // Get all deposits and expenses that belong to this year
  const yearDeposits = allDeposits.filter((d) => d.fiscalYear === selectedYear || (selectedArchive && selectedArchive.deposits?.some((ad) => ad.id === d.id)));
  const yearExpenses = allExpenses.filter((e) => e.fiscalYear === selectedYear || (selectedArchive && selectedArchive.expenses?.some((ae) => ae.id === e.id)));

  // If archive exists in historicalArchives, use its merged list if allDeposits doesn't have it
  const displayDeposits = yearDeposits.length > 0 ? yearDeposits : (selectedArchive?.deposits || []);
  const displayExpenses = yearExpenses.length > 0 ? yearExpenses : (selectedArchive?.expenses || []);

  const totalYearDeposits = displayDeposits.reduce((acc, d) => acc + (d.amount || 0), 0);
  const totalYearExpenses = displayExpenses.reduce((acc, e) => acc + (e.amount || 0), 0);
  const yearOpeningBalance = selectedArchive ? selectedArchive.openingBalance : (selectedYear === settings.fiscalYear ? settings.openingBalance : 0);
  const yearClosingBalance = yearOpeningBalance + totalYearDeposits - totalYearExpenses;

  const yearlyRecords = primaryYears.map((yearKey) => {
    const isCurrent = yearKey === settings.fiscalYear || (settings.fiscalYear.includes(yearKey) && yearKey === '2026');
    const arch = historicalArchives[yearKey];
    const deps = allDeposits.filter((d) => d.fiscalYear === yearKey);
    const exps = allExpenses.filter((e) => e.fiscalYear === yearKey);

    const hasAnyData = arch || deps.length > 0 || exps.length > 0 || (isCurrent && (financialStats.totalDeposits > 0 || financialStats.totalExpenses > 0 || settings.openingBalance > 0));

    if (arch) {
      return {
        year: yearKey,
        isCurrent: isCurrent,
        hasData: true,
        opening: arch.openingBalance,
        deposits: Math.max(arch.totalDeposits, deps.reduce((s, d) => s + d.amount, 0)),
        expenses: Math.max(arch.totalExpenses, exps.reduce((s, e) => s + e.amount, 0)),
        closing: arch.openingBalance + Math.max(arch.totalDeposits, deps.reduce((s, d) => s + d.amount, 0)) - Math.max(arch.totalExpenses, exps.reduce((s, e) => s + e.amount, 0)),
        notes: arch.notes || `PostgreSQL audited records for ${yearKey}`,
      };
    }

    if (deps.length > 0 || exps.length > 0) {
      const depTot = deps.reduce((s, d) => s + d.amount, 0);
      const expTot = exps.reduce((s, e) => s + e.amount, 0);
      return {
        year: yearKey,
        isCurrent: isCurrent,
        hasData: true,
        opening: 0,
        deposits: depTot,
        expenses: expTot,
        closing: depTot - expTot,
        notes: `PostgreSQL ledger for ${yearKey}`,
      };
    }

    if (isCurrent && hasAnyData) {
      return {
        year: yearKey,
        isCurrent: true,
        hasData: true,
        opening: settings.openingBalance,
        deposits: financialStats.totalDeposits,
        expenses: financialStats.totalExpenses,
        closing: financialStats.currentBalance,
        notes: 'Current active PostgreSQL fiscal year ledger',
      };
    }

    return {
      year: yearKey,
      isCurrent: isCurrent,
      hasData: false,
      opening: 0,
      deposits: 0,
      expenses: 0,
      closing: 0,
      notes: `Ready for import into PostgreSQL`,
    };
  });

  const handleOpenImportForYear = (yr: string) => {
    setTargetYear(yr);
    setTargetOpeningBalance('0.00');
    setTargetNotes(`Audited financial records for year ${yr}`);
    setCsvContentText('');
    setCsvFileName('');
    setSummaryDeposits('0.00');
    setSummaryExpenses('0.00');
    setIsImportModalOpen(true);
  };

  const handleOpenEditArchive = () => {
    setEditOpeningBalance((selectedArchive?.openingBalance || 0).toString());
    setEditArchiveNotes(selectedArchive?.notes || '');
    setIsEditArchiveModalOpen(true);
  };

  const handleSaveArchiveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    const op = parseFloat(editOpeningBalance) || 0;
    await updateHistoricalArchive(selectedYear, {
      openingBalance: op,
      notes: editArchiveNotes,
    });
    setIsEditArchiveModalOpen(false);
  };

  // Open Add Deposit modal for selected year
  const handleOpenAddDepositForYear = () => {
    setEditingDeposit(null);
    setDepFormDate(`${selectedYear}-11-01`);
    setDepFormFlat('AB1');
    setDepFormAmount('');
    setDepFormMethod('DBBL');
    setDepFormDesc(`Annual contribution Flat AB1 (${selectedYear})`);
    setDepFormRef(`DBBL-${selectedYear}-${Math.floor(1000 + Math.random() * 9000)}`);
    setDepFormPaidBy('');
    setDepFormNotes(`FY ${selectedYear} maintenance deposit`);
    setIsDepositModalOpen(true);
  };

  // Open Edit Deposit modal
  const handleOpenEditDeposit = (dep: Deposit) => {
    setEditingDeposit(dep);
    setDepFormDate(dep.date);
    setDepFormFlat(dep.flatId);
    setDepFormAmount(dep.amount.toString());
    setDepFormMethod(dep.paymentMethod);
    setDepFormDesc(dep.description);
    setDepFormRef(dep.referenceNo || '');
    setDepFormPaidBy(dep.paidBy || '');
    setDepFormNotes(dep.notes || '');
    setIsDepositModalOpen(true);
  };

  const handleSaveDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(depFormAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (editingDeposit) {
      await updateDeposit({
        ...editingDeposit,
        fiscalYear: selectedYear,
        date: depFormDate,
        flatId: depFormFlat,
        amount: amt,
        paymentMethod: depFormMethod,
        description: depFormDesc,
        referenceNo: depFormRef,
        paidBy: depFormPaidBy,
        notes: depFormNotes,
      });
    } else {
      await addDeposit({
        fiscalYear: selectedYear,
        date: depFormDate,
        flatId: depFormFlat,
        amount: amt,
        paymentMethod: depFormMethod,
        description: depFormDesc,
        referenceNo: depFormRef,
        paidBy: depFormPaidBy,
        notes: depFormNotes,
        verified: true,
      });
    }
    setIsDepositModalOpen(false);
  };

  // Open Add Expense modal for selected year
  const handleOpenAddExpenseForYear = () => {
    setEditingExpense(null);
    setExpFormDate(`${selectedYear}-06-01`);
    setExpFormDesc('');
    setExpFormAmount('');
    setExpFormCategory('adhoc');
    setExpFormShares(10);
    setExpFormVendor('');
    setExpFormNotes(`FY ${selectedYear} building maintenance`);
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (exp: Expense) => {
    setEditingExpense(exp);
    setExpFormDate(exp.date);
    setExpFormDesc(exp.description);
    setExpFormAmount(exp.amount.toString());
    setExpFormCategory(exp.category);
    setExpFormShares(exp.numberOfShares);
    setExpFormVendor(exp.vendorName || '');
    setExpFormNotes(exp.notes || '');
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expFormAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    const perFlat = Math.round(amt / (expFormShares || 10));
    const allocations: Record<string, number> = {};
    flats.forEach((f) => {
      allocations[f.id] = perFlat * f.shares;
    });

    if (editingExpense) {
      await updateExpense({
        ...editingExpense,
        fiscalYear: selectedYear,
        date: expFormDate,
        description: expFormDesc,
        category: expFormCategory,
        numberOfShares: expFormShares,
        amount: amt,
        perFlatBase: perFlat,
        allocations: editingExpense.allocations || allocations,
        vendorName: expFormVendor,
        notes: expFormNotes,
      });
    } else {
      await addExpense({
        fiscalYear: selectedYear,
        date: expFormDate,
        description: expFormDesc,
        category: expFormCategory,
        billingFrequency: 'yearly',
        numberOfShares: expFormShares,
        amount: amt,
        perFlatBase: perFlat,
        allocations,
        vendorName: expFormVendor,
        notes: expFormNotes,
        receiptVerified: true,
      });
    }
    setIsExpenseModalOpen(false);
  };

  const handleDeleteDepositConfirm = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this deposit entry?')) {
      await deleteDeposit(id);
    }
  };

  const handleDeleteExpenseConfirm = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this expense entry?')) {
      await deleteExpense(id);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvContentText(text || '');
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadSampleCsv = () => {
    const sample = `List of Deposits,,,,,,Balance From Last Year,Total Fund Received,Total Spent,Current Balance,,,,
Date,Description,Flat,Amount,Balance,,,,,,,,,
"${targetYear}-11-15","Annual contribution Flat AB1 in DBBL",AB1,"68000.00","0.00",,"50000.00","340000.00","324778.00","65222.00",,,,
"${targetYear}-11-18","Annual contribution Flat A2 in DBBL",A2,"34000.00","0.00",,,,,,,,,
"${targetYear}-11-20","Annual contribution Flat B2 in DBBL",B2,"34000.00","0.00",,,,,,,,,
"${targetYear}-11-20","Annual contribution Flat A3 in DBBL",A3,"34000.00","0.00",,,,,,,,,
"${targetYear}-11-22","Annual contribution Flat B3 in bKash",B3,"34000.00","0.00",,,,,,,,,
"${targetYear}-11-25","Annual contribution Flat A4 in DBBL",A4,"34000.00","0.00",,,,,,,,,
"${targetYear}-11-28","Annual contribution Flat B4 in DBBL",B4,"34000.00","0.00",,,,,,,,,
"${targetYear}-12-05","Annual contribution Flat AB5 in Cash",AB5,"68000.00","0.00",,,,,,,,,
Total,,,"340000.00","0.00",,,,,,,,,
,,,,,,,,,,,,,
List of Expense,,,,,,,,,,,,,
Date,Description,,Number of Share,Amount,Per Flat,AB1,A2,B2,A3,B3,A4,B4,AB5
"${targetYear}-08-10","Rooftop Waterproofing & Bitumen Coating",,10,"95000.00",9500,19000,9500,9500,9500,9500,9500,9500,19000
"${targetYear}-10-15","Lift Traction Wire Rope Replacement",,10,"82000.00",8200,16400,8200,8200,8200,8200,8200,8200,16400
"${targetYear}-12-23","Yearly Generator Servicing & Engine Oil",,10,"48500.00",4850,9700,4850,4850,4850,4850,4850,4850,9700
Total,,,,"225500.00",,"45100.00","22550.00","22550.00","22550.00","22550.00","22550.00","22550.00","45100.00"`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', `Sample_Import_${targetYear}.csv`);
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExecuteImport = async (e: React.FormEvent) => {
    e.preventDefault();
    const opBal = parseFloat(targetOpeningBalance) || 0;

    if (importMethod === 'csv') {
      if (!csvContentText) {
        alert('Please choose a CSV file or paste CSV content first.');
        return;
      }
      const result = await parseAndImportCsv(csvContentText, targetYear, opBal, targetNotes);
      setImportStatusMessage({
        text: result.message,
        success: result.success,
      });
      if (result.success) {
        setSelectedYear(targetYear);
        setIsImportModalOpen(false);
      }
    } else {
      const depAmt = parseFloat(summaryDeposits) || 0;
      const expAmt = parseFloat(summaryExpenses) || 0;
      await importPreviousYearData(
        targetYear,
        opBal,
        [
          {
            id: `dep-summary-${Date.now()}`,
            fiscalYear: targetYear,
            date: `${targetYear}-12-01`,
            description: `Aggregated Collections for FY ${targetYear}`,
            flatId: 'AB1',
            amount: depAmt,
            paymentMethod: 'DBBL',
            verified: true,
            createdAt: new Date().toISOString(),
          },
        ],
        [
          {
            id: `exp-summary-${Date.now()}`,
            fiscalYear: targetYear,
            date: `${targetYear}-05-01`,
            description: `Aggregated Annual Maintenance Disbursements for FY ${targetYear}`,
            category: 'adhoc',
            billingFrequency: 'yearly',
            numberOfShares: 10,
            amount: expAmt,
            perFlatBase: Math.round(expAmt / 10),
            allocations: {},
            receiptVerified: true,
            createdAt: new Date().toISOString(),
          },
        ],
        targetNotes || `Historical yearly balance carry-over for ${targetYear}`
      );
      setImportStatusMessage({
        text: `Fiscal Year ${targetYear} successfully imported into PostgreSQL!`,
        success: true,
      });
      setSelectedYear(targetYear);
      setIsImportModalOpen(false);
    }
  };

  const handleDeleteYear = async (year: string) => {
    if (window.confirm(`Delete historical archive and transactions for ${year} from PostgreSQL?`)) {
      await deleteHistoricalYear(year);
      setSelectedYear('2024');
    }
  };

  // Filtered deposits and expenses for search
  const filteredDeposits = displayDeposits.filter((d) => {
    const q = searchQuery.toLowerCase();
    return (
      d.description.toLowerCase().includes(q) ||
      d.flatId.toLowerCase().includes(q) ||
      (d.paidBy && d.paidBy.toLowerCase().includes(q)) ||
      (d.referenceNo && d.referenceNo.toLowerCase().includes(q))
    );
  });

  const filteredExpenses = displayExpenses.filter((e) => {
    const q = searchQuery.toLowerCase();
    return (
      e.description.toLowerCase().includes(q) ||
      e.category.toLowerCase().includes(q) ||
      (e.vendorName && e.vendorName.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Multi-Year Financials &amp; History (2023, 2024, 2025 &amp; 2026)
            </h2>
            <span className="px-2 py-0.5 bg-neutral-900 text-white text-[10px] font-mono font-bold rounded flex items-center gap-1">
              <Database className="w-3 h-3 text-emerald-400" />
              POSTGRESQL
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Audit trail of collections and maintenance expenses. Flat owners can browse historical records; modification is limited to Admin.
          </p>
        </div>

        {/* Admin-only Import Button vs Restricted Notice */}
        <div className="flex items-center gap-2">
          {role === 'admin' ? (
            <button
              onClick={() => handleOpenImportForYear(selectedYear)}
              className="px-3.5 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              Import Data for FY {selectedYear}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-md border border-neutral-200">
              <Lock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Editing Restricted to Admin</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      {importStatusMessage && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            importStatusMessage.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{importStatusMessage.text}</span>
          </div>
          <button
            onClick={() => setImportStatusMessage(null)}
            className="text-neutral-500 hover:text-neutral-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Year Selector Cards (2026, 2025, 2024, 2023) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {yearlyRecords.map((item) => (
          <div
            key={item.year}
            onClick={() => setSelectedYear(item.year)}
            className={`p-4 bg-white border rounded-xl transition-all flex flex-col justify-between cursor-pointer ${
              selectedYear === item.year
                ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-sm'
                : 'border-neutral-200 hover:border-neutral-300'
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-neutral-900 font-mono">
                  Fiscal Year {item.year}
                </span>
                {item.hasData ? (
                  <span className="px-1.5 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold rounded">
                    ACTIVE
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-mono rounded">
                    BLANK
                  </span>
                )}
              </div>

              <div className="mt-3 space-y-1 font-mono text-xs">
                <div className="flex justify-between text-neutral-500">
                  <span>Opening Reserve:</span>
                  <span>৳{item.opening.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Received (Deposits):</span>
                  <span className="text-emerald-800 font-semibold">৳{item.deposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-600">
                  <span>Spent (Expenses):</span>
                  <span className="text-rose-800 font-semibold">৳{item.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-neutral-900 font-bold border-t border-neutral-100 pt-1">
                  <span>Closing Balance:</span>
                  <span>৳{item.closing.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between">
              <span className="text-xs font-medium text-neutral-900 flex items-center gap-1">
                <span>View FY {item.year} Ledger</span>
                <ArrowRight className="w-3 h-3" />
              </span>
              {role === 'admin' && !item.hasData && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleOpenImportForYear(item.year);
                  }}
                  className="text-[11px] text-blue-600 hover:underline flex items-center gap-0.5"
                >
                  <Plus className="w-3 h-3" />
                  Import
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Main Historical Year Breakdown & Management */}
      <div className="bg-white border border-neutral-200 rounded-xl p-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-neutral-900 text-white text-[11px] font-bold rounded">
                FISCAL YEAR {selectedYear}
              </span>
              <span className="text-xs font-mono text-neutral-500">
                {displayDeposits.length} deposits · {displayExpenses.length} expenses
              </span>
            </div>
            <h3 className="text-xl font-bold text-neutral-900 mt-2">
              Annual Financial Ledger for Year {selectedYear}
            </h3>
            <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
              {selectedArchive?.notes || `All audited deposits and maintenance expenses recorded in PostgreSQL for Fiscal Year ${selectedYear}.`}
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            {role === 'admin' && (
              <>
                <button
                  onClick={handleOpenEditArchive}
                  className="px-3 py-1.5 border border-neutral-300 rounded-lg text-xs font-medium hover:bg-neutral-50 flex items-center gap-1 text-neutral-700"
                  title="Edit opening balance and archive notes"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  Edit Opening Balance
                </button>
                <button
                  onClick={handleOpenAddDepositForYear}
                  className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-medium hover:bg-emerald-800 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Deposit
                </button>
                <button
                  onClick={handleOpenAddExpenseForYear}
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  + Expense
                </button>
                {selectedArchive && (
                  <button
                    onClick={() => handleDeleteYear(selectedYear)}
                    className="p-1.5 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50"
                    title="Delete year from database"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-neutral-500 text-[11px] block">Opening Reserve</span>
              {role === 'admin' && (
                <button
                  onClick={handleOpenEditArchive}
                  className="text-neutral-400 hover:text-neutral-900 p-0.5"
                  title="Edit opening balance"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              )}
            </div>
            <span className="text-base font-bold text-neutral-900 mt-1 block">
              ৳{yearOpeningBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg">
            <span className="text-neutral-500 text-[11px] block">Total Collections</span>
            <span className="text-base font-bold text-emerald-800 mt-1 block">
              ৳{totalYearDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block font-sans">
              {displayDeposits.length} deposits recorded
            </span>
          </div>

          <div className="p-3.5 bg-neutral-50 border border-neutral-200 rounded-lg">
            <span className="text-neutral-500 text-[11px] block">Maintenance Spent</span>
            <span className="text-base font-bold text-rose-800 mt-1 block">
              ৳{totalYearExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-neutral-400 mt-0.5 block font-sans">
              {displayExpenses.length} expense vouchers
            </span>
          </div>

          <div className="p-3.5 bg-neutral-50 border border-neutral-900 rounded-lg">
            <span className="text-neutral-900 text-[11px] font-bold block">Closing Fund Reserve</span>
            <span className="text-base font-bold text-neutral-900 mt-1 block">
              ৳{yearClosingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-emerald-700 mt-0.5 block font-sans">
              Audited in PostgreSQL
            </span>
          </div>
        </div>

        {/* View Toggle (All | Deposits | Expenses) + Search */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-lg self-start">
            <button
              onClick={() => setBreakdownView('all')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                breakdownView === 'all'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All FY {selectedYear} Transactions
            </button>
            <button
              onClick={() => setBreakdownView('deposits')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                breakdownView === 'deposits'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Deposits ({displayDeposits.length})
            </button>
            <button
              onClick={() => setBreakdownView('expenses')}
              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                breakdownView === 'expenses'
                  ? 'bg-white text-neutral-900 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Expenses ({displayExpenses.length})
            </button>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
            <input
              type="text"
              placeholder={`Search FY ${selectedYear}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 border border-neutral-300 rounded-lg text-xs text-neutral-900 placeholder-neutral-400"
            />
          </div>
        </div>

        {/* Section 1: Previous Year Deposits Table */}
        {(breakdownView === 'all' || breakdownView === 'deposits') && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-sm">
                  FY {selectedYear} Owner Collections &amp; Deposits
                </span>
                <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 text-[10px] font-mono font-bold rounded">
                  ৳{totalYearDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {role === 'admin' && (
                <button
                  onClick={handleOpenAddDepositForYear}
                  className="text-xs text-neutral-900 hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  Add Deposit
                </button>
              )}
            </div>

            {filteredDeposits.length > 0 ? (
              <div className="overflow-x-auto border border-neutral-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Flat</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Method</th>
                      <th className="py-2.5 px-3">Reference / Payer</th>
                      <th className="py-2.5 px-3 text-right">Amount (৳)</th>
                      {role === 'admin' && <th className="py-2.5 px-3 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredDeposits.map((dep) => (
                      <tr key={dep.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-neutral-600 whitespace-nowrap">
                          {dep.date}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-900 font-mono font-bold rounded">
                            {dep.flatId}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-neutral-900 font-medium max-w-xs truncate">
                          {dep.description}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-600 whitespace-nowrap">
                          {dep.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-500 font-mono text-[11px] truncate max-w-[150px]">
                          {dep.referenceNo || dep.paidBy || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 whitespace-nowrap">
                          ৳{dep.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        {role === 'admin' && (
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditDeposit(dep)}
                                className="p-1 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
                                title="Edit deposit"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteDepositConfirm(dep.id)}
                                className="p-1 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50"
                                title="Delete deposit"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-neutral-300 rounded-lg text-neutral-500 text-xs">
                No deposits found for FY {selectedYear}. {role === 'admin' && 'Click "+ Add Deposit" or import CSV to add records.'}
              </div>
            )}
          </div>
        )}

        {/* Section 2: Previous Year Expenses Table */}
        {(breakdownView === 'all' || breakdownView === 'expenses') && (
          <div className="space-y-3 pt-4 border-t border-neutral-100">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-bold text-neutral-900 text-sm">
                  FY {selectedYear} Building Maintenance Disbursements
                </span>
                <span className="px-2 py-0.5 bg-rose-50 text-rose-800 text-[10px] font-mono font-bold rounded">
                  ৳{totalYearExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {role === 'admin' && (
                <button
                  onClick={handleOpenAddExpenseForYear}
                  className="text-xs text-neutral-900 hover:underline flex items-center gap-1 font-medium"
                >
                  <Plus className="w-3 h-3" />
                  Add Expense
                </button>
              )}
            </div>

            {filteredExpenses.length > 0 ? (
              <div className="overflow-x-auto border border-neutral-200 rounded-lg">
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-50 text-neutral-700 font-semibold border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3 text-center">Shares</th>
                      <th className="py-2.5 px-3">Vendor / Notes</th>
                      <th className="py-2.5 px-3 text-right">Amount (৳)</th>
                      {role === 'admin' && <th className="py-2.5 px-3 text-center">Actions</th>}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-neutral-50/80 transition-colors">
                        <td className="py-2.5 px-3 font-mono text-neutral-600 whitespace-nowrap">
                          {exp.date}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-900 font-medium max-w-xs truncate">
                          {exp.description}
                        </td>
                        <td className="py-2.5 px-3">
                          <span className="px-1.5 py-0.5 bg-neutral-100 text-neutral-700 text-[10px] font-mono rounded capitalize">
                            {exp.category.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center font-mono text-neutral-600">
                          {exp.numberOfShares || 10}
                        </td>
                        <td className="py-2.5 px-3 text-neutral-500 text-[11px] truncate max-w-[150px]">
                          {exp.vendorName || exp.notes || '-'}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-rose-800 whitespace-nowrap">
                          ৳{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        {role === 'admin' && (
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => handleOpenEditExpense(exp)}
                                className="p-1 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
                                title="Edit expense"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteExpenseConfirm(exp.id)}
                                className="p-1 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50"
                                title="Delete expense"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 text-center border border-dashed border-neutral-300 rounded-lg text-neutral-500 text-xs">
                No maintenance expenses recorded for FY {selectedYear}. {role === 'admin' && 'Click "+ Add Expense" or import CSV to add records.'}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Edit Opening Balance & Archive Modal (Admin Only) */}
      {isEditArchiveModalOpen && role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Edit3 className="w-4 h-4 text-neutral-900" />
                <h3 className="text-base font-bold text-neutral-900">
                  Edit Opening Reserve for FY {selectedYear}
                </h3>
              </div>
              <button
                onClick={() => setIsEditArchiveModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArchiveEdit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Opening Balance for Fiscal Year {selectedYear} (৳)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={editOpeningBalance}
                  onChange={(e) => setEditOpeningBalance(e.target.value)}
                  className="w-full p-2.5 font-mono border border-neutral-300 rounded-lg text-neutral-900"
                />
                <span className="text-[10px] text-neutral-500 mt-1 block">
                  The closing reserve will automatically update based on total deposits minus expenses.
                </span>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Audit Notes / Remarks
                </label>
                <textarea
                  rows={3}
                  value={editArchiveNotes}
                  onChange={(e) => setEditArchiveNotes(e.target.value)}
                  placeholder="e.g. Audited annual maintenance statement for Gulshan View Residency..."
                  className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsEditArchiveModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 font-medium shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Modal for Selected Year (Add / Edit) */}
      {isDepositModalOpen && role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-600" />
                <h3 className="text-base font-bold text-neutral-900">
                  {editingDeposit ? 'Edit Deposit Entry' : `Record Deposit for FY ${selectedYear}`}
                </h3>
              </div>
              <button
                onClick={() => setIsDepositModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDeposit} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Flat</label>
                  <select
                    value={depFormFlat}
                    onChange={(e) => setDepFormFlat(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono bg-white text-neutral-900"
                  >
                    {flats.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.id} ({f.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={depFormDate}
                    onChange={(e) => setDepFormDate(e.target.value)}
                    className="w-full p-2 font-mono border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Amount (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={depFormAmount}
                    onChange={(e) => setDepFormAmount(e.target.value)}
                    placeholder="e.g. 34000.00"
                    className="w-full p-2 font-mono border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Payment Method</label>
                  <select
                    value={depFormMethod}
                    onChange={(e) => setDepFormMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white text-neutral-900"
                  >
                    <option value="DBBL">DBBL Bank Transfer</option>
                    <option value="bKash">bKash</option>
                    <option value="Cash">Cash Receipt</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Nagad">Nagad</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={depFormDesc}
                  onChange={(e) => setDepFormDesc(e.target.value)}
                  placeholder="e.g. Annual maintenance fee Flat AB1 in DBBL"
                  className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Reference No.</label>
                  <input
                    type="text"
                    value={depFormRef}
                    onChange={(e) => setDepFormRef(e.target.value)}
                    placeholder="e.g. DBBL-TX-894523"
                    className="w-full p-2 font-mono border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Paid By (Payer)</label>
                  <input
                    type="text"
                    value={depFormPaidBy}
                    onChange={(e) => setDepFormPaidBy(e.target.value)}
                    placeholder="e.g. Dr. Masudur Rahman"
                    className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={depFormNotes}
                  onChange={(e) => setDepFormNotes(e.target.value)}
                  placeholder="Additional notes"
                  className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsDepositModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-700 text-white rounded-lg hover:bg-emerald-800 font-medium shadow-xs"
                >
                  Save Deposit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Expense Modal for Selected Year (Add / Edit) */}
      {isExpenseModalOpen && role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-neutral-900" />
                <h3 className="text-base font-bold text-neutral-900">
                  {editingExpense ? 'Edit Expense Entry' : `Record Expense for FY ${selectedYear}`}
                </h3>
              </div>
              <button
                onClick={() => setIsExpenseModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveExpense} className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">Description</label>
                <input
                  type="text"
                  required
                  value={expFormDesc}
                  onChange={(e) => setExpFormDesc(e.target.value)}
                  placeholder="e.g. Lift Traction Wire Rope Replacement"
                  className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Total Amount (৳)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={expFormAmount}
                    onChange={(e) => setExpFormAmount(e.target.value)}
                    placeholder="e.g. 82000.00"
                    className="w-full p-2 font-mono border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={expFormDate}
                    onChange={(e) => setExpFormDate(e.target.value)}
                    className="w-full p-2 font-mono border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Category</label>
                  <select
                    value={expFormCategory}
                    onChange={(e) => setExpFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full p-2 border border-neutral-300 rounded-lg bg-white text-neutral-900"
                  >
                    <option value="lift">Lift Maintenance</option>
                    <option value="generator">Generator &amp; Fuel</option>
                    <option value="painting_renovation">Painting &amp; Renovation</option>
                    <option value="water_pump">Water Pump</option>
                    <option value="security_cctv">Security &amp; CCTV</option>
                    <option value="fire_safety">Fire Safety</option>
                    <option value="electrical">Electrical Works</option>
                    <option value="cleaning">Water Tank / Cleaning</option>
                    <option value="tax">Municipal Taxes</option>
                    <option value="adhoc">Ad-hoc Common Repairs</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">Number of Shares</label>
                  <input
                    type="number"
                    value={expFormShares}
                    onChange={(e) => setExpFormShares(parseInt(e.target.value) || 10)}
                    className="w-full p-2 font-mono border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Vendor / Contractor</label>
                <input
                  type="text"
                  value={expFormVendor}
                  onChange={(e) => setExpFormVendor(e.target.value)}
                  placeholder="e.g. Otis Elevator Service BD"
                  className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">Notes</label>
                <input
                  type="text"
                  value={expFormNotes}
                  onChange={(e) => setExpFormNotes(e.target.value)}
                  placeholder="Work order reference or receipt number"
                  className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 font-medium shadow-xs"
                >
                  Save Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Admin-Only Import Previous Year Data Modal */}
      {isImportModalOpen && role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-neutral-900" />
                <h3 className="text-base font-bold text-neutral-900">
                  Import Data for Fiscal Year {targetYear}
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteImport} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Year Selector */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Select Target Year
                  </label>
                  <select
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-lg font-mono text-neutral-900 bg-white"
                  >
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                  </select>
                </div>

                {/* Opening Reserve */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Opening Balance for FY {targetYear} (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 50000.00"
                    value={targetOpeningBalance}
                    onChange={(e) => setTargetOpeningBalance(e.target.value)}
                    className="w-full p-2 font-mono border border-neutral-300 rounded-lg text-neutral-900"
                  />
                </div>
              </div>

              {/* Import Method Toggle */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
                <span className="font-semibold text-neutral-900 block">Choose Import Format</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={importMethod === 'csv'}
                      onChange={() => setImportMethod('csv')}
                      name="import_method"
                    />
                    <span>Itemized CSV Spreadsheet (Detailed Ledger)</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={importMethod === 'summary'}
                      onChange={() => setImportMethod('summary')}
                      name="import_method"
                    />
                    <span>Direct Total Collections &amp; Expenses</span>
                  </label>
                </div>
              </div>

              {importMethod === 'csv' ? (
                <div className="space-y-3">
                  <div className="p-3 border border-dashed border-neutral-300 rounded-lg bg-neutral-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-800">
                        Choose CSV File
                      </span>
                      <button
                        type="button"
                        onClick={handleDownloadSampleCsv}
                        className="text-[11px] text-neutral-600 hover:text-neutral-900 underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download Template
                      </button>
                    </div>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-neutral-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-neutral-900 file:text-white cursor-pointer"
                    />
                    {csvFileName && (
                      <div className="text-emerald-700 font-mono text-[11px]">
                        ✓ Selected: {csvFileName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Or Paste CSV Text Directly
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Paste CSV rows here..."
                      value={csvContentText}
                      onChange={(e) => setCsvContentText(e.target.value)}
                      className="w-full p-2 font-mono text-[11px] border border-neutral-300 rounded-lg text-neutral-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
                  <div>
                    <label className="block text-neutral-700 mb-1">Total Collections in {targetYear} (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={summaryDeposits}
                      onChange={(e) => setSummaryDeposits(e.target.value)}
                      className="w-full p-2 font-mono border border-neutral-300 rounded-lg bg-white text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 mb-1">Total Expenses in {targetYear} (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={summaryExpenses}
                      onChange={(e) => setSummaryExpenses(e.target.value)}
                      className="w-full p-2 font-mono border border-neutral-300 rounded-lg bg-white text-neutral-900"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Audit Notes / Major Works
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Lift traction rope replacement, deep tube-well motor repair..."
                  value={targetNotes}
                  onChange={(e) => setTargetNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-lg text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 font-medium flex items-center gap-1.5 shadow-xs"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Import Year {targetYear} to PostgreSQL
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
