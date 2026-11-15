import { NextRequest, NextResponse } from 'next/server';
import { verifyPin, verifyCaregiverPasscode } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, type } = body;

    if (!code) {
      return NextResponse.json({ error: 'Passcode or PIN is required' }, { status: 400 });
    }

    if (type === 'ELDERLY' || code.length === 4) {
      const result = verifyPin(code);
      if (result.success) {
        return NextResponse.json({
          success: true,
          role: 'ELDERLY',
          patient: result.patient,
        });
      }
    }

    // Try verifying as caregiver
    const careResult = verifyCaregiverPasscode(code);
    if (careResult.success) {
      return NextResponse.json({
        success: true,
        role: 'CAREGIVER',
        caregiver: careResult.caregiver,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid PIN or Passcode' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
