import json
import os
import shutil
from typing import Dict, Any, List, Optional
from datetime import datetime

DATA_DIR = os.path.join(os.getcwd(), 'data')
DB_FILE = os.path.join(DATA_DIR, 'database.json')
INITIAL_FILE = os.path.join(DATA_DIR, 'initialData.json')

def get_db_path() -> str:
    if not os.path.exists(DATA_DIR):
        os.makedirs(DATA_DIR, exist_ok=True)
    if not os.path.exists(DB_FILE):
        if os.path.exists(INITIAL_FILE):
            shutil.copy(INITIAL_FILE, DB_FILE)
    return DB_FILE

def read_db() -> Dict[str, Any]:
    path = get_db_path()
    try:
        with open(path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        print(f"Error reading database: {e}")
        with open(INITIAL_FILE, 'r', encoding='utf-8') as f:
            return json.load(f)

def write_db(data: Dict[str, Any]) -> None:
    path = get_db_path()
    temp_path = f"{path}.tmp.{int(datetime.now().timestamp() * 1000)}"
    with open(temp_path, 'w', encoding='utf-8') as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    shutil.move(temp_path, path)

# ----------------- Core Operations -----------------

def get_patient() -> Dict[str, Any]:
    db = read_db()
    return db.get('patient', {})

def verify_pin(pin: str) -> Dict[str, Any]:
    db = read_db()
    patient = db.get('patient', {})
    if patient.get('pin') == pin:
        return {"success": True, "role": "ELDERLY", "patient": patient}
    return {"success": False, "role": "NONE"}

def verify_passcode(passcode: str) -> Dict[str, Any]:
    db = read_db()
    for member in db.get('familyMembers', []):
        if member.get('passcode', '').upper() == passcode.upper():
            return {"success": True, "role": member.get('role'), "member": member}
    return {"success": False, "role": "NONE"}

def get_medications(active_only: bool = False) -> List[Dict[str, Any]]:
    db = read_db()
    meds = db.get('medications', [])
    if active_only:
        return [m for m in meds if m.get('active', True)]
    return meds

def add_medication(med: Dict[str, Any]) -> Dict[str, Any]:
    db = read_db()
    med['id'] = f"med_{int(datetime.now().timestamp() * 1000)}"
    med['active'] = True
    db.setdefault('medications', []).append(med)
    write_db(db)
    return med

def update_medication(med_id: str, updates: Dict[str, Any]) -> Optional[Dict[str, Any]]:
    db = read_db()
    for i, m in enumerate(db.get('medications', [])):
        if m.get('id') == med_id:
            db['medications'][i].update(updates)
            write_db(db)
            return db['medications'][i]
    return None

def delete_medication(med_id: str) -> bool:
    db = read_db()
    meds = db.get('medications', [])
    new_meds = [m for m in meds if m.get('id') != med_id]
    if len(new_meds) != len(meds):
        db['medications'] = new_meds
        write_db(db)
        return True
    return False

def record_dose(med_id: str, status: str, recorded_by: str = 'ELDERLY', skip_reason: str = '', note: str = '') -> Dict[str, Any]:
    db = read_db()
    today = datetime.now().strftime('%Y-%m-%d')
    med = next((m for m in db.get('medications', []) if m.get('id') == med_id), None)
    
    logs = db.setdefault('doseLogs', [])
    existing = next((l for l in logs if l.get('medicationId') == med_id and l.get('scheduledDate') == today), None)
    
    if existing:
        existing['status'] = status
        existing['recordedAt'] = datetime.now().isoformat()
        existing['recordedBy'] = recorded_by
        if skip_reason:
            existing['skipReason'] = skip_reason
        if note:
            existing['note'] = note
        log_entry = existing
    else:
        log_entry = {
            "id": f"log_{int(datetime.now().timestamp() * 1000)}",
            "medicationId": med_id,
            "medicationName": med.get('name', 'Unknown') if med else 'Unknown',
            "dosage": med.get('dosage', '') if med else '',
            "scheduledDate": today,
            "scheduledTime": med.get('scheduledTime', '08:00') if med else '08:00',
            "status": status,
            "recordedAt": datetime.now().isoformat(),
            "recordedBy": recorded_by,
            "skipReason": skip_reason,
            "note": note
        }
        logs.append(log_entry)
        
    if status in ['MISSED', 'SKIPPED']:
        db.setdefault('notifications', []).insert(0, {
            "id": f"notif_{int(datetime.now().timestamp() * 1000)}",
            "level": "WARNING" if status == 'MISSED' else "INFO",
            "title": f"Medication {status.capitalize()} Alert",
            "message": f"{med.get('name', 'Medication') if med else 'Medication'} was marked as {status} on {today}. Reason: {skip_reason or 'None'}.",
            "timestamp": datetime.now().isoformat(),
            "status": "DELIVERED",
            "read": False,
            "type": "MISSED_DOSE"
        })
        
    write_db(db)
    return log_entry

def get_adherence_metrics() -> Dict[str, Any]:
    db = read_db()
    logs = db.get('doseLogs', [])
    total = len(logs)
    if total == 0:
        return {"adherenceRate": 100, "taken": 0, "missed": 0, "skipped": 0, "total": 0, "streakDays": 7}
    taken = sum(1 for l in logs if l.get('status') == 'TAKEN')
    missed = sum(1 for l in logs if l.get('status') == 'MISSED')
    skipped = sum(1 for l in logs if l.get('status') == 'SKIPPED')
    rate = round((taken / total) * 100)
    return {"adherenceRate": rate, "taken": taken, "missed": missed, "skipped": skipped, "total": total, "streakDays": 8}

def get_appointments() -> List[Dict[str, Any]]:
    db = read_db()
    return sorted(db.get('appointments', []), key=lambda a: a.get('date', ''))

def add_appointment(app: Dict[str, Any]) -> Dict[str, Any]:
    db = read_db()
    app['id'] = f"app_{int(datetime.now().timestamp() * 1000)}"
    app['reminderSent'] = False
    app.setdefault('status', 'UPCOMING')
    db.setdefault('appointments', []).append(app)
    write_db(db)
    return app

def get_vitals() -> List[Dict[str, Any]]:
    db = read_db()
    return sorted(db.get('vitals', []), key=lambda v: v.get('recordedAt', ''), reverse=True)

def add_vital(vital: Dict[str, Any]) -> Dict[str, Any]:
    db = read_db()
    vital['id'] = f"vit_{int(datetime.now().timestamp() * 1000)}"
    vital['recordedAt'] = datetime.now().isoformat()
    db.setdefault('vitals', []).insert(0, vital)
    write_db(db)
    return vital

def get_family_members() -> List[Dict[str, Any]]:
    db = read_db()
    return db.get('familyMembers', [])

def add_family_member(member: Dict[str, Any]) -> Dict[str, Any]:
    db = read_db()
    member['id'] = f"fam_{int(datetime.now().timestamp() * 1000)}"
    member['lastActive'] = datetime.now().isoformat()
    member.setdefault('passcode', f"FAM-{int(datetime.now().timestamp()) % 10000:04d}")
    db.setdefault('familyMembers', []).append(member)
    write_db(db)
    return member

def get_notifications() -> List[Dict[str, Any]]:
    db = read_db()
    return db.get('notifications', [])

def trigger_sos(patient_name: str) -> Dict[str, Any]:
    db = read_db()
    sos_alert = {
        "id": f"sos_{int(datetime.now().timestamp() * 1000)}",
        "level": "EMERGENCY",
        "title": "🚨 EMERGENCY SOS TRIGGERED!",
        "message": f"{patient_name} triggered an Emergency SOS at {datetime.now().strftime('%H:%M:%S')}! Immediate caregiver attention needed.",
        "timestamp": datetime.now().isoformat(),
        "status": "DELIVERED",
        "read": False,
        "type": "EMERGENCY_SOS"
    }
    db.setdefault('notifications', []).insert(0, sos_alert)
    write_db(db)
    return sos_alert
