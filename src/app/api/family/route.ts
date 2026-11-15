import { NextRequest, NextResponse } from 'next/server';
import { getFamilyMembers, addFamilyMember, updateMemberPermissions, deleteFamilyMember } from '@/lib/db';

export async function GET() {
  try {
    const members = getFamilyMembers();
    return NextResponse.json({ success: true, members });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, role, relationship, email, phone, permissions } = body;

    if (!name || !relationship || !email) {
      return NextResponse.json({ error: 'Name, relationship, and email are required' }, { status: 400 });
    }

    const passcode = `FAM-${Math.floor(1000 + Math.random() * 9000)}`;

    const newMember = addFamilyMember({
      name,
      role: role || 'FAMILY_MEMBER',
      relationship,
      email,
      phone: phone || '',
      passcode,
      permissions: permissions || {
        canViewMedications: true,
        canEditSchedules: false,
        canViewVitals: true,
        canReceiveAlerts: true,
      },
    });

    return NextResponse.json({ success: true, member: newMember });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, permissions } = body;
    if (!id || !permissions) {
      return NextResponse.json({ error: 'Member ID and permissions are required' }, { status: 400 });
    }
    const updated = updateMemberPermissions(id, permissions);
    return NextResponse.json({ success: true, member: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Member ID required' }, { status: 400 });
    const success = deleteFamilyMember(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
