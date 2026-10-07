import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { Expense, ExpenseCategory, BillingFrequency } from '../types';
import { 
  ArrowUpRight, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  Receipt, 
  FileText, 
  ExternalLink, 
  Upload, 
  Sliders, 
  X,
  Eye
} from 'lucide-react';

interface ExpensesManagerProps {
  onOpenReceiptViewer: (expenseId: string) => void;
}

export const ExpensesManager: React.FC<ExpensesManagerProps> = ({ onOpenReceiptViewer }) => {
  const { 
    expenses, 
    flats, 
    addExpense, 
    updateExpense, 
    deleteExpense, 
    role, 
    receipts 
  } = useFund();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [frequencyFilter, setFrequencyFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

  // Form states
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState<ExpenseCategory>('painting_renovation');
  const [formFrequency, setFormFrequency] = useState<BillingFrequency>('adhoc');
  const [formAmount, setFormAmount] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [splitMode, setSplitMode] = useState<'standard' | 'custom'>('standard');
  const [customAllocations, setCustomAllocations] = useState<Record<string, string>>({
    AB1: '',
    A2: '',
    B2: '',
    A3: '',
    B3: '',
    A4: '',
    B4: '',
    AB5: '',
  });

  // Attached receipt data
  const [receiptFilePreview, setReceiptFilePreview] = useState<{ fileName: string; fileUrl: string } | null>(null);

  const filteredExpenses = expenses.filter((exp) => {
    const matchesCat = categoryFilter === 'ALL' || exp.category === categoryFilter;
    const matchesFreq = frequencyFilter === 'ALL' || exp.billingFrequency === frequencyFilter;
    const matchesSearch =
      exp.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (exp.vendorName && exp.vendorName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (exp.notes && exp.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesFreq && matchesSearch;
  });

  const totalFilteredAmount = filteredExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  const handleOpenAddModal = () => {
    setEditingExpense(null);
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormDescription('');
    setFormCategory('painting_renovation');
    setFormFrequency('adhoc');
    setFormAmount('');
    setFormVendor('');
    setFormNotes('');
    setSplitMode('standard');
    setCustomAllocations({
      AB1: '',
      A2: '',
      B2: '',
      A3: '',
      B3: '',
      A4: '',
      B4: '',
      AB5: '',
    });
    setReceiptFilePreview(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (exp: Expense) => {
    setEditingExpense(exp);
    setFormDate(exp.date);
    setFormDescription(exp.description);
    setFormCategory(exp.category);
    setFormFrequency(exp.billingFrequency);
    setFormAmount(exp.amount.toString());
    setFormVendor(exp.vendorName || '');
    setFormNotes(exp.notes || '');
    setSplitMode('custom');
    const existingAlloc: Record<string, string> = {};
    flats.forEach((f) => {
      existingAlloc[f.id] = (exp.allocations[f.id] || 0).toString();
    });
    setCustomAllocations(existingAlloc);
    setIsModalOpen(true);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setReceiptFilePreview({
          fileName: file.name,
          fileUrl: reader.result as string,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const calculateAllocations = (total: number): { allocations: Record<string, number>; shares: number; perFlatBase: number } => {
    if (splitMode === 'standard') {
      // 10 shares: AB1=2, A2=1, B2=1, A3=1, B3=1, A4=1, B4=1, AB5=2
      const perShare = total / 10;
      const allocations: Record<string, number> = {
        AB1: Math.round(perShare * 2 * 100) / 100,
        A2: Math.round(perShare * 100) / 100,
        B2: Math.round(perShare * 100) / 100,
        A3: Math.round(perShare * 100) / 100,
        B3: Math.round(perShare * 100) / 100,
        A4: Math.round(perShare * 100) / 100,
        B4: Math.round(perShare * 100) / 100,
        AB5: Math.round(perShare * 2 * 100) / 100,
      };
      return { allocations, shares: 10, perFlatBase: Math.round(perShare) };
    } else {
      const allocations: Record<string, number> = {};
      let participatingCount = 0;
      flats.forEach((f) => {
        const val = parseFloat(customAllocations[f.id] || '0');
        allocations[f.id] = isNaN(val) ? 0 : val;
        if (allocations[f.id] > 0) participatingCount++;
      });
      return {
        allocations,
        shares: participatingCount,
        perFlatBase: participatingCount > 0 ? Math.round(total / participatingCount) : 0,
      };
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const totalAmount = parseFloat(formAmount);
    if (isNaN(totalAmount) || totalAmount <= 0) {
      alert('Please enter a valid expense total amount.');
      return;
    }

    const { allocations, shares, perFlatBase } = calculateAllocations(totalAmount);

    if (editingExpense) {
      updateExpense({
        ...editingExpense,
        date: formDate,
        description: formDescription,
        category: formCategory,
        billingFrequency: formFrequency,
        amount: totalAmount,
        vendorName: formVendor,
        notes: formNotes,
        numberOfShares: shares,
        perFlatBase,
        allocations,
      });
    } else {
      addExpense(
        {
          date: formDate,
          description: formDescription,
          category: formCategory,
          billingFrequency: formFrequency,
          amount: totalAmount,
          vendorName: formVendor,
          notes: formNotes,
          numberOfShares: shares,
          perFlatBase,
          allocations,
          receiptVerified: true,
        },
        receiptFilePreview || undefined
      );
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Delete this expense and its linked receipt voucher?')) {
      deleteExpense(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Post Bill CTA */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Building Maintenance &amp; Expenditure Ledger
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Itemized bills allocated proportionally across 10 apartment shares with verified vouchers
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Post Maintenance Bill
          </button>
        )}
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-neutral-200">
        {/* Category Filter */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs scrollbar-none pb-1 md:pb-0">
          <span className="text-neutral-500 font-medium">Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-1.5 border border-neutral-200 rounded-md bg-neutral-50 text-neutral-800 text-xs focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="painting_renovation">Painting &amp; Renovation</option>
            <option value="tax">Holding Tax</option>
            <option value="generator">Generator Servicing</option>
            <option value="lift">Lift AMC</option>
            <option value="security_cctv">CCTV Security</option>
            <option value="water_pump">Water Pump</option>
            <option value="repairs">Structural Repairs</option>
            <option value="cleaning">Tank Cleaning</option>
            <option value="fire_safety">Fire Safety</option>
            <option value="electrical">Electrical</option>
          </select>

          <span className="text-neutral-500 font-medium ml-2">Cadence:</span>
          <select
            value={frequencyFilter}
            onChange={(e) => setFrequencyFilter(e.target.value)}
            className="p-1.5 border border-neutral-200 rounded-md bg-neutral-50 text-neutral-800 text-xs focus:outline-none"
          >
            <option value="ALL">All Frequencies</option>
            <option value="yearly">Yearly Maintenance</option>
            <option value="monthly">Monthly Recurring</option>
            <option value="adhoc">Ad-hoc Maintenance</option>
          </select>
        </div>

        {/* Search */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search expense description, vendor..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="p-3 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-600">
          <div>
            Showing <span className="font-semibold text-neutral-900">{filteredExpenses.length}</span> audited maintenance expenditures
          </div>
          <div className="font-mono">
            Total Expenditures: <span className="font-bold text-rose-800">৳{totalFilteredAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 text-xs">
                <th className="py-3 px-3 font-semibold">Date</th>
                <th className="py-3 px-3 font-semibold">Description &amp; Vendor</th>
                <th className="py-3 px-2 font-semibold text-center">Shares</th>
                <th className="py-3 px-3 font-semibold text-right">Amount</th>
                <th className="py-3 px-2 font-semibold text-right">Base</th>
                {/* 8 Flats Unit Breakdown Columns */}
                <th className="py-3 px-2 font-semibold text-right bg-neutral-100/50">AB1</th>
                <th className="py-3 px-2 font-semibold text-right">A2</th>
                <th className="py-3 px-2 font-semibold text-right">B2</th>
                <th className="py-3 px-2 font-semibold text-right">A3</th>
                <th className="py-3 px-2 font-semibold text-right">B3</th>
                <th className="py-3 px-2 font-semibold text-right">A4</th>
                <th className="py-3 px-2 font-semibold text-right">B4</th>
                <th className="py-3 px-2 font-semibold text-right bg-neutral-100/50">AB5</th>
                <th className="py-3 px-3 font-semibold text-center">Receipt</th>
                <th className="py-3 px-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800 text-xs">
              {filteredExpenses.map((exp) => {
                const hasReceipt = receipts.some((r) => r.expenseId === exp.id || r.title === exp.description);
                return (
                  <tr key={exp.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Date */}
                    <td className="py-3 px-3 font-mono text-[11px] text-neutral-600 whitespace-nowrap">
                      {exp.date}
                    </td>

                    {/* Description */}
                    <td className="py-3 px-3 max-w-[200px]">
                      <div className="font-semibold text-neutral-900 truncate">
                        {exp.description}
                      </div>
                      <div className="text-[11px] text-neutral-500 truncate">
                        {exp.vendorName || 'Authorized Vendor'}
                      </div>
                    </td>

                    {/* Shares */}
                    <td className="py-3 px-2 font-mono text-center text-neutral-600 whitespace-nowrap">
                      {exp.numberOfShares}
                    </td>

                    {/* Total Amount */}
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-neutral-900 whitespace-nowrap">
                      ৳{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Base per flat */}
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-neutral-500 whitespace-nowrap">
                      {exp.perFlatBase ? exp.perFlatBase.toLocaleString() : '—'}
                    </td>

                    {/* Unit share allocations */}
                    <td className="py-3 px-2 text-right font-mono tabular-nums font-medium bg-neutral-50/50 text-neutral-900 whitespace-nowrap">
                      {(exp.allocations?.AB1 || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-neutral-700 whitespace-nowrap">
                      {(exp.allocations?.A2 || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-neutral-700 whitespace-nowrap">
                      {(exp.allocations?.B2 || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-neutral-700 whitespace-nowrap">
                      {(exp.allocations?.A3 || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-neutral-700 whitespace-nowrap">
                      {(exp.allocations?.B3 || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-neutral-700 whitespace-nowrap">
                      {(exp.allocations?.A4 || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums text-neutral-700 whitespace-nowrap">
                      {(exp.allocations?.B4 || 0).toLocaleString()}
                    </td>
                    <td className="py-3 px-2 text-right font-mono tabular-nums font-medium bg-neutral-50/50 text-neutral-900 whitespace-nowrap">
                      {(exp.allocations?.AB5 || 0).toLocaleString()}
                    </td>

                    {/* Receipt Status */}
                    <td className="py-3 px-3 text-center whitespace-nowrap">
                      {hasReceipt ? (
                        <button
                          onClick={() => onOpenReceiptViewer(exp.id)}
                          className="text-[11px] font-medium text-emerald-800 hover:text-emerald-950 underline underline-offset-2 flex items-center justify-center gap-1 mx-auto"
                        >
                          <Receipt className="w-3.5 h-3.5" />
                          View
                        </button>
                      ) : (
                        <span className="text-[10px] text-neutral-400">Missing</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-3 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onOpenReceiptViewer(exp.id)}
                          title="View Receipt"
                          className="p-1 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        {role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(exp)}
                              title="Edit Expense"
                              className="p-1 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleDelete(exp.id)}
                              title="Delete Expense"
                              className="p-1 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-50 font-bold text-neutral-900 border-t border-neutral-200 text-xs">
                <td colSpan={3} className="py-3 px-3">Total Allocated Expenditures</td>
                <td className="py-3 px-3 text-right font-mono text-rose-800">
                  ৳{totalFilteredAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-2"></td>
                {/* Sum for each flat */}
                {['AB1', 'A2', 'B2', 'A3', 'B3', 'A4', 'B4', 'AB5'].map((flatId) => {
                  const flatSum = filteredExpenses.reduce((s, e) => s + (e.allocations?.[flatId] || 0), 0);
                  return (
                    <td key={flatId} className="py-3 px-2 text-right font-mono tabular-nums text-neutral-900">
                      ৳{flatSum.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                    </td>
                  );
                })}
                <td colSpan={2} className="py-3 px-3"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                {editingExpense ? 'Edit Maintenance Bill' : 'Post Maintenance Bill / Expense'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Description */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Expense Title / Purpose
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Lift Servicing for Oct or Nippon Paint"
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                {/* Vendor */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Contractor / Vendor Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Sigma Elevator Bangladesh Ltd."
                    value={formVendor}
                    onChange={(e) => setFormVendor(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {/* Date */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Expense Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                {/* Category */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as ExpenseCategory)}
                    className="w-full p-2 border border-neutral-300 rounded-md bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="painting_renovation">Painting &amp; Renovation</option>
                    <option value="generator">Generator Servicing</option>
                    <option value="lift">Lift AMC &amp; Repairs</option>
                    <option value="tax">Holding Tax</option>
                    <option value="repairs">Structural Repairs</option>
                    <option value="water_pump">Water Pump</option>
                    <option value="security_cctv">CCTV Security</option>
                    <option value="cleaning">Water Tank Cleaning</option>
                    <option value="fire_safety">Fire Safety</option>
                    <option value="electrical">Electrical</option>
                    <option value="adhoc">Adhoc Maintenance</option>
                  </select>
                </div>

                {/* Billing Frequency */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Billing Cadence
                  </label>
                  <select
                    value={formFrequency}
                    onChange={(e) => setFormFrequency(e.target.value as BillingFrequency)}
                    className="w-full p-2 border border-neutral-300 rounded-md bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="adhoc">Ad-hoc</option>
                    <option value="monthly">Monthly</option>
                    <option value="yearly">Yearly</option>
                    <option value="daily">Daily</option>
                  </select>
                </div>
              </div>

              {/* Amount */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Total Bill Amount (৳ BDT)
                </label>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="e.g. 50000.00"
                  value={formAmount}
                  onChange={(e) => setFormAmount(e.target.value)}
                  className="w-full p-2 font-mono text-base font-bold border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              {/* Share Split Method */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-neutral-900">
                    Expense Split Allocation Rule
                  </span>
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        checked={splitMode === 'standard'}
                        onChange={() => setSplitMode('standard')}
                        name="split_mode"
                      />
                      <span>Standard 10 Shares</span>
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer ml-3">
                      <input
                        type="radio"
                        checked={splitMode === 'custom'}
                        onChange={() => setSplitMode('custom')}
                        name="split_mode"
                      />
                      <span>Custom Allocation</span>
                    </label>
                  </div>
                </div>

                {splitMode === 'standard' ? (
                  <p className="text-neutral-500 text-[11px]">
                    Automatic 10-Share distribution: AB1 receives 2 shares (20%), AB5 receives 2 shares (20%), and other 6 flats receive 1 share each (10%).
                  </p>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-neutral-200">
                    {flats.map((flat) => (
                      <div key={flat.id}>
                        <label className="block font-mono text-[11px] text-neutral-600 mb-0.5">
                          {flat.id} ({flat.shares}sh)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="৳ 0.00"
                          value={customAllocations[flat.id] || ''}
                          onChange={(e) =>
                            setCustomAllocations((prev) => ({
                              ...prev,
                              [flat.id]: e.target.value,
                            }))
                          }
                          className="w-full p-1.5 font-mono text-xs border border-neutral-300 rounded bg-white text-neutral-900"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Receipt Upload */}
              <div className="p-3 border border-dashed border-neutral-300 rounded-md bg-neutral-50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-neutral-800">
                    Attach Invoice / Receipt Voucher
                  </span>
                  <span className="text-neutral-400 text-[11px]">JPG, PNG, PDF</span>
                </div>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleFileUpload}
                  className="block w-full text-xs text-neutral-500 file:mr-2 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-neutral-900 file:text-white hover:file:bg-neutral-800"
                />
                {receiptFilePreview && (
                  <div className="text-emerald-700 font-mono text-[11px]">
                    ✓ Uploaded: {receiptFilePreview.fileName}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Scope of Work &amp; Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Detail work done, materials purchased, warranty info..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 font-medium"
                >
                  {editingExpense ? 'Save Changes' : 'Post & Disburse Bill'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
