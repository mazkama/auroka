'use client';

import React, { useState, useMemo } from 'react';
import { AppLayout } from '@/presentation/components/layout/AppLayout';
import { useFinance } from '@/presentation/hooks/useFinance';
import { formatRupiah, formatDateID } from '@/presentation/utils/formatters';
import { AddTransactionModal } from '@/presentation/components/features/AddTransactionModal';
import {
  TrendingUp,
  TrendingDown,
  Star,
  Award,
  Calendar,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  UploadCloud,
  SlidersHorizontal,
  Clock,
} from 'lucide-react';

const MONTH_NAMES = [
  'Januari',
  'Februari',
  'Maret',
  'April',
  'Mei',
  'Juni',
  'Juli',
  'Agustus',
  'September',
  'Oktober',
  'November',
  'Desember',
];

const AVAILABLE_YEARS = [2024, 2025, 2026, 2027];

type FilterMode = 'MONTHLY' | 'RANGE';

// Simulation calculation generator based on period or date range
const getAnalyticsData = (
  mode: FilterMode,
  monthIndex: number,
  year: number,
  startDateStr: string,
  endDateStr: string
) => {
  let seed = 1;
  let periodLabel = '';
  let subLabel = '';

  if (mode === 'MONTHLY') {
    seed = (year - 2024) * 12 + monthIndex + 1;
    periodLabel = `${MONTH_NAMES[monthIndex]} ${year}`;
    subLabel = `Bulan Penuh (30-31 Hari)`;
  } else {
    const start = new Date(startDateStr);
    const end = new Date(endDateStr);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);
    seed = diffDays + start.getDate() + (start.getMonth() + 1) * 3;
    periodLabel = `${startDateStr} s/d ${endDateStr}`;
    subLabel = `Rentang ${diffDays} Hari Terpilih`;
  }

  const baseIncome = 15000000 + (seed % 7) * 1500000 + (monthIndex === 7 ? 2500000 : 0);
  const baseExpense = 7000000 + ((seed * 3) % 8) * 850000 + (monthIndex === 11 ? 5000000 : 0);
  const netCashFlow = baseIncome - baseExpense;
  const savingsRate = Math.max(0, Math.round((netCashFlow / baseIncome) * 100));

  const categories = [
    { name: 'Makan & Minum', percentage: 35, amount: Math.round(baseExpense * 0.35), color: '#004ac6' },
    { name: 'Belanja & Pribadi', percentage: 22, amount: Math.round(baseExpense * 0.22), color: '#2563eb' },
    { name: 'Listrik & Utilitas', percentage: 15, amount: Math.round(baseExpense * 0.15), color: '#0284c7' },
    { name: 'Transportasi', percentage: 12, amount: Math.round(baseExpense * 0.12), color: '#0d9488' },
    { name: 'Hiburan', percentage: 9, amount: Math.round(baseExpense * 0.09), color: '#7c3aed' },
    { name: 'Lainnya', percentage: 7, amount: Math.round(baseExpense * 0.07), color: '#64748b' },
  ];

  const worthinessBreakdown = [
    { stars: 5, label: 'Sangat Bermanfaat / Wajib', percentage: 65, count: 18, color: 'text-amber-500' },
    { stars: 4, label: 'Penting & Bernilai Baik', percentage: 22, count: 8, color: 'text-amber-400' },
    { stars: 3, label: 'Cukup Bermanfaat', percentage: 8, count: 3, color: 'text-amber-300' },
    { stars: 2, label: 'Kurang Diperlukan (Impulsif)', percentage: 4, count: 2, color: 'text-rose-400' },
    { stars: 1, label: 'Menyesal / Tidak Bermanfaat', percentage: 1, count: 1, color: 'text-rose-600' },
  ];

  return {
    periodLabel,
    subLabel,
    income: baseIncome,
    expense: baseExpense,
    netCashFlow,
    savingsRate,
    categories,
    worthinessBreakdown,
    friendOrdersCount: 3 + (seed % 4),
    friendOrdersTotal: 450000 + (seed % 5) * 120000,
  };
};

