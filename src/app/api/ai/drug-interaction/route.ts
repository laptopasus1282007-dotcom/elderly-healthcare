import { NextRequest, NextResponse } from 'next/server';
import { checkDrugInteractionWithGemini } from '@/lib/gemini';
import { getMedications } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { newMedication } = body;

    if (!newMedication) {
      return NextResponse.json({ error: 'New medication name is required' }, { status: 400 });
    }

    const currentMeds = getMedications(true).map(m => m.name);
    const result = await checkDrugInteractionWithGemini(newMedication, currentMeds);

    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
