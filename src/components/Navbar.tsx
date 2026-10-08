import React from 'react';
import { useFund } from '../context/FundContext';
import { 
  Building2, 
  ShieldCheck, 
  UserCheck, 
  Download, 
  Plus, 
  SlidersHorizontal,
  KeyRound,
  LogOut,
  User
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenNewEntry: () => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenNewEntry,
  onOpenSettings,
  onOpenProfile,
}) => {
  const { role, currentUser, logout, exportCsvData } = useFund();

  const navLinks = [
    { id: 'overview', label: 'Overview' },
    { id: 'deposits', label: 'Deposits' },
    { id: 'expenses', label: 'Expenses' },
    { id: 'ledgers', label: 'Unit Ledgers' },
    { id: 'receipts', label: 'Receipts Portal' },
    { id: 'previous_years', label: 'Previous Years' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-neutral-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Zone 1: Wordmark */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
              <Building2 className="w-5 h-5 text-neutral-100" />
            </div>
            <button
              onClick={() => setCurrentTab('overview')}
              className="text-left font-bold text-neutral-900 text-base sm:text-lg tracking-tight hover:text-neutral-700 transition-colors"
            >
              Apartment Fund Manager
            </button>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-neutral-600">
            {navLinks.map((link) => {
              const isActive = currentTab === link.id;
              return (
                <button
                  key={link.id}
                  onClick={() => setCurrentTab(link.id)}
                  className={`transition-colors whitespace-nowrap py-1 relative ${
                    isActive
                      ? 'text-neutral-900 font-semibold'
                      : 'text-neutral-500 hover:text-neutral-900'
                  }`}
                >
                  {link.label}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-neutral-900 rounded-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Actions & User Login Pill */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {/* Quick Export CSV */}
            <button
              onClick={exportCsvData}
              title="Export complete ledger CSV"
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors text-xs font-medium flex items-center gap-1.5"
            >
              <Download className="w-4 h-4" />
              <span className="hidden xl:inline">Export CSV</span>
            </button>

            {/* Quick Settings */}
            <button
              onClick={onOpenSettings}
              title="Fund Settings, Accounts & Users"
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-md transition-colors"
            >
              <SlidersHorizontal className="w-4 h-4" />
            </button>

            {/* User Account / Profile Button */}
            <div className="flex items-center bg-neutral-100 rounded-lg p-1 border border-neutral-200">
              <button
                onClick={onOpenProfile}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded hover:bg-white transition-colors text-neutral-800"
                title="Account Settings: Update Flat Info & Change Password"
              >
                {role === 'admin' ? (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-700" />
                ) : (
                  <UserCheck className="w-3.5 h-3.5 text-blue-600" />
                )}
                <span className="font-semibold text-neutral-900 max-w-[130px] truncate hidden sm:inline">
                  {currentUser?.displayName || 'User'}
                </span>
                <span className={`px-1.5 py-0.2 font-mono text-[9px] font-bold rounded ${
                  role === 'admin' 
                    ? 'bg-neutral-900 text-white' 
                    : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {role === 'admin' ? 'ADMIN' : (currentUser?.flatId ? `FLAT ${currentUser.flatId}` : 'OWNER')}
                </span>
              </button>

              <button
                onClick={logout}
                title="Sign Out of Portal"
                className="p-1 text-neutral-400 hover:text-neutral-700 rounded ml-0.5"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Primary Action Button (Admin only) */}
            {role === 'admin' ? (
              <button
                onClick={onOpenNewEntry}
                className="px-3 py-1.5 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5 whitespace-nowrap shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Post Entry</span>
              </button>
            ) : (
              <button
                onClick={onOpenProfile}
                className="px-2.5 py-1.5 bg-white border border-neutral-300 text-neutral-800 rounded-md text-xs font-medium hover:bg-neutral-50 transition-colors flex items-center gap-1 shadow-xs"
              >
                <User className="w-3.5 h-3.5 text-neutral-600" />
                <span>My Flat Info</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation bar */}
        <div className="lg:hidden flex items-center gap-2 overflow-x-auto py-2.5 border-t border-neutral-100 text-xs font-medium scrollbar-none">
          {navLinks.map((link) => {
            const isActive = currentTab === link.id;
            return (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`px-3 py-1.5 rounded-md whitespace-nowrap transition-colors ${
                  isActive
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                }`}
              >
                {link.label}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
