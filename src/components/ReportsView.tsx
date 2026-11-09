import React from 'react';
import { Patient, MedicalVisit, Transaction, Appointment } from '../types';
import {
  BarChart3,
  TrendingUp,
  Users,
  Wallet,
  ArrowDownLeft,
  ArrowUpRight,
  Download,
  Calendar,
  HeartPulse,
  Activity,
  MapPin
} from 'lucide-react';

interface ReportsViewProps {
  patients: Patient[];
  visits: MedicalVisit[];
  transactions: Transaction[];
  appointments: Appointment[];
  onExportCSV: () => void;
  onExportJSON: () => void;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  patients,
  visits,
  transactions,
  appointments,
  onExportCSV,
  onExportJSON,
}) => {
  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;

  // Group transactions by month for trend
  const monthlyData: Record<string, { income: number; expense: number }> = {};

  transactions.forEach((tx) => {
    const monthKey = tx.date.substring(0, 7); // YYYY-MM
    if (!monthlyData[monthKey]) {
      monthlyData[monthKey] = { income: 0, expense: 0 };
    }
    if (tx.type === 'income') {
      monthlyData[monthKey].income += tx.amount;
    } else {
      monthlyData[monthKey].expense += tx.amount;
    }
  });

  // Group patients by province
  const provinceCounts: Record<string, number> = {};
  patients.forEach((p) => {
    const prov = p.currentAddress.province || p.hometown.province || 'ອື່ນໆ';
    provinceCounts[prov] = (provinceCounts[prov] || 0) + 1;
  });

  // Most common diagnoses from visits
  const diagnosisCounts: Record<string, number> = {};
  visits.forEach((v) => {
    const diag = v.diagnosis.trim();
    if (diag) {
      diagnosisCounts[diag] = (diagnosisCounts[diag] || 0) + 1;
    }
  });

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-800 to-indigo-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-blue-100 text-xs font-medium mb-2 border border-white/15">
              <span>ບົດລາຍງານ & ສະຖິຕິຄລີນິກ</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ສະຫຼຸບຜົນການດຳເນີນງານ ແລະ ສະຖິຕິຄົນເຈັບ</h1>
            <p className="text-sm text-blue-100 max-w-2xl mt-1">
              ວິເຄາະລາຍຮັບ-ລາຍຈ່າຍ, ສະຖິຕິພະຍາດທີ່ພົບເລື້ອຍ, ແລະ ການກະຈາຍຕົວຂອງຄົນເຈັບ
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onExportCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white/15 hover:bg-white/25 text-white rounded-xl text-xs font-semibold border border-white/20 transition-colors"
            >
              <Download className="w-4 h-4" />
              <span>ດາວໂຫຼດ CSV</span>
            </button>
            <button
              onClick={onExportJSON}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white text-blue-900 rounded-xl text-xs font-bold hover:bg-blue-50 transition-colors shadow-md"
            >
              <Download className="w-4 h-4 text-blue-600" />
              <span>ສຳຮອງຂໍ້ມູນ JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Financial Health KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">ລາຍຮັບສະສົມ</span>
          <p className="text-xl font-black text-emerald-700 font-mono mt-1">
            +{totalIncome.toLocaleString()} ₭
          </p>
          <span className="text-[11px] text-slate-500">ຈາກຄ່າປິ່ນປົວ & ຂາຍຢາ</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">ລາຍຈ່າຍສະສົມ</span>
          <p className="text-xl font-black text-rose-600 font-mono mt-1">
            -{totalExpense.toLocaleString()} ₭
          </p>
          <span className="text-[11px] text-slate-500">ຄ່າຢາ, ເງິນເດືອນ, ຄ່າເຊົ່າ</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">ກຳໄລສຸດທິ</span>
          <p
            className={`text-xl font-black font-mono mt-1 ${
              netProfit >= 0 ? 'text-teal-800' : 'text-rose-600'
            }`}
          >
            {netProfit >= 0 ? '+' : ''}
            {netProfit.toLocaleString()} ₭
          </p>
          <span className="text-[11px] text-slate-500">
            {totalIncome > 0 ? `${Math.round((netProfit / totalIncome) * 100)}% ຂອງລາຍຮັບ` : '-'}
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <span className="text-xs font-bold text-slate-500 uppercase">ຄ່າປິ່ນປົວສະເລ່ຍ/ຄັ້ງ</span>
          <p className="text-xl font-black text-indigo-700 font-mono mt-1">
            {visits.length > 0 ? Math.round(totalIncome / visits.length).toLocaleString() : 0} ₭
          </p>
          <span className="text-[11px] text-slate-500">ຕໍ່ຄັ້ງທີ່ຄົນເຈັບມາກວດ</span>
        </div>
      </div>

      {/* Charts & Distributions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Monthly Financial Performance */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-blue-600" />
              ການປຽບທຽບລາຍຮັບ-ລາຍຈ່າຍຕາມເດືອນ
            </h3>
          </div>

          <div className="space-y-4">
            {Object.keys(monthlyData).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">ຍັງບໍ່ມີຂໍ້ມູນການເງິນ</p>
            ) : (
              Object.entries(monthlyData).map(([month, data]) => {
                const maxVal = Math.max(data.income, data.expense, 1);
                const incPct = Math.round((data.income / maxVal) * 100);
                const expPct = Math.round((data.expense / maxVal) * 100);

                return (
                  <div key={month} className="p-3 bg-slate-50 rounded-xl space-y-2 border border-slate-200">
                    <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                      <span>ເດືອນ {month}</span>
                      <span className="text-teal-700 font-mono">
                        ຍອດເຫຼືອ: {(data.income - data.expense).toLocaleString()} ₭
                      </span>
                    </div>

                    {/* Income bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span className="text-emerald-700 font-medium">ລາຍຮັບ</span>
                        <span className="font-mono">{data.income.toLocaleString()} ₭</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${incPct}%` }} />
                      </div>
                    </div>

                    {/* Expense bar */}
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-600 mb-1">
                        <span className="text-rose-700 font-medium">ລາຍຈ່າຍ</span>
                        <span className="font-mono">{data.expense.toLocaleString()} ₭</span>
                      </div>
                      <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${expPct}%` }} />
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Most Frequent Diagnoses & Diseases */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-rose-500" />
              ພະຍາດ ແລະ ອາການທີ່ມາກວດຫຼາຍທີ່ສຸດ
            </h3>
          </div>

          <div className="space-y-3">
            {Object.keys(diagnosisCounts).length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">ຍັງບໍ່ມີຂໍ້ມູນການວິນິດໄສ</p>
            ) : (
              Object.entries(diagnosisCounts)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 6)
                .map(([diag, count]) => {
                  const pct = Math.round((count / visits.length) * 100);
                  return (
                    <div key={diag} className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-800">
                        <span className="font-medium text-slate-900 truncate max-w-[240px]">{diag}</span>
                        <span className="font-bold text-teal-800 font-mono">{count} ຄົນ ({pct}%)</span>
                      </div>
                      <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-500 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          {/* Patient Provinces Breakdown */}
          <div className="mt-6 pt-5 border-t border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              ການແຈກຢາຍຕາມແຂວງຂອງຄົນເຈັບ
            </h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(provinceCounts).map(([prov, count]) => (
                <span
                  key={prov}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium"
                >
                  <span>{prov}</span>
                  <span className="w-4 h-4 rounded-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                    {count}
                  </span>
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
