import { db } from './index.ts';
import {
  flats,
  coOwners,
  fundSettings,
  deposits,
  expenses,
  receipts,
  fiscalYearArchives,
  users,
} from './schema.ts';
import { eq, desc, asc } from 'drizzle-orm';
import type { Deposit, Expense, Receipt, FiscalYearArchive, FundSettings, UserAccount, FlatUnit } from '../types/index.ts';

export async function getAllFundData() {
  try {
    const settingsList = await db.select().from(fundSettings);
    const rawSettings = settingsList[0] || {
      id: 'default',
      buildingName: 'Gulshan View Residency',
      complexAddress: 'House 14, Road 28, Gulshan-1, Dhaka 1212',
      openingBalance: '0.00',
      fiscalYear: '2026',
      currencySymbol: '৳',
      adminName: 'Mahmudul Hasan (Fund Manager)',
      adminEmail: 'mahmudul.ess@gmail.com',
      adminPhone: '+880 1819-245678',
      dbblAccountName: 'Gulshan View Residency Common Fund',
      dbblAccountNo: '115.120.0098452',
      dbblBranch: 'Gulshan Circle Branch',
      bkashNumber: '+880 1711-987654',
    };

    const flatsList = await db.select().from(flats).orderBy(asc(flats.id));
    const coOwnersList = await db.select().from(coOwners);

    const fullFlats = flatsList.map((f) => ({
      ...f,
      ownershipType: (f.ownershipType as 'single' | 'multiple') || 'multiple',
      defaultPaymentMethod: (f.defaultPaymentMethod as any) || 'DBBL',
      coOwners: coOwnersList.filter((co) => co.flatId === f.id).map((co) => ({
        id: co.id,
        name: co.name,
        email: co.email,
        phone: co.phone,
        sharePercent: co.sharePercent ?? undefined,
        isPrimary: co.isPrimary ?? false,
      })),
    }));

    const depositsList = await db.select().from(deposits).orderBy(desc(deposits.date));
    const formattedDeposits: Deposit[] = depositsList.map((d) => ({
      id: d.id,
      fiscalYear: d.fiscalYear || '2026',
      date: d.date,
      description: d.description,
      flatId: d.flatId,
      amount: parseFloat(d.amount),
      paymentMethod: d.paymentMethod as any,
      paidBy: d.paidBy ?? undefined,
      referenceNo: d.referenceNo ?? undefined,
      receiptUrl: d.receiptUrl ?? undefined,
      notes: d.notes ?? undefined,
      verified: d.verified,
      createdAt: d.createdAt ? d.createdAt.toISOString() : new Date().toISOString(),
    }));

    const expensesList = await db.select().from(expenses).orderBy(desc(expenses.date));
    const formattedExpenses: Expense[] = expensesList.map((e) => ({
      id: e.id,
      fiscalYear: e.fiscalYear || '2026',
      date: e.date,
      description: e.description,
      category: e.category as any,
      billingFrequency: e.billingFrequency as any,
      numberOfShares: e.numberOfShares,
      amount: parseFloat(e.amount),
      perFlatBase: parseFloat(e.perFlatBase),
      allocations: (e.allocations as Record<string, number>) || {},
      vendorName: e.vendorName ?? undefined,
      receiptUrl: e.receiptUrl ?? undefined,
      receiptFileName: e.receiptFileName ?? undefined,
      receiptVerified: e.receiptVerified,
      notes: e.notes ?? undefined,
      createdAt: e.createdAt ? e.createdAt.toISOString() : new Date().toISOString(),
    }));

    const receiptsList = await db.select().from(receipts).orderBy(desc(receipts.date));
    const formattedReceipts: Receipt[] = receiptsList.map((r) => ({
      id: r.id,
      expenseId: r.expenseId ?? undefined,
      title: r.title,
      vendorName: r.vendorName,
      date: r.date,
      amount: parseFloat(r.amount),
      fileUrl: r.fileUrl,
      fileName: r.fileName,
      fileType: r.fileType,
      category: r.category,
      uploadedAt: r.uploadedAt,
      uploadedBy: r.uploadedBy,
      verified: r.verified,
      notes: r.notes ?? undefined,
    }));

    const archivesList = await db.select().from(fiscalYearArchives).orderBy(desc(fiscalYearArchives.fiscalYear));
    const formattedArchives: Record<string, FiscalYearArchive> = {};
    archivesList.forEach((a) => {
      const yearDeposits = formattedDeposits.filter((d) => d.fiscalYear === a.fiscalYear);
      const yearExpenses = formattedExpenses.filter((e) => e.fiscalYear === a.fiscalYear);
      formattedArchives[a.fiscalYear] = {
        fiscalYear: a.fiscalYear,
        openingBalance: parseFloat(a.openingBalance),
        totalDeposits: parseFloat(a.totalDeposits),
        totalExpenses: parseFloat(a.totalExpenses),
        closingBalance: parseFloat(a.closingBalance),
        notes: a.notes ?? undefined,
        importedAt: a.importedAt,
        importedBy: a.importedBy,
        deposits: yearDeposits,
        expenses: yearExpenses,
      };
    });

    const formattedSettings: FundSettings = {
      buildingName: rawSettings.buildingName,
      complexAddress: rawSettings.complexAddress,
      openingBalance: parseFloat(rawSettings.openingBalance),
      fiscalYear: rawSettings.fiscalYear,
      currencySymbol: rawSettings.currencySymbol,
      adminName: rawSettings.adminName,
      adminEmail: rawSettings.adminEmail,
      adminPhone: rawSettings.adminPhone,
      dbblAccountName: rawSettings.dbblAccountName,
      dbblAccountNo: rawSettings.dbblAccountNo,
      dbblBranch: rawSettings.dbblBranch,
      bkashNumber: rawSettings.bkashNumber,
    };

    return {
      settings: formattedSettings,
      flats: fullFlats,
      deposits: formattedDeposits,
      expenses: formattedExpenses,
      receipts: formattedReceipts,
      historicalArchives: formattedArchives,
    };
  } catch (error) {
    console.error('Database query failed in getAllFundData:', error);
    throw new Error('Database query failed. Please try again later.', { cause: error });
  }
}

