import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { FlatUnit, CoOwner, UserAccount } from '../types/index.ts';
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
  CheckCircle2,
  KeyRound,
  ShieldCheck,
  UserCheck,
  Edit3
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
    importJsonBackup,
    usersList,
    updateUserAccount,
    createUserAccount,
    deleteUserAccount,
  } = useFund();

  const [activeTab, setActiveTab] = useState<'general' | 'banking' | 'owners' | 'users' | 'data'>('general');
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

  // User management state
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [editUserPassword, setEditUserPassword] = useState('');
  const [editUserRole, setEditUserRole] = useState<'admin' | 'owner'>('owner');
  const [editUserFlatId, setEditUserFlatId] = useState('AB1');
  const [editUserDisplayName, setEditUserDisplayName] = useState('');

  // Add User State
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newDisplayName, setNewDisplayName] = useState('');
  const [newRole, setNewRole] = useState<'admin' | 'owner'>('owner');
  const [newFlatId, setNewFlatId] = useState('AB1');

  if (!isOpen) return null;

  const handleSaveGeneral = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      buildingName,
      complexAddress,
      openingBalance: parseFloat(openingBalance) || 0,
      fiscalYear,
      adminName,
      adminEmail,
      adminPhone,
    });
    setSuccessBanner('General complex parameters & opening balance updated successfully in PostgreSQL.');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleSaveBanking = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings({
      dbblAccountName,
      dbblAccountNo,
      dbblBranch,
      bkashNumber,
    });
    setSuccessBanner('Banking & depository accounts updated in PostgreSQL.');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleAddCoOwner = async () => {
    if (!flatObj) return;
    const newOwner: CoOwner = {
      id: `owner-${Date.now()}`,
      name: 'New Co-Owner',
      email: '',
      phone: '',
      sharePercent: 50,
    };
    await updateFlat({
      ...flatObj,
      coOwners: [...flatObj.coOwners, newOwner],
    });
  };

  const handleUpdateCoOwner = async (ownerId: string, partial: Partial<CoOwner>) => {
    if (!flatObj) return;
    const updatedCoOwners = flatObj.coOwners.map((o) =>
      o.id === ownerId ? { ...o, ...partial } : o
    );
    await updateFlat({
      ...flatObj,
      coOwners: updatedCoOwners,
    });
  };

  const handleDeleteCoOwner = async (ownerId: string) => {
    if (!flatObj) return;
    const updatedCoOwners = flatObj.coOwners.filter((o) => o.id !== ownerId);
    await updateFlat({
      ...flatObj,
      coOwners: updatedCoOwners,
    });
  };

  const handleStartEditUser = (user: UserAccount) => {
    setEditingUserId(user.id);
    setEditUserPassword('');
    setEditUserRole(user.role);
    setEditUserFlatId(user.flatId || 'AB1');
    setEditUserDisplayName(user.displayName);
  };

  const handleSaveUserEdit = async (userId: string) => {
    const payload: any = {
      role: editUserRole,
      flatId: editUserFlatId,
      displayName: editUserDisplayName,
    };
    if (editUserPassword.trim() !== '') {
      payload.password = editUserPassword;
    }
    await updateUserAccount(userId, payload);
    setEditingUserId(null);
    setSuccessBanner('User credentials updated successfully.');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername || !newPassword) {
      alert('Username and password are required.');
      return;
    }
    await createUserAccount({
      username: newUsername,
      password: newPassword,
      displayName: newDisplayName || newUsername,
      role: newRole,
      flatId: newFlatId,
    });
    setIsAddingUser(false);
    setNewUsername('');
    setNewPassword('');
    setNewDisplayName('');
    setSuccessBanner('New user account registered successfully.');
    setTimeout(() => setSuccessBanner(null), 4000);
  };

  const handleDeleteUser = async (id: string, name: string) => {
    if (window.confirm(`Delete user account "${name}"?`)) {
      await deleteUserAccount(id);
    }
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
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-neutral-800" />
            <h3 className="text-base font-bold text-neutral-900">
              Fund Administration &amp; Access Settings
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-900 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center border-b border-neutral-200 px-4 bg-white text-xs font-medium overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'general'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            General &amp; Opening Fund
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap flex items-center gap-1.5 ${
              activeTab === 'users'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            User Logins &amp; Passwords
          </button>
          <button
            onClick={() => setActiveTab('banking')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'banking'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Bank Accounts
          </button>
          <button
            onClick={() => setActiveTab('owners')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
              activeTab === 'owners'
                ? 'border-neutral-900 text-neutral-900 font-semibold'
                : 'border-transparent text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Co-Owners Register
          </button>
          <button
            onClick={() => setActiveTab('data')}
            className={`py-3 px-3 border-b-2 transition-colors whitespace-nowrap ${
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
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
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
                  Physical Complex Address
                </label>
                <input
                  type="text"
                  required
                  value={complexAddress}
                  onChange={(e) => setComplexAddress(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Opening Reserve Balance (৳ BDT)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={openingBalance}
                    onChange={(e) => setOpeningBalance(e.target.value)}
                    className="w-full p-2 font-mono border border-neutral-300 rounded-md text-neutral-900"
                  />
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">
                    Starting reserve balance in PostgreSQL.
                  </span>
                </div>

                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Current Active Fiscal Year
                  </label>
                  <input
                    type="text"
                    required
                    value={fiscalYear}
                    onChange={(e) => setFiscalYear(e.target.value)}
                    placeholder="e.g. 2026"
                    className="w-full p-2 font-mono border border-neutral-300 rounded-md text-neutral-900"
                  />
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-3 space-y-3">
                <span className="font-semibold text-neutral-900 block">
                  Fund Manager / Primary Administrator Contact
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-neutral-500 mb-0.5">Admin Full Name</label>
                    <input
                      type="text"
                      required
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 mb-0.5">Admin Email</label>
                    <input
                      type="email"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 mb-0.5">Admin Phone</label>
                    <input
                      type="text"
                      required
                      value={adminPhone}
                      onChange={(e) => setAdminPhone(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md font-medium hover:bg-neutral-800 flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save General Settings
                </button>
              </div>
            </form>
          )}

          {/* Tab 2: User Logins & Passwords */}
          {activeTab === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <div>
                  <h4 className="font-bold text-neutral-900 text-sm">
                    User Accounts &amp; Passwords
                  </h4>
                  <p className="text-[11px] text-neutral-500">
                    Flat owners sign in with username and password to view building accounts in read-only transparency mode.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsAddingUser(!isAddingUser)}
                  className="px-3 py-1.5 bg-neutral-900 text-white rounded-lg text-xs font-medium hover:bg-neutral-800 flex items-center gap-1 shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add User
                </button>
              </div>

              {/* Add User Form */}
              {isAddingUser && (
                <form onSubmit={handleCreateUser} className="p-3 bg-neutral-50 border border-neutral-200 rounded-xl space-y-3">
                  <div className="font-bold text-neutral-900 text-xs flex items-center justify-between">
                    <span>Create New User Login</span>
                    <button type="button" onClick={() => setIsAddingUser(false)} className="text-neutral-400 hover:text-neutral-900">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Username</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. flat_a2"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value)}
                        className="w-full p-1.5 border border-neutral-300 rounded bg-white text-neutral-900 font-mono text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Password</label>
                      <input
                        type="text"
                        required
                        placeholder="Enter initial password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full p-1.5 border border-neutral-300 rounded bg-white text-neutral-900 text-xs"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Display Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Faruk Ahmed (A2)"
                        value={newDisplayName}
                        onChange={(e) => setNewDisplayName(e.target.value)}
                        className="w-full p-1.5 border border-neutral-300 rounded bg-white text-neutral-900 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Role</label>
                      <select
                        value={newRole}
                        onChange={(e) => setNewRole(e.target.value as any)}
                        className="w-full p-1.5 border border-neutral-300 rounded bg-white text-neutral-900 text-xs"
                      >
                        <option value="owner">Owner (Read-only)</option>
                        <option value="admin">Admin (Full Edit)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-neutral-600 mb-0.5">Flat Assigned</label>
                      <select
                        value={newFlatId}
                        onChange={(e) => setNewFlatId(e.target.value)}
                        className="w-full p-1.5 border border-neutral-300 rounded bg-white text-neutral-900 text-xs font-mono"
                      >
                        {flats.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.id}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setIsAddingUser(false)}
                      className="px-3 py-1 border border-neutral-300 rounded text-neutral-600 hover:bg-neutral-100 text-xs"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-3 py-1 bg-neutral-900 text-white rounded text-xs font-medium hover:bg-neutral-800"
                    >
                      Save New Account
                    </button>
                  </div>
                </form>
              )}

              {/* Users List */}
              <div className="space-y-2">
                {usersList.map((user) => {
                  const isEditing = editingUserId === user.id;

                  return (
                    <div
                      key={user.id}
                      className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 ${
                          user.role === 'admin' ? 'bg-neutral-900 text-white' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {user.role === 'admin' ? (
                            <ShieldCheck className="w-3.5 h-3.5" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-neutral-900 font-mono">
                              {user.username}
                            </span>
                            <span className={`px-1.5 py-0.2 font-mono text-[9px] font-bold rounded ${
                              user.role === 'admin' ? 'bg-neutral-900 text-white' : 'bg-blue-100 text-blue-800'
                            }`}>
                              {user.role.toUpperCase()}
                            </span>
                            {user.flatId && (
                              <span className="px-1.5 py-0.2 bg-neutral-200 text-neutral-800 text-[10px] font-mono rounded">
                                Flat {user.flatId}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-neutral-500 block">
                            {user.displayName} {user.email ? `(${user.email})` : ''}
                          </span>
                        </div>
                      </div>

                      {/* Editing User or Quick Actions */}
                      {isEditing ? (
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-2 w-full sm:w-auto">
                          <input
                            type="text"
                            placeholder="New password (leave blank to keep)"
                            value={editUserPassword}
                            onChange={(e) => setEditUserPassword(e.target.value)}
                            className="p-1 border border-neutral-300 rounded bg-white text-xs w-full sm:w-48 font-mono"
                          />
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => handleSaveUserEdit(user.id)}
                              className="px-2.5 py-1 bg-neutral-900 text-white rounded text-xs hover:bg-neutral-800"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingUserId(null)}
                              className="px-2 py-1 border border-neutral-300 rounded text-neutral-600 hover:bg-neutral-100 text-xs"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditUser(user)}
                            className="px-2.5 py-1 bg-white border border-neutral-300 rounded text-neutral-700 hover:bg-neutral-100 flex items-center gap-1 text-[11px]"
                          >
                            <Edit3 className="w-3 h-3" />
                            Change Password / Edit
                          </button>
                          {user.username !== 'admin' && (
                            <button
                              type="button"
                              onClick={() => handleDeleteUser(user.id, user.username)}
                              className="p-1 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50"
                              title="Delete user"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 3: Banking */}
          {activeTab === 'banking' && (
            <form onSubmit={handleSaveBanking} className="space-y-4">
              <div className="space-y-3">
                <span className="font-semibold text-neutral-900 block">
                  Dutch-Bangla Bank Ltd. (DBBL) Account Details
                </span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <div>
                    <label className="block text-neutral-500 mb-0.5">Account Title</label>
                    <input
                      type="text"
                      required
                      value={dbblAccountName}
                      onChange={(e) => setDbblAccountName(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 mb-0.5">Account Number</label>
                    <input
                      type="text"
                      required
                      value={dbblAccountNo}
                      onChange={(e) => setDbblAccountNo(e.target.value)}
                      className="w-full p-2 font-mono border border-neutral-300 rounded-md text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-500 mb-0.5">Branch</label>
                    <input
                      type="text"
                      required
                      value={dbblBranch}
                      onChange={(e) => setDbblBranch(e.target.value)}
                      className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                    />
                  </div>
                </div>
              </div>

              <div className="border-t border-neutral-200 pt-3 space-y-2">
                <span className="font-semibold text-neutral-900 block">
                  bKash Merchant / Personal Depository
                </span>
                <div className="max-w-xs">
                  <label className="block text-neutral-500 mb-0.5">bKash Wallet Number</label>
                  <input
                    type="text"
                    required
                    value={bkashNumber}
                    onChange={(e) => setBkashNumber(e.target.value)}
                    className="w-full p-2 font-mono border border-neutral-300 rounded-md text-neutral-900"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md font-medium hover:bg-neutral-800 flex items-center gap-1.5 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Banking Details
                </button>
              </div>
            </form>
          )}

          {/* Tab 4: Co-Owners Register */}
          {activeTab === 'owners' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-neutral-200">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-neutral-700">Select Flat:</span>
                  <select
                    value={selectedFlatForOwners}
                    onChange={(e) => setSelectedFlatForOwners(e.target.value)}
                    className="p-1.5 border border-neutral-300 rounded font-mono text-neutral-900 bg-white"
                  >
                    {flats.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.id} — {f.name} ({f.shares} shares)
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
                    Registered co-owners for Flat {flatObj.id} ({flatObj.name}).
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

          {/* Tab 5: Data Backup & Reset */}
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
                <span className="font-bold">Reset Database to Blank</span>
                <p className="text-xs text-rose-700">
                  This will clear all deposits, expenses, receipts, and archives in the PostgreSQL database, leaving a clean slate ready for multi-year importing.
                </p>
                <button
                  onClick={() => {
                    if (window.confirm('Are you sure you want to reset the database to a blank state? All records will be cleared.')) {
                      resetToDefaultData();
                      setSuccessBanner('Database successfully reset to blank state.');
                    }
                  }}
                  className="px-3 py-1.5 bg-rose-700 text-white rounded text-xs font-medium hover:bg-rose-800 flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reset to Blank Database
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
