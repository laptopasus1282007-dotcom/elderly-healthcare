import fs from 'fs';
import path from 'path';
import { AppDatabase, DoseLog, Medication, Appointment, VitalRecord, AlertNotification } from '@/types';
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

// ----------------- Data Access Operations -----------------

// Patient & Auth
export function getPatient() {
  const db = readDatabase();
  return db.patient;
}

export function verifyPin(pin: string): { success: boolean; role: 'ELDERLY' | 'NONE'; patient?: any } {
  const db = readDatabase();
  if (db.patient.pin === pin) {
    return { success: true, role: 'ELDERLY', patient: db.patient };
  }
  return { success: false, role: 'NONE' };
}

export function verifyCaregiverPasscode(passcode: string): { success: boolean; caregiver?: any } {
  const db = readDatabase();
  const caregiver = db.caregivers.find(c => c.passcode === passcode);
  if (caregiver) {
    return { success: true, caregiver };
  }
  return { success: false };
}

// Medications
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

// Dose Logs & Adherence
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
  recordedBy: 'ELDERLY' | 'CAREGIVER' | 'AUTO_SYSTEM' = 'ELDERLY',
  note?: string
): DoseLog {
  const db = readDatabase();
  const today = new Date().toISOString().split('T')[0];
  const med = db.medications.find(m => m.id === medicationId);

  // Check if an existing log for today exists
  let log = db.doseLogs.find(l => l.medicationId === medicationId && l.scheduledDate === today);

  if (log) {
    log.status = status;
    log.recordedAt = new Date().toISOString();
    log.recordedBy = recordedBy;
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
      note,
    };
    db.doseLogs.push(log);
  }

  // Create alert log if marked missed
  if (status === 'MISSED') {
    db.alerts.unshift({
      id: `alt_${Date.now()}`,
      level: 'WARNING',
      title: 'Dose Missed Alert',
      message: `${med?.name || 'Medication'} was missed on ${today}. Caregiver notified.`,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      type: 'MISSED_DOSE',
    });
  }

  writeDatabase(db);
  return log;
}

// Calculate Adherence Metrics
export function calculateAdherenceMetrics() {
  const db = readDatabase();
  const totalLogs = db.doseLogs.length;
  if (totalLogs === 0) {
    return { adherenceRate: 100, taken: 0, missed: 0, skipped: 0, total: 0 };
  }
  const taken = db.doseLogs.filter(l => l.status === 'TAKEN').length;
  const missed = db.doseLogs.filter(l => l.status === 'MISSED').length;
  const skipped = db.doseLogs.filter(l => l.status === 'SKIPPED').length;
  const adherenceRate = Math.round((taken / totalLogs) * 100);

  return { adherenceRate, taken, missed, skipped, total: totalLogs };
}

// Appointments
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

// Vitals
export function getVitals(): VitalRecord[] {
  const db = readDatabase();
  return db.vitals.sort((a, b) => b.recordedAt.localeCompare(a.recordedAt));
}

export function addVitalRecord(vital: Omit<VitalRecord, 'id' | 'recordedAt'>): VitalRecord {
  const db = readDatabase();
  const newVital: VitalRecord = {
    ...vital,
    id: `vit_${Date.now()}`,
    recordedAt: new Date().toISOString(),
  };
  db.vitals.unshift(newVital);
  writeDatabase(db);
  return newVital;
}

// Alerts & SOS
export function getAlerts(): AlertNotification[] {
  const db = readDatabase();
  return db.alerts;
}

export function triggerEmergencySos(patientName: string): AlertNotification {
  const db = readDatabase();
  const emergencyAlert: AlertNotification = {
    id: `alt_sos_${Date.now()}`,
    level: 'EMERGENCY',
    title: '🚨 EMERGENCY SOS TRIGGERED!',
    message: `${patientName} triggered an Emergency SOS at ${new Date().toLocaleTimeString()}! Urgent caregiver attention required.`,
    timestamp: new Date().toISOString(),
    acknowledged: false,
    type: 'EMERGENCY_SOS',
  };
  db.alerts.unshift(emergencyAlert);
  writeDatabase(db);
  return emergencyAlert;
}
