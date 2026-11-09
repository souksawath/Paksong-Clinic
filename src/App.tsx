/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {
  initAuth,
  googleSignIn,
  getAccessToken,
  logout,
  setAccessToken,
} from './firebase';
import {
  Patient,
  MedicalVisit,
  Transaction,
  Appointment,
} from './types';
import {
  INITIAL_PATIENTS,
  INITIAL_VISITS,
  INITIAL_TRANSACTIONS,
  INITIAL_APPOINTMENTS,
} from './mockData';
import { Navbar } from './components/Navbar';
import { PatientManagement } from './components/PatientManagement';
import { FinanceManagement } from './components/FinanceManagement';
import { AppointmentManagement } from './components/AppointmentManagement';
import { ReportsView } from './components/ReportsView';
import { GoogleSyncModal } from './components/GoogleSyncModal';
import { Hospital, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function App() {
  // Navigation
  const [activeTab, setActiveTab] = useState<'patients' | 'finance' | 'appointments' | 'reports'>('patients');

  // Core Data States with localStorage persistence
  const [patients, setPatients] = useState<Patient[]>(() => {
    try {
      const saved = localStorage.getItem('clinic_patients');
      return saved ? JSON.parse(saved) : INITIAL_PATIENTS;
    } catch {
      return INITIAL_PATIENTS;
    }
  });

  const [visits, setVisits] = useState<MedicalVisit[]>(() => {
    try {
      const saved = localStorage.getItem('clinic_visits');
      return saved ? JSON.parse(saved) : INITIAL_VISITS;
    } catch {
      return INITIAL_VISITS;
    }
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem('clinic_transactions');
      return saved ? JSON.parse(saved) : INITIAL_TRANSACTIONS;
    } catch {
      return INITIAL_TRANSACTIONS;
    }
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    try {
      const saved = localStorage.getItem('clinic_appointments');
      return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
    } catch {
      return INITIAL_APPOINTMENTS;
    }
  });

  // Google Workspace Sync States
  const [spreadsheetId, setSpreadsheetId] = useState<string | null>(() => {
    return localStorage.getItem('clinic_spreadsheet_id') || null;
  });
  const [spreadsheetUrl, setSpreadsheetUrl] = useState<string | null>(() => {
    return localStorage.getItem('clinic_spreadsheet_url') || null;
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem('clinic_last_synced') || null;
  });
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);

  // Authentication
  const [user, setUser] = useState<User | null>(null);
  const [accessToken, setToken] = useState<string | null>(null);

  // Appointment preselection state
  const [patientForAppointment, setPatientForAppointment] = useState<Patient | null>(null);

  // Notification / Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem('clinic_patients', JSON.stringify(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('clinic_visits', JSON.stringify(visits));
  }, [visits]);

  useEffect(() => {
    localStorage.setItem('clinic_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('clinic_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    if (spreadsheetId) localStorage.setItem('clinic_spreadsheet_id', spreadsheetId);
    if (spreadsheetUrl) localStorage.setItem('clinic_spreadsheet_url', spreadsheetUrl);
    if (lastSyncedAt) localStorage.setItem('clinic_last_synced', lastSyncedAt);
  }, [spreadsheetId, spreadsheetUrl, lastSyncedAt]);

  // Init Firebase Auth
  useEffect(() => {
    const unsubscribe = initAuth(
      (authuser, token) => {
        setUser(authuser);
        setToken(token);
        setAccessToken(token);
      },
      () => {
        setUser(null);
        setToken(null);
        setAccessToken(null);
      }
    );
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        setToken(result.accessToken);
        showToast(`ເຂົ້າສູ່ລະບົບສຳເລັດ: ${result.user.displayName || result.user.email}`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast(err.message || 'ບໍ່ສາມາດເຂົ້າສູ່ລະບົບ Google ໄດ້');
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      setToken(null);
      showToast('ອອກຈາກລະບົບແລ້ວ');
    } catch (err: any) {
      console.error('Logout error:', err);
    }
  };

  // Patient Actions
  const handleSavePatient = (savedPatient: Patient) => {
    setPatients((prev) => {
      const idx = prev.findIndex((p) => p.id === savedPatient.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = savedPatient;
        return updated;
      }
      return [savedPatient, ...prev];
    });
    showToast(`ບັນທຶກຂໍ້ມູນຄົນເຈັບ: ${savedPatient.firstName} ${savedPatient.lastName} ແລ້ວ`);
  };

  const handleDeletePatient = (patientId: string) => {
    setPatients((prev) => prev.filter((p) => p.id !== patientId));
    showToast('ລຶບຂໍ້ມູນຄົນເຈັບສຳເລັດແລ້ວ');
  };

  // Visit Actions
  const handleSaveVisit = (visit: MedicalVisit, autoIncomeTransaction?: Transaction) => {
    setVisits((prev) => [visit, ...prev]);

    // Automatically record income in Section 2 if selected
    if (autoIncomeTransaction) {
      setTransactions((prev) => [autoIncomeTransaction, ...prev]);
      showToast(`ບັນທຶກການປິ່ນປົວ & ລາຍຮັບ ${autoIncomeTransaction.amount.toLocaleString()} ₭ ເຂົ້າບັນຊີແລ້ວ!`);
    } else {
      showToast('ບັນທຶກການກວດປິ່ນປົວສຳເລັດ');
    }
  };

  // Schedule Appointment from Patient view
  const handleScheduleAppointment = (patient: Patient) => {
    setPatientForAppointment(patient);
    setActiveTab('appointments');
  };

  // Transaction Actions (Section 2)
  const handleSaveTransaction = (tx: Transaction) => {
    setTransactions((prev) => {
      const idx = prev.findIndex((t) => t.id === tx.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx] = tx;
        return updated;
      }
      return [tx, ...prev];
    });
    showToast(`ບັນທຶກ${tx.type === 'income' ? 'ລາຍຮັບ' : 'ລາຍຈ່າຍ'} ${tx.amount.toLocaleString()} ₭ ແລ້ວ`);
  };

  const handleDeleteTransaction = (txId: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== txId));
    showToast('ລຶບລາຍການບັນຊີສຳເລັດແລ້ວ');
  };

  // Appointment Actions
  const handleSaveAppointment = (apt: Appointment) => {
    setAppointments((prev) => [apt, ...prev]);
    showToast(`ສ້າງນັດໝາຍສຳລັບ ${apt.patientName} ແລ້ວ`);
  };

  const handleUpdateAppointmentStatus = (aptId: string, status: Appointment['status']) => {
    setAppointments((prev) =>
      prev.map((a) => (a.id === aptId ? { ...a, status } : a))
    );
    showToast(`ອັບເດດສະຖານະນັດໝາຍເປັນ "${status === 'completed' ? 'ສຳເລັດ' : 'ຍົກເລີກ'}" ແລ້ວ`);
  };

  // Sync Success Callback
  const handleSyncSuccess = (id: string, url: string) => {
    setSpreadsheetId(id);
    setSpreadsheetUrl(url);
    const now = new Date().toISOString();
    setLastSyncedAt(now);
    showToast('ຊິງຄ໌ຂໍ້ມູນໄປຍັງ Google Sheets ສຳເລັດແລ້ວ!');
  };

  // Export CSV
  const handleExportCSV = () => {
    const csvRows: string[] = [];
    csvRows.push('ລາຍການ,ວັນທີ,ປະເພດ,ຈຳນວນເງິນ,ວິທີຊຳລະ,ຄົນເຈັບ,ໝາຍເຫດ');

    transactions.forEach((t) => {
      csvRows.push(
        `"${t.title.replace(/"/g, '""')}","${t.date}","${t.type}","${t.amount}","${t.paymentMethodLabel}","${t.patientName || '-'}","${t.notes || ''}"`
      );
    });

    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClinicCare_Transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ດາວໂຫຼດໄຟລ໌ CSV ສຳເລັດແລ້ວ');
  };

  // Export JSON Backup
  const handleExportJSON = () => {
    const backupData = {
      clinic: 'ClinicCare Lao',
      backupAt: new Date().toISOString(),
      patients,
      visits,
      transactions,
      appointments,
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ClinicCare_Backup_${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('ດາວໂຫຼດໄຟລ໌ Backup JSON ສຳເລັດແລ້ວ');
  };

  // Reset to sample data
  const handleResetSampleData = () => {
    if (window.confirm('ທ່ານຕ້ອງການໂຫຼດຂໍ້ມູນຕົວຢ່າງຄືນໃໝ່ທັງໝົດ ຫຼື ບໍ່? (ຂໍ້ມູນທີ່ແກ້ໄຂຈະຖືກຣີເຊັດ)')) {
      setPatients(INITIAL_PATIENTS);
      setVisits(INITIAL_VISITS);
      setTransactions(INITIAL_TRANSACTIONS);
      setAppointments(INITIAL_APPOINTMENTS);
      showToast('ຣີເຊັດຂໍ້ມູນຕົວຢ່າງຮຽບຮ້ອຍແລ້ວ');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col antialiased">
      {/* Top Notification Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl flex items-center gap-3 text-xs border border-slate-700 animate-in fade-in slide-in-from-bottom-4 duration-200">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          <span className="font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        user={user}
        onLoginClick={handleLogin}
        onLogoutClick={handleLogout}
        onOpenSyncModal={() => setIsSyncModalOpen(true)}
        spreadsheetUrl={spreadsheetUrl}
        lastSyncedAt={lastSyncedAt}
        isSyncing={false}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'patients' && (
          <PatientManagement
            patients={patients}
            visits={visits}
            onSavePatient={handleSavePatient}
            onDeletePatient={handleDeletePatient}
            onSaveVisit={handleSaveVisit}
            onScheduleAppointment={handleScheduleAppointment}
          />
        )}

        {activeTab === 'finance' && (
          <FinanceManagement
            transactions={transactions}
            patients={patients}
            onSaveTransaction={handleSaveTransaction}
            onDeleteTransaction={handleDeleteTransaction}
            onOpenSyncModal={() => setIsSyncModalOpen(true)}
          />
        )}

        {activeTab === 'appointments' && (
          <AppointmentManagement
            appointments={appointments}
            patients={patients}
            onSaveAppointment={handleSaveAppointment}
            onUpdateStatus={handleUpdateAppointmentStatus}
            patientPreselect={patientForAppointment}
          />
        )}

        {activeTab === 'reports' && (
          <ReportsView
            patients={patients}
            visits={visits}
            transactions={transactions}
            appointments={appointments}
            onExportCSV={handleExportCSV}
            onExportJSON={handleExportJSON}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6 mt-12 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Hospital className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-700">ClinicCare Lao</span>
            <span>•</span>
            <span>ລະບົບຄຸ້ມຄອງຄລີນິກ, ປະຫວັດຄົນເຈັບ ແລະ ລາຍຮັບ-ລາຍຈ່າຍ</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetSampleData}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              ໂຫຼດຂໍ້ມູນຕົວຢ່າງຄືນໃໝ່
            </button>
            <span>•</span>
            <button
              onClick={() => setIsSyncModalOpen(true)}
              className="text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              Google Sheets & Drive Sync
            </button>
          </div>
        </div>
      </footer>

      {/* Google Sheets and Drive Sync Modal */}
      <GoogleSyncModal
        isOpen={isSyncModalOpen}
        onClose={() => setIsSyncModalOpen(false)}
        user={user}
        accessToken={accessToken}
        onLoginClick={handleLogin}
        patients={patients}
        visits={visits}
        transactions={transactions}
        appointments={appointments}
        spreadsheetId={spreadsheetId}
        spreadsheetUrl={spreadsheetUrl}
        lastSyncedAt={lastSyncedAt}
        onSyncSuccess={handleSyncSuccess}
      />
    </div>
  );
}
