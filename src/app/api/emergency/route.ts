import { NextRequest, NextResponse } from 'next/server';
import { getEmergencyContacts, addEmergencyContact, deleteEmergencyContact } from '@/lib/db';

export async function GET() {
  try {
    const contacts = getEmergencyContacts();
    return NextResponse.json({ success: true, contacts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, phone, relationship, isPrimary } = body;

    if (!name || !phone) {
      return NextResponse.json({ error: 'Contact name and phone are required' }, { status: 400 });
    }

    const contact = addEmergencyContact({
      name,
      phone,
      relationship: relationship || 'Family',
      isPrimary: Boolean(isPrimary),
    });

    return NextResponse.json({ success: true, contact });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Contact ID required' }, { status: 400 });
    const success = deleteEmergencyContact(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
