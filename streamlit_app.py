import streamlit as st
import pandas as pd
import json
from datetime import datetime
import plotly.express as px
import plotly.graph_objects as go

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

# ----------------- Page Configuration -----------------
st.set_page_config(
    page_title="AyuCare - Elderly Healthcare Platform",
    page_icon="🏥",
    layout="wide",
    initial_sidebar_state="expanded"
)

# ----------------- Professional Theme CSS -----------------
st.markdown("""
<style>
    /* Premium Healthcare Color System */
    :root {
        --primary-teal: #174D46;
        --secondary-sage: #8EAA98;
        --warm-ivory: #F7F7F2;
        --surface-white: #FFFFFF;
        --text-charcoal: #202B29;
        --text-muted: #737D79;
    }
    
    .stApp {
        background-color: #F7F7F2;
        color: #202B29;
        font-family: 'Inter', -apple-system, sans-serif;
    }
    
    /* Elegant Sidebar */
    [data-testid="stSidebar"] {
        background-color: #174D46 !important;
        color: #FFFFFF !important;
    }
    
    [data-testid="stSidebar"] * {
        color: #FFFFFF !important;
    }
    
    /* Clean White Metric Cards */
    .metric-card {
        background: #FFFFFF;
        padding: 24px;
        border-radius: 16px;
        border: 1px solid #E5E7EB;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        margin-bottom: 16px;
    }
    
    .metric-val {
        font-size: 2.2rem;
        font-weight: 800;
        color: #174D46;
    }
    
    .metric-lbl {
        font-size: 0.85rem;
        font-weight: 600;
        text-transform: uppercase;
        color: #737D79;
        letter-spacing: 0.05em;
    }
    
    /* Giant Touch Action Buttons */
    .stButton > button {
        border-radius: 12px;
        font-weight: 700;
        transition: all 0.2s ease;
    }
    
    .stButton > button:hover {
        transform: translateY(-1px);
        box-shadow: 0 4px 12px rgba(23, 77, 70, 0.2);
    }
</style>
""", unsafe_allow_html=True)

# ----------------- Session State Initialization -----------------
if 'user_role' not in st.session_state:
    st.session_state.user_role = 'ELDERLY'  # 'ELDERLY' | 'CAREGIVER' | 'FAMILY_MEMBER'
if 'language' not in st.session_state:
    st.session_state.language = 'mr'  # 'mr' | 'en'
if 'patient' not in st.session_state:
    st.session_state.patient = get_patient()

patient = st.session_state.patient
lang = st.session_state.language

# ----------------- Sidebar Navigation -----------------
with st.sidebar:
    st.markdown("""
        <div style="padding: 10px 0 20px 0; border-bottom: 1px solid rgba(255,255,255,0.15);">
            <h1 style="font-size: 1.8rem; font-weight: 900; margin: 0; color: #FFFFFF;">🏥 AyuCare</h1>
            <p style="font-size: 0.75rem; color: #8EAA98; margin: 4px 0 0 0; font-weight: 500;">
                Smarter Care. Safer Living. Together.
            </p>
        </div>
    """, unsafe_allow_html=True)

    # Patient Status Card
    st.markdown(f"""
        <div style="background: rgba(255,255,255,0.1); padding: 14px; border-radius: 12px; margin: 15px 0;">
            <p style="margin: 0; font-size: 0.75rem; color: #8EAA98; text-transform: uppercase; font-weight: 700;">Active Patient</p>
            <p style="margin: 2px 0 0 0; font-size: 1.1rem; font-weight: 800;">{patient.get('marathiName' if lang == 'mr' else 'name')}</p>
            <p style="margin: 0; font-size: 0.8rem; opacity: 0.85;">Age: {patient.get('age')} • Blood: {patient.get('bloodGroup')}</p>
        </div>
    """, unsafe_allow_html=True)

    nav_options = [
        "🏠 Executive Overview",
        "💊 Medication Management",
        "📅 Medication Calendar",
        "🩺 Doctor Appointments",
        "👨‍👩‍👧 Family & Caregivers",
        "📊 Health Reports & Analytics",
        "💖 Daily Wellness Check-in",
        "🚨 Emergency Assistance",
        "🔔 Notifications & Alerts",
        "⚙️ Settings & Security"
    ]
    selected_nav = st.radio("Navigation", nav_options, label_visibility="collapsed")

    st.markdown("---")
    # Quick Language & Role Switcher in Sidebar
    col_l1, col_l2 = st.columns(2)
    with col_l1:
        if st.button("मराठी" if lang == 'en' else "English", use_container_width=True):
            st.session_state.language = 'mr' if lang == 'en' else 'en'
            st.rerun()
    with col_l2:
        roles = ['ELDERLY', 'CAREGIVER', 'FAMILY_MEMBER']
        curr_idx = roles.index(st.session_state.user_role)
        next_role = roles[(curr_idx + 1) % len(roles)]
        if st.button(f"Role: {st.session_state.user_role[:4]}", use_container_width=True):
            st.session_state.user_role = next_role
            st.rerun()

