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
    const { name, dosage, instruction, timingCategory, scheduledTime, pillColor, shape, purpose, precautions, marathiName } = body;

    if (!name || !dosage || !timingCategory || !scheduledTime) {
      return NextResponse.json({ error: 'Missing required medication fields' }, { status: 400 });
    }

    // Run AI Drug Interaction check against existing active medications
    const currentMeds = getMedications(true).map(m => m.name);
    const interactionCheck = await checkDrugInteractionWithGemini(name, currentMeds);

    const newMed = addMedication({
      name,
      marathiName: marathiName || name,
      dosage,
      instruction: instruction || 'As directed by physician',
      timingCategory,
      scheduledTime,
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
