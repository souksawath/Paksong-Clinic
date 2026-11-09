import React, { useState } from 'react';
import { Appointment, Patient } from '../types';
import {
  CalendarDays,
  Plus,
  Clock,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Calendar,
  X,
  Save,
  Search
} from 'lucide-react';

interface AppointmentManagementProps {
  appointments: Appointment[];
  patients: Patient[];
  onSaveAppointment: (apt: Appointment) => void;
  onUpdateStatus: (aptId: string, status: Appointment['status']) => void;
  patientPreselect?: Patient | null;
}

export const AppointmentManagement: React.FC<AppointmentManagementProps> = ({
  appointments,
  patients,
  onSaveAppointment,
  onUpdateStatus,
  patientPreselect,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPatientId, setSelectedPatientId] = useState(patientPreselect?.id || '');
  const [date, setDate] = useState(
    new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
  );
  const [time, setTime] = useState('09:00');
  const [reason, setReason] = useState('');
  const [doctorName, setDoctorName] = useState('ດຣ. ບຸນທະວີ ໄຊຍະວົງ');
  const [notes, setNotes] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'scheduled' | 'completed' | 'cancelled'>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const handleOpenModal = (pre?: Patient) => {
    if (pre) {
      setSelectedPatientId(pre.id);
    } else if (patients.length > 0 && !selectedPatientId) {
      setSelectedPatientId(patients[0].id);
    }
    setReason('');
    setNotes('');
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const patient = patients.find((p) => p.id === selectedPatientId);
    if (!patient) {
      alert('ກະລຸນາເລືອກຄົນເຈັບ');
      return;
    }
    if (!reason.trim()) {
      alert('ກະລຸນາລະບຸເຫດຜົນການນັດໝາຍ');
      return;
    }

    const newApt: Appointment = {
      id: `apt-${Date.now()}`,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      patientPhone: patient.phone,
      appointmentDate: date,
      appointmentTime: time,
      reason: reason.trim(),
      doctorName,
      status: 'scheduled',
      notes: notes.trim(),
      createdAt: new Date().toISOString(),
    };

    onSaveAppointment(newApt);
    setIsModalOpen(false);
  };

  const filtered = appointments.filter((apt) => {
    if (statusFilter !== 'all' && apt.status !== statusFilter) return false;
    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      return (
        apt.patientName.toLowerCase().includes(q) ||
        apt.patientPhone.includes(q) ||
        apt.reason.toLowerCase().includes(q)
      );
    }
    return true;
  }).sort((a, b) => new Date(`${a.appointmentDate} ${a.appointmentTime}`).getTime() - new Date(`${b.appointmentDate} ${b.appointmentTime}`).getTime());

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-indigo-800 to-indigo-600 rounded-2xl p-6 text-white shadow-lg shadow-indigo-900/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-indigo-100 text-xs font-medium mb-2 border border-white/15">
              <span>ຕາຕະລາງນັດໝາຍຄລີນິກ</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight">ການນັດໝາຍ ແລະ ຕິດຕາມອາການຄົນເຈັບ</h1>
            <p className="text-sm text-indigo-100 max-w-2xl mt-1">
              ຈັດການຕາຕະລາງພົບແພດ, ນັດຕິດຕາມຜົນການກວດ, ວັດຄວາມດັນ ແລະ ກວດນ້ຳຕານຊ້ຳ
            </p>
          </div>

          <button
            onClick={() => handleOpenModal()}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-indigo-900 rounded-xl font-bold text-sm shadow-md hover:bg-indigo-50 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 text-indigo-600" />
            <span>+ ສ້າງນັດໝາຍໃໝ່</span>
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6 pt-5 border-t border-white/20">
          <div>
            <span className="text-xs text-indigo-200">ນັດໝາຍທັງໝົດ</span>
            <p className="text-2xl font-bold font-mono">{appointments.length} ລາຍການ</p>
          </div>
          <div>
            <span className="text-xs text-indigo-200">ລໍຖ້າພົບແພດ</span>
            <p className="text-2xl font-bold font-mono">
              {appointments.filter((a) => a.status === 'scheduled').length}
            </p>
          </div>
          <div>
            <span className="text-xs text-indigo-200">ສຳເລັດແລ້ວ</span>
            <p className="text-2xl font-bold font-mono text-emerald-300">
              {appointments.filter((a) => a.status === 'completed').length}
            </p>
          </div>
          <div>
            <span className="text-xs text-indigo-200">ຍົກເລີກ / ບໍ່ມາ</span>
            <p className="text-2xl font-bold font-mono text-slate-300">
              {appointments.filter((a) => a.status === 'cancelled' || a.status === 'no_show').length}
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="ຄົ້ນຫານັດໝາຍ: ຊື່ຄົນເຈັບ, ເບີໂທ, ເຫດຜົນ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-xs rounded-xl border border-slate-300 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              statusFilter === 'all' ? 'bg-white text-indigo-900 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            ທັງໝົດ
          </button>
          <button
            onClick={() => setStatusFilter('scheduled')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              statusFilter === 'scheduled' ? 'bg-white text-indigo-900 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            ລໍຖ້າພົບແພດ
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              statusFilter === 'completed' ? 'bg-white text-emerald-700 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            ສຳເລັດ
          </button>
          <button
            onClick={() => setStatusFilter('cancelled')}
            className={`px-3 py-1 rounded-lg transition-colors ${
              statusFilter === 'cancelled' ? 'bg-white text-rose-700 font-bold shadow-xs' : 'text-slate-600'
            }`}
          >
            ຍົກເລີກ
          </button>
        </div>
      </div>

      {/* Appointments List Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-full py-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">
            <CalendarDays className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-xs">ບໍ່ມີຂໍ້ມູນນັດໝາຍໃນຊ່ວງນີ້</p>
          </div>
        ) : (
          filtered.map((apt) => {
            const isCompleted = apt.status === 'completed';
            const isCancelled = apt.status === 'cancelled';

            return (
              <div
                key={apt.id}
                className={`p-5 rounded-2xl border transition-all ${
                  isCompleted
                    ? 'bg-slate-50 border-slate-200 opacity-80'
                    : isCancelled
                    ? 'bg-rose-50/40 border-rose-200 opacity-60'
                    : 'bg-white border-slate-200 hover:border-indigo-300 shadow-xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{apt.appointmentDate}</div>
                      <div className="text-xs text-indigo-700 font-semibold">{apt.appointmentTime} ໂມງ</div>
                    </div>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isCancelled
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {isCompleted ? 'ສຳເລັດ' : isCancelled ? 'ຍົກເລີກ' : 'ລໍຖ້າພົບແພດ'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-900">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    <span>{apt.patientName}</span>
                  </div>

                  {apt.patientPhone && (
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      <a href={`tel:${apt.patientPhone}`} className="hover:text-indigo-600 hover:underline">
                        {apt.patientPhone}
                      </a>
                    </div>
                  )}

                  <div className="p-2.5 bg-slate-50 rounded-lg text-slate-700 text-xs mt-2 border border-slate-100">
                    <span className="font-semibold text-slate-900 block mb-0.5">ເຫດຜົນການນັດ:</span>
                    <span>{apt.reason}</span>
                  </div>

                  <div className="text-[11px] text-slate-500 pt-1">
                    ແພດຮັບຜິດຊອບ: <span className="font-medium text-slate-700">{apt.doctorName}</span>
                  </div>
                </div>

                {/* Actions */}
                {!isCompleted && !isCancelled && (
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                    <button
                      onClick={() => onUpdateStatus(apt.id, 'cancelled')}
                      className="px-2.5 py-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-[11px] font-medium rounded-md transition-colors"
                    >
                      ຍົກເລີກ
                    </button>
                    <button
                      onClick={() => onUpdateStatus(apt.id, 'completed')}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs"
                    >
                      <CheckCircle className="w-3 h-3" />
                      <span>ມາພົບແລ້ວ</span>
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Appointment Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="relative w-full max-w-md my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 bg-indigo-700 text-white">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <h3 className="text-base font-bold">ສ້າງນັດໝາຍໃໝ່ (New Appointment)</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-white/80 hover:text-white rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ເລືອກຄົນເຈັບ <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={selectedPatientId}
                  onChange={(e) => setSelectedPatientId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs bg-white"
                >
                  <option value="">-- ເລືອກຄົນເຈັບ --</option>
                  {patients.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.hn} - {p.firstName} {p.lastName} ({p.phone || 'ບໍ່ມີເບີ'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ວັນທີນັດ</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ເວລາ</label>
                  <input
                    type="time"
                    required
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ເຫດຜົນການນັດ / ອາການຕິດຕາມ <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={2}
                  placeholder="ຕົວຢ່າງ: ຕິດຕາມຄວາມດັນ, ກວດເລືອດຊ້ຳ, ຟັງຜົນແລັບ..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ທ່ານໝໍຜູ້ກວດ</label>
                <input
                  type="text"
                  value={doctorName}
                  onChange={(e) => setDoctorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ໝາຍເຫດເພີ່ມເຕີມ</label>
                <input
                  type="text"
                  placeholder="ເຊັ່ນ: ງົດນ້ຳ-ອາຫານກ່ອນມາກວດ..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 text-xs font-medium"
                >
                  ຍົກເລີກ
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold shadow-xs"
                >
                  ບັນທຶກນັດໝາຍ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
