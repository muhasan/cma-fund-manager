import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { 
  Building, 
  Printer, 
  Send, 
  ArrowDownLeft, 
  User, 
  Users, 
  Calendar, 
  Mail, 
  Phone, 
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  Download,
  Edit3
} from 'lucide-react';

interface UnitLedgerViewProps {
  initialFlatId?: string;
  onOpenNewDepositForFlat: (flatId: string) => void;
  onOpenEditFlat?: () => void;
}

export const UnitLedgerView: React.FC<UnitLedgerViewProps> = ({
  initialFlatId,
  onOpenNewDepositForFlat,
  onOpenEditFlat,
}) => {
  const { 
    flats, 
    deposits, 
    expenses, 
    flatSummaries, 
    settings, 
    selectedFlatId, 
    setSelectedFlatId,
    role
  } = useFund();

  const activeFlatId = initialFlatId || selectedFlatId;
  const currentFlat = flats.find((f) => f.id === activeFlatId) || flats[0];
  const summary = flatSummaries.find((s) => s.flatId === currentFlat.id);

  const [yearFilter, setYearFilter] = useState<string>('ALL');

  // Build combined chronological ledger of all debits (expenses) and credits (deposits)
  interface LedgerEntry {
    id: string;
    fiscalYear?: string;
    date: string;
    description: string;
    type: 'debit' | 'credit';
    debitAmount: number;
    creditAmount: number;
    refNo: string;
    details: string;
  }

  const rawEntries: LedgerEntry[] = [];

  // 1. Deposits made by this flat (Credit: increases balance)
  deposits
    .filter((d) => d.flatId === currentFlat.id && (yearFilter === 'ALL' || d.fiscalYear === yearFilter))
    .forEach((d) => {
      rawEntries.push({
        id: d.id,
        fiscalYear: d.fiscalYear,
        date: d.date,
        description: d.description,
        type: 'credit',
        debitAmount: 0,
        creditAmount: d.amount,
        refNo: d.referenceNo || d.paymentMethod,
        details: d.paidBy ? `Deposited by ${d.paidBy} via ${d.paymentMethod}` : `Paid via ${d.paymentMethod}`,
      });
    });

  // 2. Expenses allocated to this flat (Debit: reduces balance)
  expenses
    .filter((e) => yearFilter === 'ALL' || e.fiscalYear === yearFilter)
    .forEach((e) => {
      const allocated = e.allocations?.[currentFlat.id] || 0;
      if (allocated > 0) {
        rawEntries.push({
          id: e.id,
          fiscalYear: e.fiscalYear,
          date: e.date,
          description: e.description,
          type: 'debit',
          debitAmount: allocated,
          creditAmount: 0,
          refNo: e.receiptFileName || 'Voucher',
          details: `${e.numberOfShares} Share Allocation (${currentFlat.shares} shares billed)`,
        });
      }
    });

  // Sort chronologically ascending
  rawEntries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Compute running balance
  let currentRunning = 0;
  const chronologicalLedger = rawEntries.map((item) => {
    // If credit, balance increases (+). If debit, balance decreases (-)
    currentRunning = currentRunning + item.creditAmount - item.debitAmount;
    return {
      ...item,
      runningBalance: currentRunning,
    };
  });

  const isDue = (summary?.balance || 0) < 0;
  const dueAmount = Math.abs(summary?.balance || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Unit Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-neutral-200">
        {flats.map((flat) => {
          const flatSum = flatSummaries.find((s) => s.flatId === flat.id);
          const hasDue = (flatSum?.balance || 0) < 0;
          const isSelected = flat.id === currentFlat.id;

          return (
            <button
              key={flat.id}
              onClick={() => setSelectedFlatId(flat.id)}
              className={`px-3 py-2 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${
                isSelected
                  ? 'bg-neutral-900 text-white shadow-sm'
                  : 'bg-white text-neutral-600 hover:bg-neutral-100 border border-neutral-200'
              }`}
            >
              <span className="font-bold">{flat.id}</span>
              <span className="text-[11px] opacity-80">
                ({flat.shares} {flat.shares > 1 ? 'sh' : 'sh'})
              </span>
              {hasDue && (
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isSelected ? 'bg-amber-400' : 'bg-rose-500'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Official Unit Statement Card */}
      <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6 print:border-none print:p-0">
        {/* Printable Letterhead Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-neutral-900 text-white text-xs font-bold rounded">
                UNIT STATEMENT
              </span>
              <span className="text-xs font-mono text-neutral-500">
                FY {settings.fiscalYear}
              </span>
            </div>
            <h1 className="text-2xl font-bold text-neutral-900 mt-2">
              {currentFlat.name}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              {settings.buildingName} · {settings.complexAddress}
            </p>

            {/* Fiscal Year Filter Buttons */}
            <div className="flex items-center gap-1.5 pt-3 no-print">
              <span className="text-xs text-neutral-500 font-medium">Ledger Year:</span>
              {['ALL', '2026', '2025', '2024', '2023'].map((yr) => (
                <button
                  key={yr}
                  onClick={() => setYearFilter(yr)}
                  className={`px-2.5 py-1 rounded text-xs font-mono font-medium transition-colors ${
                    yearFilter === yr
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {yr === 'ALL' ? 'All Years' : `FY ${yr}`}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 no-print self-start sm:self-auto">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 flex items-center gap-1.5 shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              Print / Save PDF Statement
            </button>
          </div>
        </div>

        {/* Ownership Profile & Share Weights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-lg border border-neutral-200 text-xs">
          {/* Column 1: Share Weight */}
          <div className="space-y-1">
            <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
              Share Weight &amp; Floor
            </span>
            <div className="text-base font-bold text-neutral-900 font-mono">
              {currentFlat.shares} of 10 Total Shares ({((currentFlat.shares / 10) * 100).toFixed(0)}%)
            </div>
            <div className="text-neutral-600">Floor Level: {currentFlat.floor}</div>
            <div className="text-neutral-500 text-[11px]">
              {currentFlat.ownershipType === 'single'
                ? 'Single Proprietor Unit (AB5)'
                : 'Multiple Co-Owners Unit'}
            </div>
          </div>

          {/* Column 2: Co-Owners Register */}
          <div className="space-y-1 md:col-span-2">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-neutral-500 uppercase tracking-wider text-[10px]">
                Registered Unit Owners &amp; Contacts
              </span>
              {onOpenEditFlat && (
                <button
                  onClick={onOpenEditFlat}
                  className="text-[11px] font-medium text-neutral-700 hover:text-neutral-900 underline flex items-center gap-1 no-print"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Update Unit Details</span>
                </button>
              )}
            </div>
            <div className="space-y-1.5 mt-1">
              {currentFlat.coOwners.map((owner) => (
                <div key={owner.id} className="flex flex-wrap items-center justify-between text-neutral-800 border-b border-neutral-200/60 pb-1 last:border-none">
                  <div>
                    <span className="font-bold text-neutral-900">{owner.name}</span>
                    {owner.sharePercent && (
                      <span className="text-neutral-500 text-[11px] ml-1.5">({owner.sharePercent}% co-share)</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-neutral-500 font-mono text-[11px]">
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-neutral-400" />
                      {owner.email}
                    </span>
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      {owner.phone}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Account Balance Summary Stat Bars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-neutral-200 bg-white">
            <div className="text-xs font-medium text-neutral-500">Total Payments Deposited</div>
            <div className="mt-1 text-xl font-bold font-mono text-emerald-800">
              ৳{(summary?.totalDeposited || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Credited via DBBL / bKash / Cash
            </div>
          </div>

          <div className="p-4 rounded-lg border border-neutral-200 bg-white">
            <div className="text-xs font-medium text-neutral-500">Maintenance Expenses Allocated</div>
            <div className="mt-1 text-xl font-bold font-mono text-neutral-900">
              ৳{(summary?.totalExpenseAllocated || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] text-neutral-400 mt-1">
              Based on {currentFlat.shares}-share proportional dues
            </div>
          </div>

          <div className={`p-4 rounded-lg border ${isDue ? 'border-rose-200 bg-rose-50/40' : 'border-emerald-200 bg-emerald-50/40'}`}>
            <div className="text-xs font-medium text-neutral-700">Net Current Balance</div>
            <div className={`mt-1 text-xl font-bold font-mono ${isDue ? 'text-rose-800' : 'text-emerald-800'}`}>
              {isDue ? '-' : '+'}৳{dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </div>
            <div className="text-[11px] font-semibold mt-1">
              {isDue ? 'PAYMENT DUE / OUTSTANDING' : 'CLEARED / CREDIT IN ADVANCE'}
            </div>
          </div>
        </div>

        {/* Itemized Chronological Ledger Table */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-neutral-900">
              Chronological Transaction Ledger
            </h3>
            <span className="text-xs text-neutral-500 font-mono">
              {chronologicalLedger.length} ledger transactions
            </span>
          </div>

          <div className="border border-neutral-200 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                  <th className="py-2.5 px-3 font-semibold">Date</th>
                  <th className="py-2.5 px-3 font-semibold">Description &amp; Reference</th>
                  <th className="py-2.5 px-3 font-semibold">Type</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Debit (Expense)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Credit (Deposit)</th>
                  <th className="py-2.5 px-3 font-semibold text-right">Running Balance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-neutral-800">
                {chronologicalLedger.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-6 text-center text-neutral-500">
                      No transactions recorded for this flat unit yet.
                    </td>
                  </tr>
                ) : (
                  chronologicalLedger.map((row) => (
                    <tr key={row.id} className="hover:bg-neutral-50/60 transition-colors">
                      <td className="py-2.5 px-3 font-mono text-neutral-600 whitespace-nowrap">
                        {row.date}
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="font-semibold text-neutral-900">{row.description}</div>
                        <div className="text-[11px] text-neutral-500">{row.details} · Ref: {row.refNo}</div>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        {row.type === 'credit' ? (
                          <span className="font-semibold text-emerald-800">Deposit</span>
                        ) : (
                          <span className="font-medium text-neutral-600">Maintenance Bill</span>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums text-neutral-900 whitespace-nowrap">
                        {row.debitAmount > 0 ? `৳${row.debitAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-emerald-800 whitespace-nowrap">
                        {row.creditAmount > 0 ? `৳${row.creditAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—'}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold whitespace-nowrap">
                        <span className={row.runningBalance < 0 ? 'text-rose-700' : 'text-emerald-800'}>
                          {row.runningBalance < 0 ? '-' : '+'}৳{Math.abs(row.runningBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-neutral-50 font-bold text-neutral-900 border-t border-neutral-200">
                  <td colSpan={3} className="py-3 px-3">
                    Net Position as of {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-neutral-900">
                    ৳{(summary?.totalExpenseAllocated || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-emerald-800">
                    ৳{(summary?.totalDeposited || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-rose-800">
                    -৳{dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        {/* Bank Transfer Instructions for Outstanding Settlement */}
        {isDue && (
          <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2 text-xs">
            <div className="font-bold text-neutral-900">Settlement Deposit Instructions</div>
            <p className="text-neutral-600">
              Please clear the outstanding amount of <strong className="text-rose-800">৳{dueAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</strong> into the building common account:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 font-mono text-[11px]">
              <div className="p-2.5 bg-white border border-neutral-200 rounded">
                <div className="font-bold text-neutral-900">Dutch-Bangla Bank PLC (DBBL)</div>
                <div className="text-neutral-600">A/C Name: {settings.dbblAccountName}</div>
                <div className="text-neutral-900 font-bold">A/C No: {settings.dbblAccountNo}</div>
                <div className="text-neutral-500">Branch: {settings.dbblBranch}</div>
              </div>
              <div className="p-2.5 bg-white border border-neutral-200 rounded">
                <div className="font-bold text-neutral-900">bKash Mobile Deposit</div>
                <div className="text-neutral-600">Wallet: {settings.bkashNumber}</div>
                <div className="text-neutral-500 mt-1">Mention Flat ID "{currentFlat.id}" in transfer note.</div>
              </div>
            </div>
          </div>
        )}

        {/* Signatures for Print Statement */}
        <div className="pt-8 border-t border-neutral-200 grid grid-cols-2 gap-8 text-xs text-neutral-500 print:block">
          <div>
            <div className="border-b border-neutral-300 w-48 mb-1" />
            <div className="font-semibold text-neutral-900">{settings.adminName}</div>
            <div>Fund Manager &amp; Complex Treasurer</div>
          </div>
          <div className="text-right">
            <div className="border-b border-neutral-300 w-48 ml-auto mb-1" />
            <div className="font-semibold text-neutral-900">Flat Owner Acknowledgment</div>
            <div>{currentFlat.name}</div>
          </div>
        </div>
      </div>
    </div>
  );
};
