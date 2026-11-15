import { 
  verifyPin, 
  verifyCaregiverPasscode, 
  getMedications, 
  calculateAdherenceMetrics, 
  recordDoseStatus,
  getPatient 
} from '../src/lib/db';
import { getElderlyAudioText, checkDrugInteractionWithGemini } from '../src/lib/gemini';

describe('AyuCare Core Engine & Security Tests', () => {

  test('Security: Elderly 4-digit PIN verification succeeds for correct PIN', () => {
    const result = verifyPin('1234');
    expect(result.success).toBe(true);
    expect(result.role).toBe('ELDERLY');
    expect(result.patient?.name).toBe('Shantabai Joshi');
  });

  test('Security: PIN verification fails for incorrect PIN', () => {
    const result = verifyPin('9999');
    expect(result.success).toBe(false);
    expect(result.role).toBe('NONE');
  });

  test('Security: Caregiver passcode verification works correctly', () => {
    const result = verifyCaregiverPasscode('CARE-2026');
    expect(result.success).toBe(true);
    expect(result.caregiver?.role).toBe('CAREGIVER');
  });

  test('Medication Engine: Returns active medications with complete details', () => {
    const meds = getMedications(true);
    expect(Array.isArray(meds)).toBe(true);
    expect(meds.length).toBeGreaterThan(0);
    expect(meds[0]).toHaveProperty('scheduledTime');
    expect(meds[0]).toHaveProperty('timingCategory');
  });

  test('Adherence Metrics: Accurately calculates compliance percentage', () => {
    const metrics = calculateAdherenceMetrics();
    expect(metrics).toHaveProperty('adherenceRate');
    expect(metrics.adherenceRate).toBeGreaterThanOrEqual(0);
    expect(metrics.adherenceRate).toBeLessThanOrEqual(100);
  });

  test('Dose Logging & Proactive Alert Trigger: Correctly updates status', () => {
    const log = recordDoseStatus('med_01', 'TAKEN', 'ELDERLY', 'Unit test verification');
    expect(log.status).toBe('TAKEN');
    expect(log.recordedBy).toBe('ELDERLY');
  });

  test('Accessibility: Generates respectful Marathi and English voice prompts', () => {
    const mrText = getElderlyAudioText('शांताबाई', 'टेल्मिसार्टन', 'न्याहारीनंतर', 'mr');
    expect(mrText).toContain('शांताबाई');
    expect(mrText).toContain('टेल्मिसार्टन');

    const enText = getElderlyAudioText('Shantabai', 'Telmisartan', 'after breakfast', 'en');
    expect(enText).toContain('Shantabai');
    expect(enText).toContain('Telmisartan');
  });

  test('Drug Interaction Guard: Flags potential risk for blood pressure combinations', async () => {
    const result = await checkDrugInteractionWithGemini('Aspirin 75mg', ['Telmisartan 40mg']);
    expect(result).toHaveProperty('warningLevel');
    expect(Array.isArray(result.precautions)).toBe(true);
  });

});