export async function insertDeposit(data: Omit<Deposit, 'id' | 'createdAt'>) {
  try {
    const id = `dep-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await db.insert(deposits).values({
      id,
      fiscalYear: data.fiscalYear || '2026',
      date: data.date,
      description: data.description,
      flatId: data.flatId,
      amount: data.amount.toFixed(2),
      paymentMethod: data.paymentMethod,
      paidBy: data.paidBy || null,
      referenceNo: data.referenceNo || null,
      receiptUrl: data.receiptUrl || null,
      notes: data.notes || null,
      verified: true,
    });
    return id;
  } catch (error) {
    console.error('Failed to insert deposit:', error);
    throw new Error('Failed to insert deposit into database', { cause: error });
  }
}

export async function updateDepositDb(id: string, data: Partial<Deposit>) {
  try {
    const updatePayload: Record<string, any> = {};
    if (data.date !== undefined) updatePayload.date = data.date;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.flatId !== undefined) updatePayload.flatId = data.flatId;
    if (data.amount !== undefined) updatePayload.amount = data.amount.toFixed(2);
    if (data.paymentMethod !== undefined) updatePayload.paymentMethod = data.paymentMethod;
    if (data.paidBy !== undefined) updatePayload.paidBy = data.paidBy || null;
    if (data.referenceNo !== undefined) updatePayload.referenceNo = data.referenceNo || null;
    if (data.notes !== undefined) updatePayload.notes = data.notes || null;
    if (data.fiscalYear !== undefined) updatePayload.fiscalYear = data.fiscalYear;

    await db.update(deposits).set(updatePayload).where(eq(deposits.id, id));
  } catch (error) {
    console.error('Failed to update deposit:', error);
    throw new Error('Failed to update deposit in database', { cause: error });
  }
}

export async function deleteDepositById(id: string) {
  try {
    await db.delete(deposits).where(eq(deposits.id, id));
  } catch (error) {
    console.error('Failed to delete deposit:', error);
    throw new Error('Failed to delete deposit', { cause: error });
  }
}

export async function insertExpense(
  data: Omit<Expense, 'id' | 'createdAt'>,
  receiptData?: { fileName: string; fileUrl: string }
) {
  try {
    const expId = `exp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    await db.insert(expenses).values({
      id: expId,
      fiscalYear: data.fiscalYear || '2026',
      date: data.date,
      description: data.description,
      category: data.category,
      billingFrequency: data.billingFrequency,
      numberOfShares: data.numberOfShares,
      amount: data.amount.toFixed(2),
      perFlatBase: (data.perFlatBase || 0).toFixed(2),
      allocations: data.allocations || {},
      vendorName: data.vendorName || null,
      receiptUrl: receiptData?.fileUrl || data.receiptUrl || null,
      receiptFileName: receiptData?.fileName || data.receiptFileName || null,
      receiptVerified: true,
      notes: data.notes || null,
    });

    if (receiptData || data.receiptUrl) {
      await db.insert(receipts).values({
        id: `rcp-${Date.now()}`,
        expenseId: expId,
        title: data.description,
        vendorName: data.vendorName || 'Authorized Vendor',
        date: data.date,
        amount: data.amount.toFixed(2),
        fileUrl: receiptData?.fileUrl || data.receiptUrl || '',
        fileName: receiptData?.fileName || data.receiptFileName || 'Expense_Voucher.pdf',
        fileType: receiptData?.fileUrl?.startsWith('data:image') ? 'image/jpeg' : 'application/pdf',
        category: data.category,
        uploadedAt: new Date().toISOString(),
        uploadedBy: 'Admin',
        verified: true,
        notes: data.notes || null,
      });
    }

    return expId;
  } catch (error) {
    console.error('Failed to insert expense:', error);
    throw new Error('Failed to insert expense into database', { cause: error });
  }
}

