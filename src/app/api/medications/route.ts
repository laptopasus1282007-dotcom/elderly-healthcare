import { NextRequest, NextResponse } from 'next/server';
import { getMedications, addMedication, deleteMedication, updateMedication } from '@/lib/db';
import { checkDrugInteractionWithGemini } from '@/lib/gemini';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const activeOnly = searchParams.get('active') === 'true';
    const meds = getMedications(activeOnly);
    return NextResponse.json({ success: true, medications: meds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { 
      name, 
      marathiName, 
      dosage, 
      frequency, 
      instruction, 
      timingCategory, 
      scheduledTime, 
      startDate, 
      endDate, 
      prescribingDoctor, 
      pillColor, 
      shape, 
      purpose, 
      precautions 
    } = body;

    if (!name || !dosage || !timingCategory || !scheduledTime) {
      return NextResponse.json({ error: 'Missing required medication fields' }, { status: 400 });
    }

    const currentMeds = getMedications(true).map(m => m.name);
    const interactionCheck = await checkDrugInteractionWithGemini(name, currentMeds);

    const newMed = addMedication({
      name,
      marathiName: marathiName || name,
      dosage,
      frequency: frequency || 'Once Daily',
      instruction: instruction || 'As directed by physician',
      timingCategory,
      scheduledTime,
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || undefined,
      prescribingDoctor: prescribingDoctor || 'Attending Physician',
      pillColor: pillColor || 'blue',
      shape: shape || 'round',
      active: true,
      purpose: purpose || 'Health maintenance',
      precautions: precautions || interactionCheck.precautions.join(', '),
    });

    return NextResponse.json({
      success: true,
      medication: newMed,
      safetyCheck: interactionCheck,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, ...updates } = body;
    if (!id) return NextResponse.json({ error: 'Medication ID required' }, { status: 400 });
    const updated = updateMedication(id, updates);
    return NextResponse.json({ success: true, medication: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ error: 'Medication ID required' }, { status: 400 });
    const success = deleteMedication(id);
    return NextResponse.json({ success });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
