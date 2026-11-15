import pytest
from backend.database import (
    verify_pin,
    verify_passcode,
    get_medications,
    record_dose,
    get_adherence_metrics,
    get_patient
)
from backend.gemini_service import check_drug_interaction

def test_pin_verification_success():
    res = verify_pin("1234")
    assert res["success"] is True
    assert res["role"] == "ELDERLY"
    assert res["patient"]["name"] == "Shantabai Joshi"

def test_pin_verification_failure():
    res = verify_pin("0000")
    assert res["success"] is False
    assert res["role"] == "NONE"

def test_passcode_verification():
    res = verify_passcode("CARE-2026")
    assert res["success"] is True
    assert res["role"] == "CAREGIVER"

def test_active_medications_list():
    meds = get_medications(active_only=True)
    assert len(meds) > 0
    assert any("Telmisartan" in m["name"] for m in meds)

def test_adherence_calculation():
    metrics = get_adherence_metrics()
    assert "adherenceRate" in metrics
    assert 0 <= metrics["adherenceRate"] <= 100

def test_record_dose_action():
    log = record_dose("med_01", "TAKEN", "ELDERLY", note="Python unit test verification")
    assert log["status"] == "TAKEN"
    assert log["recordedBy"] == "ELDERLY"

def test_clinical_safety_interaction():
    res = check_drug_interaction("Aspirin 75mg", ["Telmisartan 40mg"])
    assert "warningLevel" in res
    assert isinstance(res["precautions"], list)
