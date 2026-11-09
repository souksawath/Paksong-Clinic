import React, { useState, useEffect } from 'react';
import { Patient } from '../types';
import { X, User, MapPin, HeartPulse, Phone, AlertTriangle, Save, Calendar } from 'lucide-react';

interface PatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (patient: Patient) => void;
  patientToEdit?: Patient | null;
  patientCount: number;
  prefillData?: { name?: string; phone?: string };
}

const LAO_PROVINCES = [
  'ນະຄອນຫຼວງວຽງຈັນ',
  'ຫຼວງພະບາງ',
  'ຈຳປາສັກ',
  'ສະຫວັນນະເຂດ',
  'ຊຽງຂວາງ',
  'ວຽງຈັນ',
  'ຄຳມ່ວນ',
  'ບໍລິຄຳໄຊ',
  'ສາລະວັນ',
  'ເຊກອງ',
  'ອັດຕະປື',
  'ບໍ່ແກ້ວ',
  'ຫຼວງນ້ຳທາ',
  'ອຸດົມໄຊ',
  'ຜົ້ງສາລີ',
  'ຫົວພັນ',
  'ໄຊຍະບູລີ',
  'ໄຊສົມບູນ',
];

export const PatientModal: React.FC<PatientModalProps> = ({
  isOpen,
  onClose,
  onSave,
  patientToEdit,
  patientCount,
  prefillData,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthDate, setBirthDate] = useState('1990-01-01');
  const [age, setAge] = useState(36);
  const [phone, setPhone] = useState('');
  
  // Hometown (ບ້ານເກີດ)
  const [homeVillage, setHomeVillage] = useState('');
  const [homeDistrict, setHomeDistrict] = useState('');
  const [homeProvince, setHomeProvince] = useState('ນະຄອນຫຼວງວຽງຈັນ');
  
  // Current address (ບ້ານຢູ່ປັດຈຸບັນ)
  const [currVillage, setCurrVillage] = useState('');
  const [currDistrict, setCurrDistrict] = useState('');
  const [currProvince, setCurrProvince] = useState('ນະຄອນຫຼວງວຽງຈັນ');
  const [sameAsHometown, setSameAsHometown] = useState(false);

  // Medical info
  const [bloodGroup, setBloodGroup] = useState<'A' | 'B' | 'AB' | 'O' | 'Unknown'>('O');
  const [drugAllergies, setDrugAllergies] = useState('');
  const [underlyingDiseases, setUnderlyingDiseases] = useState('');
  const [initialSymptoms, setInitialSymptoms] = useState('');
  
  // Emergency contact
  const [emerName, setEmerName] = useState('');
  const [emerRelation, setEmerRelation] = useState('');
  const [emerPhone, setEmerPhone] = useState('');

  const [notes, setNotes] = useState('');

  // Calculate age when birthDate changes
  useEffect(() => {
    if (birthDate) {
      const birth = new Date(birthDate);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birth.getFullYear();
      const m = today.getMonth() - birth.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge >= 0) {
        setAge(calculatedAge);
      }
    }
  }, [birthDate]);

  // Load existing patient data if editing
  useEffect(() => {
    if (patientToEdit) {
      setFirstName(patientToEdit.firstName);
      setLastName(patientToEdit.lastName);
      setGender(patientToEdit.gender);
      setBirthDate(patientToEdit.birthDate);
      setAge(patientToEdit.age);
      setPhone(patientToEdit.phone);
      setHomeVillage(patientToEdit.hometown.village);
      setHomeDistrict(patientToEdit.hometown.district);
      setHomeProvince(patientToEdit.hometown.province);
      setCurrVillage(patientToEdit.currentAddress.village);
      setCurrDistrict(patientToEdit.currentAddress.district);
      setCurrProvince(patientToEdit.currentAddress.province);
      setBloodGroup(patientToEdit.bloodGroup);
      setDrugAllergies(patientToEdit.drugAllergies || '');
      setUnderlyingDiseases(patientToEdit.underlyingDiseases || '');
      setInitialSymptoms(patientToEdit.initialSymptoms || '');
      setEmerName(patientToEdit.emergencyContact.name);
      setEmerRelation(patientToEdit.emergencyContact.relation);
      setEmerPhone(patientToEdit.emergencyContact.phone);
      setNotes(patientToEdit.notes || '');
    } else {
      // Reset form
      let defaultFirst = '';
      let defaultLast = '';
      if (prefillData?.name) {
        const parts = prefillData.name.trim().split(/\s+/);
        defaultFirst = parts[0] || '';
        defaultLast = parts.slice(1).join(' ') || '';
      }
      setFirstName(defaultFirst);
      setLastName(defaultLast);
      setGender('male');
      setBirthDate('1995-01-01');
      setPhone(prefillData?.phone || '');
      setHomeVillage('');
      setHomeDistrict('');
      setHomeProvince('ນະຄອນຫຼວງວຽງຈັນ');
      setCurrVillage('');
      setCurrDistrict('');
      setCurrProvince('ນະຄອນຫຼວງວຽງຈັນ');
      setBloodGroup('O');
      setDrugAllergies('');
      setUnderlyingDiseases('');
      setInitialSymptoms('');
      setEmerName('');
      setEmerRelation('');
      setEmerPhone('');
      setNotes('');
      setSameAsHometown(false);
    }
  }, [patientToEdit, isOpen, prefillData]);

  const handleCopyHometown = (checked: boolean) => {
    setSameAsHometown(checked);
    if (checked) {
      setCurrVillage(homeVillage);
      setCurrDistrict(homeDistrict);
      setCurrProvince(homeProvince);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      alert('ກະລຸນາປ້ອນ ຊື່ ແລະ ນາມສະກຸນ ຂອງຄົນເຈັບ');
      return;
    }

    const nextHn = patientToEdit
      ? patientToEdit.hn
      : `HN-2026-${String(patientCount + 1).padStart(3, '0')}`;

    const newPatient: Patient = {
      id: patientToEdit ? patientToEdit.id : `p-${Date.now()}`,
      hn: nextHn,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      gender,
      birthDate,
      age: Number(age) || 0,
      phone: phone.trim(),
      hometown: {
        village: homeVillage.trim(),
        district: homeDistrict.trim(),
        province: homeProvince,
      },
      currentAddress: {
        village: currVillage.trim(),
        district: currDistrict.trim(),
        province: currProvince,
      },
      bloodGroup,
      drugAllergies: drugAllergies.trim(),
      underlyingDiseases: underlyingDiseases.trim(),
      emergencyContact: {
        name: emerName.trim(),
        relation: emerRelation.trim(),
        phone: emerPhone.trim(),
      },
      initialSymptoms: initialSymptoms.trim(),
      notes: notes.trim(),
      createdAt: patientToEdit ? patientToEdit.createdAt : new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSave(newPatient);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-50 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center shadow-xs">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                {patientToEdit ? 'ແກ້ໄຂຂໍ້ມູນຄົນເຈັບ' : 'ລົງທະບຽນຄົນເຈັບໃໝ່ (New Patient)'}
              </h3>
              <p className="text-xs text-slate-500">
                ກະລຸນາຕື່ມຂໍ້ມູນປະຫວັດສ່ວນຕົວ, ບ້ານເກີດ, ບ້ານຢູ່ປັດຈຸບັນ ແລະ ອາການເບື້ອງຕົ້ນ
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: ຂໍ້ມູນພື້ນຖານ */}
          <div>
            <h4 className="flex items-center gap-2 text-sm font-bold text-teal-800 uppercase tracking-wider mb-3">
              <User className="w-4 h-4 text-teal-600" />
              1. ຂໍ້ມູນປະຈຳຕົວ (Personal Information)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ຊື່ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ຕົວຢ່າງ: ສົມສັກ"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ນາມສະກຸນ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="ຕົວຢ່າງ: ວົງວິໄລ"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ເພດ</label>
                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="male">ຊາຍ (Male)</option>
                  <option value="female">ຍິງ (Female)</option>
                  <option value="other">ອື່ນໆ (Other)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ວັນເດືອນປີເກີດ
                </label>
                <input
                  type="date"
                  value={birthDate}
                  onChange={(e) => setBirthDate(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ອາຍຸ (ປີ)
                </label>
                <input
                  type="number"
                  min="0"
                  max="130"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-slate-50"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ເບີໂທລະສັບ
                </label>
                <input
                  type="tel"
                  placeholder="020 xxxx xxxx"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 2: ບ້ານເກີດ & ບ້ານຢູ່ປັດຈຸບັນ */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="flex items-center gap-2 text-sm font-bold text-teal-800 uppercase tracking-wider mb-3">
              <MapPin className="w-4 h-4 text-teal-600" />
              2. ທີ່ຢູ່ອາໄສ (Addresses)
            </h4>
            
            {/* ບ້ານເກີດ */}
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-4">
              <span className="text-xs font-bold text-slate-800 block mb-2">
                🏛️ ບ້ານເກີດ (Hometown Address)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">ບ້ານເກີດ</label>
                  <input
                    type="text"
                    placeholder="ບ້ານ..."
                    value={homeVillage}
                    onChange={(e) => setHomeVillage(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-xs focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">ເມືອງ</label>
                  <input
                    type="text"
                    placeholder="ເມືອງ..."
                    value={homeDistrict}
                    onChange={(e) => setHomeDistrict(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-xs focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">ແຂວງ</label>
                  <select
                    value={homeProvince}
                    onChange={(e) => setHomeProvince(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-xs focus:ring-1 focus:ring-teal-500 bg-white"
                  >
                    {LAO_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* ບ້ານຢູ່ປັດຈຸບັນ */}
            <div className="p-3.5 bg-teal-50/50 rounded-xl border border-teal-200/60">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-teal-900 block">
                  📍 ບ້ານຢູ່ປັດຈຸບັນ (Current Address)
                </span>
                <label className="flex items-center gap-1.5 text-xs text-teal-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={sameAsHometown}
                    onChange={(e) => handleCopyHometown(e.target.checked)}
                    className="rounded border-teal-400 text-teal-600 focus:ring-teal-500"
                  />
                  <span>ຄືກັນກັບບ້ານເກີດ</span>
                </label>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">ບ້ານປັດຈຸບັນ</label>
                  <input
                    type="text"
                    placeholder="ບ້ານ..."
                    value={currVillage}
                    onChange={(e) => setCurrVillage(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-xs focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">ເມືອງ</label>
                  <input
                    type="text"
                    placeholder="ເມືອງ..."
                    value={currDistrict}
                    onChange={(e) => setCurrDistrict(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-xs focus:ring-1 focus:ring-teal-500 bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-slate-600 mb-1">ແຂວງ</label>
                  <select
                    value={currProvince}
                    onChange={(e) => setCurrProvince(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md border border-slate-300 text-xs focus:ring-1 focus:ring-teal-500 bg-white"
                  >
                    {LAO_PROVINCES.map((prov) => (
                      <option key={prov} value={prov}>
                        {prov}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: ອາການປິ່ນປົວ & ຂໍ້ມູນສຸຂະພາບ */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="flex items-center gap-2 text-sm font-bold text-teal-800 uppercase tracking-wider mb-3">
              <HeartPulse className="w-4 h-4 text-teal-600" />
              3. ອາການ ແລະ ຂໍ້ມູນການແພດ (Clinical Info)
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ໝວດເລືອດ</label>
                <select
                  value={bloodGroup}
                  onChange={(e) => setBloodGroup(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500 bg-white"
                >
                  <option value="A">ໝວດ A</option>
                  <option value="B">ໝວດ B</option>
                  <option value="AB">ໝວດ AB</option>
                  <option value="O">ໝວດ O</option>
                  <option value="Unknown">ບໍ່ຮູ້ແນ່ນອນ</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-rose-600 mb-1 flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  ປະຫວັດແພ້ຢາ / ອາຫານ (Drug Allergies)
                </label>
                <input
                  type="text"
                  placeholder="ຕົວຢ່າງ: ແພ້ຢາ Penicillin, ແພ້ອາຫານທະເລ..."
                  value={drugAllergies}
                  onChange={(e) => setDrugAllergies(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-rose-200 text-sm focus:outline-hidden focus:ring-2 focus:ring-rose-500 bg-rose-50/30"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ໂລກປະຈຳຕົວ (Underlying Diseases)
                </label>
                <input
                  type="text"
                  placeholder="ຕົວຢ່າງ: ຄວາມດັນເລືອດສູງ, ເບົາຫວານ..."
                  value={underlyingDiseases}
                  onChange={(e) => setUnderlyingDiseases(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  ມາປິ່ນປົວໃນອາການ (Chief Complaint) <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="ຕົວຢ່າງ: ໄຂ້ສູງ 2 ມື້, ໄອແຫ້ງ, ເຈັບຄໍ..."
                  value={initialSymptoms}
                  onChange={(e) => setInitialSymptoms(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Section 4: ຜູ້ຕິດຕໍ່ສຸກເສີນ */}
          <div className="pt-4 border-t border-slate-200">
            <h4 className="flex items-center gap-2 text-sm font-bold text-teal-800 uppercase tracking-wider mb-3">
              <Phone className="w-4 h-4 text-teal-600" />
              4. ຜູ້ຕິດຕໍ່ສຸກເສີນ (Emergency Contact)
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ຊື່ ແລະ ນາມສະກຸນ</label>
                <input
                  type="text"
                  placeholder="ຊື່ຜູ້ຕິດຕໍ່"
                  value={emerName}
                  onChange={(e) => setEmerName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ສາຍພົວພັນ</label>
                <input
                  type="text"
                  placeholder="ພໍ່, ແມ່, ພັນລະຍາ, ລູກ..."
                  value={emerRelation}
                  onChange={(e) => setEmerRelation(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">ເບີໂທຕິດຕໍ່</label>
                <input
                  type="tel"
                  placeholder="020 xxxx xxxx"
                  value={emerPhone}
                  onChange={(e) => setEmerPhone(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">ໝາຍເຫດເພີ່ມເຕີມ</label>
            <textarea
              rows={2}
              placeholder="ບັນທຶກອື່ນໆ ຂອງຄົນເຈັບ..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 rounded-lg border border-slate-300 text-sm focus:outline-hidden focus:ring-2 focus:ring-teal-500"
            />
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-slate-300 text-sm font-medium text-slate-700 hover:bg-slate-100 transition-colors"
            >
              ຍົກເລີກ
            </button>
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold shadow-md shadow-teal-600/20 transition-colors"
            >
              <Save className="w-4 h-4" />
              <span>ບັນທຶກຂໍ້ມູນ</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
