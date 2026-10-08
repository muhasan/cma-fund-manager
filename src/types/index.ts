export type OwnershipType = 'single' | 'multiple';

export interface CoOwner {
  id: string;
  name: string;
  email: string;
  phone: string;
  sharePercent?: number;
  isPrimary?: boolean;
}

export interface FlatUnit {
  id: string; // 'AB1' | 'A2' | 'B2' | 'A3' | 'B3' | 'A4' | 'B4' | 'AB5'
  name: string;
  floor: number | string;
  shares: number; // 2 for AB1 & AB5, 1 for others
  ownershipType: OwnershipType; // AB5 is single, rest multiple
  coOwners: CoOwner[];
  defaultPaymentMethod: 'DBBL' | 'bKash' | 'Cash' | 'Bank Transfer';
  contactPerson: string;
  contactEmail: string;
  contactPhone: string;
}

export type PaymentMethod = 'DBBL' | 'bKash' | 'Cash' | 'Bank Transfer' | 'Nagad';

export interface Deposit {
  id: string;
  fiscalYear?: string; // e.g. "2023", "2024", "2025", "2026"
  date: string; // ISO format YYYY-MM-DD
  description: string;
  flatId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paidBy?: string;
  referenceNo?: string;
  receiptUrl?: string;
  notes?: string;
  verified: boolean;
  createdAt: string;
}

export type ExpenseCategory =
  | 'tax'
  | 'generator'
  | 'lift'
  | 'painting_renovation'
  | 'repairs'
  | 'water_pump'
  | 'security_cctv'
  | 'fire_safety'
  | 'electrical'
  | 'cleaning'
  | 'adhoc';

export type BillingFrequency = 'yearly' | 'monthly' | 'adhoc' | 'daily';

export interface Expense {
  id: string;
  fiscalYear?: string; // e.g. "2023", "2024", "2025", "2026"
  date: string; // ISO format YYYY-MM-DD
  description: string;
  category: ExpenseCategory;
  billingFrequency: BillingFrequency;
  numberOfShares: number;
  amount: number;
  perFlatBase: number;
  allocations: Record<string, number>; // flatId -> amount billed
  vendorName?: string;
  receiptUrl?: string;
  receiptFileName?: string;
  receiptVerified: boolean;
  notes?: string;
  createdAt: string;
}

export interface UserAccount {
  id: string;
  username: string;
  role: 'admin' | 'owner';
  flatId?: string;
  displayName: string;
  email?: string;
  createdAt?: string;
}

export interface Receipt {
  id: string;
  expenseId?: string;
  title: string;
  vendorName: string;
  date: string;
  amount: number;
  fileUrl: string;
  fileName: string;
  fileType: string;
  category: string;
  uploadedAt: string;
  uploadedBy: string;
  verified: boolean;
  notes?: string;
}

export type NotificationType =
  | 'monthly_report'
  | 'due_reminder'
  | 'deposit_receipt'
  | 'adhoc_bill'
  | 'custom_broadcast';

export interface NotificationLog {
  id: string;
  sentAt: string;
  type: NotificationType;
  flatId?: string; // 'all' or specific flat ID
  recipientEmails: string[];
  subject: string;
  summary: string;
  bodyHtml: string;
  status: 'delivered' | 'queued';
  attachmentType?: 'statement' | 'report' | 'receipt';
}

export interface FiscalYearArchive {
  fiscalYear: string; // e.g. "2024-2025", "2023-2024", etc.
  openingBalance: number;
  totalDeposits: number;
  totalExpenses: number;
  closingBalance: number;
  deposits: Deposit[];
  expenses: Expense[];
  notes?: string;
  importedAt: string;
  importedBy: string;
}

export interface FundSettings {
  buildingName: string;
  complexAddress: string;
  openingBalance: number; // 97,372.00
  fiscalYear: string; // "2025-2026"
  currencySymbol: string; // "৳"
  adminName: string;
  adminEmail: string;
  adminPhone: string;
  dbblAccountName: string;
  dbblAccountNo: string;
  dbblBranch: string;
  bkashNumber: string;
}

export interface FlatBalanceSummary {
  flatId: string;
  flatName: string;
  shares: number;
  ownershipType: OwnershipType;
  totalDeposited: number;
  totalExpenseAllocated: number;
  balance: number; // deposited - allocated (negative means due / outstanding)
  coOwners: CoOwner[];
  lastDepositDate?: string;
  lastDepositAmount?: number;
}
