import { NextRequest, NextResponse } from 'next/server';
import { scanPrescriptionWithGemini } from '@/lib/gemini';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, mimeType } = body;

    if (!imageBase64) {
      return NextResponse.json({ error: 'Image base64 data is required' }, { status: 400 });
    }

    const result = await scanPrescriptionWithGemini(imageBase64, mimeType || 'image/jpeg');
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