# ----------------- Top Header Bar -----------------
col_h1, col_h2 = st.columns([3, 1])
with col_h1:
    role_badge = {
        'ELDERLY': "👵 Elderly Individual (वयोवृद्ध मोड)",
        'CAREGIVER': "👨‍⚕️ Primary Caregiver (केअरटेकर मोड)",
        'FAMILY_MEMBER': "👨‍👩‍👧 Family Member (कुटुंब सदस्य)"
    }.get(st.session_state.user_role, "User")
    
    st.markdown(f"""
        <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 20px;">
            <span style="background: #174D46; color: white; padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 700;">
                {role_badge}
            </span>
            <span style="color: #737D79; font-size: 0.85rem; font-weight: 600;">
                {datetime.now().strftime('%A, %d %B %Y')}
            </span>
        </div>
    """, unsafe_allow_html=True)

# ==============================================================================
# VIEW 1: EXECUTIVE OVERVIEW DASHBOARD
# ==============================================================================
if selected_nav == "🏠 Executive Overview":
    st.title("Healthcare Overview" if lang == 'en' else "दैनिक आरोग्य आढावा")
    st.caption("Real-time summary of daily adherence, upcoming doses, and clinical vitals")

    # Top KPI Metrics Row
    adh = get_adherence_metrics()
    meds = get_medications(active_only=True)
    apps = get_appointments()
    vits = get_vitals()

    m1, m2, m3, m4 = st.columns(4)
    with m1:
        st.markdown(f"""
            <div class="metric-card">
                <div class="metric-lbl">{'Adherence Rate' if lang == 'en' else 'नियमितता दर'}</div>
                <div class="metric-val">{adh.get('adherenceRate')}%</div>
                <div style="color: #2E7D32; font-size: 0.8rem; font-weight: 700; margin-top: 4px;">🎯 Excellent Streak</div>
            </div>
        """, unsafe_allow_html=True)
    with m2:
        st.markdown(f"""
            <div class="metric-card">
                <div class="metric-lbl">{'Active Prescriptions' if lang == 'en' else 'सक्रिय औषधे'}</div>
                <div class="metric-val">{len(meds)}</div>
                <div style="color: #737D79; font-size: 0.8rem; font-weight: 600; margin-top: 4px;">4 Daily Doses</div>
            </div>
        """, unsafe_allow_html=True)
    with m3:
        st.markdown(f"""
            <div class="metric-card">
                <div class="metric-lbl">{'Next Doctor Visit' if lang == 'en' else 'पुढील भेट'}</div>
                <div class="metric-val" style="font-size: 1.6rem;">Nov 20</div>
                <div style="color: #174D46; font-size: 0.8rem; font-weight: 700; margin-top: 4px;">Dr. Kulkarni (Cardio)</div>
            </div>
        """, unsafe_allow_html=True)
    with m4:
        latest_bp = f"{vits[0].get('bpSystolic')}/{vits[0].get('bpDiastolic')}" if vits else "124/82"
        st.markdown(f"""
            <div class="metric-card">
                <div class="metric-lbl">{'Latest Blood Pressure' if lang == 'en' else 'रक्तदाब (BP)'}</div>
                <div class="metric-val" style="font-size: 1.6rem;">{latest_bp}</div>
                <div style="color: #2E7D32; font-size: 0.8rem; font-weight: 700; margin-top: 4px;">Stable / Normal</div>
            </div>
        """, unsafe_allow_html=True)

    # Next Due Medicine Focus Card
    st.subheader("Current Due Medication" if lang == 'en' else "आता घेण्याची गोळी")
    if meds:
        next_med = meds[0]
        col_med1, col_med2 = st.columns([2, 1])
        with col_med1:
            st.info(f"💊 **{next_med.get('marathiName' if lang == 'mr' else 'name')}** • {next_med.get('dosage')}\n\n👉 **Instruction:** {next_med.get('instruction')}\n\n⏰ **Scheduled Time:** {next_med.get('scheduledTime')} ({next_med.get('timingCategory')})")
        with col_med2:
            st.write("### Actions")
            if st.button("✅ Mark as Taken (घेतले)", type="primary", use_container_width=True):
                record_dose(next_med.get('id'), 'TAKEN', st.session_state.user_role)
                st.success("Dose successfully recorded as Taken!")
                st.rerun()
            if st.button("⚠️ Skip Dose (वगळले)", use_container_width=True):
                record_dose(next_med.get('id'), 'SKIPPED', st.session_state.user_role, skip_reason="Patient fasting / nausea")
                st.warning("Dose marked as Skipped.")
                st.rerun()

    # Adherence Trend Visualization
    st.subheader("Weekly Adherence & Compliance" if lang == 'en' else "साप्ताहिक नियमितता आलेख")
    days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
    scores = [100, 100, 80, 100, 100, 75, 100]
    fig = go.Figure(data=[
        go.Bar(x=days, y=scores, marker_color='#174D46', text=[f"{s}%" for s in scores], textposition='auto')
    ])
    fig.update_layout(
        plot_bgcolor='white',
        paper_bgcolor='white',
        margin=dict(t=10, b=10, l=10, r=10),
        height=260,
        yaxis=dict(range=[0, 110], title="Adherence %")
    )
    st.plotly_chart(fig, use_container_width=True)

