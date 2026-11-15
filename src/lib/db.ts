import fs from 'fs';
import path from 'path';
import { 
  AppDatabase, 
  DoseLog, 
  Medication, 
  Appointment, 
  WellnessRecord, 
  AppNotification, 
  FamilyMember, 
  PatientProfile, 
  EmergencyContact 
} from '@/types';
import initialData from '../../data/initialData.json';

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure database file exists with initial seeded data
function getDbPath(): string {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(initialData, null, 2), 'utf-8');
  }
  return DB_FILE;
}

// Read database safely
export function readDatabase(): AppDatabase {
  try {
    const filePath = getDbPath();
    const raw = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(raw) as AppDatabase;
  } catch (error) {
    console.error('Error reading database, falling back to initial data:', error);
    return initialData as unknown as AppDatabase;
  }
}

// Write database atomically using temporary file to prevent corruption
export function writeDatabase(data: AppDatabase): void {
  const filePath = getDbPath();
  const tempPath = `${filePath}.tmp.${Date.now()}`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
  fs.renameSync(tempPath, filePath);
}

// ----------------- Patient & Auth -----------------

export function getPatient(): PatientProfile {
  const db = readDatabase();
  return db.patient;
}

export function updatePatientProfile(updates: Partial<PatientProfile>): PatientProfile {
  const db = readDatabase();
  db.patient = { ...db.patient, ...updates };
  writeDatabase(db);
  return db.patient;
}

export function verifyPin(pin: string): { success: boolean; role: 'ELDERLY' | 'NONE'; patient?: PatientProfile } {
  const db = readDatabase();
  if (db.patient.pin === pin) {
    return { success: true, role: 'ELDERLY', patient: db.patient };
  }
  return { success: false, role: 'NONE' };
}

export function verifyMemberPasscode(passcode: string): { success: boolean; member?: FamilyMember } {
  const db = readDatabase();
  const member = db.familyMembers.find(m => m.passcode.toUpperCase() === passcode.toUpperCase());
  if (member) {
    member.lastActive = new Date().toISOString();
    writeDatabase(db);
    return { success: true, member };
  }
  return { success: false };
}

// Backward compatibility alias for tests
export function verifyCaregiverPasscode(passcode: string): { success: boolean; caregiver?: any } {
  const res = verifyMemberPasscode(passcode);
  return { success: res.success, caregiver: res.member };
}

// ----------------- Family Members & Permissions -----------------

export function getFamilyMembers(): FamilyMember[] {
  const db = readDatabase();
  return db.familyMembers;
}

export function addFamilyMember(member: Omit<FamilyMember, 'id'>): FamilyMember {
  const db = readDatabase();
  const newMember: FamilyMember = {
    ...member,
    id: `fam_${Date.now()}`,
    lastActive: new Date().toISOString(),
  };
  db.familyMembers.push(newMember);
  writeDatabase(db);
  return newMember;
}

export function updateMemberPermissions(id: string, permissions: FamilyMember['permissions']): FamilyMember | null {
  const db = readDatabase();
  const member = db.familyMembers.find(m => m.id === id);
  if (!member) return null;
  member.permissions = permissions;
  writeDatabase(db);
  return member;
}

export function deleteFamilyMember(id: string): boolean {
  const db = readDatabase();
  const prevLen = db.familyMembers.length;
  db.familyMembers = db.familyMembers.filter(m => m.id !== id);
  if (db.familyMembers.length !== prevLen) {
    writeDatabase(db);
    return true;
  }
  return false;
}

// ----------------- Medications -----------------

export function getMedications(activeOnly: boolean = false): Medication[] {
  const db = readDatabase();
  return activeOnly ? db.medications.filter(m => m.active) : db.medications;
}

export function addMedication(med: Omit<Medication, 'id'>): Medication {
  const db = readDatabase();
  const newMed: Medication = {
    ...med,
    id: `med_${Date.now()}`,
  };
  db.medications.push(newMed);
  writeDatabase(db);
  return newMed;
}

