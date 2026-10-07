import React, { useState } from 'react';
import { FundProvider, useFund } from './context/FundContext';
import { Navbar } from './components/Navbar';
import { DashboardOverview } from './components/DashboardOverview';
import { DepositsManager } from './components/DepositsManager';
import { ExpensesManager } from './components/ExpensesManager';
import { UnitLedgerView } from './components/UnitLedgerView';
import { ReceiptsPortal } from './components/ReceiptsPortal';
import { PreviousYearsManager } from './components/PreviousYearsManager';
import { AdminSettingsModal } from './components/AdminSettingsModal';
import { MonthlyReportModal } from './components/MonthlyReportModal';
import { 
  Building2, 
  FileSpreadsheet, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Receipt, 
  SlidersHorizontal,
  ShieldCheck,
  UserCheck,
  Calendar
} from 'lucide-react';

const MainAppContent: React.FC = () => {
  const { role, setRole, selectedFlatId, setSelectedFlatId, settings } = useFund();

  const [currentTab, setCurrentTab] = useState<string>('overview');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMonthlyReportOpen, setIsMonthlyReportOpen] = useState(false);
  const [inspectedExpenseId, setInspectedExpenseId] = useState<string | null>(null);

  const handleSelectFlatFromOverview = (flatId: string) => {
    setSelectedFlatId(flatId);
    setCurrentTab('ledgers');
  };

  const handleOpenNewDeposit = () => {
    setCurrentTab('deposits');
  };

  const handleOpenNewExpense = () => {
    setCurrentTab('expenses');
  };

  const handleOpenReceiptViewer = (expenseId: string) => {
    setInspectedExpenseId(expenseId);
    setCurrentTab('receipts');
  };

  const handleOpenPreviousYears = () => {
    setCurrentTab('previous_years');
  };

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenNewEntry={() => setCurrentTab('expenses')}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Role Banner Notification (if in Owner View) */}
      {role === 'owner' && (
        <div className="bg-neutral-900 text-neutral-100 px-4 py-2 text-xs flex items-center justify-between no-print">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-emerald-400" />
              <span>
                <strong>Owner Transparency Mode:</strong> You are browsing building financials, statements, and receipts in read-only mode.
              </span>
            </div>
            <button
              onClick={() => setRole('admin')}
              className="underline font-semibold hover:text-white"
            >
              Switch to Admin Dashboard →
            </button>
          </div>
        </div>
      )}

      {/* Main Workspace Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentTab === 'overview' && (
          <div className="space-y-6">
            <DashboardOverview
              onSelectFlat={handleSelectFlatFromOverview}
              onOpenNewDeposit={handleOpenNewDeposit}
              onOpenNewExpense={handleOpenNewExpense}
              onOpenPreviousYears={handleOpenPreviousYears}
            />

            {/* Quick Actions Footer Bar */}
            <div className="p-4 bg-white border border-neutral-200 rounded-lg flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-2 text-neutral-600">
                <Building2 className="w-4 h-4 text-neutral-800" />
                <span>
                  Admin Contact: <strong className="text-neutral-900">{settings.adminName}</strong> ({settings.adminEmail})
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMonthlyReportOpen(true)}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-medium transition-colors flex items-center gap-1.5"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  View Monthly Transparency Statement
                </button>
                <button
                  onClick={handleOpenPreviousYears}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-medium transition-colors flex items-center gap-1.5"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  Previous Years &amp; History
                </button>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-3 py-1.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded font-medium transition-colors flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Complex &amp; Account Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {currentTab === 'deposits' && <DepositsManager />}

        {currentTab === 'expenses' && (
          <ExpensesManager onOpenReceiptViewer={handleOpenReceiptViewer} />
        )}

        {currentTab === 'ledgers' && (
          <UnitLedgerView
            initialFlatId={selectedFlatId}
            onOpenNewDepositForFlat={(fId) => {
              setSelectedFlatId(fId);
              setCurrentTab('deposits');
            }}
          />
        )}

        {currentTab === 'receipts' && (
          <ReceiptsPortal
            initialExpenseId={inspectedExpenseId}
            onClearInitialExpenseId={() => setInspectedExpenseId(null)}
          />
        )}

        {currentTab === 'previous_years' && <PreviousYearsManager />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-neutral-200 py-4 no-print mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-neutral-500">
          <div>
            {settings.buildingName} · Common Management Fund System (5 Years Managing History)
          </div>
          <div className="flex items-center gap-3">
            <span>Fiscal Year: {settings.fiscalYear}</span>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsMonthlyReportOpen(true)}
              className="hover:text-neutral-900 underline"
            >
              Audit Statement
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={handleOpenPreviousYears}
              className="hover:text-neutral-900 underline"
            >
              Previous Years
            </button>
            <span aria-hidden="true">·</span>
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="hover:text-neutral-900 underline"
            >
              Settings
            </button>
          </div>
        </div>
      </footer>

      {/* Settings Modal */}
      <AdminSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      {/* Monthly Report Modal */}
      <MonthlyReportModal
        isOpen={isMonthlyReportOpen}
        onClose={() => setIsMonthlyReportOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <FundProvider>
      <MainAppContent />
    </FundProvider>
  );
}