# ==============================================================================
# VIEW 2: MEDICATION MANAGEMENT
# ==============================================================================
elif selected_nav == "💊 Medication Management":
    st.title("Medication Management" if lang == 'en' else "औषध वेळापत्रक व व्यवस्थापन")
    st.caption("Manage prescribed dosages, timing, food instructions, and safety guard")

    tab1, tab2, tab3 = st.tabs(["Active Medications", "➕ Add New Medication", "📸 Gemini Vision OCR Scanner"])

    with tab1:
        meds = get_medications()
        for med in meds:
            with st.expander(f"💊 {med.get('name')} ({med.get('scheduledTime')}) - {med.get('timingCategory')}", expanded=True):
                c1, c2, c3 = st.columns([2, 1, 1])
                with c1:
                    st.write(f"**Dosage:** {med.get('dosage')}")
                    st.write(f"**Instruction:** {med.get('instruction')}")
                    st.write(f"**Purpose:** {med.get('purpose')}")
                    st.write(f"**Prescribed By:** {med.get('prescribingDoctor')}")
                with c2:
                    st.write(f"**Color & Shape:** {med.get('pillColor')} {med.get('shape')}")
                    st.write(f"**Frequency:** {med.get('frequency')}")
                    if med.get('precautions'):
                        st.warning(f"⚠️ {med.get('precautions')}")
                with c3:
                    if st.button("Mark Taken", key=f"take_{med.get('id')}", use_container_width=True):
                        record_dose(med.get('id'), 'TAKEN', st.session_state.user_role)
                        st.success("Recorded!")
                    if st.button("Delete", key=f"del_{med.get('id')}", use_container_width=True):
                        delete_medication(med.get('id'))
                        st.rerun()

    with tab2:
        st.subheader("Add Prescribed Medication")
        with st.form("add_med_form"):
            name = st.text_input("Medicine Name (e.g. Amlodipine 5mg)")
            col_f1, col_f2 = st.columns(2)
            with col_f1:
                dosage = st.text_input("Dosage", "1 Tablet (५ मि.ग्रॅ.)")
                timing = st.selectbox("Timing Category", ["MORNING", "AFTERNOON", "EVENING", "NIGHT"])
            with col_f2:
                time_str = st.text_input("Scheduled Time (24H)", "08:30")
                instruction = st.text_input("Instruction", "After Breakfast / न्याहारीनंतर")
            
            doctor = st.text_input("Prescribing Doctor", "Dr. Ananya Kulkarni")
            purpose = st.text_input("Medical Purpose", "Hypertension Blood Pressure control")

            submitted = st.form_submit_button("Save Medication & Check Interactions")
            if submitted and name:
                current_names = [m.get('name') for m in get_medications(True)]
                safety = check_drug_interaction(name, current_names)
                if safety.get('warningLevel') != 'LOW':
                    st.warning(f"⚠️ Clinical Safety Alert: {safety.get('message')}")
                add_medication({
                    "name": name,
                    "marathiName": name,
                    "dosage": dosage,
                    "timingCategory": timing,
                    "scheduledTime": time_str,
                    "instruction": instruction,
                    "prescribingDoctor": doctor,
                    "purpose": purpose,
                    "precautions": safety.get('message')
                })
                st.success("Medication successfully saved to schedule!")
                st.rerun()

    with tab3:
        st.subheader("Gemini 2.5 Flash Vision OCR")
        st.write("Upload a prescription slip or medicine strip photo to auto-extract details:")
        uploaded_file = st.file_uploader("Choose an image", type=['png', 'jpg', 'jpeg'])
        if uploaded_file is not None:
            st.image(uploaded_file, caption="Uploaded Prescription", width=350)
            if st.button("Extract with Gemini AI", type="primary"):
                with st.spinner("Analyzing prescription with Google Gemini Vision..."):
                    res = scan_prescription_image(uploaded_file.getvalue())
                    st.success("Extracted Medications:")
                    st.json(res)
                    for m in res.get('medicines', []):
                        if st.button(f"➕ Add {m.get('name')} to Regimen", key=f"ocr_add_{m.get('name')}"):
                            add_medication(m)
                            st.success(f"{m.get('name')} added to schedule!")
                            st.rerun()

