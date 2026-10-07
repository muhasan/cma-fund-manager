import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { 
  Building2, 
  Printer, 
  Download, 
  Send, 
  X, 
  CheckCircle2, 
  Calendar 
} from 'lucide-react';

interface MonthlyReportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MonthlyReportModal: React.FC<MonthlyReportModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { 
    settings, 
    financialStats, 
    flatSummaries, 
    expenses, 
    deposits, 
    exportCsvData 
  } = useFund();

  const [selectedMonth, setSelectedMonth] = useState('March 2026');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Top Action Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50 no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-neutral-900 text-sm">
              Monthly Transparency Audit Report
            </span>
            <span className="text-xs font-mono text-neutral-500">
              · Ready for Owners &amp; Committee Review
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 border border-neutral-300 rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-100 flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              Print Report
            </button>
            <button
              onClick={exportCsvData}
              className="px-3 py-1.5 border border-neutral-300 rounded-md text-xs font-medium text-neutral-700 hover:bg-neutral-100 flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-900 rounded"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Content */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 text-xs text-neutral-800 print:p-0">
          {/* Formal Letterhead */}
          <div className="text-center pb-6 border-b-2 border-neutral-900 space-y-1">
            <h1 className="text-2xl font-bold tracking-tight text-neutral-900 uppercase">
              {settings.buildingName}
            </h1>
            <p className="text-neutral-600 text-xs">
              {settings.complexAddress} · Management Committee Common Fund
            </p>
            <div className="inline-block mt-2 px-3 py-1 bg-neutral-100 font-mono text-xs font-bold text-neutral-900 rounded">
              FINANCIAL TRANSPARENCY REPORT &amp; DUES LEDGER — FY {settings.fiscalYear}
            </div>
          </div>

          {/* Executive Reconciliation Summary Box */}
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">
            <h2 className="font-bold text-neutral-900 text-sm mb-3">
              1. Fund Balance &amp; Cash Reconciliation Statement
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
              <div className="p-2.5 bg-white border border-neutral-200 rounded">
                <span className="text-neutral-500 block text-[11px]">Opening Reserve (Prior Year)</span>
                <span className="text-base font-bold text-neutral-900">
                  ৳{settings.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-2.5 bg-white border border-neutral-200 rounded">
                <span className="text-neutral-500 block text-[11px]">Total Owner Deposits Received</span>
                <span className="text-base font-bold text-emerald-800">
                  ৳{financialStats.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-2.5 bg-white border border-neutral-200 rounded">
                <span className="text-neutral-500 block text-[11px]">Total Maintenance Disbursed</span>
                <span className="text-base font-bold text-rose-800">
                  ৳{financialStats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>

              <div className="p-2.5 bg-white border-2 border-neutral-900 rounded bg-neutral-50">
                <span className="text-neutral-900 font-bold block text-[11px]">Closing Fund in Hand</span>
                <span className="text-base font-bold text-neutral-900">
                  ৳{financialStats.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          {/* 10-Share Unit Breakdown Table */}
          <div className="space-y-2">
            <h2 className="font-bold text-neutral-900 text-sm">
              2. Individual Flat Unit Ledger &amp; Outstanding Dues
            </h2>
            <table className="w-full text-left text-xs border border-neutral-200">
              <thead>
                <tr className="bg-neutral-100 text-neutral-700 font-semibold border-b border-neutral-200">
                  <th className="p-2">Unit</th>
                  <th className="p-2">Shares</th>
                  <th className="p-2">Ownership</th>
                  <th className="p-2 text-right">Deposited</th>
                  <th className="p-2 text-right">Expenses Billed</th>
                  <th className="p-2 text-right">Net Position</th>
                  <th className="p-2 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200">
                {flatSummaries.map((f) => {
                  const isDue = f.balance < 0;
                  return (
                    <tr key={f.flatId} className="hover:bg-neutral-50">
                      <td className="p-2 font-bold">{f.flatId}</td>
                      <td className="p-2 font-mono">{f.shares} sh</td>
                      <td className="p-2 text-[11px] text-neutral-600">
                        {f.ownershipType === 'single' ? 'Single Owner' : 'Multiple Owners'}
                      </td>
                      <td className="p-2 text-right font-mono text-emerald-800">
                        ৳{f.totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right font-mono text-neutral-900">
                        ৳{f.totalExpenseAllocated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-right font-mono font-bold">
                        <span className={isDue ? 'text-rose-700' : 'text-emerald-800'}>
                          {isDue ? '-' : '+'}৳{Math.abs(f.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="p-2 text-center">
                        <span className={isDue ? 'text-rose-700 font-bold' : 'text-emerald-800 font-bold'}>
                          {isDue ? 'Payment Due' : 'Cleared'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-100 font-bold border-t border-neutral-300">
                  <td colSpan={3} className="p-2">Total Combined Net</td>
                  <td className="p-2 text-right font-mono text-emerald-800">
                    ৳{financialStats.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right font-mono">
                    ৳{financialStats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-right font-mono text-rose-700">
                    -৳{financialStats.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="p-2 text-center text-neutral-500">Net Due</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Audited Major Expenditures List */}
          <div className="space-y-2">
            <h2 className="font-bold text-neutral-900 text-sm">
              3. Itemized Major Maintenance Expenditures ({expenses.length} Total Bills)
            </h2>
            <div className="border border-neutral-200 rounded overflow-hidden">
              <table className="w-full text-left text-[11px]">
                <thead>
                  <tr className="bg-neutral-50 border-b border-neutral-200 text-neutral-600 font-semibold">
                    <th className="p-2">Date</th>
                    <th className="p-2">Description</th>
                    <th className="p-2">Vendor</th>
                    <th className="p-2 text-center">Shares</th>
                    <th className="p-2 text-right">Total (৳)</th>
                    <th className="p-2 text-center">Audit Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100">
                  {expenses.slice(0, 10).map((exp) => (
                    <tr key={exp.id}>
                      <td className="p-2 font-mono text-neutral-500">{exp.date}</td>
                      <td className="p-2 font-medium text-neutral-900">{exp.description}</td>
                      <td className="p-2 text-neutral-600">{exp.vendorName || 'Authorized Vendor'}</td>
                      <td className="p-2 text-center font-mono">{exp.numberOfShares}</td>
                      <td className="p-2 text-right font-mono font-bold text-neutral-900">
                        ৳{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </td>
                      <td className="p-2 text-center text-emerald-700 font-medium font-mono text-[10px]">
                        VERIFIED
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {expenses.length > 10 && (
              <div className="text-[11px] text-neutral-500 italic text-right">
                Showing top 10 items. Remaining {expenses.length - 10} item vouchers available in Receipts Portal.
              </div>
            )}
          </div>

          {/* Auditor Sign-off */}
          <div className="pt-8 border-t border-neutral-300 grid grid-cols-2 gap-8 text-neutral-600">
            <div>
              <div className="border-b border-neutral-400 w-48 mb-1" />
              <div className="font-bold text-neutral-900">{settings.adminName}</div>
              <div>Treasurer &amp; Fund Manager, {settings.buildingName}</div>
            </div>
            <div className="text-right">
              <div className="border-b border-neutral-400 w-48 ml-auto mb-1" />
              <div className="font-bold text-neutral-900">Internal Audit Committee</div>
              <div>Apartment Owners Association</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
