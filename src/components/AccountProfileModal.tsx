import React, { useState, useEffect } from 'react';
import { useFund } from '../context/FundContext';
import { FlatUnit, CoOwner, PaymentMethod } from '../types/index.ts';
import {
  KeyRound,
  Building,
  User,
  Mail,
  Phone,
  CreditCard,
  Save,
  X,
  AlertCircle,
  CheckCircle2,
  Lock,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ShieldCheck,
  UserCheck
} from 'lucide-react';

interface AccountProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'flat' | 'password';
}

export const AccountProfileModal: React.FC<AccountProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'flat',
}) => {
  const { currentUser, role, flats, updateMyFlatInfo, changePassword } = useFund();

  const [activeTab, setActiveTab] = useState<'flat' | 'password'>(initialTab);

  // Sync initial tab when opening
  useEffect(() => {
    if (isOpen) {
      setActiveTab(initialTab);
    }
  }, [isOpen, initialTab]);

  // Determine current flat for editing
  // Flat owners only edit their own flat; admin can select any flat
  const userFlatId = currentUser?.flatId || 'AB1';
  const [selectedFlatId, setSelectedFlatId] = useState<string>(userFlatId);

  useEffect(() => {
    if (currentUser?.flatId) {
      setSelectedFlatId(currentUser.flatId);
    }
  }, [currentUser]);

  const activeFlat = flats.find((f) => f.id === selectedFlatId) || flats[0];

  // Flat Information Form State
  const [contactPerson, setContactPerson] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [defaultPaymentMethod, setDefaultPaymentMethod] = useState<PaymentMethod>('DBBL');
  const [coOwners, setCoOwners] = useState<CoOwner[]>([]);

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);

  // Feedback states
  const [flatSuccessMsg, setFlatSuccessMsg] = useState<string | null>(null);
  const [flatErrorMsg, setFlatErrorMsg] = useState<string | null>(null);
  const [isSavingFlat, setIsSavingFlat] = useState(false);

  const [passwordSuccessMsg, setPasswordSuccessMsg] = useState<string | null>(null);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Populate flat form fields when selected flat changes
  useEffect(() => {
    if (activeFlat) {
      setContactPerson(activeFlat.contactPerson || '');
      setContactEmail(activeFlat.contactEmail || '');
      setContactPhone(activeFlat.contactPhone || '');
      setDefaultPaymentMethod((activeFlat.defaultPaymentMethod as PaymentMethod) || 'DBBL');
      setCoOwners(activeFlat.coOwners ? [...activeFlat.coOwners] : []);
    }
  }, [activeFlat, selectedFlatId]);

  if (!isOpen || !currentUser) return null;

  // Handle Flat Info Save
  const handleSaveFlatInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    setFlatErrorMsg(null);
    setFlatSuccessMsg(null);
    setIsSavingFlat(true);

    try {
      const result = await updateMyFlatInfo(activeFlat.id, {
        contactPerson: contactPerson.trim(),
        contactEmail: contactEmail.trim(),
        contactPhone: contactPhone.trim(),
        defaultPaymentMethod: defaultPaymentMethod as any,
        coOwners,
      });

      if (result.success) {
        setFlatSuccessMsg(`Information for Flat ${activeFlat.id} updated successfully in the system.`);
        setTimeout(() => setFlatSuccessMsg(null), 4000);
      } else {
        setFlatErrorMsg(result.error || 'Failed to update flat details.');
      }
    } catch (err: any) {
      setFlatErrorMsg(err.message || 'Error updating flat info');
    } finally {
      setIsSavingFlat(false);
    }
  };

  // Co-Owners Helpers
  const handleAddCoOwner = () => {
    const newCo: CoOwner = {
      id: `co-${Date.now()}`,
      name: '',
      email: '',
      phone: '',
      sharePercent: 50,
      isPrimary: false,
    };
    setCoOwners([...coOwners, newCo]);
  };

  const handleUpdateCoOwner = (index: number, field: keyof CoOwner, val: any) => {
    const updated = [...coOwners];
    updated[index] = { ...updated[index], [field]: val };
    setCoOwners(updated);
  };

  const handleRemoveCoOwner = (index: number) => {
    setCoOwners(coOwners.filter((_, i) => i !== index));
  };

  // Handle Password Change
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordErrorMsg(null);
    setPasswordSuccessMsg(null);

    if (!currentPassword) {
      setPasswordErrorMsg('Please enter your current password.');
      return;
    }
    if (newPassword.length < 4) {
      setPasswordErrorMsg('New password must be at least 4 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordErrorMsg('New password and confirmation do not match.');
      return;
    }

    setIsChangingPassword(true);
    try {
      const result = await changePassword(currentPassword, newPassword);
      if (result.success) {
        setPasswordSuccessMsg('Your password has been changed successfully! Please remember it for future sign-ins.');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccessMsg(null), 5000);
      } else {
        setPasswordErrorMsg(result.error || 'Failed to change password. Please check your current password.');
      }
    } catch (err: any) {
      setPasswordErrorMsg(err.message || 'Error occurred while updating password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-xl shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold">
              {role === 'admin' ? (
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              ) : (
                <Building className="w-5 h-5 text-neutral-100" />
              )}
            </div>
            <div>
              <h3 className="text-base font-bold text-neutral-900">
                Account &amp; Flat Profile
              </h3>
              <div className="flex items-center gap-2 text-xs text-neutral-500">
                <span>{currentUser.displayName}</span>
                <span className="font-mono text-[10px] px-1.5 py-0.5 bg-neutral-100 rounded text-neutral-700">
                  @{currentUser.username}
                </span>
                <span className={`px-1.5 py-0.5 rounded font-mono text-[9px] font-bold ${
                  role === 'admin' ? 'bg-neutral-900 text-white' : 'bg-emerald-100 text-emerald-800'
                }`}>
                  {role === 'admin' ? 'ADMIN' : `FLAT ${activeFlat?.id || ''}`}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-neutral-200 gap-4 text-xs font-medium">
          <button
            onClick={() => setActiveTab('flat')}
            className={`pb-2 flex items-center gap-1.5 transition-colors relative ${
              activeTab === 'flat'
                ? 'text-neutral-900 font-bold border-b-2 border-neutral-900'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Building className="w-3.5 h-3.5" />
            <span>Flat Information</span>
          </button>
          <button
            onClick={() => setActiveTab('password')}
            className={`pb-2 flex items-center gap-1.5 transition-colors relative ${
              activeTab === 'password'
                ? 'text-neutral-900 font-bold border-b-2 border-neutral-900'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <KeyRound className="w-3.5 h-3.5" />
            <span>Change Password</span>
          </button>
        </div>

        {/* TAB 1: FLAT INFORMATION */}
        {activeTab === 'flat' && (
          <div className="space-y-4 text-xs">
            {/* If Admin, allow selecting which flat to edit */}
            {role === 'admin' && (
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-neutral-900 block">Select Unit to Edit</span>
                  <span className="text-[11px] text-neutral-500">As admin, you can edit contact details for any flat</span>
                </div>
                <select
                  value={selectedFlatId}
                  onChange={(e) => setSelectedFlatId(e.target.value)}
                  className="p-1.5 border border-neutral-300 rounded font-semibold text-neutral-900 bg-white"
                >
                  {flats.map((f) => (
                    <option key={f.id} value={f.id}>
                      Flat {f.id} — {f.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Flat Details Banner */}
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg flex items-center justify-between">
              <div>
                <span className="font-bold text-neutral-900 text-sm">
                  Flat Unit {activeFlat.id}: {activeFlat.name}
                </span>
                <span className="text-neutral-500 block text-[11px]">
                  Floor {activeFlat.floor} • Shares: {activeFlat.shares} unit(s) • Ownership: {activeFlat.ownershipType === 'single' ? 'Sole Owner' : 'Multiple Owners'}
                </span>
              </div>
              <span className="px-2 py-1 bg-white border border-neutral-200 rounded text-[11px] font-mono text-neutral-700">
                Unit ID: {activeFlat.id}
              </span>
            </div>

            {/* Success / Error Banners */}
            {flatSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{flatSuccessMsg}</span>
              </div>
            )}
            {flatErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{flatErrorMsg}</span>
              </div>
            )}

            {/* Flat Edit Form */}
            <form onSubmit={handleSaveFlatInfo} className="space-y-3.5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Contact Person */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Primary Contact Person
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      required
                      value={contactPerson}
                      onChange={(e) => setContactPerson(e.target.value)}
                      placeholder="e.g. Faruk Ahmed"
                      className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                {/* Preferred Payment Method */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Default Payment Method
                  </label>
                  <div className="relative">
                    <CreditCard className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <select
                      value={defaultPaymentMethod}
                      onChange={(e) => setDefaultPaymentMethod(e.target.value as PaymentMethod)}
                      className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 bg-white focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    >
                      <option value="DBBL">Dutch-Bangla Bank (DBBL)</option>
                      <option value="bKash">bKash Mobile Banking</option>
                      <option value="Bank Transfer">Bank Transfer (EFT/NPSB)</option>
                      <option value="Cheque">Bank Cheque</option>
                      <option value="Cash">Cash Deposit</option>
                      <option value="Nagad">Nagad</option>
                    </select>
                  </div>
                </div>

                {/* Contact Email */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Contact Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="e.g. owner@example.com"
                      className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>

                {/* Contact Phone */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Contact Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="tel"
                      required
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="e.g. +880 1711-234567"
                      className="w-full pl-9 pr-3 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                    />
                  </div>
                </div>
              </div>

              {/* Co-owners Section */}
              <div className="pt-2 border-t border-neutral-200 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-semibold text-neutral-900 block">
                      Registered Flat Owners &amp; Co-Owners
                    </span>
                    <span className="text-[11px] text-neutral-500">
                      Specify all title holders and share percentages for Unit {activeFlat.id}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleAddCoOwner}
                    className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 rounded text-[11px] font-medium flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Co-Owner</span>
                  </button>
                </div>

                {coOwners.length === 0 ? (
                  <p className="text-[11px] text-neutral-400 italic py-1">
                    No individual co-owners listed. Using primary contact person.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {coOwners.map((co, index) => (
                      <div key={co.id || index} className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-semibold text-neutral-700">
                          <span>Owner #{index + 1} {co.isPrimary ? '(Primary Title Holder)' : ''}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveCoOwner(index)}
                            className="text-neutral-400 hover:text-rose-600 p-0.5 rounded"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                          <input
                            type="text"
                            placeholder="Full Name"
                            value={co.name}
                            onChange={(e) => handleUpdateCoOwner(index, 'name', e.target.value)}
                            className="p-1.5 border border-neutral-300 rounded bg-white text-neutral-900 text-[11px]"
                          />
                          <input
                            type="email"
                            placeholder="Email"
                            value={co.email}
                            onChange={(e) => handleUpdateCoOwner(index, 'email', e.target.value)}
                            className="p-1.5 border border-neutral-300 rounded bg-white text-neutral-900 text-[11px]"
                          />
                          <input
                            type="tel"
                            placeholder="Phone"
                            value={co.phone}
                            onChange={(e) => handleUpdateCoOwner(index, 'phone', e.target.value)}
                            className="p-1.5 border border-neutral-300 rounded bg-white text-neutral-900 text-[11px]"
                          />
                          <input
                            type="number"
                            placeholder="Share %"
                            value={co.sharePercent ?? ''}
                            onChange={(e) => handleUpdateCoOwner(index, 'sharePercent', parseInt(e.target.value) || 0)}
                            className="p-1.5 border border-neutral-300 rounded bg-white text-neutral-900 text-[11px]"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2 border-t border-neutral-200">
                <button
                  type="submit"
                  disabled={isSavingFlat}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isSavingFlat ? 'Saving...' : 'Save Flat Information'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* TAB 2: CHANGE PASSWORD */}
        {activeTab === 'password' && (
          <div className="space-y-4 text-xs">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              <span className="font-bold text-neutral-900 block">Change Account Password</span>
              <p className="text-[11px] text-neutral-500">
                Update your login password for user <strong className="text-neutral-900">@{currentUser.username}</strong>. Changes take effect immediately in the database.
              </p>
            </div>

            {/* Success / Error Banners */}
            {passwordSuccessMsg && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{passwordSuccessMsg}</span>
              </div>
            )}
            {passwordErrorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{passwordErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleChangePasswordSubmit} className="space-y-3.5">
              {/* Current Password */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Current Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Enter current password"
                    className="w-full pl-9 pr-9 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* New Password */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Minimum 4 characters"
                    className="w-full pl-9 pr-9 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Confirm New Password */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Confirm New Password
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-type new password"
                    className="w-full pl-9 pr-9 py-2 border border-neutral-300 rounded-lg text-neutral-900 focus:outline-hidden focus:ring-1 focus:ring-neutral-900"
                  />
                </div>
              </div>

              {/* Security advice */}
              <div className="p-2.5 bg-neutral-50 rounded-lg border border-neutral-200 text-[11px] text-neutral-600">
                <span>
                  After changing your password, your active session remains verified. Make sure to note your new password.
                </span>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-2 border-t border-neutral-200">
                <button
                  type="submit"
                  disabled={isChangingPassword}
                  className="px-4 py-2 bg-neutral-900 text-white rounded-lg font-medium text-xs hover:bg-neutral-800 transition-colors flex items-center gap-1.5 disabled:opacity-50 shadow-xs"
                >
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isChangingPassword ? 'Updating Password...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
