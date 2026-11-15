import { NextRequest, NextResponse } from 'next/server';
import { triggerEmergencySos, getPatient, readDatabase } from '@/lib/db';
import { sendEmailNotification } from '@/lib/notifications';

export async function POST(req: NextRequest) {
  try {
    const patient = getPatient();
    const alert = triggerEmergencySos(patient.name);
    const db = readDatabase();
    const caregiverEmail = db.caregivers[0]?.email || 'caregiver@example.com';

    // Dispatch priority email
    await sendEmailNotification({
      to: caregiverEmail,
      patientName: patient.name,
      medicationName: 'EMERGENCY ASSISTANCE REQUESTED',
      scheduledTime: new Date().toLocaleTimeString(),
      type: 'MISSED',
    });

    return NextResponse.json({
      success: true,
      alert,
      emergencyContact: patient.emergencyContact,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