# ==============================================================================
# VIEW 3: MEDICATION CALENDAR
# ==============================================================================
elif selected_nav == "📅 Medication Calendar":
    st.title("Medication Schedule Calendar" if lang == 'en' else "औषध कॅलेंडर")
    st.caption("Interactive daily and weekly schedule timeline")

    meds = get_medications(active_only=True)
    calendar_data = []
    for m in meds:
        calendar_data.append({
            "Medicine": m.get('name'),
            "Timing": m.get('timingCategory'),
            "Time": m.get('scheduledTime'),
            "Dosage": m.get('dosage'),
            "Doctor": m.get('prescribingDoctor')
        })
    df_cal = pd.DataFrame(calendar_data)
    st.dataframe(df_cal, use_container_width=True)

# ==============================================================================
# VIEW 4: DOCTOR APPOINTMENTS
# ==============================================================================
elif selected_nav == "🩺 Doctor Appointments":
    st.title("Doctor Appointments" if lang == 'en' else "डॉक्टरांच्या भेटी")
    st.caption("Track consultations, hospital locations, and routine clinical checkups")

    c_a1, c_a2 = st.columns([2, 1])
    with c_a1:
        apps = get_appointments()
        for a in apps:
            st.markdown(f"""
                <div class="metric-card">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <span style="background: #E1EDEB; color: #174D46; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 8px;">
                                {a.get('specialty')}
                            </span>
                            <h3 style="margin: 8px 0 2px 0; color: #174D46;">{a.get('doctorName')}</h3>
                            <p style="margin: 0; color: #737D79; font-size: 0.85rem;">{a.get('hospital')}</p>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-size: 1.1rem; font-weight: 800; color: #202B29;">{a.get('date')}</span><br/>
                            <span style="font-size: 0.85rem; color: #737D79;">{a.get('time')}</span>
                        </div>
                    </div>
                    <div style="margin-top: 12px; font-size: 0.85rem; background: #F7F7F2; padding: 8px 12px; border-radius: 8px;">
                        <strong>Purpose:</strong> {a.get('purpose')}
                    </div>
                    <p style="margin: 8px 0 0 0; font-size: 0.85rem; color: #174D46; font-weight: 700;">📞 Contact: {a.get('phone')}</p>
                </div>
            """, unsafe_allow_html=True)
            
    with c_a2:
        st.subheader("Schedule New Appointment")
        with st.form("add_app_form"):
            doc_name = st.text_input("Doctor Name")
            spec = st.text_input("Specialty", "Cardiologist")
            hosp = st.text_input("Hospital / Clinic", "City Care Hospital")
            app_date = st.date_input("Date")
            app_time = st.text_input("Time", "10:30 AM")
            phone = st.text_input("Clinic Phone", "+91 99887 76655")
            purpose = st.text_input("Purpose", "Routine checkup")

            if st.form_submit_button("Book Appointment"):
                add_appointment({
                    "doctorName": doc_name,
                    "specialty": spec,
                    "hospital": hosp,
                    "date": str(app_date),
                    "time": app_time,
                    "phone": phone,
                    "purpose": purpose
                })
                st.success("Appointment Scheduled!")
                st.rerun()

