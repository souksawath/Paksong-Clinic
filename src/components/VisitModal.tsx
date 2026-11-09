import React, { useState, useEffect } from 'react';
import { Patient, MedicalVisit, PrescriptionItem, Transaction } from '../types';
import { X, Stethoscope, Plus, Trash2, DollarSign, Calendar, Save, Check } from 'lucide-react';

interface VisitModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: Patient;
  onSaveVisit: (visit: MedicalVisit, autoIncomeTransaction?: Transaction) => void;
}

export const VisitModal: React.FC<VisitModalProps> = ({
  isOpen,
  onClose,
  patient,
  onSaveVisit,
}) => {
  const [chiefComplaint, setChiefComplaint] = useState(patient.initialSymptoms || '');
  const [bp, setBp] = useState('120/80');
  const [pulse, setPulse] = useState(78);
  const [temp, setTemp] = useState(36.8);
  const [weight, setWeight] = useState(65);
  const [spO2, setSpO2] = useState(98);
  const [height, setHeight] = useState(165);

  const [physicalExam, setPhysicalExam] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [treatmentPlan, setTreatmentPlan] = useState('');
  const [doctorName, setDoctorName] = useState('ດຣ. ບຸນທະວີ ໄຊຍະວົງ');
  const [nextAppointmentDate, setNextAppointmentDate] = useState('');

  // Prescriptions list
  const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([
    { id: '1', name: 'Paracetamol 500mg', dosage: '1 ເມັດ ເວລາໄຂ້ ທຸກ 4-6 ຊມ', quantity: 10, unit: 'ເມັດ', price: 1000 },
  ]);

  // Billing
  const [feeConsultation, setFeeConsultation] = useState(50000);
  const [feeProcedures, setFeeProcedures] = useState(0);
  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'bcel_one' | 'transfer'>('bcel_one');
  const [autoRecordIncome, setAutoRecordIncome] = useState(true);

  // Compute medication total
  const feeMedication = prescriptions.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalCost = feeConsultation + feeProcedures + feeMedication;

  // Add prescription line
  const handleAddPrescription = () => {
    setPrescriptions([
      ...prescriptions,
      {
        id: String(Date.now()),
        name: '',
        dosage: '1 ເມັດ ຫຼັງອາຫານ 3 ເວລາ',
        quantity: 1,
        unit: 'ເມັດ',
        price: 2000,
      },
    ]);
  };

  const handleRemovePrescription = (id: string) => {
    setPrescriptions(prescriptions.filter((p) => p.id !== id));
  };

  const handleUpdatePrescription = (id: string, field: keyof PrescriptionItem, val: any) => {
    setPrescriptions(
      prescriptions.map((p) => (p.id === id ? { ...p, [field]: val } : p))
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chiefComplaint.trim()) {
      alert('ກະລຸນາລະບຸອາການຫຼັກຂອງຄົນເຈັບ');
      return;
    }

    const visitId = `v-${Date.now()}`;
    const visitDateStr = new Date().toISOString().replace('T', ' ').substring(0, 16);

    const newVisit: MedicalVisit = {
      id: visitId,
      patientId: patient.id,
      patientName: `${patient.firstName} ${patient.lastName}`,
      visitDate: visitDateStr,
      chiefComplaint: chiefComplaint.trim(),
      vitalSigns: {
        bloodPressure: bp,
        pulseRate: Number(pulse),
        temperature: Number(temp),
        weight: Number(weight),
        spO2: Number(spO2),
        height: Number(height),
      },
      physicalExamNotes: physicalExam.trim(),
      diagnosis: diagnosis.trim() || 'ກວດກາ ແລະ ປຶກສາອາການທົ່ວໄປ',
      treatmentPlan: treatmentPlan.trim(),
      prescriptions: prescriptions.filter((p) => p.name.trim().length > 0),
      doctorName,
      costTotal: totalCost,
      feeConsultation,
      feeMedication,
      feeProcedures,
      paymentStatus: 'paid',
      paymentMethod,
      nextAppointmentDate: nextAppointmentDate || undefined,
      status: 'completed',
      createdAt: new Date().toISOString(),
    };

    let autoTx: Transaction | undefined = undefined;
    if (autoRecordIncome && totalCost > 0) {
      const paymentLabels: Record<string, string> = {
        bcel_one: 'BCEL One QR',
        cash: 'ເງິນສົດ (Cash)',
        transfer: 'ໂອນຜ່ານທະນາຄານ',
      };

      autoTx = {
        id: `tx-auto-${Date.now()}`,
        type: 'income',
        category: 'medical_service',
        categoryLabel: 'ຄ່າກວດປິ່ນປົວ ແລະ ຄ່າຍາ',
        title: `ຄ່າປິ່ນປົວ: ${patient.firstName} ${patient.lastName} (${patient.hn})`,
        amount: totalCost,
        currency: 'LAK',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().slice(0, 5),
        paymentMethod,
        paymentMethodLabel: paymentLabels[paymentMethod] || 'BCEL One QR',
        patientId: patient.id,
        patientName: `${patient.firstName} ${patient.lastName}`,
        visitId: visitId,
        receiptNumber: `REC-${Date.now().toString().slice(-6)}`,
        notes: `ວິນິດໄສ: ${diagnosis || 'ປິ່ນປົວທົ່ວໄປ'}`,
        createdAt: new Date().toISOString(),
      };
    }

    onSaveVisit(newVisit, autoTx);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-teal-700 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              <Stethoscope className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-bold">ບັນທຶກການກວດປິ່ນປົວ (Consultation & Treatment)</h3>
              <p className="text-xs text-teal-100">
                ຄົນເຈັບ: <span className="font-semibold text-white">{patient.firstName} {patient.lastName}</span> ({patient.hn})
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto text-sm">
          {/* Chief Complaint */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ມາປິ່ນປົວໃນອາການ (Chief Complaint) <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={2}
              value={chiefComplaint}
              onChange={(e) => setChiefComplaint(e.target.value)}
              placeholder="ລະບຸອາການທີ່ຄົນເຈັບບອກ..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Vital Signs (ສັນຍານຊີບ) */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              🩺 ສັນຍານຊີບ (Vital Signs)
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">BP (mmHg)</label>
                <input
                  type="text"
                  placeholder="120/80"
                  value={bp}
                  onChange={(e) => setBp(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs bg-white text-center font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Pulse (bpm)</label>
                <input
                  type="number"
                  value={pulse}
                  onChange={(e) => setPulse(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs bg-white text-center font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Temp (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={temp}
                  onChange={(e) => setTemp(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs bg-white text-center font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">SpO2 (%)</label>
                <input
                  type="number"
                  value={spO2}
                  onChange={(e) => setSpO2(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs bg-white text-center font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">ນ້ຳໜັກ (kg)</label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs bg-white text-center font-mono font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">ລວງສູງ (cm)</label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                  className="w-full px-2.5 py-1.5 rounded-md border border-slate-300 text-xs bg-white text-center font-mono font-medium"
                />
              </div>
            </div>
          </div>

          {/* Physical Examination & Diagnosis */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ຜົນການກວດຮ່າງກາຍ (Physical Examination)
              </label>
              <textarea
                rows={2}
                value={physicalExam}
                onChange={(e) => setPhysicalExam(e.target.value)}
                placeholder="ສຽງປອດ, ຫົວໃຈ, ຄໍ, ທ້ອງ..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ການວິນິດໄສໂລກ (Diagnosis) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={2}
                value={diagnosis}
                onChange={(e) => setDiagnosis(e.target.value)}
                placeholder="ຕົວຢ່າງ: ໄຂ້ຫວັດໃຫຍ່, ພະຍາດກະເພາະອາຫານ..."
                className="w-full px-3 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Treatment plan */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ແຜນການປິ່ນປົວ & ຄຳແນະນຳ (Treatment & Advice)
            </label>
            <input
              type="text"
              value={treatmentPlan}
              onChange={(e) => setTreatmentPlan(e.target.value)}
              placeholder="ຕົວຢ່າງ: ດື່ມນ້ຳອຸ່ນ, ພັກຜ່ອນຫຼາຍໆ, ຫຼີກລ່ຽງອາຫານເຜັດ..."
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
            />
          </div>

          {/* Medication & Prescriptions (ໃບສັ່ງຢາ) */}
          <div className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200/80">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
                💊 ລາຍການຢາທີ່ຈ່າຍ (Prescriptions)
              </span>
              <button
                type="button"
                onClick={handleAddPrescription}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-md text-xs font-medium transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>ເພີ່ມຢາ</span>
              </button>
            </div>

            <div className="space-y-2">
              {prescriptions.map((item, idx) => (
                <div key={item.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <div className="flex-1 min-w-[140px]">
                    <input
                      type="text"
                      placeholder="ຊື່ຢາ (e.g. Paracetamol)"
                      value={item.name}
                      onChange={(e) => handleUpdatePrescription(item.id, 'name', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="flex-1 min-w-[150px]">
                    <input
                      type="text"
                      placeholder="ວິທີກິນ (e.g. 1 ເມັດ ຫຼັງອາຫານ 3 ເວລາ)"
                      value={item.dosage}
                      onChange={(e) => handleUpdatePrescription(item.id, 'dosage', e.target.value)}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md"
                    />
                  </div>
                  <div className="w-16">
                    <input
                      type="number"
                      min="1"
                      placeholder="ຈຳນວນ"
                      value={item.quantity}
                      onChange={(e) => handleUpdatePrescription(item.id, 'quantity', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md text-center"
                    />
                  </div>
                  <div className="w-24">
                    <input
                      type="number"
                      step="500"
                      placeholder="ລາຄາ/ໜ່ວຍ"
                      value={item.price}
                      onChange={(e) => handleUpdatePrescription(item.id, 'price', Number(e.target.value))}
                      className="w-full px-2 py-1 text-xs border border-slate-300 rounded-md text-right"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemovePrescription(item.id)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="mt-2 text-right text-xs text-slate-600">
              ຄ່າຍາລວມ: <span className="font-bold text-slate-900">{feeMedication.toLocaleString()} ກີບ</span>
            </div>
          </div>

          {/* Billing & Fees */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3">
              💰 ຄ່າບໍລິການ ແລະ ການຊຳລະເງິນ (Billing)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">ຄ່າກວດ/ປຶກສາ (LAK)</label>
                <input
                  type="number"
                  step="5000"
                  value={feeConsultation}
                  onChange={(e) => setFeeConsultation(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">ຄ່າຫັດຖະການ/ແລັບ (LAK)</label>
                <input
                  type="number"
                  step="5000"
                  value={feeProcedures}
                  onChange={(e) => setFeeProcedures(Number(e.target.value))}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-xs font-semibold"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">ວິທີຊຳລະ</label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as any)}
                  className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-xs font-medium bg-white"
                >
                  <option value="bcel_one">BCEL One QR</option>
                  <option value="cash">ເງິນສົດ (Cash)</option>
                  <option value="transfer">ໂອນຜ່ານທະນາຄານ</option>
                </select>
              </div>
            </div>

            {/* Total Cost Display */}
            <div className="flex items-center justify-between p-3 bg-teal-50 rounded-lg border border-teal-200">
              <span className="text-xs font-medium text-teal-900">ຍອດເງິນລວມທັງໝົດທີ່ຕ້ອງຊຳລະ:</span>
              <span className="text-lg font-extrabold text-teal-800">
                {totalCost.toLocaleString()} ກີບ
              </span>
            </div>

            {/* Auto record income into Part 2 */}
            <div className="mt-3 flex items-center gap-2">
              <input
                type="checkbox"
                id="autoIncome"
                checked={autoRecordIncome}
                onChange={(e) => setAutoRecordIncome(e.target.checked)}
                className="w-4 h-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <label htmlFor="autoIncome" className="text-xs font-medium text-slate-700 cursor-pointer">
                ບັນທຶກລາຍຮັບນີ້ເຂົ້າໃນ <span className="font-bold text-emerald-700">ພາກສ່ວນທີ 2: ລາຍຮັບ-ລາຍຈ່າຍ</span> ໂດຍອັດຕະໂນມັດ
              </label>
            </div>
          </div>

          {/* Doctor & Follow up */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ທ່ານໝໍຜູ້ກວດ</label>
              <input
                type="text"
                value={doctorName}
                onChange={(e) => setDoctorName(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ວັນນັດໝາຍຄັ້ງຕໍ່ໄປ (ຖ້າມີ)
              </label>
              <input
                type="date"
                value={nextAppointmentDate}
                onChange={(e) => setNextAppointmentDate(e.target.value)}
                className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs"
              />
            </div>
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold shadow-md shadow-teal-600/20 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>ບັນທຶກການປິ່ນປົວ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
