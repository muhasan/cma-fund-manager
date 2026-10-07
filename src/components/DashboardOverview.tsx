import React from 'react';
import { useFund } from '../context/FundContext';
import { 
  Wallet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Building, 
  AlertCircle, 
  CheckCircle2, 
  FileText, 
  Send, 
  Users, 
  Receipt,
  Download
} from 'lucide-react';

interface DashboardOverviewProps {
  onSelectFlat: (flatId: string) => void;
  onOpenNewDeposit: () => void;
  onOpenNewExpense: () => void;
  onOpenPreviousYears: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onSelectFlat,
  onOpenNewDeposit,
  onOpenNewExpense,
  onOpenPreviousYears,
}) => {
  const { 
    settings, 
    financialStats, 
    flatSummaries, 
    expenses, 
    deposits, 
    role, 
    exportCsvData 
  } = useFund();

  // Category aggregations for expenses
  const categoryTotals = expenses.reduce((acc, exp) => {
    acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryLabels: Record<string, string> = {
    painting_renovation: 'Exterior Painting & Renovation',
    security_cctv: 'CCTV Security System',
    tax: 'Municipal Holding Tax',
    generator: 'Generator Maintenance & Fuel',
    repairs: 'Garage & Structural Repairs',
    lift: 'Elevator Maintenance (Sigma AMC)',
    cleaning: 'Water Reservoir Cleaning & Hygiene',
    fire_safety: 'Fire Extinguisher & Safety Refill',
    water_pump: 'Water Pump Repair & Capacitor',
    electrical: 'Electrical Works',
    adhoc: 'Adhoc Maintenance',
  };

  const sortedCategories = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-8">
      {/* Header Info Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-neutral-200">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-900">
            {settings.buildingName}
          </h1>
          <div className="flex items-center gap-2 text-xs text-neutral-500 mt-1">
            <span>{settings.complexAddress}</span>
            <span aria-hidden="true">·</span>
            <span>Fiscal Year: {settings.fiscalYear}</span>
            <span aria-hidden="true">·</span>
            <span>8 Physical Flats (10 Total Share Units)</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {role === 'admin' && (
            <>
              <button
                onClick={onOpenNewDeposit}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5"
              >
                <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-400" />
                Record Deposit
              </button>
              <button
                onClick={onOpenNewExpense}
                className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-800 rounded-md text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
              >
                <ArrowUpRight className="w-3.5 h-3.5 text-rose-500" />
                Post Expense Bill
              </button>
              <button
                onClick={onOpenPreviousYears}
                className="px-3 py-1.5 bg-white border border-neutral-300 text-neutral-800 rounded-md text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center gap-1.5"
              >
                <Building className="w-3.5 h-3.5 text-neutral-600" />
                Previous Years Data
              </button>
            </>
          )}
        </div>
      </div>

      {/* Top Financial Stat Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Opening Balance */}
        <div className="p-4 rounded-lg bg-white border border-neutral-200">
          <div className="text-xs font-medium text-neutral-500">Balance From Last Year</div>
          <div className="mt-2 text-xl font-bold font-mono text-neutral-900 tracking-tight">
            ৳{financialStats.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Initial opening reserve fund
          </div>
        </div>

        {/* Card 2: Total Received */}
        <div className="p-4 rounded-lg bg-white border border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Total Funds Received</span>
            <span className="text-emerald-700 text-xs font-semibold">+ Inflow</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-emerald-800 tracking-tight">
            ৳{financialStats.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            {deposits.length} owner contributions
          </div>
        </div>

        {/* Card 3: Total Spent */}
        <div className="p-4 rounded-lg bg-white border border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Total Maintenance Spent</span>
            <span className="text-rose-700 text-xs font-semibold">- Outflow</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-rose-800 tracking-tight">
            ৳{financialStats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            {expenses.length} audited expense vouchers
          </div>
        </div>

        {/* Card 4: Current Fund Balance */}
        <div className="p-4 rounded-lg bg-white border border-neutral-900/40 bg-neutral-50/50">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-900">Current Fund Balance</span>
            <span className="w-2 h-2 rounded-full bg-emerald-700" />
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-neutral-900 tracking-tight">
            ৳{financialStats.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-neutral-600">
            In Bank (DBBL) &amp; Cash hand
          </div>
        </div>

        {/* Card 5: Net Outstanding Dues */}
        <div className="p-4 rounded-lg bg-white border border-neutral-200">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-neutral-500">Outstanding Owner Dues</span>
            <span className="text-amber-800 text-xs font-semibold">Payable</span>
          </div>
          <div className="mt-2 text-xl font-bold font-mono text-amber-800 tracking-tight">
            ৳{financialStats.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="mt-1 text-xs text-neutral-500">
            Across 8 flat share accounts
          </div>
        </div>
      </div>

      {/* 10-Share Unit Balances Ledger Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-semibold text-neutral-900">
              10-Share Unit Ledger &amp; Balance Summary
            </h2>
            <p className="text-xs text-neutral-500 mt-0.5">
              Tracks individual payments vs total maintenance expenses billed to each flat
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={exportCsvData}
              className="px-2.5 py-1 text-xs font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5" />
              Download Audit CSV
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200 text-xs">
                <th className="py-3 px-4 font-semibold">Flat Unit</th>
                <th className="py-3 px-3 font-semibold">Share Weight</th>
                <th className="py-3 px-4 font-semibold">Ownership Type</th>
                <th className="py-3 px-4 font-semibold">Contact / Co-Owners</th>
                <th className="py-3 px-4 font-semibold text-right">Total Deposited</th>
                <th className="py-3 px-4 font-semibold text-right">Expenses Billed</th>
                <th className="py-3 px-4 font-semibold text-right">Current Balance</th>
                <th className="py-3 px-4 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {flatSummaries.map((flat) => {
                const isDue = flat.balance < 0;
                const sharePercent = (flat.shares / financialStats.totalShares) * 100;

                return (
                  <tr
                    key={flat.flatId}
                    className="hover:bg-neutral-50/80 transition-colors group cursor-pointer"
                    onClick={() => onSelectFlat(flat.flatId)}
                  >
                    {/* Flat Unit */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-neutral-900">{flat.flatId}</div>
                      <div className="text-xs text-neutral-500">{flat.flatName}</div>
                    </td>

                    {/* Share Weight */}
                    <td className="py-3 px-3">
                      <div className="font-medium font-mono text-neutral-900">
                        {flat.shares} {flat.shares > 1 ? 'Shares' : 'Share'}
                      </div>
                      <div className="text-xs text-neutral-500">
                        {sharePercent.toFixed(0)}% of total dues
                      </div>
                    </td>

                    {/* Ownership Type */}
                    <td className="py-3 px-4 text-xs">
                      {flat.ownershipType === 'single' ? (
                        <div>
                          <span className="font-medium text-neutral-800">Single Owner</span>
                          <div className="text-neutral-500">Sole proprietorship</div>
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium text-neutral-800">Multiple Owners</span>
                          <div className="text-neutral-500">{flat.coOwners.length} registered co-owners</div>
                        </div>
                      )}
                    </td>

                    {/* Contact & Co-owners */}
                    <td className="py-3 px-4 text-xs text-neutral-600">
                      <div className="font-medium text-neutral-900">
                        {flat.coOwners.map((o) => o.name).join(' · ')}
                      </div>
                      <div className="text-neutral-400 truncate max-w-xs">
                        {flat.coOwners[0]?.email || 'No email on record'}
                      </div>
                    </td>

                    {/* Total Deposited */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-800">
                      ৳{flat.totalDeposited.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Expenses Billed */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-700">
                      ৳{flat.totalExpenseAllocated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>

                    {/* Net Balance */}
                    <td className="py-3 px-4 text-right font-mono tabular-nums font-bold">
                      <span className={isDue ? 'text-rose-700' : 'text-emerald-800'}>
                        {isDue ? '-' : '+'}৳{Math.abs(flat.balance).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4 text-center">
                      {isDue ? (
                        <span className="text-xs font-semibold text-rose-800">
                          Due: ৳{Math.abs(flat.balance).toLocaleString('en-US', { maximumFractionDigits: 0 })}
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-emerald-800">
                          Cleared
                        </span>
                      )}
                    </td>

                    {/* Action */}
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectFlat(flat.flatId);
                        }}
                        className="text-xs font-medium text-neutral-900 hover:text-neutral-600 underline underline-offset-2"
                      >
                        Statement →
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            {/* Table Footer Totals */}
            <tfoot>
              <tr className="bg-neutral-50/80 font-semibold text-neutral-900 border-t border-neutral-200 text-xs">
                <td className="py-3 px-4">Grand Total</td>
                <td className="py-3 px-3 font-mono">{financialStats.totalShares} Shares</td>
                <td className="py-3 px-4 text-neutral-500">8 Flat Accounts</td>
                <td className="py-3 px-4"></td>
                <td className="py-3 px-4 text-right font-mono text-emerald-800">
                  ৳{financialStats.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono">
                  ৳{financialStats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-right font-mono text-rose-700">
                  -৳{financialStats.totalOutstanding.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </td>
                <td className="py-3 px-4 text-center text-neutral-500">Total Net Variance</td>
                <td className="py-3 px-4"></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Two-Column Analytics: Expense Categories & Deposit Channels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="p-5 bg-white border border-neutral-200 rounded-lg space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
            <div>
              <h3 className="text-sm font-semibold text-neutral-900">
                Maintenance Expenditure by Category
              </h3>
              <p className="text-xs text-neutral-500">Audited distribution across all 18 expenses</p>
            </div>
            <span className="text-xs font-mono font-medium text-neutral-600">
              Total ৳{financialStats.totalExpenses.toLocaleString('en-US', { maximumFractionDigits: 0 })}
            </span>
          </div>

          <div className="space-y-3">
            {sortedCategories.map(([category, amount]) => {
              const percentage = ((amount / financialStats.totalExpenses) * 100).toFixed(1);
              return (
                <div key={category} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-neutral-800">
                      {categoryLabels[category] || category}
                    </span>
                    <span className="font-mono text-neutral-600">
                      ৳{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className="bg-neutral-800 h-full rounded-full transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Bank & Cash Reconciliation Details */}
        <div className="p-5 bg-white border border-neutral-200 rounded-lg space-y-4">
          <div className="border-b border-neutral-100 pb-3">
            <h3 className="text-sm font-semibold text-neutral-900">
              Bank Accounts &amp; Fund Reconciliation
            </h3>
            <p className="text-xs text-neutral-500">Official depository accounts for maintenance dues</p>
          </div>

          <div className="space-y-3 text-xs">
            {/* DBBL Account Details */}
            <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200 space-y-1">
              <div className="flex items-center justify-between font-semibold text-neutral-900">
                <span>Dutch-Bangla Bank PLC (DBBL)</span>
                <span className="font-mono text-emerald-800 font-bold">Primary Account</span>
              </div>
              <div className="text-neutral-600">
                Account Name: <span className="font-medium text-neutral-800">{settings.dbblAccountName}</span>
              </div>
              <div className="text-neutral-600">
                Account No: <span className="font-mono font-medium text-neutral-900">{settings.dbblAccountNo}</span>
              </div>
              <div className="text-neutral-600">
                Branch: <span className="font-medium text-neutral-800">{settings.dbblBranch}</span>
              </div>
            </div>

            {/* bKash Mobile Wallet */}
            <div className="p-3 bg-neutral-50 rounded-md border border-neutral-200 space-y-1">
              <div className="flex items-center justify-between font-semibold text-neutral-900">
                <span>bKash Mobile Deposit</span>
                <span className="font-mono text-neutral-600">Utility Deposit</span>
              </div>
              <div className="text-neutral-600">
                Authorized Number: <span className="font-mono font-medium text-neutral-900">{settings.bkashNumber}</span>
              </div>
              <div className="text-neutral-500">
                Used for instant emergency maintenance contributions
              </div>
            </div>

            {/* Fund Transparency Formula */}
            <div className="p-3 bg-neutral-900 text-neutral-100 rounded-md space-y-2">
              <div className="text-xs font-semibold tracking-wider text-neutral-300">
                FUND BALANCE AUDIT FORMULA
              </div>
              <div className="font-mono text-xs space-y-1 text-neutral-200">
                <div className="flex justify-between">
                  <span>Balance From Last Year:</span>
                  <span>+৳{settings.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Contributions Received:</span>
                  <span>+৳{financialStats.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Expenses Disbursed:</span>
                  <span>-৳{financialStats.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="border-t border-neutral-700 pt-1 flex justify-between font-bold text-white text-sm">
                  <span>Current Fund in Hand:</span>
                  <span className="text-emerald-400">৳{financialStats.currentBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
