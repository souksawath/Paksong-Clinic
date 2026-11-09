import React from 'react';
import { MedicalVisit, Patient } from '../types';
import { X, Printer, CheckCircle2, Hospital } from 'lucide-react';

interface ReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  visit: MedicalVisit | null;
  patient: Patient | null;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({
  isOpen,
  onClose,
  visit,
  patient,
}) => {
  if (!isOpen || !visit || !patient) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Actions bar (hidden in print) */}
        <div className="print:hidden flex items-center justify-between px-6 py-3 bg-slate-100 border-b border-slate-200">
          <span className="text-xs font-semibold text-slate-700">ໃບຮັບເງິນ / ໃບສັ່ງຢາຄລີນິກ</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-medium transition-colors shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>ພິມເອກະສານ</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-8 text-slate-800 bg-white" id="printable-receipt">
          {/* Clinic Header */}
          <div className="text-center border-b border-slate-300 pb-4 mb-4">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Hospital className="w-6 h-6 text-teal-700" />
              <h2 className="text-xl font-black text-slate-900 tracking-tight">ClinicCare Lao</h2>
            </div>
            <p className="text-xs font-semibold text-slate-700">ຄລີນິກປິ່ນປົວ ແລະ ດູແລສຸຂະພາບທົ່ວໄປ</p>
            <p className="text-[11px] text-slate-500">ນະຄອນຫຼວງວຽງຈັນ, ສປປ ລາວ | ໂທ: 021 214 555 / 020 5566 7788</p>
          </div>

          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 text-xs font-bold rounded-md uppercase tracking-wider text-slate-800">
              ໃບຮັບເງິນ ແລະ ໃບສັ່ງຢາ (Medical Receipt)
            </span>
          </div>

          {/* Patient Details */}
          <div className="grid grid-cols-2 gap-2 text-xs mb-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
            <div>
              <p className="text-slate-500 text-[10px]">ລະຫັດຄົນເຈັບ (HN):</p>
              <p className="font-bold font-mono text-teal-800">{patient.hn}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px]">ວັນທີ ແລະ ເວລາ:</p>
              <p className="font-medium text-slate-800">{visit.visitDate}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px]">ຊື່ ແລະ ນາມສະກຸນ:</p>
              <p className="font-bold text-slate-900">{patient.firstName} {patient.lastName}</p>
            </div>
            <div>
              <p className="text-slate-500 text-[10px]">ອາຍຸ / ເພດ / ໝວດເລືອດ:</p>
              <p className="font-medium text-slate-800">
                {patient.age} ປີ | {patient.gender === 'male' ? 'ຊາຍ' : patient.gender === 'female' ? 'ຍິງ' : 'ອື່ນໆ'} | {patient.bloodGroup}
              </p>
            </div>
            <div className="col-span-2">
              <p className="text-slate-500 text-[10px]">ບ້ານຢູ່ປັດຈຸບັນ:</p>
              <p className="font-medium text-slate-800">
                {patient.currentAddress.village}, {patient.currentAddress.district}, {patient.currentAddress.province}
              </p>
            </div>
          </div>

          {/* Clinical summary */}
          <div className="text-xs mb-4 space-y-1 border-b border-slate-200 pb-3">
            <p>
              <span className="font-semibold text-slate-700">ມາປິ່ນປົວໃນອາການ:</span> {visit.chiefComplaint}
            </p>
            <p>
              <span className="font-semibold text-slate-700">ການວິນິດໄສ:</span> {visit.diagnosis}
            </p>
            {visit.vitalSigns.bloodPressure && (
              <p className="text-[11px] text-slate-500">
                BP: {visit.vitalSigns.bloodPressure} mmHg | Pulse: {visit.vitalSigns.pulseRate} bpm | T: {visit.vitalSigns.temperature}°C
              </p>
            )}
          </div>

          {/* Prescriptions Table */}
          {visit.prescriptions.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-bold text-slate-800 mb-1">ລາຍການຢາ:</p>
              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-300 text-slate-600 text-[11px]">
                    <th className="text-left py-1">ຊື່ຢາ & ວິທີໃຊ້</th>
                    <th className="text-center py-1">ຈຳນວນ</th>
                    <th className="text-right py-1">ລາຄາ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {visit.prescriptions.map((rx) => (
                    <tr key={rx.id}>
                      <td className="py-1">
                        <span className="font-medium text-slate-900">{rx.name}</span>
                        <span className="block text-[10px] text-slate-500">{rx.dosage}</span>
                      </td>
                      <td className="text-center py-1 font-mono text-[11px]">{rx.quantity} {rx.unit}</td>
                      <td className="text-right py-1 font-mono">{(rx.quantity * rx.price).toLocaleString()} ₭</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Fees Breakdown */}
          <div className="border-t border-slate-300 pt-2 space-y-1 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>ຄ່າກວດ & ປຶກສາ:</span>
              <span>{visit.feeConsultation.toLocaleString()} ກີບ</span>
            </div>
            {visit.feeMedication > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>ຄ່າຍາ:</span>
                <span>{visit.feeMedication.toLocaleString()} ກີບ</span>
              </div>
            )}
            {visit.feeProcedures > 0 && (
              <div className="flex justify-between text-slate-600">
                <span>ຄ່າຫັດຖະການ:</span>
                <span>{visit.feeProcedures.toLocaleString()} ກີບ</span>
              </div>
            )}
            <div className="flex justify-between text-base font-extrabold text-teal-800 border-t border-slate-300 pt-2">
              <span>ລວມທັງໝົດ:</span>
              <span>{visit.costTotal.toLocaleString()} ກີບ</span>
            </div>
          </div>

          {/* Payment Status & Doctor Signature */}
          <div className="mt-6 pt-4 border-t border-dashed border-slate-300 flex items-end justify-between text-xs">
            <div>
              <div className="flex items-center gap-1 text-emerald-700 font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>ຊຳລະເງິນແລ້ວ</span>
              </div>
              <p className="text-[10px] text-slate-500">
                ວິທີ: {visit.paymentMethod === 'bcel_one' ? 'BCEL One QR' : visit.paymentMethod === 'cash' ? 'ເງິນສົດ' : 'ໂອນທະນາຄານ'}
              </p>
            </div>

            <div className="text-center">
              <div className="w-28 border-b border-slate-400 mb-1"></div>
              <p className="text-[10px] text-slate-600 font-medium">{visit.doctorName}</p>
              <p className="text-[9px] text-slate-400">ທ່ານໝໍຜູ້ກວດປິ່ນປົວ</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