# ==============================================================================
# VIEW 5: FAMILY & CAREGIVERS
# ==============================================================================
elif selected_nav == "👨‍👩‍👧 Family & Caregivers":
    st.title("Family & Caregiver Ecosystem" if lang == 'en' else "कुटुंब व केअरटेकर नेटवर्क")
    st.caption("Collaborative circle with secure passcode-based access and granular permissions")

    members = get_family_members()
    for m in members:
        with st.container():
            st.markdown(f"""
                <div class="metric-card">
                    <div style="display: flex; justify-content: space-between;">
                        <div>
                            <span style="background: #174D46; color: white; padding: 3px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">
                                {m.get('role')}
                            </span>
                            <h3 style="margin: 6px 0 2px 0;">{m.get('name')} ({m.get('relationship')})</h3>
                            <p style="margin: 0; color: #737D79; font-size: 0.85rem;">Email: {m.get('email')} • Phone: {m.get('phone')}</p>
                        </div>
                        <div style="text-align: right;">
                            <span style="font-family: monospace; background: #E1EDEB; padding: 6px 12px; border-radius: 8px; font-weight: 700; color: #174D46;">
                                Passcode: {m.get('passcode')}
                            </span>
                        </div>
                    </div>
                </div>
            """, unsafe_allow_html=True)

# ==============================================================================
# VIEW 6: HEALTH REPORTS & ANALYTICS
# ==============================================================================
elif selected_nav == "📊 Health Reports & Analytics":
    st.title("Healthcare Reports & Analytics" if lang == 'en' else "आरोग्य अहवाल व विश्लेषण")
    st.caption("Exportable clinical summary and compliance metrics for doctor reviews")

    adh = get_adherence_metrics()
    st.markdown(f"""
        <div style="background: white; border: 1px solid #E5E7EB; border-radius: 16px; padding: 24px; margin-bottom: 20px;">
            <h2>Clinical Healthcare Summary</h2>
            <p><strong>Patient:</strong> {patient.get('name')} (Age: {patient.get('age')})</p>
            <p><strong>Medical Adherence:</strong> {adh.get('adherenceRate')}% compliance ({adh.get('taken')} taken, {adh.get('missed')} missed, {adh.get('skipped')} skipped)</p>
            <p><strong>Known Conditions:</strong> {', '.join(patient.get('chronicConditions', []))}</p>
            <p><strong>Known Allergies:</strong> {', '.join(patient.get('allergies', []))}</p>
        </div>
    """, unsafe_allow_html=True)

    summary_text = f"""AYUCARE CLINICAL HEALTHCARE REPORT
Patient: {patient.get('name')} (Age {patient.get('age')}, Blood Group {patient.get('bloodGroup')})
Generated: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}
Adherence Compliance: {adh.get('adherenceRate')}%
Active Medications: {len(get_medications(True))}
Next Consultation: Nov 20, 2026 (Dr. Ananya Kulkarni)
"""
    st.download_button(
        label="📄 Download Official Medical Report (Text/PDF)",
        data=summary_text,
        file_name=f"AyuCare_Report_{patient.get('name')}.txt",
        mime="text/plain"
    )

# ==============================================================================
# VIEW 7: DAILY WELLNESS
# ==============================================================================
elif selected_nav == "💖 Daily Wellness Check-in":
    st.title("Daily Wellness & Vitals" if lang == 'en' else "दैनिक आरोग्य व Vitals तपासणी")
    st.caption("Track daily emotional wellbeing, Blood Pressure, and Glucose levels")

    st.subheader("How are you feeling today?" if lang == 'en' else "आज कसे वाटत आहे?")
    c_m1, c_m2, c_m3 = st.columns(3)
    with c_m1:
        if st.button("🙂 Feeling Good (छान)", use_container_width=True):
            add_vital({"mood": "GOOD", "notes": "Feeling energetic"})
            st.success("Mood recorded: Good!")
    with c_m2:
        if st.button("😐 Feeling Okay (ठीक)", use_container_width=True):
            add_vital({"mood": "OKAY", "notes": "Normal day"})
            st.info("Mood recorded: Okay")
    with c_m3:
        if st.button("😵 Tired / Dizzy (थकवा)", use_container_width=True):
            add_vital({"mood": "TIRED", "notes": "Mild dizziness reported"})
            st.warning("Mood recorded: Tired. Caregiver notified.")

    st.write("---")
    st.subheader("Log Vitals")
    with st.form("vitals_form"):
        cv1, cv2, cv3 = st.columns(3)
        with cv1:
            bp_sys = st.number_input("Systolic BP (उदा. 120)", 90, 220, 124)
            bp_dia = st.number_input("Diastolic BP (उदा. 80)", 60, 140, 82)
        with cv2:
            sugar = st.number_input("Blood Sugar mg/dL (साखर)", 60, 400, 135)
        with cv3:
            pulse = st.number_input("Pulse bpm (नाडी)", 40, 180, 74)
        v_notes = st.text_input("Notes", "Morning check")

        if st.form_submit_button("Save Vitals"):
            add_vital({
                "mood": "GOOD",
                "bpSystolic": bp_sys,
                "bpDiastolic": bp_dia,
                "bloodSugar": sugar,
                "pulseRate": pulse,
                "notes": v_notes
            })
            st.success("Vitals saved successfully!")
            st.rerun()

