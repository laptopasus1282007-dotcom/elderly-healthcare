import { NextRequest, NextResponse } from 'next/server';
import { verifyPin, verifyMemberPasscode } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { code, type } = body;

    if (!code) {
      return NextResponse.json({ error: 'Passcode or PIN is required' }, { status: 400 });
    }

    // Try PIN verification if 4 digits or specifically requested
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

    // Try family member / caregiver passcode
    const memberResult = verifyMemberPasscode(code);
    if (memberResult.success && memberResult.member) {
      return NextResponse.json({
        success: true,
        role: memberResult.member.role,
        member: memberResult.member,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid PIN or Passcode' }, { status: 401 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}
