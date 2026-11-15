import { NextRequest, NextResponse } from 'next/server';
import { getAppointments, addAppointment, updateAppointment, deleteAppointment } from '@/lib/db';

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
    const { doctorName, specialty, hospital, date, time, phone, purpose, notes } = body;

    if (!doctorName || !date || !time) {
      return NextResponse.json({ error: 'Doctor name, date, and time are required' }, { status: 400 });
    }

    const app = addAppointment({
      doctorName,
      specialty: specialty || 'General Physician',
      hospital: hospital || 'City Care Hospital',
      date,
      time,
      phone: phone || '',
      purpose: purpose || 'Follow-up Consultation',
      status: 'UPCOMING',
      notes: notes || '',
    });

    return NextResponse.json({ success: true, appointment: app });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
    const updated = updateAppointment(id, updates);
    return NextResponse.json({ success: true, appointment: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Appointment ID required' }, { status: 400 });
    const success = deleteAppointment(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
