import { NextRequest, NextResponse } from 'next/server';
import { getAppointments, addAppointment } from '@/lib/db';

export async function GET() {
  try {
    const appointments = getAppointments();
    return NextResponse.json({ success: true, appointments });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { doctorName, specialty, hospital, date, time, phone, purpose } = body;

    if (!doctorName || !date || !time) {
      return NextResponse.json({ error: 'Doctor name, date, and time are required' }, { status: 400 });
    }

    const app = addAppointment({
      doctorName,
      specialty: specialty || 'General Physician',
      hospital: hospital || 'City Clinic',
      date,
      time,
      phone: phone || '',
      purpose: purpose || 'Follow-up Checkup',
      status: 'UPCOMING',
    });

    return NextResponse.json({ success: true, appointment: app });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
