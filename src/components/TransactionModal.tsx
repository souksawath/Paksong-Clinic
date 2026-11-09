import React, { useState, useEffect } from 'react';
import { Transaction, TransactionType, Patient } from '../types';
import { X, DollarSign, PlusCircle, MinusCircle, Calendar, CreditCard, User, FileText, Save } from 'lucide-react';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tx: Transaction) => void;
  transactionToEdit?: Transaction | null;
  patients: Patient[];
}

const INCOME_CATEGORIES = [
  { value: 'medical_service', label: 'ຄ່າກວດປິ່ນປົວ ແລະ ຄ່າຍາ' },
  { value: 'pharmacy', label: 'ຂາຍຢາ ແລະ ເວຊະພັນທົ່ວໄປ' },
  { value: 'lab_procedure', label: 'ຄ່າກວດແລັບ / ຫັດຖະການ' },
  { value: 'certificate', label: 'ຄ່າອອກໃບຢັ້ງຢືນແພດ' },
  { value: 'other_income', label: 'ລາຍຮັບອື່ນໆ' },
];

const EXPENSE_CATEGORIES = [
  { value: 'medical_supplies', label: 'ຊື້ຢາ ແລະ ເວຊະພັນເຂົ້າຄລີນິກ' },
  { value: 'staff_salary', label: 'ເງິນເດືອນພະນັກງານ / ຄ່າຈ້າງ' },
  { value: 'clinic_rent', label: 'ຄ່າເຊົ່າສະຖານທີ່ຄລີນິກ' },
  { value: 'utilities', label: 'ຄ່າໄຟຟ້າ, ນ້ຳ, ອິນເຕີເນັດ' },
  { value: 'equipment', label: 'ຊື້-ສ້ອມແປງອຸປະກອນການແພດ' },
  { value: 'office_supplies', label: 'ເຄື່ອງໃຊ້ຫ້ອງການ ແລະ ເອກະສານ' },
  { value: 'marketing', label: 'ການຕະຫຼາດ ແລະ ໂຄສະນາ' },
  { value: 'other_expense', label: 'ລາຍຈ່າຍອື່ນໆ' },
];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  transactionToEdit,
  patients,
}) => {
  const [type, setType] = useState<TransactionType>('income');
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState<number | string>(150000);
  const [category, setCategory] = useState('medical_service');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [time, setTime] = useState(new Date().toTimeString().slice(0, 5));
  const [paymentMethod, setPaymentMethod] = useState<'bcel_one' | 'cash' | 'transfer' | 'card'>('bcel_one');
  const [selectedPatientId, setSelectedPatientId] = useState('');
  const [receiptNumber, setReceiptNumber] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (transactionToEdit) {
      setType(transactionToEdit.type);
      setTitle(transactionToEdit.title);
      setAmount(transactionToEdit.amount);
      setCategory(transactionToEdit.category);
      setDate(transactionToEdit.date);
      setTime(transactionToEdit.time || '10:00');
      setPaymentMethod(transactionToEdit.paymentMethod);
      setSelectedPatientId(transactionToEdit.patientId || '');
      setReceiptNumber(transactionToEdit.receiptNumber || '');
      setNotes(transactionToEdit.notes || '');
    } else {
      setType('income');
      setTitle('');
      setAmount(100000);
      setCategory('medical_service');
      setDate(new Date().toISOString().split('T')[0]);
      setTime(new Date().toTimeString().slice(0, 5));
      setPaymentMethod('bcel_one');
      setSelectedPatientId('');
      setReceiptNumber(`REC-${Date.now().toString().slice(-6)}`);
      setNotes('');
    }
  }, [transactionToEdit, isOpen]);

  // When changing type, set appropriate default category
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'income') {
      setCategory(INCOME_CATEGORIES[0].value);
    } else {
      setCategory(EXPENSE_CATEGORIES[0].value);
    }
  };

  const handlePatientSelect = (pId: string) => {
    setSelectedPatientId(pId);
    if (pId) {
      const p = patients.find((pt) => pt.id === pId);
      if (p && !title) {
        setTitle(`ຄ່າປິ່ນປົວ: ${p.firstName} ${p.lastName} (${p.hn})`);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert('ກະລຸນາປ້ອນຫົວຂໍ້ລາຍການ');
      return;
    }
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      alert('ກະລຸນາປ້ອນຈຳນວນເງິນທີ່ຖືກຕ້ອງ');
      return;
    }

    const currentCatObj =
      type === 'income'
        ? INCOME_CATEGORIES.find((c) => c.value === category)
        : EXPENSE_CATEGORIES.find((c) => c.value === category);

    const paymentLabels: Record<string, string> = {
      bcel_one: 'BCEL One QR',
      cash: 'ເງິນສົດ (Cash)',
      transfer: 'ໂອນຜ່ານທະນາຄານ',
      card: 'ບັດເຄຣດິດ',
    };

    const linkedPatient = patients.find((p) => p.id === selectedPatientId);

    const newTx: Transaction = {
      id: transactionToEdit ? transactionToEdit.id : `tx-${Date.now()}`,
      type,
      category: category as any,
      categoryLabel: currentCatObj?.label || category,
      title: title.trim(),
      amount: numAmount,
      currency: 'LAK',
      date,
      time,
      paymentMethod,
      paymentMethodLabel: paymentLabels[paymentMethod] || 'BCEL One QR',
      patientId: selectedPatientId || undefined,
      patientName: linkedPatient ? `${linkedPatient.firstName} ${linkedPatient.lastName}` : undefined,
      receiptNumber: receiptNumber.trim() || undefined,
      notes: notes.trim(),
      createdAt: transactionToEdit ? transactionToEdit.createdAt : new Date().toISOString(),
    };

    onSave(newTx);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div
          className={`flex items-center justify-between px-6 py-4 text-white transition-colors ${
            type === 'income' ? 'bg-emerald-700' : 'bg-rose-700'
          }`}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
              {type === 'income' ? <PlusCircle className="w-6 h-6" /> : <MinusCircle className="w-6 h-6" />}
            </div>
            <div>
              <h3 className="text-lg font-bold">
                {transactionToEdit
                  ? 'ແກ້ໄຂລາຍການ'
                  : type === 'income'
                  ? 'ບັນທຶກລາຍຮັບໃໝ່ (New Income)'
                  : 'ບັນທຶກລາຍຈ່າຍໃໝ່ (New Expense)'}
              </h3>
              <p className="text-xs text-white/80">
                {type === 'income' ? 'ຮັບເງິນຈາກການປິ່ນປົວ ຫຼື ບໍລິການ' : 'ຈ່າຍຄ່າໃຊ້ຈ່າຍ ແລະ ຕົ້ນທຶນຄລີນິກ'}
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-sm">
          {/* Type Selector Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                type === 'income'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ ລາຍຮັບ (Income)</span>
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 ${
                type === 'expense'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <MinusCircle className="w-4 h-4" />
              <span>- ລາຍຈ່າຍ (Expense)</span>
            </button>
          </div>

          {/* Amount (ຈຳນວນເງິນ) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ຈຳນວນເງິນ (ກີບ LAK) <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="1000"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0"
                className="w-full pl-4 pr-16 py-2.5 text-lg font-bold font-mono rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                LAK ₭
              </span>
            </div>

            {/* Quick amount chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {[50000, 100000, 200000, 500000, 1000000].map((val) => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmount(val)}
                  className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                >
                  +{val.toLocaleString()} ₭
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ຫົວຂໍ້ລາຍການ (Title) <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder={type === 'income' ? 'ຕົວຢ່າງ: ຄ່າປິ່ນປົວ, ຂາຍຢາ...' : 'ຕົວຢ່າງ: ຊື້ຢາເຂົ້າຄລີນິກ, ຈ່າຍຄ່າໄຟ...'}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ໝວດໝູ່ (Category)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              {(type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES).map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ວັນທີ</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ເວລາ</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ວິທີຊຳລະເງິນ</label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value as any)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="bcel_one">BCEL One QR (ສະແກນ QR ໂອນ)</option>
              <option value="cash">ເງິນສົດ (Cash)</option>
              <option value="transfer">ໂອນຜ່ານທະນາຄານ (Bank Transfer)</option>
              <option value="card">ບັດເຄຣດິດ / ເດບິດ</option>
            </select>
          </div>

          {/* Link to patient (optional) */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ເຊື່ອມໂຍງກັບຄົນເຈັບ (ຖ້າມີ)
            </label>
            <select
              value={selectedPatientId}
              onChange={(e) => handlePatientSelect(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-xs bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            >
              <option value="">-- ບໍ່ໄດ້ເຊື່ອມໂຍງກັບຄົນເຈັບ --</option>
              {patients.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.hn} - {p.firstName} {p.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Receipt number & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ເລກທີໃບບິນ / ເອກະສານ</label>
              <input
                type="text"
                value={receiptNumber}
                onChange={(e) => setReceiptNumber(e.target.value)}
                placeholder="REC-XXXXX"
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">ໝາຍເຫດ</label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="ລາຍລະອຽດເພີ່ມເຕີມ..."
                className="w-full px-3 py-1.5 rounded-lg border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {/* Actions */}
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
              className={`inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-white text-xs font-bold shadow-md transition-colors ${
                type === 'income'
                  ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20'
                  : 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/20'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>ບັນທຶກລາຍການ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