export default function AnalyticsPage() {
  const { summary, wallets, addTransaction } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter Mode: 'MONTHLY' (Bulan/Tahun) or 'RANGE' (Rentang Tanggal)
  const [filterMode, setFilterMode] = useState<FilterMode>('MONTHLY');

  // Month & Year Filter State (Default: Agustus 2026)
  const [selectedMonth, setSelectedMonth] = useState(7);
  const [selectedYear, setSelectedYear] = useState(2026);

  // Custom Date Range State (Default: 01 Agu 2026 - 24 Agu 2026)
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-24');

  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const analyticsData = useMemo(() => {
    return getAnalyticsData(filterMode, selectedMonth, selectedYear, startDate, endDate);
  }, [filterMode, selectedMonth, selectedYear, startDate, endDate]);

  const handlePrevMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11);
      setSelectedYear((prev) => prev - 1);
    } else {
      setSelectedMonth((prev) => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0);
      setSelectedYear((prev) => prev + 1);
    } else {
      setSelectedMonth((prev) => prev + 1);
    }
  };

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleExportExcel = () => {
    showToast(`📊 Laporan Keuangan Excel (${analyticsData.periodLabel}) berhasil diekspor.`);
  };

  const handleExportPDF = () => {
    showToast(`📑 Dokumen PDF Laporan Finansial (${analyticsData.periodLabel}) berhasil disiapkan.`);
  };

  // Quick Preset Handlers for Date Range
  const setDatePreset = (preset: 'today' | '7d' | '30d' | 'thisMonth' | 'lastMonth' | 'thisYear') => {
    if (preset === 'today') {
      setStartDate('2026-08-24');
      setEndDate('2026-08-24');
    } else if (preset === '7d') {
      setStartDate('2026-08-17');
      setEndDate('2026-08-24');
    } else if (preset === '30d') {
      setStartDate('2026-07-25');
      setEndDate('2026-08-24');
    } else if (preset === 'thisMonth') {
      setStartDate('2026-08-01');
      setEndDate('2026-08-31');
    } else if (preset === 'lastMonth') {
      setStartDate('2026-07-01');
      setEndDate('2026-07-31');
    } else if (preset === 'thisYear') {
      setStartDate('2026-01-01');
      setEndDate('2026-12-31');
    }
  };

  const isCurrentMonth =
    filterMode === 'MONTHLY' && selectedMonth === 7 && selectedYear === 2026;

  const displayIncome = isCurrentMonth && summary ? summary.monthlyIncome : analyticsData.income;
  const displayExpense = isCurrentMonth && summary ? summary.monthlyExpense : analyticsData.expense;
  const displayNet = isCurrentMonth && summary ? summary.netCashFlow : analyticsData.netCashFlow;
  const displaySavingsRate =
    isCurrentMonth && summary ? summary.savingsRate : analyticsData.savingsRate;

  return (
    <AppLayout onOpenAddModal={() => setIsModalOpen(true)}>
      <div className="space-y-6">
        {/* Toast Feedback */}
        {toastMessage && (
          <div className="fixed top-20 right-4 z-50 flex items-center gap-3 bg-[#0b1c30] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/20 animate-in fade-in slide-in-from-top-4 duration-300">
            <CheckCircle2 className="h-5 w-5 text-[#6cf8bb] shrink-0" />
            <span className="text-xs font-semibold">{toastMessage}</span>
          </div>
        )}

        {/* Top Header Banner: Filter Mode, Period Picker, Import/Export Tools */}
        <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#0b1c30] tracking-tight">
                  Analisis & Laporan Keuangan
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#004ac6]/10 text-[#004ac6] px-2.5 py-0.5 rounded-full border border-[#004ac6]/20">
                  {analyticsData.periodLabel}
                </span>
              </div>
              <p className="text-xs text-[#434655] mt-1">
                Evaluasi kinerja arus kas, rasio tabungan, dan skor kepuasan belanja (Worthiness) per periode.
              </p>
            </div>

            {/* Export Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 bg-[#f0fdf4] hover:bg-[#dcfce7] text-[#16a34a] border border-[#bbf7d0] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs"
                title="Export Data ke Excel"
              >
                <FileSpreadsheet className="h-4 w-4" />
                <span>Export Excel</span>
              </button>

              <button
                onClick={handleExportPDF}
                className="flex items-center gap-1.5 bg-[#eff4ff] hover:bg-[#dce9ff] text-[#004ac6] border border-[#bfdbfe] px-3.5 py-2 rounded-xl text-xs font-bold transition-all shadow-2xs"
                title="Export Dokumen ke PDF"
              >
                <FileText className="h-4 w-4" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* Filter Toolbar: Mode Switcher & Controls */}
          <div className="pt-3 border-t border-[#f1f5f9] flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Mode Switcher Tabs */}
            <div className="flex items-center gap-1 bg-[#f1f5f9] p-1 rounded-xl self-start">
              <button
                onClick={() => setFilterMode('MONTHLY')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'MONTHLY'
                    ? 'bg-white text-[#004ac6] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0b1c30]'
                }`}
              >
                📅 Pilihan Bulan & Tahun
              </button>
              <button
                onClick={() => setFilterMode('RANGE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'RANGE'
                    ? 'bg-white text-[#004ac6] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0b1c30]'
                }`}
              >
                📆 Rentang Tanggal Kustom
              </button>
            </div>

            {/* Mode 1 Controls: Month & Year Selector */}
            {filterMode === 'MONTHLY' && (
              <div className="flex items-center gap-1 bg-[#f8fafc] border border-[#e2e8f0] p-1 rounded-xl shadow-xs self-start md:self-auto">
                <button
                  onClick={handlePrevMonth}
                  title="Bulan Sebelumnya"
                  className="p-1.5 rounded-lg text-[#64748b] hover:text-[#004ac6] hover:bg-white transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>

                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-[#0b1c30] py-1 px-2 rounded-lg focus:outline-none focus:bg-white transition-colors cursor-pointer"
                >
                  {MONTH_NAMES.map((month, idx) => (
                    <option key={month} value={idx}>
                      {month}
                    </option>
                  ))}
                </select>

                <select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  className="bg-transparent text-xs font-bold text-[#004ac6] py-1 px-2 rounded-lg focus:outline-none focus:bg-white transition-colors cursor-pointer border-l border-[#e2e8f0]"
                >
                  {AVAILABLE_YEARS.map((yr) => (
                    <option key={yr} value={yr}>
                      {yr}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleNextMonth}
                  title="Bulan Berikutnya"
                  className="p-1.5 rounded-lg text-[#64748b] hover:text-[#004ac6] hover:bg-white transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {/* Mode 2 Controls: Custom Date Range Inputs */}
            {filterMode === 'RANGE' && (
              <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
                <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1.5 rounded-xl text-xs">
                  <span className="text-[#64748b] text-[10px] font-semibold">Dari:</span>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#0b1c30] focus:outline-none cursor-pointer"
                  />
                </div>

                <div className="flex items-center gap-1.5 bg-[#f8fafc] border border-[#e2e8f0] px-2.5 py-1.5 rounded-xl text-xs">
                  <span className="text-[#64748b] text-[10px] font-semibold">Sampai:</span>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="bg-transparent text-xs font-bold text-[#0b1c30] focus:outline-none cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Quick Preset Pills for Date Range */}
          {filterMode === 'RANGE' && (
            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="text-[10px] font-bold text-[#64748b] flex items-center gap-1 mr-1">
                <Clock className="h-3 w-3" />
                Preset Cepat:
              </span>
              {[
                { label: 'Hari Ini', preset: 'today' as const },
                { label: '7 Hari Terakhir', preset: '7d' as const },
                { label: '30 Hari Terakhir', preset: '30d' as const },
                { label: 'Bulan Ini', preset: 'thisMonth' as const },
                { label: 'Bulan Lalu', preset: 'lastMonth' as const },
                { label: 'Tahun 2026', preset: 'thisYear' as const },
              ].map((p) => (
                <button
                  key={p.preset}
                  onClick={() => setDatePreset(p.preset)}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-semibold bg-[#f1f5f9] hover:bg-[#eff4ff] text-[#475569] hover:text-[#004ac6] border border-[#e2e8f0] transition-colors"
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Financial KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Savings Rate */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Savings Rate
              </span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  displaySavingsRate >= 40
                    ? 'text-[#006c49] bg-[#006c49]/10'
                    : displaySavingsRate >= 20
                    ? 'text-[#004ac6] bg-[#004ac6]/10'
                    : 'text-[#ba1a1a] bg-[#ba1a1a]/10'
                }`}
              >
                {displaySavingsRate >= 40 ? 'Sangat Sehat' : displaySavingsRate >= 20 ? 'Sehat' : 'Perlu Evaluasi'}
              </span>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-3xl font-extrabold font-mono text-[#006c49]">
                {displaySavingsRate}%
              </h3>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Persentase pemasukan bersih yang disisihkan ({analyticsData.subLabel}).
            </p>
          </div>

          {/* Card 2: Pemasukan Bulanan */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Pemasukan Periode
              </span>
              <div className="p-1.5 rounded-lg bg-[#f0fdf4] text-[#16a34a]">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold font-mono text-[#006c49]">
                {formatRupiah(displayIncome)}
              </h3>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Total arus kas masuk ({analyticsData.periodLabel}).
            </p>
          </div>

          {/* Card 3: Pengeluaran Bulanan */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Pengeluaran Periode
              </span>
              <div className="p-1.5 rounded-lg bg-[#fff1f2] text-[#e11d48]">
                <TrendingDown className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold font-mono text-[#ba1a1a]">
                {formatRupiah(displayExpense)}
              </h3>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Total arus kas keluar ({analyticsData.periodLabel}).
            </p>
          </div>

          {/* Card 4: Net Cash Flow */}
          <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm space-y-2 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[#64748b] uppercase tracking-wider">
                Net Cash Flow
              </span>
              <div className="p-1.5 rounded-lg bg-[#fefce8] text-[#784b00]">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="flex items-baseline justify-between">
              <h3 className="text-2xl font-extrabold font-mono text-[#784b00]">
                {formatRupiah(displayNet)}
              </h3>
            </div>
            <p className="text-[11px] text-[#64748b]">
              Selisih surplus dana setelah seluruh beban pengeluaran.
            </p>
          </div>
        </div>

        {/* Charts & Breakdown Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column (7 cols): Perbandingan Pemasukan vs Pengeluaran & Kategori */}
          <div className="lg:col-span-7 bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
              <div>
                <h3 className="text-base font-bold text-[#0f172a]">
                  Rasio Arus Kas & Pengeluaran Kategori
                </h3>
                <p className="text-xs text-[#64748b] mt-0.5">
                  Distribusi beban pengeluaran terhadap total arus masuk
                </p>
              </div>
              <span className="text-xs font-mono font-bold text-[#004ac6] bg-[#eff4ff] px-2.5 py-1 rounded-xl">
                {analyticsData.periodLabel}
              </span>
            </div>

            {/* Income vs Expense Comparative Bar */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#475569]">Total Pemasukan (100%)</span>
                  <span className="text-[#006c49] font-bold font-mono">
                    {formatRupiah(displayIncome)}
                  </span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div className="h-full rounded-full bg-[#006c49] w-full transition-all duration-500" />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#475569]">
                    Total Beban Pengeluaran ({Math.min(100, Math.round((displayExpense / displayIncome) * 100))}%)
                  </span>
                  <span className="text-[#ba1a1a] font-bold font-mono">
                    {formatRupiah(displayExpense)}
                  </span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#ba1a1a] transition-all duration-500"
                    style={{
                      width: `${Math.min(100, Math.round((displayExpense / displayIncome) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Category Breakdown List */}
            <div className="pt-2 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
                Distribusi Berdasarkan Kategori
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {analyticsData.categories.map((cat) => (
                  <div
                    key={cat.name}
                    className="flex items-center justify-between p-3 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3 h-3 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <span className="font-bold text-[#0f172a]">{cat.name}</span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono font-bold text-[#0b1c30]">
                        {formatRupiah(cat.amount)}
                      </span>
                      <span className="text-[10px] text-[#64748b] block">{cat.percentage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (5 cols): Worthiness Rating & Nitip Teman Summary */}
          <div className="lg:col-span-5 space-y-6">
            {/* Worthiness Rating Card */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-3">
                <div className="flex items-center gap-2">
                  <Star className="h-5 w-5 text-amber-500 fill-amber-500" />
                  <h3 className="text-base font-bold text-[#0f172a]">
                    Analisis Worthiness Rating
                  </h3>
                </div>
                <span className="text-[10px] font-bold bg-amber-500/10 text-amber-600 px-2 py-0.5 rounded-full">
                  Kepuasan Belanja
                </span>
              </div>

              <p className="text-xs text-[#64748b]">
                Evaluasi tingkat kebermanfaatan item belanja yang dibeli sepanjang periode ini:
              </p>

              <div className="space-y-2.5">
                {analyticsData.worthinessBreakdown.map((item) => (
                  <div
                    key={item.stars}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-[#f8fafc] border border-[#e2e8f0] text-xs hover:bg-white transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex text-amber-400 text-xs tracking-tighter">
                        {'★'.repeat(item.stars)}
                        {'☆'.repeat(5 - item.stars)}
                      </span>
                      <span className="font-medium text-[#475569] text-[11px]">{item.label}</span>
                    </div>
                    <span className="font-bold font-mono text-[#004ac6]">{item.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nitip Teman Summary Card */}
            <div className="bg-white border border-[#e2e8f0] rounded-2xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <UserCheck className="h-4 w-4 text-[#d97706]" />
                  <h4 className="text-sm font-bold text-[#0f172a]">Rekapitulasi Nitip Teman</h4>
                </div>
                <span className="text-[10px] font-bold bg-[#fef3c7] text-[#d97706] px-2 py-0.5 rounded-full">
                  {analyticsData.friendOrdersCount} Titipan
                </span>
              </div>
              <p className="text-xs text-[#64748b]">
                Total dana yang ditalangi untuk pembelian titipan teman pada periode ini:
              </p>
              <div className="p-3 rounded-xl bg-[#fffbeb] border border-[#fde68a] flex items-center justify-between">
                <span className="text-xs font-semibold text-[#92400e]">Total Dana Ditalangi</span>
                <span className="font-bold font-mono text-sm text-[#92400e]">
                  {formatRupiah(analyticsData.friendOrdersTotal)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <AddTransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        wallets={wallets}
        onAddTransaction={addTransaction}
      />
    </AppLayout>
  );
}