export async function updateExpenseDb(id: string, data: Partial<Expense>) {
  try {
    const updatePayload: Record<string, any> = {};
    if (data.date !== undefined) updatePayload.date = data.date;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.billingFrequency !== undefined) updatePayload.billingFrequency = data.billingFrequency;
    if (data.numberOfShares !== undefined) updatePayload.numberOfShares = data.numberOfShares;
    if (data.amount !== undefined) updatePayload.amount = data.amount.toFixed(2);
    if (data.perFlatBase !== undefined) updatePayload.perFlatBase = data.perFlatBase.toFixed(2);
    if (data.allocations !== undefined) updatePayload.allocations = data.allocations;
    if (data.vendorName !== undefined) updatePayload.vendorName = data.vendorName || null;
    if (data.notes !== undefined) updatePayload.notes = data.notes || null;
    if (data.fiscalYear !== undefined) updatePayload.fiscalYear = data.fiscalYear;

    await db.update(expenses).set(updatePayload).where(eq(expenses.id, id));

    // Also update associated receipt if exists
    if (data.description || data.amount !== undefined || data.date || data.category || data.vendorName) {
      const receiptUpdates: Record<string, any> = {};
      if (data.description) receiptUpdates.title = data.description;
      if (data.amount !== undefined) receiptUpdates.amount = data.amount.toFixed(2);
      if (data.date) receiptUpdates.date = data.date;
      if (data.category) receiptUpdates.category = data.category;
      if (data.vendorName) receiptUpdates.vendorName = data.vendorName;
      await db.update(receipts).set(receiptUpdates).where(eq(receipts.expenseId, id));
    }
  } catch (error) {
    console.error('Failed to update expense:', error);
    throw new Error('Failed to update expense in database', { cause: error });
  }
}

export async function deleteExpenseById(id: string) {
  try {
    await db.delete(expenses).where(eq(expenses.id, id));
    await db.delete(receipts).where(eq(receipts.expenseId, id));
  } catch (error) {
    console.error('Failed to delete expense:', error);
    throw new Error('Failed to delete expense', { cause: error });
  }
}

export async function updateFundSettingsDb(data: Partial<FundSettings>) {
  try {
    const updatePayload: Record<string, any> = {};
    if (data.buildingName !== undefined) updatePayload.buildingName = data.buildingName;
    if (data.complexAddress !== undefined) updatePayload.complexAddress = data.complexAddress;
    if (data.openingBalance !== undefined) updatePayload.openingBalance = data.openingBalance.toFixed(2);
    if (data.fiscalYear !== undefined) updatePayload.fiscalYear = data.fiscalYear;
    if (data.adminName !== undefined) updatePayload.adminName = data.adminName;
    if (data.adminEmail !== undefined) updatePayload.adminEmail = data.adminEmail;
    if (data.adminPhone !== undefined) updatePayload.adminPhone = data.adminPhone;
    if (data.dbblAccountName !== undefined) updatePayload.dbblAccountName = data.dbblAccountName;
    if (data.dbblAccountNo !== undefined) updatePayload.dbblAccountNo = data.dbblAccountNo;
    if (data.dbblBranch !== undefined) updatePayload.dbblBranch = data.dbblBranch;
    if (data.bkashNumber !== undefined) updatePayload.bkashNumber = data.bkashNumber;

    await db.update(fundSettings).set(updatePayload).where(eq(fundSettings.id, 'default'));
  } catch (error) {
    console.error('Failed to update fund settings:', error);
    throw new Error('Failed to update fund settings', { cause: error });
  }
}

