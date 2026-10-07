import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { Receipt } from '../types';
import { 
  Receipt as ReceiptIcon, 
  Search, 
  Upload, 
  CheckCircle2, 
  FileText, 
  Download, 
  Eye, 
  Trash2, 
  ZoomIn, 
  Printer, 
  X,
  Plus
} from 'lucide-react';

interface ReceiptsPortalProps {
  initialExpenseId?: string | null;
  onClearInitialExpenseId?: () => void;
}

export const ReceiptsPortal: React.FC<ReceiptsPortalProps> = ({
  initialExpenseId,
  onClearInitialExpenseId,
}) => {
  const { receipts, expenses, addReceipt, deleteReceipt, role } = useFund();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(() => {
    if (initialExpenseId) {
      return receipts.find((r) => r.expenseId === initialExpenseId) || null;
    }
    return null;
  });
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);

  // Upload modal states
  const [formTitle, setFormTitle] = useState('');
  const [formVendor, setFormVendor] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().slice(0, 10));
  const [formAmount, setFormAmount] = useState('');
  const [formCategory, setFormCategory] = useState('painting_renovation');
  const [formExpenseId, setFormExpenseId] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ fileName: string; fileUrl: string; fileType: string } | null>(null);

  const filteredReceipts = receipts.filter((r) => {
    const matchesCat = categoryFilter === 'ALL' || r.category === categoryFilter;
    const matchesSearch =
      r.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (r.notes && r.notes.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  const totalReceiptsAmount = filteredReceipts.reduce((sum, r) => sum + r.amount, 0);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setUploadedFile({
          fileName: file.name,
          fileUrl: reader.result as string,
          fileType: file.type || 'image/png',
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExpenseSelectChange = (expId: string) => {
    setFormExpenseId(expId);
    const exp = expenses.find((e) => e.id === expId);
    if (exp) {
      setFormTitle(exp.description);
      setFormVendor(exp.vendorName || 'Authorized Vendor');
      setFormDate(exp.date);
      setFormAmount(exp.amount.toString());
      setFormCategory(exp.category);
    }
  };

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(formAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid amount.');
      return;
    }

    if (!uploadedFile) {
      alert('Please select a receipt document or image to upload.');
      return;
    }

    addReceipt({
      expenseId: formExpenseId || undefined,
      title: formTitle,
      vendorName: formVendor || 'Authorized Contractor',
      date: formDate,
      amount: amountNum,
      fileUrl: uploadedFile.fileUrl,
      fileName: uploadedFile.fileName,
      fileType: uploadedFile.fileType,
      category: formCategory,
      uploadedBy: 'Mahmudul Hasan (Admin)',
      verified: true,
      notes: formNotes,
    });

    setIsUploadModalOpen(false);
    setUploadedFile(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
            Audited Receipts &amp; Expense Vouchers Portal
          </h2>
          <p className="text-xs text-neutral-500 mt-1">
            Complete digital repository of all invoices, money receipts, and cash memos supporting building expenditures
          </p>
        </div>

        {role === 'admin' && (
          <button
            onClick={() => {
              setFormExpenseId('');
              setFormTitle('');
              setFormVendor('');
              setFormDate(new Date().toISOString().slice(0, 10));
              setFormAmount('');
              setFormCategory('painting_renovation');
              setFormNotes('');
              setUploadedFile(null);
              setIsUploadModalOpen(true);
            }}
            className="px-3.5 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap self-start sm:self-auto"
          >
            <Upload className="w-4 h-4" />
            Upload New Receipt
          </button>
        )}
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3 rounded-lg border border-neutral-200">
        <div className="flex items-center gap-2 overflow-x-auto text-xs scrollbar-none pb-1 sm:pb-0">
          <span className="text-neutral-500 font-medium">Filter Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="p-1.5 border border-neutral-200 rounded-md bg-neutral-50 text-neutral-800 text-xs focus:outline-none"
          >
            <option value="ALL">All Categories</option>
            <option value="painting_renovation">Painting &amp; Renovation</option>
            <option value="tax">Holding Tax</option>
            <option value="generator">Generator Servicing</option>
            <option value="lift">Lift Maintenance</option>
            <option value="security_cctv">CCTV Camera Installation</option>
            <option value="water_pump">Water Pump</option>
            <option value="repairs">Garage Repairs</option>
            <option value="cleaning">Water Tank Cleaning</option>
            <option value="fire_safety">Fire Extinguisher</option>
            <option value="electrical">Electrical Work</option>
          </select>
        </div>

        <div className="relative min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search vendor, purpose, voucher ref..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>
      </div>

      {/* Receipts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredReceipts.map((rcp) => (
          <div
            key={rcp.id}
            onClick={() => setSelectedReceipt(rcp)}
            className="bg-white border border-neutral-200 rounded-lg overflow-hidden hover:border-neutral-400 transition-all cursor-pointer group flex flex-col justify-between"
          >
            {/* Voucher Preview Thumbnail */}
            <div className="relative h-44 bg-neutral-100 overflow-hidden border-b border-neutral-200 flex items-center justify-center">
              {rcp.fileUrl.startsWith('data:image') ? (
                <img
                  src={rcp.fileUrl}
                  alt={rcp.title}
                  className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                />
              ) : (
                <div className="p-4 text-center space-y-2">
                  <FileText className="w-10 h-10 text-neutral-400 mx-auto" />
                  <div className="text-xs font-mono font-medium text-neutral-600 truncate max-w-[240px]">
                    {rcp.fileName}
                  </div>
                </div>
              )}
              {/* Verified Stamp Badge */}
              <div className="absolute top-2 right-2 px-2 py-0.5 bg-neutral-900/90 text-white rounded text-[10px] font-mono font-bold flex items-center gap-1 shadow-xs">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                VERIFIED
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-neutral-900 text-sm group-hover:text-neutral-700 transition-colors line-clamp-1">
                    {rcp.title}
                  </h3>
                </div>
                <div className="text-xs text-neutral-500 mt-0.5 truncate">
                  Vendor: {rcp.vendorName}
                </div>
              </div>

              <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">
                    {rcp.date}
                  </div>
                  <div className="text-sm font-bold font-mono text-neutral-900">
                    ৳{rcp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </div>
                </div>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedReceipt(rcp);
                  }}
                  className="px-2.5 py-1 text-xs font-medium text-neutral-900 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors flex items-center gap-1"
                >
                  <Eye className="w-3.5 h-3.5" />
                  Inspect
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox / Voucher Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-neutral-900">
                    {selectedReceipt.title}
                  </h3>
                  <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded font-mono">
                    AUDITED VOUCHER
                  </span>
                </div>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Vendor: {selectedReceipt.vendorName} · Issued on {selectedReceipt.date}
                </p>
              </div>
              <button
                onClick={() => {
                  setSelectedReceipt(null);
                  if (onClearInitialExpenseId) onClearInitialExpenseId();
                }}
                className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body Preview */}
            <div className="p-4 overflow-y-auto flex-1 bg-neutral-100 flex items-center justify-center">
              {selectedReceipt.fileUrl.startsWith('data:') ? (
                <img
                  src={selectedReceipt.fileUrl}
                  alt={selectedReceipt.title}
                  className="max-h-[60vh] max-w-full rounded shadow-md border border-neutral-200 bg-white"
                />
              ) : (
                <div className="p-8 text-center bg-white rounded-lg border border-neutral-200 max-w-md">
                  <FileText className="w-12 h-12 text-neutral-400 mx-auto mb-2" />
                  <div className="font-bold text-neutral-900">{selectedReceipt.fileName}</div>
                  <div className="text-xs text-neutral-500 mt-1">
                    Voucher document attached to expense ledger.
                  </div>
                </div>
              )}
            </div>

            {/* Footer Summary */}
            <div className="p-4 border-t border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="font-mono">
                <span className="text-neutral-500">Authorized Disbursement: </span>
                <span className="font-bold text-neutral-900 text-base">
                  ৳{selectedReceipt.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 font-medium flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print Voucher
                </button>
                <a
                  href={selectedReceipt.fileUrl}
                  download={selectedReceipt.fileName}
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 font-medium flex items-center gap-1.5 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download File
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload New Receipt Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <h3 className="text-base font-bold text-neutral-900">
                Upload Scanned Receipt / Invoice Voucher
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4 text-xs">
              {/* Optional Link to Existing Expense */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Link to Recorded Maintenance Expense (Optional)
                </label>
                <select
                  value={formExpenseId}
                  onChange={(e) => handleExpenseSelectChange(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md bg-white text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                >
                  <option value="">-- Standalone / Unlinked Receipt --</option>
                  {expenses.map((exp) => (
                    <option key={exp.id} value={exp.id}>
                      {exp.date} — {exp.description} (৳{exp.amount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Receipt Purpose / Invoice Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Nippon Paint Bulk Weathercoat Purchase"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              {/* Vendor */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Vendor / Contractor / Merchant Name
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. M/S Ratan Hardware & Paints"
                  value={formVendor}
                  onChange={(e) => setFormVendor(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Date */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Invoice Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>

                {/* Amount */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Verified Amount (৳ BDT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 134645.80"
                    value={formAmount}
                    onChange={(e) => setFormAmount(e.target.value)}
                    className="w-full p-2 font-mono border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {/* File upload */}
              <div className="p-3 border border-dashed border-neutral-300 rounded-md bg-neutral-50 space-y-2">
                <label className="block font-medium text-neutral-800">
                  Select Receipt Image or PDF File
                </label>
                <input
                  type="file"
                  required
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="block w-full text-xs text-neutral-500 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-medium file:bg-neutral-900 file:text-white hover:file:bg-neutral-800 cursor-pointer"
                />
                {uploadedFile && (
                  <div className="text-emerald-700 font-mono text-[11px] pt-1">
                    ✓ Selected: {uploadedFile.fileName}
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Audit Notes / Material Quantities
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. 4 drums exterior primer, 8 drums weathercoat..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900 focus:outline-none focus:ring-1 focus:ring-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 font-medium"
                >
                  Upload &amp; Verify Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
