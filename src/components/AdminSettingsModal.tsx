import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { FlatUnit, CoOwner } from '../types';
import { 
  Building2, 
  CreditCard, 
  Users, 
  RotateCcw, 
  Download, 
  Upload, 
  Save, 
  X, 
  Plus, 
  Trash2,
  CheckCircle2
} from 'lucide-react';

interface AdminSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSettingsModal: React.FC<AdminSettingsModalProps> = ({ isOpen, onClose }) => {
  const { 
    settings, 
    updateSettings, 
    flats, 
    updateFlat, 
    resetToDefaultData, 
    exportCsvData, 
    exportJsonBackup, 
    importJsonBackup 
  } = useFund();

  const [activeTab, setActiveTab] = useState<'general' | 'banking' | 'owners' | 'data'>('general');
  const [successBanner, setSuccessBanner] = useState<string | null>(null);

  // Form states for general settings
  const [buildingName, setBuildingName] = useState(settings.buildingName);
  const [complexAddress, setComplexAddress] = useState(settings.complexAddress);
  const [openingBalance, setOpeningBalance] = useState(settings.openingBalance.toString());
  const [fiscalYear, setFiscalYear] = useState(settings.fiscalYear);
  const [adminName, setAdminName] = useState(settings.adminName);
  const [adminEmail, setAdminEmail] = useState(settings.adminEmail);
  const [adminPhone, setAdminPhone] = useState(settings.adminPhone);

  // Banking states
  const [dbblAccountName, setDbblAccountName] = useState(settings.dbblAccountName);
  const [dbblAccountNo, setDbblAccountNo] = useState(settings.dbblAccountNo);
  const [dbblBranch, setDbblBranch] = useState(settings.dbblBranch);
  const [bkashNumber, setBkashNumber] = useState(settings.bkashNumber);

  // Owners editing state
  const [selectedFlatForOwners, setSelectedFlatForOwners] = useState<string>('AB1');
  const flatObj = flats.find((f) => f.id === selectedFlatForOwners);

  if (!isOpen) return null;

