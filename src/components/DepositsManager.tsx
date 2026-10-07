import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { Deposit, PaymentMethod } from '../types';
import { 
  ArrowDownLeft, 
  Search, 
  Filter, 
  Plus, 
  Trash2, 
  Edit3, 
  Printer, 
  CheckCircle, 
  CreditCard,
  FileText,
  X
} from 'lucide-react';

export const DepositsManager: React.FC = () => {
  const { 
    deposits, 
    flats, 
    addDeposit, 
    updateDeposit, 
    deleteDeposit, 
    role, 
    settings
  } = useFund();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFlatFilter, setSelectedFlatFilter] = useState('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDeposit, setEditingDeposit] = useState<Deposit | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Deposit | null>(null);

  // Form state
  const [formFlatId, setFormFlatId] = useState('AB1');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formAmount, setFormAmount] = useState('');
  const [formMethod, setFormMethod] = useState<PaymentMethod>('DBBL');
  const [formPaidBy, setFormPaidBy] = useState('');
  const [formRefNo, setFormRefNo] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');

  const selectedFlatObj = flats.find((f) => f.id === formFlatId);

  const filteredDeposits = deposits.filter((dep) => {
    const matchesFlat = selectedFlatFilter === 'ALL' || dep.flatId === selectedFlatFilter;
    const matchesSearch =
      dep.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dep.flatId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (dep.referenceNo && dep.referenceNo.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (dep.paidBy && dep.paidBy.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFlat && matchesSearch;
  });

  const totalFilteredAmount = filteredDeposits.reduce((acc, curr) => acc + curr.amount, 0);

  const handleOpenAddModal = () => {
    setEditingDeposit(null);
    setFormFlatId('AB1');
    setFormDate(new Date().toISOString().slice(0, 10));
    setFormAmount('');
    setFormMethod('DBBL');
    setFormPaidBy('');
    setFormRefNo(`DBBL-FT-${Math.floor(1000000 + Math.random() * 9000000)}`);
    setFormDescription('Received from flat AB1 in DBBL');
    setFormNotes('Annual maintenance contribution');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dep: Deposit) => {
    setEditingDeposit(dep);
    setFormFlatId(dep.flatId);
    setFormDate(dep.date);
    setFormAmount(dep.amount.toString());
    setFormMethod(dep.paymentMethod);
    setFormPaidBy(dep.paidBy || '');
    setFormRefNo(dep.referenceNo || '');
    setFormDescription(dep.description);
    setFormNotes(dep.notes || '');
    setIsModalOpen(true);
  };

  const handleFlatChange = (newFlatId: string) => {
    setFormFlatId(newFlatId);
    const flat = flats.find((f) => f.id === newFlatId);
    if (flat) {
      setFormDescription(`Received from flat ${flat.id} in ${formMethod}`);
      if (flat.coOwners.length > 0) {
        setFormPaidBy(flat.coOwners[0].name);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid deposit amount.');
      return;
    }

    if (editingDeposit) {
      updateDeposit({
        ...editingDeposit,
        flatId: formFlatId,
        date: formDate,
        amount: amountNum,
        paymentMethod: formMethod,
        paidBy: formPaidBy,
        referenceNo: formRefNo,
        description: formDescription,
        notes: formNotes,
      });
    } else {
      addDeposit({
        flatId: formFlatId,
        date: formDate,
        amount: amountNum,
        paymentMethod: formMethod,
        paidBy: formPaidBy,
        referenceNo: formRefNo,
        description: formDescription,
        notes: formNotes,
        verified: true,
      });
    }

    setIsModalOpen(false);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this deposit entry?')) {
      deleteDeposit(id);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Owner Contributions &amp; Deposits
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Tracking individual deposits from all 8 flat accounts across DBBL, bKash, and Cash
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={handleOpenAddModal}
            className="px-3.5 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            Record New Deposit
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-neutral-200">
        {/* Flat Selector Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-xs">
          <button
            onClick={() => setSelectedFlatFilter('ALL')}
            className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
              selectedFlatFilter === 'ALL'
                ? 'bg-neutral-900 text-white'
                : 'text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            All Flats
          </button>
          {flats.map((flat) => (
            <button
              key={flat.id}
              onClick={() => setSelectedFlatFilter(flat.id)}
              className={`px-3 py-1.5 rounded-md font-medium transition-colors whitespace-nowrap ${
                selectedFlatFilter === flat.id
                  ? 'bg-neutral-900 text-white'
                  : 'text-neutral-600 hover:bg-neutral-100'
              }`}
            >
              {flat.id}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search reference, owner, notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>
      </div>

      {/* Deposits Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="p-3 border-b border-neutral-200 bg-neutral-50/50 flex items-center justify-between text-xs text-neutral-600">
          <div>
            Showing <span className="font-semibold text-neutral-900">{filteredDeposits.length}</span> contributions
          </div>
          <div className="font-mono">
            Filtered Total: <span className="font-bold text-emerald-800">৳{totalFilteredAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 text-xs">
                <th className="py-3 px-4 font-semibold">Date</th>
                <th className="py-3 px-4 font-semibold">Flat Unit</th>
                <th className="py-3 px-4 font-semibold">Description</th>
                <th className="py-3 px-3 font-semibold">Paid By / Co-Owner</th>
                <th className="py-3 px-3 font-semibold">Payment Channel</th>
                <th className="py-3 px-4 font-semibold">Reference No</th>
                <th className="py-3 px-4 font-semibold text-right">Amount (BDT)</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {filteredDeposits.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-xs text-neutral-500">
                    No deposits matching the filter criteria.
                  </td>
                </tr>
              ) : (
                filteredDeposits.map((dep) => (
                  <tr key={dep.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Date */}
                    <td className="py-3 px-4 font-mono text-xs whitespace-nowrap text-neutral-600">
                      {dep.date}
                    </td>

                    {/* Flat Unit */}
                    <td className="py-3 px-4 whitespace-nowrap">
                      <span className="font-bold text-neutral-900">{dep.flatId}</span>
                    </td>

                    {/* Description */}
                    <td className="py-3 px-4 text-xs font-medium text-neutral-900">
                      {dep.description}
                      {dep.notes && (
                        <div className="text-neutral-500 text-[11px] font-normal truncate max-w-xs">
                          {dep.notes}
                        </div>
                      )}
                    </td>

                    {/* Paid By */}
                    <td className="py-3 px-3 text-xs text-neutral-600 whitespace-nowrap">
                      {dep.paidBy || 'Unit Primary'}
                    </td>

                    {/* Method */}
                    <td className="py-3 px-3 text-xs whitespace-nowrap">
                      <span className="font-mono text-neutral-700">
                        {dep.paymentMethod}
                      </span>
                    </td>

                    {/* Reference No */}
                    <td className="py-3 px-4 font-mono text-xs text-neutral-500 whitespace-nowrap">
                      {dep.referenceNo || '—'}
                    </td>

                    {/* Amount */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-emerald-800 whitespace-nowrap">
                      ৳{dep.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewingReceipt(dep)}
                          title="View Digital Money Receipt"
                          className="p-1 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        {role === 'admin' && (
                          <>
                            <button
                              onClick={() => handleOpenEditModal(dep)}
                              title="Edit Deposit"
                              className="p-1 text-neutral-500 hover:text-neutral-900 rounded hover:bg-neutral-100 transition-colors"
                            >
                              <Edit3 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(dep.id)}
                              title="Delete Deposit"
                              className="p-1 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-neutral-50 font-semibold text-neutral-900 border-t border-neutral-200 text-xs">
                <td colSpan={6} className="py-3 px-4 text-neutral-600">
                  Total Deposits Recorded
                </td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800">
                  ৳{totalFilteredAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Add / Edit Deposit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                {editingDeposit ? 'Edit Deposit Record' : 'Record Owner Contribution / Deposit'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Flat selection */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Select Flat Unit
                  </label>
                  <select
                    value={formFlatId}
                    onChange={(e) => handleFlatChange(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-md bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    {flats.map((flat) => (
                      <option key={flat.id} value={flat.id}>
                        {flat.id} — {flat.name} ({flat.shares} {flat.shares > 1 ? 'shares' : 'share'})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Date */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Deposit Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                  </input>
                </div>
              </div>

              {/* Paid By Co-Owner */}
              {selectedFlatObj && selectedFlatObj.coOwners.length > 1 && (
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Paid By (Co-Owner Tracking)
                  </label>
                  <select
                    value={formPaidBy}
                    onChange={(e) => setFormPaidBy(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-md bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="">Full Flat Unit (Combined)</option>
                    {selectedFlatObj.coOwners.map((owner) => (
                      <option key={owner.id} value={owner.name}>
                        {owner.name} ({owner.sharePercent ? `${owner.sharePercent}%` : 'Co-owner'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {/* Amount */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Amount Received (৳ BDT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 41598.00"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full p-2 font-mono border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                {/* Payment Channel */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Payment Channel
                  </label>
                  <select
                    value={formMethod}
                    onChange={(e) => setFormMethod(e.target.value as PaymentMethod)}
                    className="w-full p-2 border border-neutral-300 rounded-md bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  >
                    <option value="DBBL">Dutch-Bangla Bank (DBBL)</option>
                    <option value="bKash">bKash Mobile Wallet</option>
                    <option value="Cash">Cash Handover</option>
                    <option value="Bank Transfer">Bank Transfer (Other)</option>
                    <option value="Nagad">Nagad Mobile Wallet</option>
                  </select>
                </div>
              </div>

              {/* Reference No */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Bank Reference / Txn No / Deposit Slip
                </label>
                <input
                  type="text"
                  placeholder="e.g. DBBL-FT-9912048 or Cash Receipt No"
                  value={formRefNo}
                  onChange={(e) => setFormRefNo(e.target.value)}
                  className="w-full p-2 font-mono border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Received from flat A2 in DBBL"
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Internal Ledger Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  placeholder="Additional audit notes or remarks..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors font-medium"
                >
                  {editingDeposit ? 'Save Changes' : 'Confirm & Record Deposit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Deposit Money Receipt Viewer Modal */}
      {viewingReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-neutral-900">
                  Digital Money Receipt
                </h3>
              </div>
              <button
                onClick={() => setViewingReceipt(null)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="border border-neutral-200 rounded-lg p-4 bg-neutral-50 space-y-3 text-xs">
              <div className="text-center pb-2 border-b border-neutral-200">
                <div className="font-bold text-sm text-neutral-900">{settings.buildingName}</div>
                <div className="text-neutral-500">{settings.complexAddress}</div>
                <div className="text-[11px] font-mono text-neutral-400 mt-1">
                  OFFICIAL COMMON FUND MONEY RECEIPT
                </div>
              </div>

              <div className="space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Voucher Ref:</span>
                  <span className="font-bold text-neutral-900">{viewingReceipt.referenceNo || viewingReceipt.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Deposit Date:</span>
                  <span className="text-neutral-900">{viewingReceipt.date}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Flat Unit:</span>
                  <span className="font-bold text-neutral-900">{viewingReceipt.flatId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Depositor Name:</span>
                  <span className="text-neutral-900">{viewingReceipt.paidBy || 'Unit Owners'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Payment Channel:</span>
                  <span className="text-neutral-900">{viewingReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="p-3 bg-white border border-neutral-200 rounded text-center my-2">
                <div className="text-neutral-500 text-[11px]">Amount Credited to Common Fund</div>
                <div className="text-2xl font-bold font-mono text-emerald-800">
                  ৳{viewingReceipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="text-neutral-500 text-[11px] space-y-1">
                <div>Description: {viewingReceipt.description}</div>
                {viewingReceipt.notes && <div>Remarks: {viewingReceipt.notes}</div>}
              </div>

              <div className="pt-2 border-t border-neutral-200 flex justify-between items-center text-[11px] text-neutral-400">
                <span>Verified by Admin</span>
                <span>{settings.adminName}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="px-3 py-1.5 border border-neutral-300 text-neutral-700 rounded-md text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center gap-1"
              >
                <Printer className="w-3.5 h-3.5" />
                Print Receipt
              </button>
              <button
                onClick={() => setViewingReceipt(null)}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
