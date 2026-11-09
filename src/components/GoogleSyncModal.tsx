import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  X,
  FileSpreadsheet,
  HardDrive,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  RefreshCw,
  UploadCloud,
  Layers,
  Sparkles
} from 'lucide-react';
import { Patient, MedicalVisit, Transaction, Appointment } from '../types';
import { createOrUpdateClinicSpreadsheet } from '../services/googleSheetsService';
import { backupToGoogleDrive } from '../services/googleDriveService';
import confetti from 'canvas-confetti';

interface GoogleSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User | null;
  accessToken: string | null;
  onLoginClick: () => void;
  patients: Patient[];
  visits: MedicalVisit[];
  transactions: Transaction[];
  appointments: Appointment[];
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  lastSyncedAt: string | null;
  onSyncSuccess: (id: string, url: string) => void;
}

export const GoogleSyncModal: React.FC<GoogleSyncModalProps> = ({
  isOpen,
  onClose,
  user,
  accessToken,
  onLoginClick,
  patients,
  visits,
  transactions,
  appointments,
  spreadsheetId,
  spreadsheetUrl,
  lastSyncedAt,
  onSyncSuccess,
}) => {
  const [isSyncingSheets, setIsSyncingSheets] = useState(false);
  const [isBackingUpDrive, setIsBackingUpDrive] = useState(false);
  const [syncStatusMessage, setSyncStatusMessage] = useState<string | null>(null);
  const [driveStatusMessage, setDriveStatusMessage] = useState<string | null>(null);
  const [driveFileUrl, setDriveFileUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSyncToSheets = async () => {
    if (!accessToken) {
      onLoginClick();
      return;
    }

    setIsSyncingSheets(true);
    setErrorMessage(null);
    setSyncStatusMessage(null);

    try {
      const result = await createOrUpdateClinicSpreadsheet(
        accessToken,
        spreadsheetId,
        patients,
        visits,
        transactions
      );

      if (result.success) {
        onSyncSuccess(result.spreadsheetId, result.spreadsheetUrl);
        setSyncStatusMessage(
          `ຊິງຄ໌ສຳເລັດແລ້ວ! ສົ່ງອອກ ${result.patientRowsCount} ລາຍການຄົນເຈັບ ແລະ ${result.transactionRowsCount} ລາຍການບັນຊີ`
        );
        try {
          confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
        } catch (e) {
          // ignore
        }
      } else {
        setErrorMessage(result.error || 'ບໍ່ສາມາດຊິງຄ໌ກັບ Google Sheets ໄດ້');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການເຊື່ອມຕໍ່ Google Sheets');
    } finally {
      setIsSyncingSheets(false);
    }
  };

  const handleBackupToDrive = async () => {
    if (!accessToken) {
      onLoginClick();
      return;
    }

    setIsBackingUpDrive(true);
    setDriveStatusMessage(null);
    setErrorMessage(null);

    try {
      const payload = {
        clinicName: 'ClinicCare Lao',
        exportDate: new Date().toISOString(),
        patients,
        visits,
        transactions,
        appointments,
      };

      const result = await backupToGoogleDrive(accessToken, payload);

      if (result.success) {
        setDriveStatusMessage(`ສຳຮອງຂໍ້ມູນຂຶ້ນ Google Drive ສຳເລັດ! ໄຟລ໌: ${result.fileName}`);
        if (result.webViewLink) {
          setDriveFileUrl(result.webViewLink);
        }
        try {
          confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
        } catch (e) {
          // ignore
        }
      } else {
        setErrorMessage(result.error || 'ບໍ່ສາມາດສຳຮອງຂໍ້ມູນຂຶ້ນ Google Drive ໄດ້');
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'ເກີດຂໍ້ຜິດພາດໃນການສຳຮອງຂໍ້ມູນ Drive');
    } finally {
      setIsBackingUpDrive(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-emerald-700 to-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <FileSpreadsheet className="w-6 h-6 text-emerald-200" />
            </div>
            <div>
              <h3 className="text-lg font-bold">Google Sheets & Google Drive Sync</h3>
              <p className="text-xs text-emerald-100">ເຊື່ອມຕໍ່ ແລະ ຊິງຄ໌ຂໍ້ມູນຄລີນິກຂຶ້ນ Cloud</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          {/* User Auth Status */}
          <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
            {user ? (
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Google Profile'}
                    className="w-10 h-10 rounded-full border border-slate-300"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                    {(user.displayName || user.email || 'G').charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-bold text-slate-900 text-sm">{user.displayName || 'Google User'}</p>
                  <p className="text-slate-500 text-[11px]">{user.email}</p>
                  <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mt-0.5">
                    <CheckCircle2 className="w-3 h-3" /> ເຊື່ອມຕໍ່ Google Workspace ແລ້ວ
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between w-full gap-3">
                <div>
                  <p className="font-bold text-slate-800 text-sm">ຍັງບໍ່ທັນເຂົ້າສູ່ລະບົບ Google</p>
                  <p className="text-slate-500 text-xs">ກະລຸນາເຂົ້າສູ່ລະບົບເພື່ອສົ່ງອອກຂໍ້ມູນໄປ Google Sheets</p>
                </div>
                <button
                  onClick={onLoginClick}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-300 rounded-xl font-bold text-slate-700 hover:bg-slate-100 shadow-xs transition-colors shrink-0"
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
                  <span>Sign in with Google</span>
                </button>
              </div>
            )}
          </div>

          {/* Section 1: Google Sheets Sync */}
          <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">Google Sheets Integration</h4>
                  <p className="text-slate-600 text-xs">
                    ສ້າງ ແລະ ຊິງຄ໌ຕາຕະລາງປະຫວັດຄົນເຈັບ ແລະ ບັນຊີລາຍຮັບ-ລາຍຈ່າຍອັດຕະໂນມັດ
                  </p>
                </div>
              </div>
            </div>

            {/* Sheets structure explanation */}
            <div className="bg-white p-3 rounded-xl border border-emerald-200/80 space-y-2 text-slate-700">
              <p className="font-semibold text-emerald-900">
                📊 ແຜ່ນງານ (Sheets) ທີ່ຈະຖືກສ້າງ ແລະ ອັບເດດໃນ Google Spreadsheet:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-teal-800 block">1. ຄົນເຈັບ ແລະ ການປິ່ນປົວ</span>
                  <span className="text-slate-500">HN, ຊື່, ບ້ານເກີດ, ບ້ານປັດຈຸບັນ, ອາການ, ຜົນກວດ, ຄ່າປິ່ນປົວ</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="font-bold text-emerald-800 block">2. ລາຍຮັບ ແລະ ລາຍຈ່າຍ</span>
                  <span className="text-slate-500">ວັນທີ, ປະເພດ, ໝວດໝູ່, ຫົວຂໍ້, ຈຳນວນເງິນ, ວິທີຊຳລະ, ໃບບິນ</span>
                </div>
              </div>
            </div>

            {/* Existing Spreadsheet Link if exists */}
            {spreadsheetUrl && (
              <div className="p-3 bg-white rounded-xl border border-emerald-200 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 block">Spreadsheet ID:</span>
                  <span className="font-mono text-xs text-slate-700 truncate max-w-[200px] block">
                    {spreadsheetId}
                  </span>
                  {lastSyncedAt && (
                    <span className="text-[10px] text-emerald-600 block mt-0.5">
                      ຊິງຄ໌ລ່າສຸດ: {new Date(lastSyncedAt).toLocaleString('lo-LA')}
                    </span>
                  )}
                </div>

                <a
                  href={spreadsheetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-xs"
                >
                  <span>ເປີດເບິ່ງໃນ Google Sheets</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            )}

            {/* Sync Status Banner */}
            {syncStatusMessage && (
              <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>{syncStatusMessage}</span>
              </div>
            )}

            {/* Sync Action Button */}
            <button
              onClick={handleSyncToSheets}
              disabled={isSyncingSheets}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSyncingSheets ? 'animate-spin' : ''}`} />
              <span>
                {isSyncingSheets
                  ? 'ກຳລັງຊິງຄ໌ກັບ Google Sheets...'
                  : spreadsheetUrl
                  ? 'ອັບເດດຂໍ້ມູນໃສ່ Google Sheets'
                  : 'ສ້າງ Google Sheet ໃໝ່ ແລະ ຊິງຄ໌ຂໍ້ມູນ'}
              </span>
            </button>
          </div>

          {/* Section 2: Google Drive Backup */}
          <div className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <HardDrive className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Google Drive Cloud Backup</h4>
                <p className="text-slate-600 text-xs">
                  ສຳຮອງຖານຂໍ້ມູນຄລີນິກທັງໝົດ (ຄົນເຈັບ, ການປິ່ນປົວ, ບັນຊີ, ນັດໝາຍ) ເກັບໄວ້ໃນ Google Drive
                </p>
              </div>
            </div>

            {driveStatusMessage && (
              <div className="p-3 bg-blue-100 text-blue-900 rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                  <span>{driveStatusMessage}</span>
                </div>
                {driveFileUrl && (
                  <a
                    href={driveFileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-blue-700 font-bold hover:underline"
                  >
                    <span>ເບິ່ງໃນ Drive</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            <button
              onClick={handleBackupToDrive}
              disabled={isBackingUpDrive}
              className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              <UploadCloud className={`w-4 h-4 ${isBackingUpDrive ? 'animate-bounce' : ''}`} />
              <span>
                {isBackingUpDrive ? 'ກຳລັງອັບໂຫຼດສຳຮອງຂຶ້ນ Drive...' : 'ສຳຮອງຖານຂໍ້ມູນຂຶ້ນ Google Drive'}
              </span>
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">ເກີດຂໍ້ຜິດພາດ:</p>
                <p className="text-rose-700">{errorMessage}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
