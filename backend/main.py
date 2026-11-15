from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Optional, List, Dict, Any
from datetime import datetime

from backend.database import (
    get_patient,
    verify_pin,
    verify_passcode,
    get_medications,
    add_medication,
    update_medication,
    delete_medication,
    record_dose,
    get_adherence_metrics,
    get_appointments,
    add_appointment,
    get_vitals,
    add_vital,
    get_family_members,
    add_family_member,
    get_notifications,
    trigger_sos
)
from backend.gemini_service import check_drug_interaction, scan_prescription_image

app = FastAPI(
    title="AyuCare Healthcare API",
    description="Smarter Care. Safer Living. Together. — Elderly Care & Medication Management API",
    version="2.0.0"
)

# Enable CORS for cross-origin requests
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ----------------- Request Models -----------------

class PinVerificationRequest(BaseModel):
    code: str
    type: Optional[str] = "ELDERLY"

class MedicationRequest(BaseModel):
    name: str
    marathiName: Optional[str] = ""
    dosage: str
    frequency: Optional[str] = "Once Daily"
    instruction: Optional[str] = "After Breakfast"
    timingCategory: str = "MORNING"
    scheduledTime: str = "08:30"
    startDate: Optional[str] = None
    prescribingDoctor: Optional[str] = "Attending Physician"
    pillColor: Optional[str] = "blue"
    shape: Optional[str] = "round"
    purpose: Optional[str] = "Health maintenance"
    precautions: Optional[str] = ""

class DoseStatusRequest(BaseModel):
    status: str
    recordedBy: Optional[str] = "ELDERLY"
    skipReason: Optional[str] = ""
    note: Optional[str] = ""

class AppointmentRequest(BaseModel):
    doctorName: str
    specialty: Optional[str] = "General Physician"
    hospital: Optional[str] = "City Clinic"
    date: str
    time: str
    phone: Optional[str] = ""
    purpose: Optional[str] = "Consultation"
    notes: Optional[str] = ""

class VitalRequest(BaseModel):
    mood: str
    bpSystolic: Optional[int] = None
    bpDiastolic: Optional[int] = None
    bloodSugar: Optional[int] = None
    pulseRate: Optional[int] = None
    notes: Optional[str] = ""

class FamilyMemberRequest(BaseModel):
    name: str
    role: str = "FAMILY_MEMBER"
    relationship: str
    email: str
    phone: Optional[str] = ""
    permissions: Optional[Dict[str, bool]] = None

class DrugInteractionRequest(BaseModel):
    newMedication: str

class PrescriptionScanRequest(BaseModel):
    imageBase64: str
    mimeType: Optional[str] = "image/jpeg"

# ----------------- API Endpoints -----------------

@app.get("/")
def root():
    return {
        "platform": "AyuCare Elderly Healthcare Platform",
        "tagline": "Smarter Care. Safer Living. Together.",
        "status": "OPERATIONAL",
        "version": "2.0.0",
        "docs": "/docs"
    }

@app.post("/api/auth/verify-pin")
def api_verify_pin(req: PinVerificationRequest):
    if req.type == "ELDERLY" or len(req.code) == 4:
        res = verify_pin(req.code)
        if res.get("success"):
            return res
    care_res = verify_passcode(req.code)
    if care_res.get("success"):
        return care_res
    raise HTTPException(status_code=401, detail="Invalid PIN or Passcode")

@app.get("/api/patient")
def api_get_patient():
    return {"success": True, "patient": get_patient()}

@app.get("/api/medications")
def api_get_medications(active: bool = False):
    return {"success": True, "medications": get_medications(active)}

@app.post("/api/medications")
def api_add_medication(med: MedicationRequest):
    current = [m.get("name", "") for m in get_medications(True)]
    safety = check_drug_interaction(med.name, current)
    created = add_medication(med.dict())
    return {"success": True, "medication": created, "safetyCheck": safety}

@app.put("/api/medications/{med_id}")
def api_update_medication(med_id: str, updates: Dict[str, Any]):
    updated = update_medication(med_id, updates)
    if not updated:
        raise HTTPException(status_code=404, detail="Medication not found")
    return {"success": True, "medication": updated}

@app.delete("/api/medications/{med_id}")
def api_delete_medication(med_id: str):
    success = delete_medication(med_id)
    return {"success": success}

@app.post("/api/medications/{med_id}/log")
def api_record_dose(med_id: str, req: DoseStatusRequest):
    if req.status not in ["TAKEN", "MISSED", "SKIPPED"]:
        raise HTTPException(status_code=400, detail="Invalid status")
    log = record_dose(med_id, req.status, req.recordedBy, req.skipReason, req.note)
    return {"success": True, "log": log}

@app.get("/api/adherence")
def api_get_adherence():
    return {"success": True, "metrics": get_adherence_metrics()}

@app.get("/api/appointments")
def api_get_appointments():
    return {"success": True, "appointments": get_appointments()}

@app.post("/api/appointments")
def api_add_appointment(app_req: AppointmentRequest):
    created = add_appointment(app_req.dict())
    return {"success": True, "appointment": created}

@app.get("/api/vitals")
def api_get_vitals():
    return {"success": True, "vitals": get_vitals()}

@app.post("/api/vitals")
def api_add_vital(req: VitalRequest):
    vital = add_vital(req.dict())
    return {"success": True, "vital": vital}

@app.get("/api/family")
def api_get_family():
    return {"success": True, "members": get_family_members()}

@app.post("/api/family")
def api_add_family(req: FamilyMemberRequest):
    member = add_family_member(req.dict())
    return {"success": True, "member": member}

@app.get("/api/notifications")
def api_get_notifications():
    return {"success": True, "notifications": get_notifications()}

@app.post("/api/alerts/emergency-sos")
def api_trigger_sos():
    patient = get_patient()
    alert = trigger_sos(patient.get("name", "Shantabai Joshi"))
    return {"success": True, "alert": alert, "emergencyContacts": patient.get("emergencyContacts", [])}

@app.post("/api/ai/scan-prescription")
def api_scan_prescription(req: PrescriptionScanRequest):
    res = scan_prescription_image(req.imageBase64, req.mimeType)
    return res

@app.post("/api/ai/drug-interaction")
def api_drug_interaction(req: DrugInteractionRequest):
    current = [m.get("name", "") for m in get_medications(True)]
    return check_drug_interaction(req.newMedication, current)
