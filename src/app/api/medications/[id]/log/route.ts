import { NextRequest, NextResponse } from 'next/server';
import { recordDoseStatus, getPatient, readDatabase } from '@/lib/db';
import { sendEmailNotification } from '@/lib/notifications';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await req.json();
    const { status, recordedBy, note } = body;
    const medicationId = params.id;

    if (!status || !['TAKEN', 'MISSED', 'SKIPPED'].includes(status)) {
      return NextResponse.json({ error: 'Valid status (TAKEN, MISSED, SKIPPED) is required' }, { status: 400 });
    }

    const log = recordDoseStatus(medicationId, status, recordedBy || 'ELDERLY', note);
    const patient = getPatient();
    const db = readDatabase();
    const caregiverEmail = db.caregivers[0]?.email || process.env.CAREGIVER_NOTIFICATION_EMAIL || 'caregiver@example.com';

    // Proactive Alert Dispatch if MISSED
    if (status === 'MISSED') {
      await sendEmailNotification({
        to: caregiverEmail,
        patientName: patient.name,
        medicationName: log.medicationName,
        scheduledTime: log.scheduledTime,
        type: 'MISSED',
      });
    }

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
