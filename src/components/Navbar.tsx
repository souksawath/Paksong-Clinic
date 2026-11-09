import React from 'react';
import { User } from 'firebase/auth';
import {
  Users,
  Wallet,
  CalendarDays,
  BarChart3,
  Cloud,
  FileSpreadsheet,
  CheckCircle2,
  LogOut,
  Hospital,
  AlertCircle
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'patients' | 'finance' | 'appointments' | 'reports';
  setActiveTab: (tab: 'patients' | 'finance' | 'appointments' | 'reports') => void;
  user: User | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onOpenSyncModal: () => void;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  isSyncing: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  user,
  onLoginClick,
  onLogoutClick,
  onOpenSyncModal,
  spreadsheetUrl,
  lastSyncedAt,
  isSyncing,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo & Clinic Brand */}
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 flex items-center justify-center text-white shadow-md shadow-teal-500/20">
              <Hospital className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight">ClinicCare Lao</span>
                <span className="bg-teal-50 text-teal-700 text-xs px-2 py-0.5 rounded-full font-medium border border-teal-200/60">
                  ຄລີນິກປິ່ນປົວ
                </span>
              </div>
              <p className="text-xs text-slate-500">ລະບົບຕິດຕາມຄົນເຈັບ & ບັນຊີລາຍຮັບ-ລາຍຈ່າຍ</p>
            </div>
          </div>

          {/* Navigation Tabs (Separated into Part 1 & Part 2 as requested) */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200/80">
            <button
              onClick={() => setActiveTab('patients')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'patients'
                  ? 'bg-white text-teal-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Users className="w-4 h-4 text-teal-600" />
              <span>1. ຕິດຕາມຄົນເຈັບ</span>
            </button>

            <button
              onClick={() => setActiveTab('finance')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'finance'
                  ? 'bg-white text-emerald-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <Wallet className="w-4 h-4 text-emerald-600" />
              <span>2. ລາຍຮັບ - ລາຍຈ່າຍ</span>
            </button>

            <button
              onClick={() => setActiveTab('appointments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'appointments'
                  ? 'bg-white text-indigo-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <CalendarDays className="w-4 h-4 text-indigo-600" />
              <span>ຕາຕະລາງນັດໝາຍ</span>
            </button>

            <button
              onClick={() => setActiveTab('reports')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'reports'
                  ? 'bg-white text-blue-700 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>ບົດສະຫຼຸບ</span>
            </button>
          </nav>

          {/* Right Action: Google Workspace Sync & Authentication */}
          <div className="flex items-center gap-3">
            {/* Quick Sync Button */}
            <button
              onClick={onOpenSyncModal}
              title="ຊິງຄ໌ຂໍ້ມູນກັບ Google Sheets ແລະ Drive"
              className={`relative inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                spreadsheetUrl
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
              }`}
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span className="hidden sm:inline">Google Sheets</span>
              {spreadsheetUrl ? (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              ) : (
                <span className="w-2 h-2 rounded-full bg-slate-300" />
              )}
            </button>

            {/* Google Sign-in / User Profile */}
            {user ? (
              <div className="flex items-center gap-2">
                <div
                  onClick={onOpenSyncModal}
                  className="cursor-pointer flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                >
                  {user.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'Doctor Profile'}
                      className="w-8 h-8 rounded-full border border-slate-300 object-cover"
                    />
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                      {(user.displayName || user.email || 'Dr').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="hidden lg:block text-left text-xs leading-tight">
                    <p className="font-semibold text-slate-800 line-clamp-1">
                      {user.displayName || user.email?.split('@')[0]}
                    </p>
                    <p className="text-[10px] text-emerald-600 font-medium">ເຊື່ອມຕໍ່ Workspace ແລ້ວ</p>
                  </div>
                </div>

                <button
                  onClick={onLogoutClick}
                  title="ອອກຈາກລະບົບ"
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              /* Official Google Sign In Button conforming to guidelines */
              <button
                onClick={onLoginClick}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 shadow-xs transition-colors"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>ເຂົ້າສູ່ລະບົບດ້ວຍ Google</span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Tab Bar */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 gap-1 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('patients')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'patients'
                ? 'bg-teal-100 text-teal-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-3.5 h-3.5 text-teal-600" />
            <span>1. ຄົນເຈັບ</span>
          </button>
          <button
            onClick={() => setActiveTab('finance')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'finance'
                ? 'bg-emerald-100 text-emerald-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-600" />
            <span>2. ລາຍຮັບ-ລາຍຈ່າຍ</span>
          </button>
          <button
            onClick={() => setActiveTab('appointments')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'appointments'
                ? 'bg-indigo-100 text-indigo-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5 text-indigo-600" />
            <span>ນັດໝາຍ</span>
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg whitespace-nowrap ${
              activeTab === 'reports'
                ? 'bg-blue-100 text-blue-800 font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-blue-600" />
            <span>ສະຫຼຸບ</span>
          </button>
        </div>
      </div>
    </header>
  );
};
