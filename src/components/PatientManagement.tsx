import React, { useState } from 'react';
import { Patient, MedicalVisit, Transaction, Appointment } from '../types';
import {
  UserPlus,
  Search,
  Filter,
  User,
  MapPin,
  HeartPulse,
  Phone,
  AlertTriangle,
  Stethoscope,
  Calendar,
  Clock,
  ChevronRight,
  Edit2,
  Trash2,
  FileText,
  BadgeAlert,
  ArrowUpDown,
  History,
  Check,
  X,
  Sparkles,
} from 'lucide-react';
import { PatientModal } from './PatientModal';
import { VisitModal } from './VisitModal';
import { ReceiptModal } from './ReceiptModal';

interface PatientManagementProps {
  patients: Patient[];
  visits: MedicalVisit[];
  onSavePatient: (patient: Patient) => void;
  onDeletePatient: (patientId: string) => void;
  onSaveVisit: (visit: MedicalVisit, autoIncomeTransaction?: Transaction) => void;
  onScheduleAppointment: (patient: Patient) => void;
}

export const PatientManagement: React.FC<PatientManagementProps> = ({
  patients,
  visits,
  onSavePatient,
  onDeletePatient,
  onSaveVisit,
  onScheduleAppointment,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTarget, setSearchTarget] = useState<'all' | 'name' | 'phone'>('all');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(
    patients.length > 0 ? patients[0].id : null
  );

  // Modals state
  const [isPatientModalOpen, setIsPatientModalOpen] = useState(false);
  const [patientToEdit, setPatientToEdit] = useState<Patient | null>(null);
  const [prefillForNew, setPrefillForNew] = useState<{ name?: string; phone?: string } | undefined>(undefined);
  const [isVisitModalOpen, setIsVisitModalOpen] = useState(false);
  const [selectedVisitForReceipt, setSelectedVisitForReceipt] = useState<MedicalVisit | null>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  // Filter patients specifically by name or phone number
  const filteredPatients = patients.filter((p) => {
    if (searchTerm.trim() !== '') {
      const query = searchTerm.trim().toLowerCase();
      const cleanQueryDigits = query.replace(/[^0-9]/g, '');
      const cleanPhone = p.phone.replace(/[^0-9]/g, '');

      const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
      const reverseName = `${p.lastName} ${p.firstName}`.toLowerCase();

      const matchesName =
        p.firstName.toLowerCase().includes(query) ||
        p.lastName.toLowerCase().includes(query) ||
        fullName.includes(query) ||
        reverseName.includes(query);

      const matchesPhone =
        (cleanQueryDigits.length > 0 && cleanPhone.includes(cleanQueryDigits)) ||
        p.phone.toLowerCase().includes(query);

      const matchesHn = p.hn.toLowerCase().includes(query);

      if (searchTarget === 'name') {
        if (!matchesName && !matchesHn) return false;
      } else if (searchTarget === 'phone') {
        if (!matchesPhone) return false;
      } else {
        // 'all': matches by name OR phone number, or HN / symptoms
        if (
          !matchesName &&
          !matchesPhone &&
          !matchesHn &&
          !p.initialSymptoms.toLowerCase().includes(query)
        ) {
          return false;
        }
      }
    }

    const matchesGender = genderFilter === 'all' || p.gender === genderFilter;
    return matchesGender;
  });

  const selectedPatient = patients.find((p) => p.id === selectedPatientId) || patients[0];
  const patientVisits = selectedPatient
    ? visits.filter((v) => v.patientId === selectedPatient.id).sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime())
    : [];

  const handleEditPatient = (p: Patient) => {
    setPatientToEdit(p);
    setPrefillForNew(undefined);
    setIsPatientModalOpen(true);
  };

  const handleNewPatient = (prefill?: { name?: string; phone?: string }) => {
    setPatientToEdit(null);
    setPrefillForNew(prefill);
    setIsPatientModalOpen(true);
  };

  const handleDelete = (p: Patient) => {
    if (window.confirm(`ທ່ານແນ່ໃຈບໍ່ວ່າຕ້ອງການລຶບຂໍ້ມູນຄົນເຈັບ: "${p.firstName} ${p.lastName}" (${p.hn})?`)) {
      onDeletePatient(p.id);
      if (selectedPatientId === p.id) {
        setSelectedPatientId(patients.find((pt) => pt.id !== p.id)?.id || null);
      }
    }
  };

  const handleViewReceipt = (v: MedicalVisit) => {
    setSelectedVisitForReceipt(v);
    setIsReceiptModalOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Title & Quick Stats */}
      <div className="bg-gradient-to-r from-teal-800 to-teal-600 rounded-2xl p-6 text-white shadow-lg shadow-teal-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-teal-100 text-xs font-medium mb-2 border border-white/15">
              <span>ພາກສ່ວນທີ 1 (Section 1)</span>
              <span>•</span>
              <span>ລະບົບຕິດຕາມຄົນເຈັບ</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ການຕິດຕາມ ແລະ ຈັດການປະຫວັດຄົນເຈັບ</h1>
            <p className="text-sm text-teal-100 max-w-2xl mt-1">
              ບັນທຶກປະຫວັດສ່ວນຕົວ, ບ້ານເກີດ, ບ້ານຢູ່ປັດຈຸບັນ, ອາການທີ່ມາປິ່ນປົວ ແລະ ຕິດຕາມການປິ່ນປົວແຕ່ລະຄັ້ງ
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNewPatient()}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-teal-800 rounded-xl font-bold text-sm shadow-md hover:bg-teal-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus className="w-4 h-4 text-teal-600" />
              <span>ລົງທະບຽນຄົນເຈັບໃໝ່</span>
            </button>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/20">
          <div>
            <span className="text-xs text-teal-200">ຄົນເຈັບທັງໝົດ</span>
            <p className="text-2xl font-bold font-mono">{patients.length} ຄົນ</p>
          </div>
          <div>
            <span className="text-xs text-teal-200">ຄົນເຈັບຊາຍ / ຍິງ</span>
            <p className="text-2xl font-bold font-mono">
              {patients.filter((p) => p.gender === 'male').length} / {patients.filter((p) => p.gender === 'female').length}
            </p>
          </div>
          <div>
            <span className="text-xs text-teal-200">ຄັ້ງກວດປິ່ນປົວລວມ</span>
            <p className="text-2xl font-bold font-mono">{visits.length} ຄັ້ງ</p>
          </div>
          <div>
            <span className="text-xs text-teal-200">ມີປະຫວັດແພ້ຢາ</span>
            <p className="text-2xl font-bold font-mono text-rose-300">
              {patients.filter((p) => p.drugAllergies && p.drugAllergies !== 'ບໍ່ມີ' && p.drugAllergies !== 'ບໍ່ມີປະຫວັດແພ້ຢາ').length} ຄົນ
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout: Patient List (Left) + Detailed Card & Visits (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Patient Directory (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            {/* Dedicated Search Bar for Searching Patients by Name or Phone Number */}
            <div className="p-3.5 bg-gradient-to-b from-teal-50/70 to-slate-50/70 rounded-xl border border-teal-100 mb-3 space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900">
                  <Search className="w-3.5 h-3.5 text-teal-600" />
                  <span>ຄົ້ນຫາຄົນເຈັບ (Search Patients)</span>
                </div>
                <span className="text-[10px] text-slate-500">
                  ຄົ້ນຫາຕາມຊື່ ຫຼື ເບີໂທ
                </span>
              </div>

              {/* Search target selector tabs */}
              <div className="grid grid-cols-3 gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => setSearchTarget('all')}
                  className={`py-1 px-2 rounded-md font-medium text-[11px] transition-all flex items-center justify-center gap-1 ${
                    searchTarget === 'all'
                      ? 'bg-teal-700 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Search className="w-3 h-3" />
                  <span>ທັງໝົດ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTarget('name')}
                  className={`py-1 px-2 rounded-md font-medium text-[11px] transition-all flex items-center justify-center gap-1 ${
                    searchTarget === 'name'
                      ? 'bg-teal-700 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <User className="w-3 h-3" />
                  <span>ຊື່ / ນາມສະກຸນ</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSearchTarget('phone')}
                  className={`py-1 px-2 rounded-md font-medium text-[11px] transition-all flex items-center justify-center gap-1 ${
                    searchTarget === 'phone'
                      ? 'bg-teal-700 text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <Phone className="w-3 h-3" />
                  <span>ເບີໂທລະສັບ</span>
                </button>
              </div>

              {/* Main Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-teal-600" />
                <input
                  type="text"
                  placeholder={
                    searchTarget === 'phone'
                      ? 'ພິມເບີໂທລະສັບ (e.g. 020 5544 3322 ຫຼື 5544)...'
                      : searchTarget === 'name'
                      ? 'ພິມຊື່ ຫຼື ນາມສະກຸນ (e.g. ສົມສັກ ຫຼື ວົງວິໄລ)...'
                      : 'ຄົ້ນຫາຕາມຊື່, ນາມສະກຸນ ຫຼື ເບີໂທລະສັບ...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-xs rounded-xl border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-teal-500 focus:border-teal-500 shadow-xs"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    title="ລ້າງການຄົ້ນຫາ"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 rounded-full hover:bg-slate-100"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Results status & Gender filters */}
              <div className="flex items-center justify-between text-xs pt-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-[11px] text-slate-600 font-medium">
                    ພົບ <strong className="text-teal-800 font-mono">{filteredPatients.length}</strong> ຄົນ
                  </span>
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="text-[10px] text-teal-700 hover:underline font-semibold"
                    >
                      (ລ້າງຄຳຄົ້ນ)
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200">
                  <button
                    onClick={() => setGenderFilter('all')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      genderFilter === 'all'
                        ? 'bg-teal-50 text-teal-800 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ທັງໝົດ
                  </button>
                  <button
                    onClick={() => setGenderFilter('male')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      genderFilter === 'male'
                        ? 'bg-teal-50 text-teal-800 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ຊາຍ
                  </button>
                  <button
                    onClick={() => setGenderFilter('female')}
                    className={`px-2 py-0.5 rounded text-[10px] font-medium transition-colors ${
                      genderFilter === 'female'
                        ? 'bg-teal-50 text-teal-800 font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    ຍິງ
                  </button>
                </div>
              </div>
            </div>

            {/* Patients List */}
            <div className="mt-3 divide-y divide-slate-100 max-h-[600px] overflow-y-auto pr-1">
              {filteredPatients.length === 0 ? (
                <div className="py-10 px-4 text-center text-slate-500 bg-slate-50/50 rounded-xl border border-dashed border-slate-200 my-2">
                  <User className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                  <p className="text-xs font-semibold text-slate-700">
                    ບໍ່ພົບຂໍ້ມູນຄົນເຈັບ{searchTerm ? ` ທີ່ກົງກັບ "${searchTerm}"` : ''}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {searchTarget === 'phone'
                      ? 'ກວດສອບເບີໂທລະສັບຄືນໃໝ່ ຫຼື ປ່ຽນໄປຄົ້ນຫາຕາມຊື່'
                      : searchTarget === 'name'
                      ? 'ກວດສອບຊື່ ຫຼື ນາມສະກຸນຄືນໃໝ່ ຫຼື ລົງທະບຽນໃໝ່'
                      : 'ກວດສອບຊື່, ເບີໂທ ຫຼື ລົງທະບຽນຄົນເຈັບໃໝ່'}
                  </p>
                  {searchTerm && (
                    <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSearchTerm('')}
                        className="px-3 py-1.5 text-[11px] bg-white border border-slate-300 text-slate-600 rounded-lg hover:bg-slate-100 font-medium"
                      >
                        ລ້າງຄຳຄົ້ນຫາ
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          const isDigits = /^[0-9\s+]+$/.test(searchTerm);
                          handleNewPatient(isDigits ? { phone: searchTerm } : { name: searchTerm });
                        }}
                        className="px-3 py-1.5 text-[11px] bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold shadow-xs flex items-center gap-1"
                      >
                        <UserPlus className="w-3 h-3" />
                        <span>+ ລົງທະບຽນໃໝ່ດ້ວຍ "{searchTerm}"</span>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                filteredPatients.map((patient) => {
                  const isSelected = selectedPatient?.id === patient.id;
                  const hasAllergy =
                    patient.drugAllergies &&
                    patient.drugAllergies !== 'ບໍ່ມີ' &&
                    patient.drugAllergies !== 'ບໍ່ມີປະຫວັດແພ້ຢາ';

                  // Check if search matches phone specifically
                  const cleanQuery = searchTerm.replace(/[^0-9]/g, '');
                  const cleanPhone = patient.phone.replace(/[^0-9]/g, '');
                  const phoneMatches =
                    cleanQuery.length > 0 && cleanPhone.includes(cleanQuery);

                  return (
                    <div
                      key={patient.id}
                      onClick={() => setSelectedPatientId(patient.id)}
                      className={`p-3.5 rounded-xl cursor-pointer transition-all my-1 border ${
                        isSelected
                          ? 'bg-teal-50/80 border-teal-300 shadow-xs'
                          : 'bg-white hover:bg-slate-50 border-transparent hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                              patient.gender === 'female'
                                ? 'bg-pink-100 text-pink-700'
                                : 'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {patient.gender === 'female' ? 'ຍ' : 'ຊ'}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900 text-sm">
                                {patient.firstName} {patient.lastName}
                              </h4>
                              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600">
                                {patient.hn}
                              </span>
                            </div>
                            <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5 flex-wrap">
                              <span>{patient.age} ປີ</span>
                              <span>•</span>
                              <span
                                className={`inline-flex items-center gap-1 ${
                                  phoneMatches || (searchTarget === 'phone' && searchTerm)
                                    ? 'px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold border border-emerald-300'
                                    : 'text-slate-600'
                                }`}
                              >
                                <Phone className="w-3 h-3 text-teal-600" />
                                {patient.phone || '-'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">
                            ໝວດ {patient.bloodGroup}
                          </span>
                        </div>
                      </div>

                      {/* Symptoms & Address preview */}
                      <div className="mt-2.5 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-600">
                        <span className="truncate max-w-[210px] text-teal-800">
                          🩺 {patient.initialSymptoms}
                        </span>
                        <span className="truncate max-w-[120px] text-slate-400">
                          {patient.currentAddress.village || patient.currentAddress.district}
                        </span>
                      </div>

                      {hasAllergy && (
                        <div className="mt-1 flex items-center gap-1 text-[10px] text-rose-600 font-semibold">
                          <AlertTriangle className="w-3 h-3" />
                          <span className="truncate">ແພ້: {patient.drugAllergies}</span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Selected Patient Details & Treatment History (7 cols) */}
        <div className="lg:col-span-7 space-y-5">
          {selectedPatient ? (
            <>
              {/* Patient Card Details */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                {/* Header Profile */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-5 border-b border-slate-200 gap-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center font-black text-xl shadow-xs ${
                        selectedPatient.gender === 'female'
                          ? 'bg-pink-100 text-pink-700 border border-pink-200'
                          : 'bg-blue-100 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {selectedPatient.firstName.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-extrabold text-slate-900">
                          {selectedPatient.firstName} {selectedPatient.lastName}
                        </h2>
                        <span className="px-2 py-0.5 rounded-md bg-teal-100 text-teal-800 text-xs font-mono font-bold">
                          {selectedPatient.hn}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {selectedPatient.gender === 'male' ? 'ເພດຊາຍ' : selectedPatient.gender === 'female' ? 'ເພດຍິງ' : 'ອື່ນໆ'} •{' '}
                        ອາຍຸ {selectedPatient.age} ປີ • ວັນເດືອນປີເກີດ: {selectedPatient.birthDate} • ໝວດເລືອດ: {selectedPatient.bloodGroup}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-slate-700">
                        <span className="flex items-center gap-1">
                          <Phone className="w-3.5 h-3.5 text-teal-600" />
                          {selectedPatient.phone || 'ບໍ່ມີເບີໂທ'}
                        </span>
                        {selectedPatient.emergencyContact.name && (
                          <span className="text-slate-500">
                            (ສຸກເສີນ: {selectedPatient.emergencyContact.name} - {selectedPatient.emergencyContact.phone})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Actions for this patient */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEditPatient(selectedPatient)}
                      title="ແກ້ໄຂຂໍ້ມູນຄົນເຈັບ"
                      className="p-2 text-slate-600 hover:text-teal-700 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(selectedPatient)}
                      title="ລຶບຄົນເຈັບ"
                      className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Medical Alert Badge */}
                {selectedPatient.drugAllergies && (
                  <div className="mt-4 p-3 bg-rose-50 rounded-xl border border-rose-200 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div className="text-xs">
                      <span className="font-bold text-rose-800">ຄຳເຕືອນແພ້ຢາ / ອາຫານ: </span>
                      <span className="text-rose-700 font-medium">{selectedPatient.drugAllergies}</span>
                      {selectedPatient.underlyingDiseases && (
                        <p className="text-slate-600 mt-0.5">
                          ໂລກປະຈຳຕົວ: <span className="font-semibold">{selectedPatient.underlyingDiseases}</span>
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Hometown vs Current Address Comparison Grid */}
                <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  {/* ບ້ານເກີດ */}
                  <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-1.5 text-slate-700 font-bold mb-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      <span>ບ້ານເກີດ (Hometown)</span>
                    </div>
                    <p className="text-slate-800 font-medium">
                      ບ້ານ: {selectedPatient.hometown.village || '-'}
                    </p>
                    <p className="text-slate-600">
                      ເມືອງ: {selectedPatient.hometown.district || '-'}, ແຂວງ: {selectedPatient.hometown.province}
                    </p>
                  </div>

                  {/* ບ້ານຢູ່ປັດຈຸບັນ */}
                  <div className="p-3.5 bg-teal-50/60 rounded-xl border border-teal-200/80">
                    <div className="flex items-center gap-1.5 text-teal-900 font-bold mb-2">
                      <MapPin className="w-3.5 h-3.5 text-teal-600" />
                      <span>ບ້ານຢູ່ປັດຈຸບັນ (Current Address)</span>
                    </div>
                    <p className="text-slate-800 font-medium">
                      ບ້ານ: {selectedPatient.currentAddress.village || '-'}
                    </p>
                    <p className="text-slate-600">
                      ເມືອງ: {selectedPatient.currentAddress.district || '-'}, ແຂວງ: {selectedPatient.currentAddress.province}
                    </p>
                  </div>
                </div>

                {/* Chief Complaint & Symptoms */}
                <div className="mt-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <div className="text-xs">
                    <span className="font-bold text-slate-700">ມາປິ່ນປົວໃນອາການ: </span>
                    <span className="text-slate-900 font-medium">{selectedPatient.initialSymptoms}</span>
                  </div>
                  {selectedPatient.notes && (
                    <p className="text-xs text-slate-500 mt-1">
                      <span className="font-semibold">ໝາຍເຫດ:</span> {selectedPatient.notes}
                    </p>
                  )}
                </div>

                {/* Primary Action Buttons */}
                <div className="mt-5 pt-4 border-t border-slate-200 flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => setIsVisitModalOpen(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-bold shadow-md shadow-teal-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <Stethoscope className="w-4 h-4" />
                    <span>ບັນທຶກການກວດປິ່ນປົວໃໝ່</span>
                  </button>

                  <button
                    onClick={() => onScheduleAppointment(selectedPatient)}
                    className="inline-flex items-center gap-2 px-3.5 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl text-xs font-semibold border border-indigo-200 transition-colors"
                  >
                    <Calendar className="w-4 h-4" />
                    <span>ສ້າງນັດໝາຍ</span>
                  </button>
                </div>
              </div>

              {/* Patient Treatment / Visit History */}
              <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-5 h-5 text-teal-600" />
                    <h3 className="text-base font-bold text-slate-900">
                      ປະຫວັດການປິ່ນປົວ ({patientVisits.length} ຄັ້ງ)
                    </h3>
                  </div>
                </div>

                {patientVisits.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 border border-dashed border-slate-200 rounded-xl">
                    <Stethoscope className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                    <p className="text-xs">ຍັງບໍ່ມີປະຫວັດການກວດປິ່ນປົວສຳລັບຄົນເຈັບຄົນນີ້</p>
                    <button
                      onClick={() => setIsVisitModalOpen(true)}
                      className="mt-3 text-xs text-teal-600 font-semibold hover:underline"
                    >
                      + ຄລິກເພື່ອບັນທຶກການກວດປິ່ນປົວຄັ້ງທຳອິດ
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {patientVisits.map((visit) => (
                      <div
                        key={visit.id}
                        className="p-4 rounded-xl border border-slate-200 hover:border-teal-200 bg-slate-50/40 hover:bg-teal-50/20 transition-all"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200/80 gap-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-teal-600" />
                            <span className="text-xs font-bold text-slate-800">{visit.visitDate}</span>
                            <span className="text-[11px] text-slate-500">• {visit.doctorName}</span>
                          </div>

                          <div className="flex items-center gap-2">
                            <span className="text-xs font-extrabold text-teal-800">
                              {visit.costTotal.toLocaleString()} ກີບ
                            </span>
                            <button
                              onClick={() => handleViewReceipt(visit)}
                              className="inline-flex items-center gap-1 px-2.5 py-1 bg-white hover:bg-slate-100 text-slate-700 text-xs font-medium rounded-md border border-slate-300 transition-colors"
                            >
                              <FileText className="w-3.5 h-3.5 text-teal-600" />
                              <span>ໃບຮັບເງິນ / ໃບສັ່ງຢາ</span>
                            </button>
                          </div>
                        </div>

                        {/* Vital signs banner */}
                        {visit.vitalSigns && (
                          <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] bg-white p-2.5 rounded-lg border border-slate-200">
                            <div>
                              <span className="text-slate-400">BP:</span>{' '}
                              <span className="font-semibold text-slate-800">{visit.vitalSigns.bloodPressure || '-'} mmHg</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Pulse:</span>{' '}
                              <span className="font-semibold text-slate-800">{visit.vitalSigns.pulseRate || '-'} bpm</span>
                            </div>
                            <div>
                              <span className="text-slate-400">Temp:</span>{' '}
                              <span className="font-semibold text-slate-800">{visit.vitalSigns.temperature || '-'} °C</span>
                            </div>
                            <div>
                              <span className="text-slate-400">SpO2:</span>{' '}
                              <span className="font-semibold text-slate-800">{visit.vitalSigns.spO2 || '-'} %</span>
                            </div>
                          </div>
                        )}

                        {/* Diagnosis & Symptoms */}
                        <div className="mt-3 space-y-1 text-xs">
                          <p>
                            <span className="font-bold text-slate-700">ອາການ:</span> {visit.chiefComplaint}
                          </p>
                          <p>
                            <span className="font-bold text-teal-900">ການວິນິດໄສ:</span>{' '}
                            <span className="font-semibold text-teal-700">{visit.diagnosis}</span>
                          </p>
                          {visit.treatmentPlan && (
                            <p className="text-slate-600">
                              <span className="font-semibold text-slate-700">ແຜນປິ່ນປົວ:</span> {visit.treatmentPlan}
                            </p>
                          )}
                        </div>

                        {/* Prescriptions */}
                        {visit.prescriptions.length > 0 && (
                          <div className="mt-3 pt-2 border-t border-slate-200/60">
                            <span className="text-[11px] font-bold text-slate-600 block mb-1">
                              💊 ຢາທີ່ໄດ້ຮັບ:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {visit.prescriptions.map((rx) => (
                                <span
                                  key={rx.id}
                                  className="inline-flex items-center text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-md"
                                >
                                  {rx.name} ({rx.quantity} {rx.unit})
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {visit.nextAppointmentDate && (
                          <div className="mt-2 text-[11px] text-indigo-700 font-medium">
                            📅 ນັດກວດຄັ້ງຕໍ່ໄປ: {visit.nextAppointmentDate}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <User className="w-12 h-12 mx-auto text-slate-300 mb-2" />
              <p className="text-sm">ກະລຸນາເລືອກຄົນເຈັບຈາກລາຍຊື່ທາງດ້ານຊ້າຍ</p>
            </div>
          )}
        </div>
      </div>

      {/* Patient Create/Edit Modal */}
      <PatientModal
        isOpen={isPatientModalOpen}
        onClose={() => setIsPatientModalOpen(false)}
        onSave={onSavePatient}
        patientToEdit={patientToEdit}
        patientCount={patients.length}
        prefillData={prefillForNew}
      />

      {/* Visit Record Modal */}
      {selectedPatient && (
        <VisitModal
          isOpen={isVisitModalOpen}
          onClose={() => setIsVisitModalOpen(false)}
          patient={selectedPatient}
          onSaveVisit={onSaveVisit}
        />
      )}

      {/* Receipt Modal */}
      <ReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => setIsReceiptModalOpen(false)}
        visit={selectedVisitForReceipt}
        patient={selectedPatient}
      />
    </div>
  );
};
