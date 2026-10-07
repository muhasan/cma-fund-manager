import React, { useState } from 'react';
import { useFund } from '../context/FundContext';
import { FiscalYearArchive } from '../types';
import { 
  Calendar, 
  Upload, 
  Download, 
  FileSpreadsheet, 
  ShieldAlert, 
  CheckCircle2, 
  Trash2, 
  ChevronRight, 
  FileText, 
  ArrowRight, 
  Plus, 
  X,
  Lock,
  Building,
  RotateCcw
} from 'lucide-react';

export const PreviousYearsManager: React.FC = () => {
  const { 
    historicalArchives, 
    financialStats, 
    settings, 
    role, 
    importPreviousYearData, 
    parseAndImportCsv, 
    deleteHistoricalYear 
  } = useFund();

  const [selectedYear, setSelectedYear] = useState<string>('2024-2025');
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importStatusMessage, setImportStatusMessage] = useState<{ text: string; success: boolean } | null>(null);

  // Import modal form states
  const [targetYear, setTargetYear] = useState('2024-2025');
  const [targetOpeningBalance, setTargetOpeningBalance] = useState('82150.00');
  const [targetNotes, setTargetNotes] = useState('');
  const [importMethod, setImportMethod] = useState<'csv' | 'summary'>('csv');
  const [csvContentText, setCsvContentText] = useState('');
  const [csvFileName, setCsvFileName] = useState('');

  // Summary method states
  const [summaryDeposits, setSummaryDeposits] = useState('340000.00');
  const [summaryExpenses, setSummaryExpenses] = useState('324778.00');

  const selectedArchive = historicalArchives[selectedYear];

  // Combined 5-year comparison data
  const yearlyRecords = [
    {
      year: '2025-2026',
      isCurrent: true,
      opening: settings.openingBalance,
      deposits: financialStats.totalDeposits,
      expenses: financialStats.totalExpenses,
      closing: financialStats.currentBalance,
      notes: 'Current active fiscal year ledger (under continuous management)',
    },
    ...Object.values(historicalArchives).map((arch) => ({
      year: arch.fiscalYear,
      isCurrent: false,
      opening: arch.openingBalance,
      deposits: arch.totalDeposits,
      expenses: arch.totalExpenses,
      closing: arch.closingBalance,
      notes: arch.notes || 'Audited historical records',
    })),
  ].sort((a, b) => b.year.localeCompare(a.year));

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setCsvFileName(file.name);
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        setCsvContentText(text || '');
      };
      reader.readAsText(file);
    }
  };

  const handleDownloadSampleCsv = () => {
    const sample = `List of Deposits,,,,,,Balance From Last Year,Total Fund Received,Total Spent,Current Balance,,,,
Date,Description,Flat,Amount,Balance,,,,,,,,,
"2024-11-15","Annual contribution Flat AB1 in DBBL",AB1,"68000.00","0.00",,"82150.00","340000.00","324778.00","97372.00",,,,
"2024-11-18","Annual contribution Flat A2 in DBBL",A2,"34000.00","0.00",,,,,,,,,
"2024-11-20","Annual contribution Flat B2 in DBBL",B2,"34000.00","0.00",,,,,,,,,
"2024-11-20","Annual contribution Flat A3 in DBBL",A3,"34000.00","0.00",,,,,,,,,
"2024-11-22","Annual contribution Flat B3 in bKash",B3,"34000.00","0.00",,,,,,,,,
"2024-11-25","Annual contribution Flat A4 in DBBL",A4,"34000.00","0.00",,,,,,,,,
"2024-11-28","Annual contribution Flat B4 in DBBL",B4,"34000.00","0.00",,,,,,,,,
"2024-12-05","Annual contribution Flat AB5 in Cash",AB5,"68000.00","0.00",,,,,,,,,
Total,,,"340000.00","0.00",,,,,,,,,
,,,,,,,,,,,,,
List of Expense,,,,,,,,,,,,,
Date,Description,,Number of Share,Amount,Per Flat,AB1,A2,B2,A3,B3,A4,B4,AB5
"2024-08-10","Rooftop Waterproofing & Bitumen Sealant Coating",,10,"95000.00",9500,19000,9500,9500,9500,9500,9500,9500,19000
"2024-10-15","Lift Traction Wire Rope Replacement",,10,"82000.00",8200,16400,8200,8200,8200,8200,8200,8200,16400
"2024-12-23","Yearly Generator Overhauling & Filters",,10,"48500.00",4850,9700,4850,4850,4850,4850,4850,4850,9700
"2025-01-18","Intercom Security System Rewiring",,10,"36000.00",3600,7200,3600,3600,3600,3600,3600,3600,7200
"2025-03-12","Municipal Holding Tax Assessment",,10,"33278.00",3328,6656,3328,3328,3328,3328,3328,3328,6656
"2025-05-20","Underground & Overhead Water Tanks Cleaning",,10,"30000.00",3000,6000,3000,3000,3000,3000,3000,3000,6000
Total,,,,"324778.00",,"64956.00","32478.00","32478.00","32478.00","32478.00","32478.00","32478.00","64956.00"`;

    const blob = new Blob([sample], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.setAttribute('download', 'Sample_Apartment_Fund_Yearly_Import.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExecuteImport = (e: React.FormEvent) => {
    e.preventDefault();
    const opBal = parseFloat(targetOpeningBalance) || 0;

    if (importMethod === 'csv') {
      if (!csvContentText) {
        alert('Please choose a CSV file or paste CSV content first.');
        return;
      }
      const result = parseAndImportCsv(csvContentText, targetYear, opBal, targetNotes);
      setImportStatusMessage({
        text: result.message,
        success: result.success,
      });
      if (result.success) {
        setSelectedYear(targetYear);
        setIsImportModalOpen(false);
      }
    } else {
      const depAmt = parseFloat(summaryDeposits) || 0;
      const expAmt = parseFloat(summaryExpenses) || 0;
      importPreviousYearData(
        targetYear,
        opBal,
        [
          {
            id: `dep-summary-${Date.now()}`,
            date: `${targetYear.slice(0, 4)}-12-01`,
            description: `Aggregated Collections for FY ${targetYear}`,
            flatId: 'AB1',
            amount: depAmt,
            paymentMethod: 'DBBL',
            verified: true,
            createdAt: new Date().toISOString(),
          },
        ],
        [
          {
            id: `exp-summary-${Date.now()}`,
            date: `${targetYear.slice(5)}-05-01`,
            description: `Aggregated Annual Maintenance Disbursements for FY ${targetYear}`,
            category: 'adhoc',
            billingFrequency: 'yearly',
            numberOfShares: 10,
            amount: expAmt,
            perFlatBase: Math.round(expAmt / 10),
            allocations: {},
            receiptVerified: true,
            createdAt: new Date().toISOString(),
          },
        ],
        targetNotes || `Historical yearly balance carry-over for ${targetYear}`
      );
      setImportStatusMessage({
        text: `Fiscal Year ${targetYear} successfully imported!`,
        success: true,
      });
      setSelectedYear(targetYear);
      setIsImportModalOpen(false);
    }
  };

  const handleDeleteYear = (year: string) => {
    if (window.confirm(`Delete historical archive for ${year}?`)) {
      deleteHistoricalYear(year);
      const remaining = Object.keys(historicalArchives).filter((y) => y !== year);
      if (remaining.length > 0) setSelectedYear(remaining[0]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-neutral-900 tracking-tight">
              Previous Years Data &amp; 5-Year History
            </h2>
            <span className="px-2 py-0.5 bg-neutral-100 text-neutral-800 text-[11px] font-mono font-bold rounded">
              5 YEARS MANAGING
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Historical records, annual carry-overs, and prior maintenance audits from 2021 to current date
          </p>
        </div>

        {/* Admin-only Import Button vs Restricted Notice */}
        <div>
          {role === 'admin' ? (
            <button
              onClick={() => {
                setTargetYear('2024-2025');
                setTargetOpeningBalance('82150.00');
                setTargetNotes('');
                setCsvContentText('');
                setCsvFileName('');
                setIsImportModalOpen(true);
              }}
              className="px-3.5 py-2 bg-neutral-900 text-white rounded-md text-xs font-medium hover:bg-neutral-800 transition-colors flex items-center gap-1.5 shadow-xs whitespace-nowrap"
            >
              <Upload className="w-4 h-4" />
              Import Previous Year Data
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-100 px-3 py-1.5 rounded-md border border-neutral-200">
              <Lock className="w-3.5 h-3.5 text-neutral-400" />
              <span>Import Restricted to Admin</span>
            </div>
          )}
        </div>
      </div>

      {/* Status Message */}
      {importStatusMessage && (
        <div
          className={`p-3 rounded-lg border text-xs flex items-center justify-between ${
            importStatusMessage.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{importStatusMessage.text}</span>
          </div>
          <button
            onClick={() => setImportStatusMessage(null)}
            className="text-neutral-500 hover:text-neutral-900"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 5-Year Historical Performance Comparison Table */}
      <div className="bg-white border border-neutral-200 rounded-lg overflow-hidden">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
          <div>
            <h3 className="text-sm font-semibold text-neutral-900">
              5-Year Reserve &amp; Expenditure Rollover Audit
            </h3>
            <p className="text-xs text-neutral-500">
              Shows continuous year-over-year carry-forward balance across your 5 years managing the fund
            </p>
          </div>
          <button
            onClick={handleDownloadSampleCsv}
            className="text-xs text-neutral-700 hover:text-neutral-900 underline flex items-center gap-1 font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            Sample CSV Template
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                <th className="py-3 px-4 font-semibold">Fiscal Year</th>
                <th className="py-3 px-4 font-semibold text-right">Opening Reserve</th>
                <th className="py-3 px-4 font-semibold text-right">Collections Received</th>
                <th className="py-3 px-4 font-semibold text-right">Expenses Disbursed</th>
                <th className="py-3 px-4 font-semibold text-right">Closing Balance</th>
                <th className="py-3 px-4 font-semibold">Annual Maintenance Highlights</th>
                <th className="py-3 px-3 font-semibold text-center">Status</th>
                <th className="py-3 px-4 font-semibold text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-800">
              {yearlyRecords.map((rec) => (
                <tr
                  key={rec.year}
                  onClick={() => !rec.isCurrent && setSelectedYear(rec.year)}
                  className={`hover:bg-neutral-50/80 transition-colors ${
                    selectedYear === rec.year ? 'bg-neutral-50/60' : ''
                  } ${!rec.isCurrent ? 'cursor-pointer' : ''}`}
                >
                  <td className="py-3 px-4 whitespace-nowrap">
                    <div className="font-bold text-neutral-900 flex items-center gap-2">
                      <span>{rec.year}</span>
                      {rec.isCurrent && (
                        <span className="px-1.5 py-0.5 bg-neutral-900 text-white text-[10px] rounded font-mono font-semibold">
                          CURRENT
                        </span>
                      )}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums text-neutral-700">
                    ৳{rec.opening.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-emerald-800">
                    ৳{rec.deposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-rose-800">
                    ৳{rec.expenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-neutral-900">
                    ৳{rec.closing.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>

                  <td className="py-3 px-4 text-neutral-600 max-w-xs truncate">
                    {rec.notes}
                  </td>

                  <td className="py-3 px-3 text-center whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-mono text-[10px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {rec.isCurrent ? 'ACTIVE' : 'AUDITED'}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right whitespace-nowrap">
                    {!rec.isCurrent ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedYear(rec.year);
                        }}
                        className="text-xs font-medium text-neutral-900 hover:text-neutral-600 underline"
                      >
                        Inspect →
                      </button>
                    ) : (
                      <span className="text-neutral-400 text-xs">Active Dashboard</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Historical Year Details & Ledger */}
      {selectedArchive && (
        <div className="bg-white border border-neutral-200 rounded-lg p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-4 border-b border-neutral-200">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 bg-neutral-900 text-white text-[11px] font-bold rounded">
                  HISTORICAL ARCHIVE
                </span>
                <span className="text-xs font-mono text-neutral-500">
                  Imported by {selectedArchive.importedBy}
                </span>
              </div>
              <h3 className="text-xl font-bold text-neutral-900 mt-2">
                Fiscal Year {selectedArchive.fiscalYear} Annual Audit Ledger
              </h3>
              <p className="text-xs text-neutral-600 mt-1 max-w-2xl">
                {selectedArchive.notes}
              </p>
            </div>

            {role === 'admin' && (
              <button
                onClick={() => handleDeleteYear(selectedArchive.fiscalYear)}
                className="p-2 text-neutral-400 hover:text-rose-600 rounded hover:bg-rose-50 transition-colors text-xs flex items-center gap-1"
                title="Delete this historical year"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete Archive</span>
              </button>
            )}
          </div>

          {/* 4 Stat Cards for the selected historical year */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              <span className="text-neutral-500 text-[11px] block">Opening Balance</span>
              <span className="text-base font-bold text-neutral-900">
                ৳{selectedArchive.openingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              <span className="text-neutral-500 text-[11px] block">Total Collections</span>
              <span className="text-base font-bold text-emerald-800">
                ৳{selectedArchive.totalDeposits.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-lg">
              <span className="text-neutral-500 text-[11px] block">Maintenance Spent</span>
              <span className="text-base font-bold text-rose-800">
                ৳{selectedArchive.totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="p-3 bg-neutral-50 border border-neutral-900 rounded-lg">
              <span className="text-neutral-900 text-[11px] font-bold block">Closing Fund Reserve</span>
              <span className="text-base font-bold text-neutral-900">
                ৳{selectedArchive.closingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>

          {/* Itemized Historical Expenses Table */}
          {selectedArchive.expenses.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-neutral-900">
                Major Maintenance Expenditures ({selectedArchive.fiscalYear})
              </h4>
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Description</th>
                      <th className="py-2.5 px-2 font-semibold text-center">Shares</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Amount (৳)</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Base / Flat</th>
                      <th className="py-2.5 px-3 font-semibold text-center">Audit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-800">
                    {selectedArchive.expenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-neutral-50">
                        <td className="py-2.5 px-3 font-mono text-neutral-500 whitespace-nowrap">
                          {exp.date}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-neutral-900">
                          {exp.description}
                        </td>
                        <td className="py-2.5 px-2 text-center font-mono text-neutral-600">
                          {exp.numberOfShares}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-neutral-900 whitespace-nowrap">
                          ৳{exp.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono text-neutral-500 whitespace-nowrap">
                          ৳{exp.perFlatBase.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 text-center whitespace-nowrap font-mono text-[10px] text-emerald-800 font-bold">
                          VERIFIED
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Historical Deposits Table */}
          {selectedArchive.deposits.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-sm font-bold text-neutral-900">
                Annual Owner Collections ({selectedArchive.fiscalYear})
              </h4>
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-neutral-50 text-neutral-600 border-b border-neutral-200">
                      <th className="py-2.5 px-3 font-semibold">Date</th>
                      <th className="py-2.5 px-3 font-semibold">Description</th>
                      <th className="py-2.5 px-3 font-semibold">Flat Unit</th>
                      <th className="py-2.5 px-3 font-semibold">Channel</th>
                      <th className="py-2.5 px-3 font-semibold text-right">Amount (৳)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-neutral-800">
                    {selectedArchive.deposits.map((dep) => (
                      <tr key={dep.id} className="hover:bg-neutral-50">
                        <td className="py-2.5 px-3 font-mono text-neutral-500 whitespace-nowrap">
                          {dep.date}
                        </td>
                        <td className="py-2.5 px-3 font-medium text-neutral-900">
                          {dep.description}
                        </td>
                        <td className="py-2.5 px-3 font-bold text-neutral-900">
                          {dep.flatId}
                        </td>
                        <td className="py-2.5 px-3 font-mono text-neutral-600">
                          {dep.paymentMethod}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 whitespace-nowrap">
                          ৳{dep.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Admin-Only Import Previous Year Data Modal */}
      {isImportModalOpen && role === 'admin' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-lg shadow-2xl max-w-xl w-full p-6 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-5 h-5 text-neutral-900" />
                <h3 className="text-base font-bold text-neutral-900">
                  Import Previous Year Audit Data
                </h3>
              </div>
              <button
                onClick={() => setIsImportModalOpen(false)}
                className="p-1 text-neutral-400 hover:text-neutral-900 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleExecuteImport} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                {/* Fiscal Year */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Fiscal Year Label
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 2024-2025 or 2023-2024"
                    value={targetYear}
                    onChange={(e) => setTargetYear(e.target.value)}
                    className="w-full p-2 border border-neutral-300 rounded-md font-mono text-neutral-900"
                  />
                </div>

                {/* Opening Reserve */}
                <div>
                  <label className="block font-medium text-neutral-700 mb-1">
                    Opening Reserve for this Year (৳)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="e.g. 82150.00"
                    value={targetOpeningBalance}
                    onChange={(e) => setTargetOpeningBalance(e.target.value)}
                    className="w-full p-2 font-mono border border-neutral-300 rounded-md text-neutral-900"
                  />
                </div>
              </div>

              {/* Import Method Toggle */}
              <div className="p-3 bg-neutral-50 border border-neutral-200 rounded-md space-y-2">
                <span className="font-semibold text-neutral-900 block">Choose Import Method</span>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={importMethod === 'csv'}
                      onChange={() => setImportMethod('csv')}
                      name="import_method"
                    />
                    <span>Upload CSV Ledger Spreadsheet</span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="radio"
                      checked={importMethod === 'summary'}
                      onChange={() => setImportMethod('summary')}
                      name="import_method"
                    />
                    <span>Manual Annual Summary</span>
                  </label>
                </div>
              </div>

              {importMethod === 'csv' ? (
                <div className="space-y-3">
                  <div className="p-3 border border-dashed border-neutral-300 rounded-md bg-neutral-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-neutral-800">
                        Choose CSV File
                      </span>
                      <button
                        type="button"
                        onClick={handleDownloadSampleCsv}
                        className="text-[11px] text-neutral-600 hover:text-neutral-900 underline flex items-center gap-1"
                      >
                        <Download className="w-3 h-3" />
                        Download Template
                      </button>
                    </div>
                    <input
                      type="file"
                      accept=".csv,text/csv"
                      onChange={handleFileUpload}
                      className="block w-full text-xs text-neutral-500 file:mr-2 file:py-1 file:px-3 file:rounded file:border-0 file:bg-neutral-900 file:text-white"
                    />
                    {csvFileName && (
                      <div className="text-emerald-700 font-mono text-[11px]">
                        ✓ Selected: {csvFileName}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block font-medium text-neutral-700 mb-1">
                      Or Paste Raw CSV Text
                    </label>
                    <textarea
                      rows={4}
                      placeholder="Paste CSV rows here..."
                      value={csvContentText}
                      onChange={(e) => setCsvContentText(e.target.value)}
                      className="w-full p-2 font-mono text-[11px] border border-neutral-300 rounded-md text-neutral-900"
                    />
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 p-3 bg-neutral-50 border border-neutral-200 rounded-md">
                  <div>
                    <label className="block text-neutral-700 mb-1">Total Collections (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={summaryDeposits}
                      onChange={(e) => setSummaryDeposits(e.target.value)}
                      className="w-full p-2 font-mono border border-neutral-300 rounded bg-white text-neutral-900"
                    />
                  </div>
                  <div>
                    <label className="block text-neutral-700 mb-1">Total Maintenance Spent (৳)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={summaryExpenses}
                      onChange={(e) => setSummaryExpenses(e.target.value)}
                      className="w-full p-2 font-mono border border-neutral-300 rounded bg-white text-neutral-900"
                    />
                  </div>
                </div>
              )}

              {/* Notes */}
              <div>
                <label className="block font-medium text-neutral-700 mb-1">
                  Annual Audit Remarks / Major Works Conducted
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Lift traction rope replacement, deep tube-well motor repair..."
                  value={targetNotes}
                  onChange={(e) => setTargetNotes(e.target.value)}
                  className="w-full p-2 border border-neutral-300 rounded-md text-neutral-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-neutral-200">
                <button
                  type="button"
                  onClick={() => setIsImportModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 font-medium flex items-center gap-1.5"
                >
                  <Upload className="w-3.5 h-3.5" />
                  Parse &amp; Import Previous Year
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
