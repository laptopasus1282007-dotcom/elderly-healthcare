import { NextResponse } from 'next/server';
import { getHealthcareSummaryReport } from '@/lib/db';

export async function GET() {
  try {
    const summary = getHealthcareSummaryReport();
    return NextResponse.json({ success: true, summary });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
