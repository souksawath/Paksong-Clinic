import React, { useState } from 'react';
import { Transaction, TransactionType, Patient } from '../types';
import {
  Wallet,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  TrendingUp,
  PlusCircle,
  MinusCircle,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Edit2,
  Trash2,
  FileSpreadsheet,
  Download,
  Receipt,
  PieChart
} from 'lucide-react';
import { TransactionModal } from './TransactionModal';

interface FinanceManagementProps {
  transactions: Transaction[];
  patients: Patient[];
  onSaveTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (txId: string) => void;
  onOpenSyncModal: () => void;
}

export const FinanceManagement: React.FC<FinanceManagementProps> = ({
  transactions,
  patients,
  onSaveTransaction,
  onDeleteTransaction,
  onOpenSyncModal,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'income' | 'expense'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [txToEdit, setTxToEdit] = useState<Transaction | null>(null);

  // Compute Metrics
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netBalance = totalIncome - totalExpense;

  // Filter Transactions
  const filteredTransactions = transactions.filter((t) => {
    // Type filter
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;

    // Search filter
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        t.categoryLabel.toLowerCase().includes(q) ||
        (t.patientName && t.patientName.toLowerCase().includes(q)) ||
        (t.receiptNumber && t.receiptNumber.toLowerCase().includes(q));
      if (!match) return false;
    }

    // Date filter
    if (dateFilter !== 'all') {
      const txDate = new Date(t.date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        const dStr = today.toISOString().split('T')[0];
        if (t.date !== dStr) return false;
      } else if (dateFilter === 'week') {
        const sevenDaysAgo = new Date(today);
        sevenDaysAgo.setDate(today.getDate() - 7);
        if (txDate < sevenDaysAgo) return false;
      } else if (dateFilter === 'month') {
        if (txDate.getMonth() !== today.getMonth() || txDate.getFullYear() !== today.getFullYear()) {
          return false;
        }
      }
    }

    return true;
  }).sort((a, b) => new Date(`${b.date} ${b.time || '00:00'}`).getTime() - new Date(`${a.date} ${a.time || '00:00'}`).getTime());

  const handleEdit = (tx: Transaction) => {
    setTxToEdit(tx);
    setIsModalOpen(true);
  };

  const handleNew = () => {
    setTxToEdit(null);
    setIsModalOpen(true);
  };

  const handleDelete = (tx: Transaction) => {
    if (window.confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບລາຍການ: "${tx.title}" (${tx.amount.toLocaleString()} ₭)?`)) {
      onDeleteTransaction(tx.id);
    }
  };

  // Group top categories for breakdown
  const incomeByCategory: Record<string, number> = {};
  const expenseByCategory: Record<string, number> = {};

  transactions.forEach((t) => {
    if (t.type === 'income') {
      incomeByCategory[t.categoryLabel] = (incomeByCategory[t.categoryLabel] || 0) + t.amount;
    } else {
      expenseByCategory[t.categoryLabel] = (expenseByCategory[t.categoryLabel] || 0) + t.amount;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-700 rounded-2xl p-6 text-white shadow-lg shadow-emerald-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-100 text-xs font-medium mb-2 border border-white/15">
              <span>ພາກສ່ວນທີ 2 (Section 2)</span>
              <span>•</span>
              <span>ບັນຊີລາຍຮັບ - ລາຍຈ່າຍ</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ການເກັບກຳລາຍຮັບ ແລະ ລາຍຈ່າຍຂອງຄລີນິກ</h1>
            <p className="text-sm text-emerald-100 max-w-2xl mt-1">
              ຕິດຕາມລາຍຮັບຄ່າປິ່ນປົວ, ຄ່າຍາ, ຕົ້ນທຶນການແພດ, ຄ່າເຊົ່າ, ຄ່າໄຟຟ້າ ແລະ ເງິນເດືອນພະນັກງານ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onOpenSyncModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/15 hover:bg-white/25 text-white rounded-xl font-medium text-xs border border-white/20 transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-200" />
              <span>ສົ່ງອອກໄປ Google Sheets</span>
            </button>

            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-emerald-800 rounded-xl font-bold text-sm shadow-md hover:bg-emerald-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <PlusCircle className="w-4 h-4 text-emerald-600" />
              <span>+ ບັນທຶກລາຍການໃໝ່</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {/* Total Income */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ລາຍຮັບລວມ (Total Income)
            </span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-emerald-700 font-mono">
              +{totalIncome.toLocaleString()} ₭
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ຈາກ {transactions.filter((t) => t.type === 'income').length} ລາຍການ
            </p>
          </div>
        </div>

        {/* Total Expense */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ລາຍຈ່າຍລວມ (Total Expense)
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-rose-600 font-mono">
              -{totalExpense.toLocaleString()} ₭
            </p>
            <p className="text-xs text-slate-500 mt-1">
              ຈາກ {transactions.filter((t) => t.type === 'expense').length} ລາຍການ
            </p>
          </div>
        </div>

        {/* Net Balance */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              ຍອດເງິນເຫຼືອ / ກຳໄລສຸດທິ (Net Balance)
            </span>
            <div
              className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                netBalance >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-rose-50 text-rose-600'
              }`}
            >
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <p
              className={`text-2xl font-black font-mono ${
                netBalance >= 0 ? 'text-teal-800' : 'text-rose-600'
              }`}
            >
              {netBalance >= 0 ? '+' : ''}
              {netBalance.toLocaleString()} ₭
            </p>
            <p className="text-xs text-slate-500 mt-1">ສະພາບຄ່ອງທາງການເງິນຄລີນິກ</p>
          </div>
        </div>
      </div>

      {/* Categories Breakdown Quick Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Income breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-800 flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
              ແຫຼ່ງລາຍຮັບຕົ້ນຕໍ
            </span>
            <span className="text-xs text-slate-500">{Object.keys(incomeByCategory).length} ໝວດໝູ່</span>
          </div>
          <div className="space-y-2">
            {Object.entries(incomeByCategory).map(([cat, amt]) => {
              const pct = totalIncome > 0 ? Math.round((amt / totalIncome) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="truncate max-w-[200px]">{cat}</span>
                    <span className="font-mono font-semibold">{amt.toLocaleString()} ₭ ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Expense breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-rose-800 flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-rose-600" />
              ລາຍຈ່າຍຫຼັກຂອງຄລີນິກ
            </span>
            <span className="text-xs text-slate-500">{Object.keys(expenseByCategory).length} ໝວດໝູ່</span>
          </div>
          <div className="space-y-2">
            {Object.entries(expenseByCategory).map(([cat, amt]) => {
              const pct = totalExpense > 0 ? Math.round((amt / totalExpense) * 100) : 0;
              return (
                <div key={cat} className="space-y-1">
                  <div className="flex justify-between text-xs text-slate-700">
                    <span className="truncate max-w-[200px]">{cat}</span>
                    <span className="font-mono font-semibold">{amt.toLocaleString()} ₭ ({pct}%)</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-rose-500 rounded-full" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
        {/* Table Filters & Actions */}
        <div className="p-4 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-3 bg-slate-50/50">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="ຄົ້ນຫາ: ຫົວຂໍ້, ໝວດໝູ່, ຄົນເຈັບ, ເລກໃບບິນ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 bg-white"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <div className="flex items-center bg-white p-1 rounded-xl border border-slate-300 text-xs">
              <button
                onClick={() => setTypeFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === 'all'
                    ? 'bg-slate-900 text-white'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                ທັງໝົດ
              </button>
              <button
                onClick={() => setTypeFilter('income')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === 'income'
                    ? 'bg-emerald-600 text-white font-semibold'
                    : 'text-emerald-700 hover:bg-emerald-50'
                }`}
              >
                ລາຍຮັບ
              </button>
              <button
                onClick={() => setTypeFilter('expense')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  typeFilter === 'expense'
                    ? 'bg-rose-600 text-white font-semibold'
                    : 'text-rose-700 hover:bg-rose-50'
                }`}
              >
                ລາຍຈ່າຍ
              </button>
            </div>

            {/* Date filter */}
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">ທຸກຊ່ວງເວລາ</option>
              <option value="today">ມື້ນີ້ (Today)</option>
              <option value="week">7 ມື້ຫຼ້າສຸດ</option>
              <option value="month">ເດືອນນີ້ (This Month)</option>
            </select>
          </div>
        </div>

        {/* Transactions Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-5 py-3.5">ວັນທີ & ເວລາ</th>
                <th className="px-5 py-3.5">ປະເພດ</th>
                <th className="px-5 py-3.5">ຫົວຂໍ້ລາຍການ & ໝວດໝູ່</th>
                <th className="px-5 py-3.5">ຄົນເຈັບທີ່ກ່ຽວຂ້ອງ</th>
                <th className="px-5 py-3.5">ວິທີຊຳລະ</th>
                <th className="px-5 py-3.5 text-right">ຈຳນວນເງິນ (LAK)</th>
                <th className="px-5 py-3.5 text-center">ຈັດການ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-12 text-center text-slate-400">
                    <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">ບໍ່ພົບລາຍການບັນຊີຕາມເງື່ອນໄຂທີ່ເລືອກ</p>
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => {
                  const isIncome = tx.type === 'income';

                  return (
                    <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 font-mono text-[11px]">
                        <div>{tx.date}</div>
                        {tx.time && <div className="text-slate-400 text-[10px]">{tx.time}</div>}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isIncome
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                              : 'bg-rose-100 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {isIncome ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                          {isIncome ? 'ລາຍຮັບ' : 'ລາຍຈ່າຍ'}
                        </span>
                      </td>

                      <td className="px-5 py-3.5">
                        <div className="font-bold text-slate-900">{tx.title}</div>
                        <div className="flex items-center gap-2 mt-0.5 text-[10px] text-slate-500">
                          <span className="font-medium text-slate-600">{tx.categoryLabel}</span>
                          {tx.receiptNumber && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-400">ເລກບິນ: {tx.receiptNumber}</span>
                            </>
                          )}
                        </div>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-700">
                        {tx.patientName ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 text-[11px] font-medium border border-teal-200/60">
                            👤 {tx.patientName}
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )}
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-slate-600 text-[11px]">
                        <span className="inline-block px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium">
                          {tx.paymentMethodLabel}
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-right font-mono text-sm font-black">
                        <span className={isIncome ? 'text-emerald-700' : 'text-rose-600'}>
                          {isIncome ? '+' : '-'}
                          {tx.amount.toLocaleString()} ₭
                        </span>
                      </td>

                      <td className="px-5 py-3.5 whitespace-nowrap text-center">
                        <div className="inline-flex items-center gap-1">
                          <button
                            onClick={() => handleEdit(tx)}
                            title="ແກ້ໄຂ"
                            className="p-1.5 text-slate-400 hover:text-teal-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx)}
                            title="ລຶບ"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onSaveTransaction}
        transactionToEdit={txToEdit}
        patients={patients}
      />
    </div>
  );
};
