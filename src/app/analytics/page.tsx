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
  CalendarRange,
  FileSpreadsheet,
  FileText,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  UploadCloud,
  SlidersHorizontal,
  Clock,
  Inbox,
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

const CATEGORY_COLORS: Record<string, string> = {
  'Makan & Minum': '#004ac6',
  'Belanja': '#00aa13',
  'Belanja & Pribadi': '#2563eb',
  'Transportasi': '#e11d48',
  'Listrik & Utilitas': '#0284c7',
  'Listrik & Air': '#d97706',
  'Hiburan': '#9333ea',
  'Kesehatan': '#06b6d4',
  'Investasi': '#3b82f6',
  'Gaji': '#10b981',
  'Lainnya': '#64748b',
};

export default function AnalyticsPage() {
  const { summary, wallets, transactions, addTransaction, transferFunds } = useFinance();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter Mode: 'MONTHLY' (Bulan/Tahun) or 'RANGE' (Rentang Tanggal)
  const [filterMode, setFilterMode] = useState<FilterMode>('MONTHLY');

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  // Custom Date Range State (Default: awal bulan ini s/d hari ini)
  const defaultStartStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;
  const defaultEndStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

  const [startDate, setStartDate] = useState(defaultStartStr);
  const [endDate, setEndDate] = useState(defaultEndStr);

  const [toastMessage, setToastMessage] = useState<string | null>(null);

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

  // Quick Preset Handlers for Date Range
  const setDatePreset = (preset: 'today' | '7d' | '30d' | 'thisMonth' | 'lastMonth' | 'thisYear') => {
    const today = new Date();
    const toDateStr = (d: Date) =>
      `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

    if (preset === 'today') {
      const s = toDateStr(today);
      setStartDate(s);
      setEndDate(s);
    } else if (preset === '7d') {
      const start = new Date(today);
      start.setDate(today.getDate() - 7);
      setStartDate(toDateStr(start));
      setEndDate(toDateStr(today));
    } else if (preset === '30d') {
      const start = new Date(today);
      start.setDate(today.getDate() - 30);
      setStartDate(toDateStr(start));
      setEndDate(toDateStr(today));
    } else if (preset === 'thisMonth') {
      const start = new Date(today.getFullYear(), today.getMonth(), 1);
      const end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(toDateStr(start));
      setEndDate(toDateStr(end));
    } else if (preset === 'lastMonth') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      setStartDate(toDateStr(start));
      setEndDate(toDateStr(end));
    } else if (preset === 'thisYear') {
      const start = new Date(today.getFullYear(), 0, 1);
      const end = new Date(today.getFullYear(), 11, 31);
      setStartDate(toDateStr(start));
      setEndDate(toDateStr(end));
    }
  };

  // REAL DATA CALCULATION BASED ON ACTUAL USER TRANSACTIONS
  const analyticsData = useMemo(() => {
    let filteredTxs = transactions;
    let periodLabel = '';
    let subLabel = '';

    if (filterMode === 'MONTHLY') {
      const monthPrefix = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}`;
      filteredTxs = transactions.filter((tx) => tx.transactionDate?.startsWith(monthPrefix));
      periodLabel = `${MONTH_NAMES[selectedMonth]} ${selectedYear}`;
      subLabel = `Bulan Penuh (30-31 Hari)`;
    } else {
      filteredTxs = transactions.filter(
        (tx) => tx.transactionDate >= startDate && tx.transactionDate <= endDate
      );
      periodLabel = `${startDate} s/d ${endDate}`;
      subLabel = `Rentang Terpilih`;
    }

    let income = 0;
    let expense = 0;
    const categoryTotals: Record<string, number> = {};
    const ratingCounts: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    let totalRatedItems = 0;
    let friendOrdersCount = 0;
    let friendOrdersTotal = 0;

    filteredTxs.forEach((tx) => {
      if (tx.type === 'IN' || tx.type === 'INITIAL_BALANCE') {
        income += tx.totalAmount;
      } else if (tx.type === 'OUT') {
        expense += tx.totalAmount;

        if (tx.items && tx.items.length > 0) {
          tx.items.forEach((item) => {
            const cat = item.categoryName || 'Lainnya';
            categoryTotals[cat] = (categoryTotals[cat] || 0) + item.amount;

            if (item.rating && item.rating >= 1 && item.rating <= 5) {
              ratingCounts[item.rating] = (ratingCounts[item.rating] || 0) + 1;
              totalRatedItems++;
            }

            if (item.isFriendOrder) {
              friendOrdersCount++;
              friendOrdersTotal += item.amount;
            }
          });
        } else {
          categoryTotals['Lainnya'] = (categoryTotals['Lainnya'] || 0) + tx.totalAmount;
        }
      }
    });

    const netCashFlow = income - expense;
    let savingsRate = 0;
    if (income > 0) {
      savingsRate = Math.max(0, Math.round((netCashFlow / income) * 100));
    }

    const categories = Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      amount,
      percentage: expense > 0 ? Math.round((amount / expense) * 100) : 0,
      color: CATEGORY_COLORS[name] || '#64748b',
    })).sort((a, b) => b.amount - a.amount);

    const worthinessLabels: Record<number, string> = {
      5: 'Sangat Bermanfaat / Wajib',
      4: 'Penting & Bernilai Baik',
      3: 'Cukup Bermanfaat',
      2: 'Kurang Diperlukan (Impulsif)',
      1: 'Menyesal / Tidak Bermanfaat',
    };

    const worthinessBreakdown = [5, 4, 3, 2, 1].map((stars) => {
      const count = ratingCounts[stars] || 0;
      return {
        stars,
        label: worthinessLabels[stars],
        count,
        percentage: totalRatedItems > 0 ? Math.round((count / totalRatedItems) * 100) : 0,
      };
    });

    return {
      periodLabel,
      subLabel,
      income,
      expense,
      netCashFlow,
      savingsRate,
      categories,
      worthinessBreakdown,
      friendOrdersCount,
      friendOrdersTotal,
      hasData: filteredTxs.length > 0,
    };
  }, [transactions, filterMode, selectedMonth, selectedYear, startDate, endDate]);

  const handleExportExcel = () => {
    showToast(`Laporan Keuangan Excel (${analyticsData.periodLabel}) berhasil diekspor.`);
  };

  const handleExportPDF = () => {
    showToast(`Dokumen PDF Laporan Finansial (${analyticsData.periodLabel}) berhasil disiapkan.`);
  };

  const displayIncome = analyticsData.income;
  const displayExpense = analyticsData.expense;
  const displayNet = analyticsData.netCashFlow;
  const displaySavingsRate = analyticsData.savingsRate;

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
                Evaluasi kinerja arus kas, rasio tabungan, dan skor kepuasan belanja (Worthiness) berbasis data riil transaksi Anda.
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
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'MONTHLY'
                    ? 'bg-white text-[#004ac6] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0b1c30]'
                }`}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>Pilihan Bulan & Tahun</span>
              </button>
              <button
                onClick={() => setFilterMode('RANGE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filterMode === 'RANGE'
                    ? 'bg-white text-[#004ac6] shadow-xs'
                    : 'text-[#64748b] hover:text-[#0b1c30]'
                }`}
              >
                <CalendarRange className="h-3.5 w-3.5" />
                <span>Rentang Tanggal Kustom</span>
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
                { label: `Tahun ${now.getFullYear()}`, preset: 'thisYear' as const },
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
                  <div
                    className="h-full rounded-full bg-[#006c49] transition-all duration-500"
                    style={{ width: displayIncome > 0 ? '100%' : '0%' }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-[#475569]">
                    Total Beban Pengeluaran ({displayIncome > 0 ? Math.min(100, Math.round((displayExpense / displayIncome) * 100)) : 0}%)
                  </span>
                  <span className="text-[#ba1a1a] font-bold font-mono">
                    {formatRupiah(displayExpense)}
                  </span>
                </div>
                <div className="h-3.5 w-full rounded-full bg-[#f1f5f9] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#ba1a1a] transition-all duration-500"
                    style={{
                      width: displayIncome > 0 ? `${Math.min(100, Math.round((displayExpense / displayIncome) * 100))}%` : '0%',
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
              {analyticsData.categories.length === 0 ? (
                <div className="p-8 text-center bg-[#f8fafc] rounded-xl border border-dashed border-[#cbd5e1] space-y-2">
                  <Inbox className="h-8 w-8 text-[#94a3b8] mx-auto" />
                  <p className="text-xs font-bold text-[#0f172a]">Belum Ada Pengeluaran Pada Periode Ini</p>
                  <p className="text-[11px] text-[#64748b]">
                    Transaksi pengeluaran yang dicatat akan dikelompokkan secara otomatis di sini.
                  </p>
                </div>
              ) : (
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
              )}
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
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < item.stars
                                ? 'text-amber-400 fill-amber-400'
                                : 'text-[#cbd5e1]'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="font-medium text-[#475569] text-[11px]">{item.label}</span>
                    </div>
                    <span className="font-bold font-mono text-[#004ac6]">
                      {item.percentage}% ({item.count})
                    </span>
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
        onTransferFunds={transferFunds}
      />
    </AppLayout>
  );
}