export async function updateFlatDb(flatId: string, data: Partial<FlatUnit>) {
  try {
    const updatePayload: Record<string, any> = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.floor !== undefined) updatePayload.floor = String(data.floor);
    if (data.shares !== undefined) updatePayload.shares = data.shares;
    if (data.ownershipType !== undefined) updatePayload.ownershipType = data.ownershipType;
    if (data.contactPerson !== undefined) updatePayload.contactPerson = data.contactPerson;
    if (data.contactEmail !== undefined) updatePayload.contactEmail = data.contactEmail;
    if (data.contactPhone !== undefined) updatePayload.contactPhone = data.contactPhone;
    if (data.defaultPaymentMethod !== undefined) updatePayload.defaultPaymentMethod = data.defaultPaymentMethod;

    if (Object.keys(updatePayload).length > 0) {
      await db.update(flats).set(updatePayload).where(eq(flats.id, flatId));
    }

    if (data.coOwners) {
      await db.delete(coOwners).where(eq(coOwners.flatId, flatId));
      for (const co of data.coOwners) {
        await db.insert(coOwners).values({
          id: co.id || `co-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          flatId,
          name: co.name,
          email: co.email,
          phone: co.phone,
          sharePercent: co.sharePercent ?? null,
          isPrimary: co.isPrimary ?? false,
        });
      }
    }
  } catch (error) {
    console.error('Failed to update flat:', error);
    throw new Error('Failed to update flat', { cause: error });
  }
}

export async function importFiscalYearBatch(
  fiscalYear: string,
  openingBalance: number,
  depositsList: Deposit[],
  expensesList: Expense[],
  notes?: string
) {
  try {
    const totalDeposits = depositsList.reduce((acc, d) => acc + (d.amount || 0), 0);
    const totalExpenses = expensesList.reduce((acc, e) => acc + (e.amount || 0), 0);
    const closingBalance = openingBalance + totalDeposits - totalExpenses;

    const archiveId = `arch-${fiscalYear.replace(/[^a-zA-Z0-9]/g, '-')}`;

    // Upsert archive
    await db.insert(fiscalYearArchives).values({
      id: archiveId,
      fiscalYear,
      openingBalance: openingBalance.toFixed(2),
      totalDeposits: totalDeposits.toFixed(2),
      totalExpenses: totalExpenses.toFixed(2),
      closingBalance: closingBalance.toFixed(2),
      notes: notes || `Historical archive for ${fiscalYear}`,
      importedAt: new Date().toISOString(),
      importedBy: 'Admin',
    }).onConflictDoUpdate({
      target: fiscalYearArchives.fiscalYear,
      set: {
        openingBalance: openingBalance.toFixed(2),
        totalDeposits: totalDeposits.toFixed(2),
        totalExpenses: totalExpenses.toFixed(2),
        closingBalance: closingBalance.toFixed(2),
        notes: notes || `Historical archive for ${fiscalYear}`,
        importedAt: new Date().toISOString(),
      },
    });

    // Also insert any itemized deposits for this year
    for (const dep of depositsList) {
      await db.insert(deposits).values({
        id: dep.id || `dep-imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fiscalYear,
        date: dep.date,
        description: dep.description,
        flatId: dep.flatId,
        amount: dep.amount.toFixed(2),
        paymentMethod: dep.paymentMethod,
        paidBy: dep.paidBy || null,
        referenceNo: dep.referenceNo || null,
        notes: dep.notes || null,
        verified: true,
      });
    }

    // Insert itemized expenses for this year
    for (const exp of expensesList) {
      await db.insert(expenses).values({
        id: exp.id || `exp-imp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        fiscalYear,
        date: exp.date,
        description: exp.description,
        category: exp.category,
        billingFrequency: exp.billingFrequency,
        numberOfShares: exp.numberOfShares,
        amount: exp.amount.toFixed(2),
        perFlatBase: (exp.perFlatBase || 0).toFixed(2),
        allocations: exp.allocations || {},
        vendorName: exp.vendorName || null,
        notes: exp.notes || null,
        receiptVerified: true,
      });
    }

    return { totalDeposits, totalExpenses, closingBalance };
  } catch (error) {
    console.error('Failed to import fiscal year batch:', error);
    throw new Error('Failed to import fiscal year batch', { cause: error });
  }
}

export async function updateFiscalYearArchiveDb(
  year: string,
  data: { openingBalance?: number; notes?: string }
) {
  try {
    const existing = await db.select().from(fiscalYearArchives).where(eq(fiscalYearArchives.fiscalYear, year));
    if (existing.length === 0) {
      throw new Error(`Archive for year ${year} not found`);
    }
    const current = existing[0];
    const newOpening = data.openingBalance !== undefined ? data.openingBalance : parseFloat(current.openingBalance);
    const totDep = parseFloat(current.totalDeposits);
    const totExp = parseFloat(current.totalExpenses);
    const newClosing = newOpening + totDep - totExp;

    const payload: Record<string, any> = {
      openingBalance: newOpening.toFixed(2),
      closingBalance: newClosing.toFixed(2),
    };
    if (data.notes !== undefined) payload.notes = data.notes;

    await db.update(fiscalYearArchives).set(payload).where(eq(fiscalYearArchives.fiscalYear, year));
    return { openingBalance: newOpening, closingBalance: newClosing };
  } catch (error) {
    console.error('Failed to update fiscal year archive:', error);
    throw new Error('Failed to update fiscal year archive', { cause: error });
  }
}

export async function deleteFiscalYearArchiveDb(year: string) {
  try {
    await db.delete(fiscalYearArchives).where(eq(fiscalYearArchives.fiscalYear, year));
    await db.delete(deposits).where(eq(deposits.fiscalYear, year));
    await db.delete(expenses).where(eq(expenses.fiscalYear, year));
  } catch (error) {
    console.error('Failed to delete fiscal year archive:', error);
    throw new Error('Failed to delete fiscal year archive', { cause: error });
  }
}

export async function resetDatabaseToBlankDb() {
  try {
    await db.delete(deposits);
    await db.delete(expenses);
    await db.delete(receipts);
    await db.delete(fiscalYearArchives);
    await db.update(fundSettings).set({ openingBalance: '0.00' }).where(eq(fundSettings.id, 'default'));
  } catch (error) {
    console.error('Failed to reset database to blank:', error);
    throw new Error('Failed to reset database to blank', { cause: error });
  }
}

// User Authentication and Accounts
export async function authenticateUser(username: string, password: string) {
  try {
    const userRows = await db.select().from(users);
    const user = userRows.find(
      (u) => u.username.toLowerCase() === username.trim().toLowerCase() && u.password === password
    );
    if (!user) {
      return null;
    }
    return {
      id: user.id,
      username: user.username,
      role: (user.role as 'admin' | 'owner') || 'owner',
      flatId: user.flatId || undefined,
      displayName: user.displayName,
      email: user.email || undefined,
    };
  } catch (error) {
    console.error('Failed to authenticate user:', error);
    throw new Error('Authentication failed', { cause: error });
  }
}

export async function getAllUsersDb() {
  try {
    const list = await db.select().from(users).orderBy(asc(users.username));
    return list.map((u) => ({
      id: u.id,
      username: u.username,
      role: (u.role as 'admin' | 'owner') || 'owner',
      flatId: u.flatId || undefined,
      displayName: u.displayName,
      email: u.email || undefined,
      createdAt: u.createdAt ? u.createdAt.toISOString() : undefined,
    }));
  } catch (error) {
    console.error('Failed to get all users:', error);
    throw new Error('Failed to get users', { cause: error });
  }
}

export async function updateUserDb(
  id: string,
  data: { username?: string; password?: string; role?: string; flatId?: string; displayName?: string; email?: string }
) {
  try {
    const payload: Record<string, any> = {};
    if (data.username !== undefined) payload.username = data.username.trim().toLowerCase();
    if (data.password !== undefined && data.password.trim() !== '') payload.password = data.password;
    if (data.role !== undefined) payload.role = data.role;
    if (data.flatId !== undefined) payload.flatId = data.flatId || null;
    if (data.displayName !== undefined) payload.displayName = data.displayName;
    if (data.email !== undefined) payload.email = data.email || null;

    await db.update(users).set(payload).where(eq(users.id, id));
  } catch (error) {
    console.error('Failed to update user:', error);
    throw new Error('Failed to update user', { cause: error });
  }
}

export async function createUserDb(data: {
  username: string;
  password: string;
  role?: string;
  flatId?: string;
  displayName: string;
  email?: string;
}) {
  try {
    const id = `usr-${Date.now()}`;
    await db.insert(users).values({
      id,
      username: data.username.trim().toLowerCase(),
      password: data.password,
      role: data.role || 'owner',
      flatId: data.flatId || null,
      displayName: data.displayName,
      email: data.email || null,
    });
    return id;
  } catch (error) {
    console.error('Failed to create user:', error);
    throw new Error('Failed to create user', { cause: error });
  }
}

export async function deleteUserDb(id: string) {
  try {
    await db.delete(users).where(eq(users.id, id));
  } catch (error) {
    console.error('Failed to delete user:', error);
    throw new Error('Failed to delete user', { cause: error });
  }
}

export async function changeUserPasswordDb(userId: string, currentPassword: string, newPassword: string) {
  try {
    const userRows = await db.select().from(users).where(eq(users.id, userId));
    if (userRows.length === 0) {
      throw new Error('User account not found');
    }
    const user = userRows[0];
    if (user.password !== currentPassword) {
      throw new Error('Current password does not match');
    }
    if (!newPassword || newPassword.trim().length < 4) {
      throw new Error('New password must be at least 4 characters');
    }
    await db.update(users).set({ password: newPassword.trim() }).where(eq(users.id, userId));
    return { success: true, message: 'Password updated successfully' };
  } catch (error: any) {
    console.error('Failed to change password:', error);
    throw new Error(error.message || 'Failed to change password', { cause: error });
  }
}

export async function ensureUsersSeeded() {
  try {
    const existing = await db.select().from(users);
    const requiredUsers = [
      { id: 'usr-admin', username: 'admin', password: 'admin123', role: 'admin', flatId: 'AB5', displayName: 'Mahmudul Hasan (Admin)', email: 'mahmudul.ess@gmail.com' },
      { id: 'usr-ab1', username: 'flat_ab1', password: 'flat123', role: 'owner', flatId: 'AB1', displayName: 'Dr. Masudur Rahman (AB1)', email: 'm.rahman.ab1@example.com' },
      { id: 'usr-a2', username: 'flat_a2', password: 'flat123', role: 'owner', flatId: 'A2', displayName: 'Faruk Ahmed (A2)', email: 'faruk.ahmed.a2@example.com' },
      { id: 'usr-b2', username: 'flat_b2', password: 'flat123', role: 'owner', flatId: 'B2', displayName: 'Shahriar Khan (B2)', email: 'shahriar.khan.b2@example.com' },
      { id: 'usr-a3', username: 'flat_a3', password: 'flat123', role: 'owner', flatId: 'A3', displayName: 'Engr. Alamgir Kabir (A3)', email: 'alamgir.kabir.a3@example.com' },
      { id: 'usr-b3', username: 'flat_b3', password: 'flat123', role: 'owner', flatId: 'B3', displayName: 'Kabir Hossain (B3)', email: 'kabir.hossain.b3@example.com' },
      { id: 'usr-a4', username: 'flat_a4', password: 'flat123', role: 'owner', flatId: 'A4', displayName: 'Zillur Rahman (A4)', email: 'zillur.rahman.a4@example.com' },
      { id: 'usr-b4', username: 'flat_b4', password: 'flat123', role: 'owner', flatId: 'B4', displayName: 'Mostafizur Rahman (B4)', email: 'mostafizur.b4@example.com' },
      { id: 'usr-ab5', username: 'flat_ab5', password: 'flat123', role: 'owner', flatId: 'AB5', displayName: 'Mahmudul Hasan (AB5)', email: 'mahmudul.ess@gmail.com' },
    ];

    for (const reqUser of requiredUsers) {
      const found = existing.find((u) => u.username.toLowerCase() === reqUser.username.toLowerCase());
      if (!found) {
        await db.insert(users).values(reqUser);
      }
    }
  } catch (err) {
    console.warn('Error in ensureUsersSeeded:', err);
  }
}
