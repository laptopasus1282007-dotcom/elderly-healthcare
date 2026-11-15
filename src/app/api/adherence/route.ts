import { NextRequest, NextResponse } from 'next/server';
import { calculateAdherenceMetrics, getDoseLogs } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date') || undefined;
    const metrics = calculateAdherenceMetrics();
    const logs = getDoseLogs(date);

    return NextResponse.json({
      success: true,
      metrics,
      recentLogs: logs.slice(-20),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
