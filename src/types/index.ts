export type TimingCategory = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
export type DoseStatus = 'PENDING' | 'TAKEN' | 'MISSED' | 'SKIPPED';
export type CaregiverRole = 'PRIMARY_CAREGIVER' | 'FAMILY_MEMBER' | 'DOCTOR';
export type MoodType = 'HAPPY' | 'NORMAL' | 'TIRED' | 'DIZZY' | 'UNWELL';
export type AlertLevel = 'INFO' | 'WARNING' | 'EMERGENCY';

export interface EmergencyContact {
  name: string;
  phone: string;
  relationship: string;
}

export interface Patient {
  id: string;
  name: string;
  marathiName: string;
  age: number;
  gender: string;
  pin: string; // 4-digit passcode for elderly one-touch access
  bloodGroup: string;
  chronicConditions: string[];
  emergencyContact: EmergencyContact;
}

export interface Caregiver {
  id: string;
  name: string;
  role: CaregiverRole;
  email: string;
  phone: string;
  passcode: string; // e.g. CARE-2026
}

export interface Medication {
  id: string;
  name: string;
  marathiName?: string;
  dosage: string;
  instruction: string; // e.g. "After Breakfast / न्याहारीनंतर"
  timingCategory: TimingCategory;
  scheduledTime: string; // "08:30"
  pillColor: string; // "blue" | "white" | "red" | "yellow" | "green"
  shape: string; // "round" | "capsule" | "oval"
  active: boolean;
  purpose: string;
  precautions?: string;
}

export interface DoseLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledDate: string; // "YYYY-MM-DD"
  scheduledTime: string; // "08:30"
  status: DoseStatus;
  recordedAt?: string;
  recordedBy?: 'ELDERLY' | 'CAREGIVER' | 'AUTO_SYSTEM';
  note?: string;
}

export interface Appointment {
  id: string;
  doctorName: string;
  specialty: string;
  hospital: string;
  date: string; // "YYYY-MM-DD"
  time: string; // "10:30 AM"
  phone: string;
  purpose: string;
  status: 'UPCOMING' | 'COMPLETED' | 'CANCELLED';
  reminderSent: boolean;
}

export interface VitalRecord {
  id: string;
  recordedAt: string;
  bpSystolic?: number;
  bpDiastolic?: number;
  bloodSugar?: number;
  pulseRate?: number;
  mood: MoodType;
  notes?: string;
}

export interface AlertNotification {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
  recipientEmail?: string;
  type: 'MISSED_DOSE' | 'UPCOMING_APPOINTMENT' | 'EMERGENCY_SOS' | 'DRUG_CONFLICT';
}

export interface AppDatabase {
  patient: Patient;
  caregivers: Caregiver[];
  medications: Medication[];
  doseLogs: DoseLog[];
  appointments: Appointment[];
  vitals: VitalRecord[];
  alerts: AlertNotification[];
}