  const handleSaveGeneral = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      buildingName,
      complexAddress,
      openingBalance: parseFloat(openingBalance) || 0,
      fiscalYear,
      adminName,
      adminEmail,
      adminPhone,
    });
    setSuccessBanner('General complex parameters updated successfully.');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleSaveBanking = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings({
      dbblAccountName,
      dbblAccountNo,
      dbblBranch,
      bkashNumber,
    });
    setSuccessBanner('Banking & depository accounts updated.');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleAddCoOwner = () => {
    if (!flatObj) return;
    const newOwner: CoOwner = {
      id: `owner-${Date.now()}`,
      name: 'New Co-Owner',
      email: '',
      phone: '',
      sharePercent: 50,
    };
    updateFlat({
      ...flatObj,
      coOwners: [...flatObj.coOwners, newOwner],
    });
  };

  const handleUpdateCoOwner = (ownerId: string, updates: Partial<CoOwner>) => {
    if (!flatObj) return;
    updateFlat({
      ...flatObj,
      coOwners: flatObj.coOwners.map((o) => (o.id === ownerId ? { ...o, ...updates } : o)),
    });
  };

  const handleDeleteCoOwner = (ownerId: string) => {
    if (!flatObj) return;
    if (flatObj.coOwners.length <= 1) {
      alert('A flat unit must have at least one registered contact owner.');
      return;
    }
    updateFlat({
      ...flatObj,
      coOwners: flatObj.coOwners.filter((o) => o.id !== ownerId),
    });
  };

  const handleJsonUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        if (content) {
          const ok = importJsonBackup(content);
          if (ok) {
            setSuccessBanner('JSON Fund Database restored successfully!');
          } else {
            alert('Failed to parse backup JSON.');
          }
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-neutral-800" />
            <h3 className="text-base font-bold text-neutral-900">
              Fund Administration &amp; Settings
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-900 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-200 px-4 bg-white text-xs font-medium">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'general'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            General &amp; Opening Fund
          </button>
          <button
            onClick={() => setActiveTab('banking')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'banking'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Bank Accounts
          </button>
          <button
            onClick={() => setActiveTab('owners')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'owners'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Co-Owners Register
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-3 px-3 border-b-2 transition-colors ${
              activeTab === 'data'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Data Backup &amp; Reset
          </button>
        </div>

        {/* Success Banner */}
        {successBanner && (
          <div className="p-3 bg-emerald-50 border-b border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successBanner}</span>
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Tab 1: General */}
          {activeTab === 'general' && (
            <form onSubmit={handleSaveGeneral} className="space-y-4">
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Apartment Complex Name
                </label>
                <input
                  type="text"
                  required
                  value={buildingName}
                  onChange={(e) => setBuildingName(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                />
              </div>

              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  required
                  value={complexAddress}
                  onChange={(e) => setComplexAddress(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Opening Fund (Balance From Last Year) ৳
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="w-full p-2 font-mono border border-neutral-300 rounded-md text-neutral-900"
                  />
                  <div className="text-[11px] text-neutral-500 mt-1">
                    Historical balance carry-over: ৳97,372.00
                  </div>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Fiscal Audit Period
                  </label>
                  <input
                    type="text"
                    required
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-200">
                <span className="font-semibold text-neutral-800">Fund Administrator Profile</span>
                <div className="grid grid-cols-3 gap-3 mt-2">
                  <div>
                    <label className="block text-neutral-600 mb-1">Admin Name</label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 mb-1">Official Email</label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 mb-1">Phone Number</label>
                    <input
                      type="text"
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md font-medium hover:bg-neutral-800 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save General Settings
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: Banking */}
          {activeTab === 'banking' && (
            <form onSubmit={handleSaveBanking} className="space-y-4">
              <div className="space-y-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="font-semibold text-neutral-900">Dutch-Bangla Bank PLC (DBBL) Account</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-neutral-600 mb-1">Account Title</label>
                    <input
                      type="text"
                      value={dbblAccountName}
                      onChange={(e) => setDbblAccountName(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-md bg-white text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-600 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={dbblAccountNo}
                      onChange={(e) => setDbblAccountNo(e.target.value)}
                      className="w-full p-2 font-mono border border-neutral-300 rounded-md bg-white text-neutral-900"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-neutral-600 mb-1">Branch Name</label>
                  <input
                    type="text"
                    value={dbblBranch}
                    onChange={(e) => setDbblBranch(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-md bg-white text-neutral-900"
                  />
                </div>
              </div>

              <div className="space-y-2 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <span className="font-semibold text-neutral-900">bKash Mobile Deposit</span>
                <div>
                  <label className="block text-neutral-600 mb-1">bKash Number</label>
                  <input
                    type="text"
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    className="w-full p-2 font-mono border border-neutral-300 rounded-md bg-white text-neutral-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-3">
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md font-medium hover:bg-neutral-800 flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Banking Details
                </button>
              </div>
            </form>
          )}

          {/* Tab 3: Owners Register */}
          {activeTab === 'owners' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Select Flat to Manage Registered Owners
                  </label>
                  <select
                    value={selectedFlatForOwners}
                    onChange={(e) => setSelectedFlatForOwners(e.target.value)}
                    className="p-2 border border-neutral-300 rounded-md bg-white text-neutral-900 font-bold"
                  >
                    {flats.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.id} — {f.name} ({f.ownershipType === 'single' ? 'Single Owner' : 'Multiple Owners'})
                      </option>
                    ))}
                  </select>
                </div>

                <button
                  onClick={handleAddCoOwner}
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Co-Owner
                </button>
              </div>

              {flatObj && (
                <div className="space-y-3 pt-2">
                  <div className="text-neutral-500 text-xs">
                    Registered co-owners receive automated email notifications and payment reminders for Flat {flatObj.id}.
                  </div>

                  {flatObj.coOwners.map((owner, idx) => (
                    <div
                      key={owner.id}
                      className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-neutral-800">
                          Co-Owner #{idx + 1}
                        </span>
                        {flatObj.coOwners.length > 1 && (
                          <button
                            onClick={() => handleDeleteCoOwner(owner.id)}
                            className="text-neutral-400 hover:text-rose-600 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        <div>
                          <label className="block text-[11px] text-neutral-500 mb-0.5">Name</label>
                          <input
                            type="text"
                            value={owner.name}
                            onChange={(e) => handleUpdateCoOwner(owner.id, { name: e.target.value })}
                            className="w-full p-1.5 border border-neutral-300 rounded bg-white text-neutral-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-neutral-500 mb-0.5">Email</label>
                          <input
                            type="email"
                            value={owner.email}
                            onChange={(e) => handleUpdateCoOwner(owner.id, { email: e.target.value })}
                            className="w-full p-1.5 border border-neutral-300 rounded bg-white text-neutral-900"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] text-neutral-500 mb-0.5">Phone</label>
                          <input
                            type="text"
                            value={owner.phone}
                            onChange={(e) => handleUpdateCoOwner(owner.id, { phone: e.target.value })}
                            className="w-full p-1.5 border border-neutral-300 rounded bg-white text-neutral-900"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 4: Data Backup & Reset */}
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
                <span className="font-bold text-neutral-900">Export Audit Data</span>
                <p className="text-neutral-600">
                  Download all deposits, expense allocations, and balance summaries in spreadsheet format or full JSON archive.
                </p>
                <div className="flex gap-2 pt-1">
                  <button
                    onClick={exportCsvData}
                    className="px-3 py-1.5 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download Audit CSV
                  </button>
                  <button
                    onClick={exportJsonBackup}
                    className="px-3 py-1.5 border border-neutral-300 text-neutral-800 rounded text-xs font-medium hover:bg-neutral-100 flex items-center gap-1.5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Full JSON Backup
                  </button>
                </div>
              </div>

              <div className="p-4 bg-neutral-50 border border-neutral-200 rounded-lg space-y-2">
                <span className="font-bold text-neutral-900">Restore from JSON Archive</span>
                <p className="text-neutral-600">
                  Upload a previously saved JSON file to restore all fund records.
                </p>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleJsonUpload}
                  className="block w-full text-xs text-neutral-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-neutral-800 file:text-white"
                />
              </div>

              <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg space-y-2 text-rose-900">
                <span className="font-bold">Reset to Initial 2025–2026 Audit Baseline</span>
                <p className="text-xs text-rose-700">
                  This will reset all data back to the exact initial CSV ledger (৳97,372.00 opening balance, 8 deposits totaling ৳396,192.00, 18 maintenance expenses totaling ৳469,237.68, and ৳24,326.32 current balance).
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to restore the original 2025–2026 audit data? Any unsaved edits will be replaced.')) {
                      resetToDefaultData();
                      setSuccessBanner('Database successfully reset to initial audit baseline.');
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-700 text-white rounded text-xs font-medium hover:bg-rose-800 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Initial Audit Data
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