export function updateMedication(id: string, updates: Partial<Medication>): Medication | null {
  const db = readDatabase();
  const idx = db.medications.findIndex(m => m.id === id);
  if (idx === -1) return null;
  db.medications[idx] = { ...db.medications[idx], ...updates };
  writeDatabase(db);
  return db.medications[idx];
}

export function deleteMedication(id: string): boolean {
  const db = readDatabase();
  const beforeLen = db.medications.length;
  db.medications = db.medications.filter(m => m.id !== id);
  if (db.medications.length !== beforeLen) {
    writeDatabase(db);
    return true;
  }
  return false;
}

// ----------------- Dose Logs & Adherence -----------------

export function getDoseLogs(date?: string): DoseLog[] {
  const db = readDatabase();
  if (date) {
    return db.doseLogs.filter(l => l.scheduledDate === date);
  }
  return db.doseLogs;
}

export function recordDoseStatus(
  medicationId: string,
  status: 'TAKEN' | 'MISSED' | 'SKIPPED',
  recordedBy: 'ELDERLY' | 'CAREGIVER' | 'FAMILY_MEMBER' | 'AUTO_SYSTEM' = 'ELDERLY',
  skipReason?: string,
  note?: string
): DoseLog {
  const db = readDatabase();
  const today = new Date().toISOString().split('T')[0];
  const med = db.medications.find(m => m.id === medicationId);

  let log = db.doseLogs.find(l => l.medicationId === medicationId && l.scheduledDate === today);

  if (log) {
    log.status = status;
    log.recordedAt = new Date().toISOString();
    log.recordedBy = recordedBy;
    if (skipReason) log.skipReason = skipReason;
    if (note) log.note = note;
  } else {
    log = {
      id: `log_${Date.now()}`,
      medicationId,
      medicationName: med?.name || 'Unknown',
      dosage: med?.dosage || '',
      scheduledDate: today,
      scheduledTime: med?.scheduledTime || '08:00',
      status,
      recordedAt: new Date().toISOString(),
      recordedBy,
      skipReason,
      note,
    };
    db.doseLogs.push(log);
  }

  // Generate audit notification
  if (status === 'MISSED' || status === 'SKIPPED') {
    db.notifications.unshift({
      id: `notif_${Date.now()}`,
      level: status === 'MISSED' ? 'WARNING' : 'INFO',
      title: status === 'MISSED' ? 'Missed Medication Alert' : 'Dose Skipped by Patient',
      message: `${med?.name || 'Medication'} was marked as ${status} on ${today}. Reason: ${skipReason || 'None provided'}.`,
      timestamp: new Date().toISOString(),
      status: 'DELIVERED',
      read: false,
      recipientEmail: db.familyMembers[0]?.email,
      type: 'MISSED_DOSE',
    });
  }

  writeDatabase(db);
  return log;
}

export function calculateAdherenceMetrics() {
  const db = readDatabase();
  const totalLogs = db.doseLogs.length;
  if (totalLogs === 0) {
    return { adherenceRate: 100, taken: 0, missed: 0, skipped: 0, total: 0, streakDays: 7 };
  }
  const taken = db.doseLogs.filter(l => l.status === 'TAKEN').length;
  const missed = db.doseLogs.filter(l => l.status === 'MISSED').length;
  const skipped = db.doseLogs.filter(l => l.status === 'SKIPPED').length;
  const adherenceRate = Math.round((taken / totalLogs) * 100);

  return { adherenceRate, taken, missed, skipped, total: totalLogs, streakDays: 8 };
}

// ----------------- Appointments -----------------

export function getAppointments(): Appointment[] {
  const db = readDatabase();
  return db.appointments.sort((a, b) => a.date.localeCompare(b.date));
}

export function addAppointment(app: Omit<Appointment, 'id' | 'reminderSent'>): Appointment {
  const db = readDatabase();
  const newApp: Appointment = {
    ...app,
    id: `app_${Date.now()}`,
    reminderSent: false,
  };
  db.appointments.push(newApp);
  writeDatabase(db);
  return newApp;
}

