import {
  FlatUnit,
  Deposit,
  Expense,
  Receipt,
  FundSettings,
  FiscalYearArchive,
} from '../types/index.ts';

export const INITIAL_SETTINGS: FundSettings = {
  buildingName: 'Gulshan View Residency',
  complexAddress: 'House 14, Road 28, Gulshan-1, Dhaka 1212',
  openingBalance: 0.00,
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

export const INITIAL_FLATS: FlatUnit[] = [
  {
    id: 'AB1',
    name: 'Flat AB1 (Combined Unit)',
    floor: '1st Floor',
    shares: 2,
    ownershipType: 'multiple',
    contactPerson: 'Dr. Masudur Rahman',
    contactEmail: 'm.rahman.ab1@example.com',
    contactPhone: '+880 1711-301101',
    defaultPaymentMethod: 'DBBL',
    coOwners: [
      {
        id: 'ab1-1',
        name: 'Dr. Masudur Rahman',
        email: 'm.rahman.ab1@example.com',
        phone: '+880 1711-301101',
        sharePercent: 50,
        isPrimary: true,
      },
      {
        id: 'ab1-2',
        name: 'Mrs. Sultana Rahman',
        email: 'sultana.rahman@example.com',
        phone: '+880 1713-301102',
        sharePercent: 50,
      },
    ],
  },
  {
    id: 'A2',
    name: 'Flat A2 (North Unit)',
    floor: '2nd Floor',
    shares: 1,
    ownershipType: 'multiple',
    contactPerson: 'Faruk Ahmed',
    contactEmail: 'faruk.ahmed.a2@example.com',
    contactPhone: '+880 1819-402201',
    defaultPaymentMethod: 'DBBL',
    coOwners: [
      {
        id: 'a2-1',
        name: 'Faruk Ahmed',
        email: 'faruk.ahmed.a2@example.com',
        phone: '+880 1819-402201',
        sharePercent: 50,
        isPrimary: true,
      },
      {
        id: 'a2-2',
        name: 'Tariq Ahmed',
        email: 'tariq.ahmed@example.com',
        phone: '+880 1819-402202',
        sharePercent: 50,
      },
    ],
  },
  {
    id: 'B2',
    name: 'Flat B2 (South Unit)',
    floor: '2nd Floor',
    shares: 1,
    ownershipType: 'multiple',
    contactPerson: 'Shahriar Khan',
    contactEmail: 'shahriar.khan.b2@example.com',
    contactPhone: '+880 1912-502203',
    defaultPaymentMethod: 'DBBL',
    coOwners: [
      {
        id: 'b2-1',
        name: 'Shahriar Khan',
        email: 'shahriar.khan.b2@example.com',
        phone: '+880 1912-502203',
        sharePercent: 60,
        isPrimary: true,
      },
      {
        id: 'b2-2',
        name: 'Nasreen Khan',
        email: 'nasreen.khan@example.com',
        phone: '+880 1912-502204',
        sharePercent: 40,
      },
    ],
  },
  {
    id: 'A3',
    name: 'Flat A3 (North Unit)',
    floor: '3rd Floor',
    shares: 1,
    ownershipType: 'multiple',
    contactPerson: 'Engr. Alamgir Kabir',
    contactEmail: 'alamgir.kabir.a3@example.com',
    contactPhone: '+880 1715-603301',
    defaultPaymentMethod: 'DBBL',
    coOwners: [
      {
        id: 'a3-1',
        name: 'Engr. Alamgir Kabir',
        email: 'alamgir.kabir.a3@example.com',
        phone: '+880 1715-603301',
        sharePercent: 50,
        isPrimary: true,
      },
      {
        id: 'a3-2',
        name: 'Rehana Alamgir',
        email: 'rehana.alamgir@example.com',
        phone: '+880 1715-603302',
        sharePercent: 50,
      },
    ],
  },
  {
    id: 'B3',
    name: 'Flat B3 (South Unit)',
    floor: '3rd Floor',
    shares: 1,
    ownershipType: 'multiple',
    contactPerson: 'Kabir Hossain',
    contactEmail: 'kabir.hossain.b3@example.com',
    contactPhone: '+880 1611-703304',
    defaultPaymentMethod: 'bKash',
    coOwners: [
      {
        id: 'b3-1',
        name: 'Kabir Hossain',
        email: 'kabir.hossain.b3@example.com',
        phone: '+880 1611-703304',
        sharePercent: 50,
        isPrimary: true,
      },
      {
        id: 'b3-2',
        name: 'Parveen Hossain',
        email: 'parveen.hossain@example.com',
        phone: '+880 1611-703305',
        sharePercent: 50,
      },
    ],
  },
  {
    id: 'A4',
    name: 'Flat A4 (North Unit)',
    floor: '4th Floor',
    shares: 1,
    ownershipType: 'multiple',
    contactPerson: 'Zillur Rahman',
    contactEmail: 'zillur.rahman.a4@example.com',
    contactPhone: '+880 1714-804401',
    defaultPaymentMethod: 'DBBL',
    coOwners: [
      {
        id: 'a4-1',
        name: 'Zillur Rahman',
        email: 'zillur.rahman.a4@example.com',
        phone: '+880 1714-804401',
        sharePercent: 50,
        isPrimary: true,
      },
      {
        id: 'a4-2',
        name: 'Anisur Rahman',
        email: 'anisur.rahman@example.com',
        phone: '+880 1714-804402',
        sharePercent: 50,
      },
    ],
  },
  {
    id: 'B4',
    name: 'Flat B4 (South Unit)',
    floor: '4th Floor',
    shares: 1,
    ownershipType: 'multiple',
    contactPerson: 'Mostafizur Rahman',
    contactEmail: 'mostafizur.b4@example.com',
    contactPhone: '+880 1817-904403',
    defaultPaymentMethod: 'DBBL',
    coOwners: [
      {
        id: 'b4-1',
        name: 'Mostafizur Rahman',
        email: 'mostafizur.b4@example.com',
        phone: '+880 1817-904403',
        sharePercent: 50,
        isPrimary: true,
      },
      {
        id: 'b4-2',
        name: 'Salma Mostafiz',
        email: 'salma.mostafiz@example.com',
        phone: '+880 1817-904404',
        sharePercent: 50,
      },
    ],
  },
  {
    id: 'AB5',
    name: 'Flat AB5 (Penthouse - Top Floor)',
    floor: '5th Floor',
    shares: 2,
    ownershipType: 'single',
    contactPerson: 'Mahmudul Hasan',
    contactEmail: 'mahmudul.ess@gmail.com',
    contactPhone: '+880 1819-245678',
    defaultPaymentMethod: 'Cash',
    coOwners: [
      {
        id: 'ab5-1',
        name: 'Mahmudul Hasan (Sole Owner)',
        email: 'mahmudul.ess@gmail.com',
        phone: '+880 1819-245678',
        sharePercent: 100,
        isPrimary: true,
      },
    ],
  },
];

// Start with blank database as requested
export const INITIAL_DEPOSITS: Deposit[] = [];
export const INITIAL_EXPENSES: Expense[] = [];
export const INITIAL_RECEIPTS: Receipt[] = [];
export const INITIAL_HISTORICAL_ARCHIVES: Record<string, FiscalYearArchive> = {};

// Helper to generate voucher SVG
export function generateVoucherDataUri(
  title: string,
  vendor: string,
  date: string,
  amount: number,
  receiptNo: string
): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="700" height="900" viewBox="0 0 700 900" style="background:#fff;font-family:sans-serif;">
    <rect width="100%" height="100%" fill="#ffffff" />
    <rect x="25" y="25" width="650" height="850" fill="none" stroke="#e2e8f0" stroke-width="2" rx="8" />
    <rect x="25" y="25" width="650" height="100" fill="#0f172a" rx="8" />
    <text x="50" y="70" fill="#ffffff" font-size="22" font-weight="bold">OFFICIAL PAYMENT RECEIPT / VOUCHER</text>
    <text x="50" y="100" fill="#94a3b8" font-size="13">Gulshan View Residency · Common Management Fund</text>
    
    <text x="50" y="170" fill="#64748b" font-size="12">VOUCHER / INVOICE REF</text>
    <text x="50" y="195" fill="#0f172a" font-size="16" font-weight="600">${receiptNo}</text>
    
    <text x="450" y="170" fill="#64748b" font-size="12">DATE ISSUED</text>
    <text x="450" y="195" fill="#0f172a" font-size="16" font-weight="600">${date}</text>
    
    <line x1="50" y1="225" x2="650" y2="225" stroke="#f1f5f9" stroke-width="2" />
    
    <text x="50" y="260" fill="#64748b" font-size="12">VENDOR / CONTRACTOR</text>
    <text x="50" y="285" fill="#0f172a" font-size="18" font-weight="bold">${vendor}</text>
    
    <text x="50" y="340" fill="#64748b" font-size="12">EXPENSE PURPOSE / DESCRIPTION</text>
    <text x="50" y="370" fill="#1e293b" font-size="16">${title}</text>
    
    <rect x="50" y="420" width="600" height="120" fill="#f8fafc" stroke="#e2e8f0" rx="6" />
    <text x="75" y="460" fill="#475569" font-size="14">Amount Authorized &amp; Disbursed</text>
    <text x="75" y="505" fill="#0f172a" font-size="32" font-weight="bold">BDT ৳${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</text>
    
    <rect x="50" y="570" width="600" height="160" fill="#fff" stroke="#f1f5f9" rx="6" />
    <text x="75" y="605" fill="#334155" font-size="13" font-weight="bold">Audit &amp; Compliance Details</text>
    <text x="75" y="635" fill="#64748b" font-size="12">• Expense verified against quotation and physical delivery</text>
    <text x="75" y="660" fill="#64748b" font-size="12">• Split across 10 Flat Shares as per Complex Bylaws</text>
    <text x="75" y="685" fill="#64748b" font-size="12">• Billed to Apartment Owners Common Management Fund</text>
    
    <g transform="translate(420, 750)">
      <circle cx="90" cy="50" r="45" fill="none" stroke="#16a34a" stroke-width="3" stroke-dasharray="4 2" />
      <text x="90" y="46" text-anchor="middle" fill="#16a34a" font-size="12" font-weight="bold">VERIFIED</text>
      <text x="90" y="62" text-anchor="middle" fill="#16a34a" font-size="9">PAID &amp; AUDITED</text>
    </g>
    
    <text x="50" y="790" fill="#64748b" font-size="12">Managed by Fund Administrator</text>
    <text x="50" y="810" fill="#0f172a" font-size="14" font-weight="600">Mahmudul Hasan</text>
    <text x="50" y="830" fill="#94a3b8" font-size="11">Gulshan View Residency Management Committee</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
