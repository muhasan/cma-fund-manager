import { pgTable, text, integer, numeric, boolean, timestamp, jsonb, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  username: text('username').notNull().unique(),
  password: text('password').notNull(),
  role: text('role').notNull().default('owner'), // 'admin' | 'owner'
  flatId: text('flat_id').references(() => flats.id),
  displayName: text('display_name').notNull(),
  email: text('email'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const fundSettings = pgTable('fund_settings', {
  id: text('id').primaryKey().default('default'),
  buildingName: text('building_name').notNull().default('Gulshan View Residency'),
  complexAddress: text('complex_address').notNull().default('House 14, Road 28, Gulshan-1, Dhaka 1212'),
  openingBalance: numeric('opening_balance', { precision: 14, scale: 2 }).notNull().default('0.00'),
  fiscalYear: text('fiscal_year').notNull().default('2025-2026'),
  currencySymbol: text('currency_symbol').notNull().default('৳'),
  adminName: text('admin_name').notNull().default('Mahmudul Hasan (Fund Manager)'),
  adminEmail: text('admin_email').notNull().default('mahmudul.ess@gmail.com'),
  adminPhone: text('admin_phone').notNull().default('+880 1819-245678'),
  dbblAccountName: text('dbbl_account_name').notNull().default('Gulshan View Residency Common Fund'),
  dbblAccountNo: text('dbbl_account_no').notNull().default('115.120.0098452'),
  dbblBranch: text('dbbl_branch').notNull().default('Gulshan Circle Branch'),
  bkashNumber: text('bkash_number').notNull().default('+880 1711-987654'),
  updatedAt: timestamp('updated_at').defaultNow(),
});

export const flats = pgTable('flats', {
  id: text('id').primaryKey(), // 'AB1', 'A2', 'B2', 'A3', 'B3', 'A4', 'B4', 'AB5'
  name: text('name').notNull(),
  floor: text('floor').notNull(),
  shares: integer('shares').notNull().default(1),
  ownershipType: text('ownership_type').notNull().default('multiple'), // 'single' or 'multiple'
  contactPerson: text('contact_person').notNull(),
  contactEmail: text('contact_email').notNull(),
  contactPhone: text('contact_phone').notNull(),
  defaultPaymentMethod: text('default_payment_method').notNull().default('DBBL'),
});

export const coOwners = pgTable('co_owners', {
  id: text('id').primaryKey(),
  flatId: text('flat_id').notNull().references(() => flats.id),
  name: text('name').notNull(),
  email: text('email').notNull(),
  phone: text('phone').notNull(),
  sharePercent: integer('share_percent'),
  isPrimary: boolean('is_primary').default(false),
});

export const deposits = pgTable('deposits', {
  id: text('id').primaryKey(),
  fiscalYear: text('fiscal_year').notNull().default('2025-2026'),
  date: text('date').notNull(),
  description: text('description').notNull(),
  flatId: text('flat_id').notNull().references(() => flats.id),
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  paymentMethod: text('payment_method').notNull().default('DBBL'),
  paidBy: text('paid_by'),
  referenceNo: text('reference_no'),
  receiptUrl: text('receipt_url'),
  notes: text('notes'),
  verified: boolean('verified').notNull().default(true),
  createdAt: timestamp('created_at').defaultNow(),
});

export const expenses = pgTable('expenses', {
  id: text('id').primaryKey(),
  fiscalYear: text('fiscal_year').notNull().default('2025-2026'),
  date: text('date').notNull(),
  description: text('description').notNull(),
  category: text('category').notNull().default('adhoc'),
  billingFrequency: text('billing_frequency').notNull().default('yearly'),
  numberOfShares: integer('number_of_shares').notNull().default(10),
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  perFlatBase: numeric('per_flat_base', { precision: 14, scale: 2 }).notNull().default('0.00'),
  allocations: jsonb('allocations').notNull().$type<Record<string, number>>(),
  vendorName: text('vendor_name'),
  receiptUrl: text('receipt_url'),
  receiptFileName: text('receipt_file_name'),
  receiptVerified: boolean('receipt_verified').notNull().default(true),
  notes: text('notes'),
  createdAt: timestamp('created_at').defaultNow(),
});

export const receipts = pgTable('receipts', {
  id: text('id').primaryKey(),
  expenseId: text('expense_id'),
  title: text('title').notNull(),
  vendorName: text('vendor_name').notNull(),
  date: text('date').notNull(),
  amount: numeric('amount', { precision: 14, scale: 2 }).notNull(),
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name').notNull(),
  fileType: text('file_type').notNull(),
  category: text('category').notNull(),
  uploadedAt: text('uploaded_at').notNull(),
  uploadedBy: text('uploaded_by').notNull(),
  verified: boolean('verified').notNull().default(true),
  notes: text('notes'),
});

export const fiscalYearArchives = pgTable('fiscal_year_archives', {
  id: text('id').primaryKey(),
  fiscalYear: text('fiscal_year').notNull().unique(), // e.g. "2023-2024", "2024-2025", etc.
  openingBalance: numeric('opening_balance', { precision: 14, scale: 2 }).notNull().default('0.00'),
  totalDeposits: numeric('total_deposits', { precision: 14, scale: 2 }).notNull().default('0.00'),
  totalExpenses: numeric('total_expenses', { precision: 14, scale: 2 }).notNull().default('0.00'),
  closingBalance: numeric('closing_balance', { precision: 14, scale: 2 }).notNull().default('0.00'),
  notes: text('notes'),
  importedAt: text('imported_at').notNull(),
  importedBy: text('imported_by').notNull(),
});
