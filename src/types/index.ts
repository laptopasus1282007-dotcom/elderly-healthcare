export type UserRole = 'ELDERLY' | 'CAREGIVER' | 'FAMILY_MEMBER' | 'DOCTOR';
export type TimingCategory = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT';
export type DoseStatus = 'PENDING' | 'TAKEN' | 'MISSED' | 'SKIPPED';
export type MoodType = 'GOOD' | 'OKAY' | 'TIRED' | 'DIZZY';
export type AlertLevel = 'INFO' | 'WARNING' | 'EMERGENCY';
export type NotificationStatus = 'SENT' | 'PENDING' | 'DELIVERED' | 'FAILED';

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  relationship: string;
  isPrimary: boolean;
}

export interface PatientProfile {
  id: string;
  name: string;
  marathiName: string;
  age: number;
  gender: string;
  pin: string; // 4-digit passcode for elderly one-touch access
  bloodGroup: string;
  chronicConditions: string[];
  allergies: string[];
  emergencyContacts: EmergencyContact[];
  address: string;
}

export interface FamilyMember {
  id: string;
  name: string;
  role: UserRole;
  relationship: string;
  email: string;
  phone: string;
  passcode: string;
  permissions: {
    canViewMedications: boolean;
    canEditSchedules: boolean;
    canViewVitals: boolean;
    canReceiveAlerts: boolean;
  };
  lastActive?: string;
}

export interface Medication {
  id: string;
  name: string;
  marathiName?: string;
  dosage: string;
  frequency: string; // e.g. "Once Daily", "Twice Daily", "As needed"
  instruction: string; // e.g. "After Breakfast / न्याहारीनंतर"
  timingCategory: TimingCategory;
  scheduledTime: string; // "08:30"
  startDate: string;
  endDate?: string;
  prescribingDoctor: string;
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
  recordedBy?: 'ELDERLY' | 'CAREGIVER' | 'FAMILY_MEMBER' | 'AUTO_SYSTEM';
  skipReason?: string;
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
  notes?: string;
}

export interface WellnessRecord {
  id: string;
  recordedAt: string;
  mood: MoodType;
  bpSystolic?: number;
  bpDiastolic?: number;
  bloodSugar?: number;
  pulseRate?: number;
  notes?: string;
  recordedBy?: string;
}

export interface AppNotification {
  id: string;
  level: AlertLevel;
  title: string;
  message: string;
  timestamp: string;
  status: NotificationStatus;
  read: boolean;
  recipientEmail?: string;
  type: 'MISSED_DOSE' | 'UPCOMING_DOSE' | 'UPCOMING_APPOINTMENT' | 'EMERGENCY_SOS' | 'WELLNESS_UPDATE';
}

export interface AppDatabase {
  patient: PatientProfile;
  familyMembers: FamilyMember[];
  medications: Medication[];
  doseLogs: DoseLog[];
  appointments: Appointment[];
  vitals: WellnessRecord[];
  notifications: AppNotification[];
}

export type ActiveNavTab = 
  | 'OVERVIEW' 
  | 'MEDICATIONS' 
  | 'CALENDAR' 
  | 'APPOINTMENTS' 
  | 'FAMILY' 
  | 'REPORTS' 
  | 'WELLNESS' 
  | 'EMERGENCY' 
  | 'NOTIFICATIONS' 
  | 'SETTINGS';


// Backward compatibility type aliases
export type VitalRecord = WellnessRecord;
export type Patient = PatientProfile;
export type AlertNotification = AppNotification;
export type Caregiver = FamilyMember;
