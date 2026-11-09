export interface Patient {
  id: string;
  hn: string; // Hospital Number e.g., HN-2026-001
  firstName: string; // ຊື່
  lastName: string; // ນາມສະກຸນ
  gender: 'male' | 'female' | 'other'; // ເພດ
  birthDate: string; // ວັນເດືອນປີເກີດ (YYYY-MM-DD)
  age: number; // ອາຍຸ
  phone: string; // ເບີໂທລະສັບ
  hometown: {
    village: string; // ບ້ານເກີດ
    district: string; // ເມືອງ
    province: string; // ແຂວງ
  };
  currentAddress: {
    village: string; // ບ້ານຢູ່ປັດຈຸບັນ
    district: string; // ເມືອງ
    province: string; // ແຂວງ
  };
  bloodGroup: 'A' | 'B' | 'AB' | 'O' | 'Unknown'; // ໝວດເລືອດ
  drugAllergies: string; // ປະຫວັດແພ້ຢາ / ອາຫານ
  underlyingDiseases: string; // ໂລກປະຈຳຕົວ (ເຊັ່ນ ຄວາມດັນ, ເບົາຫວານ)
  emergencyContact: {
    name: string; // ຊື່ຜູ້ຕິດຕໍ່ສຸກເສີນ
    relation: string; // ສາຍພົວພັນ
    phone: string; // ເບີໂທ
  };
  initialSymptoms: string; // ມາປິ່ນປົວໃນອາການ
  notes?: string;
  createdAt: string; // ISO date
  updatedAt: string;
}

export interface VitalSigns {
  bloodPressure?: string; // ຄວາມດັນເລືອດ (mmHg) e.g., "120/80"
  pulseRate?: number; // ຊີບພະຈອນ (bpm) e.g., 78
  temperature?: number; // ອຸນຫະພູມ (°C) e.g., 36.8
  weight?: number; // ນ້ຳໜັກ (kg)
  height?: number; // ລວງສູງ (cm)
  spO2?: number; // ລະດັບອົກຊີແຊນ (%) e.g., 98
}

export interface PrescriptionItem {
  id: string;
  name: string; // ຊື່ຢາ
  dosage: string; // ຂະໜາດ/ວິທີກິນ e.g. "1 ເມັດ ຫຼັງອາຫານ 3 ເວລາ"
  quantity: number; // ຈຳນວນ
  unit: string; // ຫົວໜ່ວຍ (ເມັດ, ຕຸກ, ແຜງ)
  price: number; // ລາຄາຕໍ່ໜ່ວຍ (ກີບ)
}

export interface MedicalVisit {
  id: string;
  patientId: string;
  patientName: string;
  visitDate: string; // YYYY-MM-DD HH:mm
  chiefComplaint: string; // ອາການຫຼັກທີ່ມາພົບແພດ
  vitalSigns: VitalSigns;
  physicalExamNotes: string; // ຜົນການກວດຮ່າງກາຍ
  diagnosis: string; // ການວິນິດໄສໂລກ
  treatmentPlan: string; // ແຜນການປິ່ນປົວ
  prescriptions: PrescriptionItem[];
  doctorName: string; // ຊື່ທ່ານໝໍຜູ້ກວດ
  costTotal: number; // ຄ່າປິ່ນປົວ ແລະ ຄ່າຍາລວມ (LAK)
  feeConsultation: number; // ຄ່າກວດ
  feeMedication: number; // ຄ່າຍາ
  feeProcedures: number; // ຄ່າຫັດຖະການ / ອື່ນໆ
  paymentStatus: 'paid' | 'pending' | 'waived';
  paymentMethod?: 'cash' | 'bcel_one' | 'transfer' | 'other';
  nextAppointmentDate?: string; // ວັນນັດໝາຍຄັ້ງຕໍ່ໄປ
  status: 'completed' | 'in_progress' | 'cancelled';
  createdAt: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:mm
  reason: string; // ເຫດຜົນການນັດ / ອາການຕິດຕາມ
  doctorName: string;
  status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show';
  notes?: string;
  createdAt: string;
}

export type TransactionType = 'income' | 'expense';

export type IncomeCategory =
  | 'medical_service' // ຄ່າກວດປິ່ນປົວ
  | 'pharmacy' // ຄ່າຍາ ແລະ ເວຊະພັນ
  | 'lab_procedure' // ຄ່າກວດແລັບ / ຫັດຖະການ
  | 'certificate' // ໃບຢັ້ງຢືນແພດ
  | 'other_income'; // ລາຍຮັບອື່ນໆ

export type ExpenseCategory =
  | 'medical_supplies' // ຊື້ຢາ ແລະ ເວຊະພັນ
  | 'staff_salary' // ເງິນເດືອນພະນັກງານ / ຄ່າຈ້າງ
  | 'clinic_rent' // ຄ່າເຊົ່າສະຖານທີ່
  | 'utilities' // ຄ່າໄຟຟ້າ, ນ້ຳ, ອິນເຕີເນັດ
  | 'equipment' // ຊື້-ສ້ອມແປງອຸປະກອນການແພດ
  | 'marketing' // ການຕະຫຼາດ ແລະ ໂຄສະນາ
  | 'office_supplies' // ເຄື່ອງໃຊ້ຫ້ອງການ
  | 'other_expense'; // ລາຍຈ່າຍອື່ນໆ

export interface Transaction {
  id: string;
  type: TransactionType; // 'income' | 'expense'
  category: IncomeCategory | ExpenseCategory;
  categoryLabel: string; // ຊື່ໝວດໝູ່ພາສາລາວ
  title: string; // ຫົວຂໍ້ລາຍການ
  amount: number; // ຈຳນວນເງິນ (LAK)
  currency: 'LAK' | 'THB' | 'USD';
  date: string; // YYYY-MM-DD
  time?: string; // HH:mm
  paymentMethod: 'cash' | 'bcel_one' | 'transfer' | 'card';
  paymentMethodLabel: string;
  patientId?: string; // ເຊື່ອມກັບຄົນເຈັບ (ຖ້າມີ)
  patientName?: string;
  visitId?: string; // ເຊື່ອມກັບ Visit (ຖ້າມີ)
  receiptNumber?: string; // ເລກທີໃບຮັບເງິນ / ໃບສັ່ງຈ່າຍ
  notes?: string;
  createdAt: string;
}

export interface GoogleSheetsSyncConfig {
  spreadsheetId: string | null;
  spreadsheetUrl: string | null;
  spreadsheetTitle: string;
  lastSyncedAt: string | null;
  autoSync: boolean;
}
