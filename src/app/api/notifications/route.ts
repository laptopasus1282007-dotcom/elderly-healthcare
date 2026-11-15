import { NextRequest, NextResponse } from 'next/server';
import { getNotifications, markNotificationAsRead } from '@/lib/db';

export async function GET() {
  try {
    const notifications = getNotifications();
    return NextResponse.json({ success: true, notifications });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
    const success = markNotificationAsRead(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