export function updateAppointment(id: string, updates: Partial<Appointment>): Appointment | null {
  const db = readDatabase();
  const idx = db.appointments.findIndex(a => a.id === id);
  if (idx === -1) return null;
  db.appointments[idx] = { ...db.appointments[idx], ...updates };
  writeDatabase(db);
  return db.appointments[idx];
}

export function deleteAppointment(id: string): boolean {
  const db = readDatabase();
  const prevLen = db.appointments.length;
  db.appointments = db.appointments.filter(a => a.id !== id);
  if (db.appointments.length !== prevLen) {
    writeDatabase(db);
    return true;
  }
  return false;
}

// ----------------- Daily Wellness & Vitals -----------------

export function getVitals(): WellnessRecord[] {
  const db = readDatabase();
  return db.vitals.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

export function addVitalRecord(vital: Omit<WellnessRecord, 'id' | 'recordedAt'>): WellnessRecord {
  const db = readDatabase();
  const newVital: WellnessRecord = {
    ...vital,
    id: `vit_${Date.now()}`,
    recordedAt: new Date().toISOString(),
  };
  db.vitals.unshift(newVital);
  writeDatabase(db);
  return newVital;
}

// ----------------- Emergency Contacts & SOS -----------------

export function getEmergencyContacts(): EmergencyContact[] {
  const db = readDatabase();
  return db.patient.emergencyContacts || [];
}

export function addEmergencyContact(contact: Omit<EmergencyContact, 'id'>): EmergencyContact {
  const db = readDatabase();
  const newContact: EmergencyContact = {
    ...contact,
    id: `ec_${Date.now()}`,
  };
  if (!db.patient.emergencyContacts) db.patient.emergencyContacts = [];
  db.patient.emergencyContacts.push(newContact);
  writeDatabase(db);
  return newContact;
}

export function deleteEmergencyContact(id: string): boolean {
  const db = readDatabase();
  if (!db.patient.emergencyContacts) return false;
  const prevLen = db.patient.emergencyContacts.length;
  db.patient.emergencyContacts = db.patient.emergencyContacts.filter(c => c.id !== id);
  if (db.patient.emergencyContacts.length !== prevLen) {
    writeDatabase(db);
    return true;
  }
  return false;
}

export function triggerEmergencySos(patientName: string): AppNotification {
  const db = readDatabase();
  const emergencyAlert: AppNotification = {
    id: `alt_sos_${Date.now()}`,
    level: 'EMERGENCY',
    title: '🚨 EMERGENCY SOS TRIGGERED!',
    message: `${patientName} triggered Emergency SOS assistance at ${new Date().toLocaleTimeString()}! Urgent caregiver response needed.`,
    timestamp: new Date().toISOString(),
    status: 'DELIVERED',
    read: false,
    recipientEmail: db.familyMembers[0]?.email,
    type: 'EMERGENCY_SOS',
  };
  db.notifications.unshift(emergencyAlert);
  writeDatabase(db);
  return emergencyAlert;
}

// ----------------- Notifications -----------------

export function getNotifications(): AppNotification[] {
  const db = readDatabase();
  return db.notifications;
}

export function markNotificationAsRead(id: string): boolean {
  const db = readDatabase();
  const notif = db.notifications.find(n => n.id === id);
  if (notif) {
    notif.read = true;
    writeDatabase(db);
    return true;
  }
  return false;
}

// ----------------- Healthcare Summary Aggregator (For PDF Export) -----------------

export function getHealthcareSummaryReport() {
  const db = readDatabase();
  const adherence = calculateAdherenceMetrics();
  const upcomingAppointments = db.appointments.filter(a => a.status === 'UPCOMING');
  const activeMedications = db.medications.filter(m => m.active);
  const latestVital = db.vitals[0];

  return {
    patient: db.patient,
    generatedAt: new Date().toISOString(),
    adherence,
    activeMedications,
    upcomingAppointments,
    latestVital,
    vitalsHistory: db.vitals.slice(0, 7),
    recentLogs: db.doseLogs.slice(-10),
  };
}