# ==============================================================================
# VIEW 8: EMERGENCY ASSISTANCE
# ==============================================================================
elif selected_nav == "🚨 Emergency Assistance":
    st.title("Emergency SOS Assistance" if lang == 'en' else "तातडीची मदत (Emergency SOS)")
    st.caption("One-tap emergency trigger, audible siren, and family notifications")

    st.markdown("""
        <div style="background: #FEE2E2; border: 2px solid #DC2626; padding: 24px; border-radius: 20px; text-align: center; margin-bottom: 24px;">
            <h2 style="color: #991B1B; margin-top: 0;">EMERGENCY SOS ASSISTANCE</h2>
            <p style="color: #7F1D1D; font-size: 1.1rem; font-weight: 600;">
                Clicking the button below sends an instant high-priority alert to all designated family members & doctors.
            </p>
        </div>
    """, unsafe_allow_html=True)

    if st.button("🚨 TRIGGER EMERGENCY SOS (तातडीची मदत)", type="primary", use_container_width=True):
        trigger_sos(patient.get('name'))
        st.error(f"🚨 EMERGENCY ALERT DISPATCHED TO {patient.get('emergencyContacts', [{}])[0].get('name')} ({patient.get('emergencyContacts', [{}])[0].get('phone')})")

    st.subheader("Designated Emergency Contacts")
    for ec in patient.get('emergencyContacts', []):
        st.write(f"📞 **{ec.get('name')}** ({ec.get('relationship')}) — `{ec.get('phone')}` {'⭐ Primary' if ec.get('isPrimary') else ''}")

# ==============================================================================
# VIEW 9: NOTIFICATIONS & ALERTS
# ==============================================================================
elif selected_nav == "🔔 Notifications & Alerts":
    st.title("Notifications & Audit Trail" if lang == 'en' else "सूचना व अलर्ट्स इतिहास")
    st.caption("Delivery audit of scheduled medication reminders, missed doses, and escalations")

    notifs = get_notifications()
    for n in notifs:
        st.markdown(f"""
            <div class="metric-card" style="border-left: 5px solid {'#DC2626' if n.get('level') == 'EMERGENCY' else '#D97706' if n.get('level') == 'WARNING' else '#174D46'};">
                <div style="display: flex; justify-content: space-between;">
                    <h4 style="margin: 0; color: #174D46;">{n.get('title')}</h4>
                    <span style="font-size: 0.75rem; color: #737D79;">{n.get('timestamp')} • <strong>Status: {n.get('status')}</strong></span>
                </div>
                <p style="margin: 6px 0 0 0; color: #202B29; font-size: 0.9rem;">{n.get('message')}</p>
            </div>
        """, unsafe_allow_html=True)

# ==============================================================================
# VIEW 10: SETTINGS & SECURITY
# ==============================================================================
elif selected_nav == "⚙️ Settings & Security":
    st.title("Settings & Security" if lang == 'en' else "सेटिंग्ज व सुरक्षितता")
    st.caption("Manage PIN codes, role access, language, and accessibility modes")

    st.subheader("Passcode & PIN Security")
    st.write(f"👵 **Elderly 4-Digit Quick PIN:** `{patient.get('pin')}`")
    st.write("👨‍⚕️ **Primary Caregiver Passcode:** `CARE-2026`")
    st.write("🩺 **Attending Physician Passcode:** `DOC-2026`")

    st.subheader("Accessibility")
    st.checkbox("High Contrast Mode (काळ्यावर पिवळा मजकूर - दृष्टी दोषासाठी)")
    st.selectbox("Font Size Hierarchy", ["Standard (A)", "Large (A+)", "Extra Large (A++)"])
