import { NextRequest, NextResponse } from 'next/server';
import { getVitals, addVitalRecord } from '@/lib/db';

export async function GET() {
  try {
    const vitals = getVitals();
    return NextResponse.json({ success: true, vitals });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { bpSystolic, bpDiastolic, bloodSugar, pulseRate, mood, notes } = body;

    if (!mood) {
      return NextResponse.json({ error: 'Daily mood status is required' }, { status: 400 });
    }

    const vital = addVitalRecord({
      bpSystolic: bpSystolic ? Number(bpSystolic) : undefined,
      bpDiastolic: bpDiastolic ? Number(bpDiastolic) : undefined,
      bloodSugar: bloodSugar ? Number(bloodSugar) : undefined,
      pulseRate: pulseRate ? Number(pulseRate) : undefined,
      mood,
      notes: notes || '',
    });

    return NextResponse.json({ success: true, vital });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
