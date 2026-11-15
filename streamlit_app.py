import streamlit as st
import pandas as pd
from datetime import datetime
import plotly.graph_objects as go

from backend.database import (
    get_patient,
    verify_pin,
    get_medications,
    add_medication,
    delete_medication,
    record_dose,
    get_adherence_metrics,
    get_appointments,
    add_appointment,
    get_vitals,
    add_vital,
    get_family_members,
    get_notifications,
    trigger_sos
)
from backend.gemini_service import check_drug_interaction

# ----------------- Page Setup -----------------
st.set_page_config(
    page_title="AyuCare • सोपे व सुरक्षित आरोग्य व्यवस्थापन",
    page_icon="🌿",
    layout="centered",
    initial_sidebar_state="collapsed"
)

# ----------------- Ultra-Clean Human Healthcare Design (CSS) -----------------
st.markdown("""
<style>
    /* Google Font: Plus Jakarta Sans */
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');

    /* Global Theme & Colors */
    :root {
        --bg-main: #FBFBF9;
        --card-bg: #FFFFFF;
        --teal-primary: #154D44;
        --teal-soft: #E9F1EE;
        --sage: #7A9A8B;
        --text-dark: #1E2927;
        --text-muted: #6B7774;
        --border-soft: #EBECE8;
    }

    /* Entire Page Background */
    .stApp {
        background-color: var(--bg-main) !important;
        font-family: 'Plus Jakarta Sans', -apple-system, sans-serif !important;
        color: var(--text-dark) !important;
    }

    /* Hide standard Streamlit header & decoration */
    #MainMenu, header, footer {visibility: hidden !important;}
    .block-container {
        padding-top: 1.5rem !important;
        padding-bottom: 3rem !important;
        max-width: 780px !important;
    }

    /* Top Brand Navigation */
    .brand-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #FFFFFF;
        padding: 16px 24px;
        border-radius: 20px;
        border: 1px solid var(--border-soft);
        box-shadow: 0 2px 8px rgba(0,0,0,0.03);
        margin-bottom: 24px;
    }

    .brand-title {
        font-size: 1.4rem;
        font-weight: 800;
        color: var(--teal-primary);
        display: flex;
        align-items: center;
        gap: 8px;
    }

    .brand-sub {
        font-size: 0.8rem;
        color: var(--text-muted);
        font-weight: 500;
    }

    /* Hero Focus Card (Due Medication) */
    .focus-card {
        background: #FFFFFF;
        border: 2px solid #2E7D32;
        border-radius: 24px;
        padding: 28px;
        box-shadow: 0 8px 24px rgba(46, 125, 50, 0.08);
        margin-bottom: 24px;
        position: relative;
    }

    .focus-badge {
        display: inline-block;
        background: #E8F5E9;
        color: #2E7D32;
        font-size: 0.85rem;
        font-weight: 700;
        padding: 6px 14px;
        border-radius: 30px;
        margin-bottom: 14px;
    }

    .med-title {
        font-size: 2rem;
        font-weight: 800;
        color: var(--text-dark);
        margin: 0;
        line-height: 1.2;
    }

    .med-instruction {
        font-size: 1.15rem;
        font-weight: 600;
        color: #154D44;
        margin-top: 8px;
    }

    /* Standard Card */
    .clean-card {
        background: #FFFFFF;
        border: 1px solid var(--border-soft);
        border-radius: 20px;
        padding: 20px 24px;
        box-shadow: 0 2px 6px rgba(0,0,0,0.02);
        margin-bottom: 14px;
    }

    /* Schedule Row */
    .sched-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 14px 18px;
        background: #F8F9F7;
        border-radius: 16px;
        margin-bottom: 10px;
        border: 1px solid var(--border-soft);
    }

    /* Buttons Style */
    .stButton > button {
        border-radius: 16px !important;
        font-size: 1.05rem !important;
        font-weight: 700 !important;
        padding: 14px 24px !important;
        border: none !important;
        box-shadow: 0 2px 4px rgba(0,0,0,0.04) !important;
        transition: all 0.2s ease !important;
    }

    .stButton > button:hover {
        transform: translateY(-2px) !important;
        box-shadow: 0 6px 16px rgba(21, 77, 68, 0.15) !important;
    }

    /* Tabs Clean Styling */
    .stTabs [data-baseweb="tab-list"] {
        gap: 8px !important;
        background: #FFFFFF !important;
        padding: 6px !important;
        border-radius: 18px !important;
        border: 1px solid var(--border-soft) !important;
        margin-bottom: 24px !important;
    }

    .stTabs [data-baseweb="tab"] {
        border-radius: 14px !important;
        padding: 10px 18px !important;
        font-weight: 700 !important;
        color: var(--text-muted) !important;
        background: transparent !important;
        border: none !important;
    }

    .stTabs [aria-selected="true"] {
        background: var(--teal-primary) !important;
        color: #FFFFFF !important;
    }
</style>
""", unsafe_allow_html=True)

# ----------------- State -----------------
if 'lang' not in st.session_state:
    st.session_state.lang = 'mr'

lang = st.session_state.lang
patient = get_patient()
meds = get_medications(active_only=True)
adh = get_adherence_metrics()

# ----------------- Top Human Header -----------------
col_b1, col_b2 = st.columns([3, 1])
with col_b1:
    st.markdown("""
        <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 1.8rem;">🌿</span>
            <div>
                <h1 style="font-size: 1.5rem; font-weight: 800; color: #154D44; margin: 0;">AyuCare</h1>
                <p style="font-size: 0.8rem; color: #6B7774; margin: 0; font-weight: 600;">काळजी सोपी. आरोग्य सुरक्षित.</p>
            </div>
        </div>
    """, unsafe_allow_html=True)
with col_b2:
    if st.button("मराठी / EN", use_container_width=True):
        st.session_state.lang = 'en' if lang == 'mr' else 'mr'
        st.rerun()

st.write("")

# ----------------- Patient Welcome Banner -----------------
patient_display = patient.get('marathiName') if lang == 'mr' else patient.get('name')
greeting = "शुभ सकाळ" if datetime.now().hour < 12 else "शुभ दुपार" if datetime.now().hour < 17 else "शुभ संध्याकाळ"

st.markdown(f"""
    <div style="background: linear-gradient(135deg, #154D44 0%, #1F6B5F 100%); color: white; padding: 22px 28px; border-radius: 22px; margin-bottom: 20px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
            <div>
                <span style="font-size: 0.85rem; opacity: 0.85; font-weight: 600;">{greeting}! 🙏</span>
                <h2 style="font-size: 1.8rem; font-weight: 800; margin: 2px 0 0 0; color: #FFFFFF;">{patient_display}</h2>
                <p style="font-size: 0.85rem; margin: 4px 0 0 0; opacity: 0.9;">वय: {patient.get('age')} वर्षे • रक्तगट: {patient.get('bloodGroup')} • नियमितता: {adh.get('adherenceRate')}%</p>
            </div>
            <div style="background: rgba(255,255,255,0.15); padding: 8px 16px; border-radius: 14px; text-align: center;">
                <span style="font-size: 0.75rem; opacity: 0.8; display: block;">आज</span>
                <span style="font-size: 1.1rem; font-weight: 800;">{datetime.now().strftime('%d %b')}</span>
            </div>
        </div>
    </div>
""", unsafe_allow_html=True)

# ----------------- Simple 5 Main Tabs (No Clutter) -----------------
t1, t2, t3, t4, t5 = st.tabs([
    "💊 आजची औषधे", 
    "📋 सर्व औषधे", 
    "🩺 डॉक्टरांच्या भेटी", 
    "💖 आरोग्य नोंदी", 
    "👨‍👩‍👧 कुटुंब व मदत"
])

# ==============================================================================
# TAB 1: आजची औषधे (TODAY'S DOSES - SIMPLE & PROMINENT)
# ==============================================================================
with t1:
    due_med = meds[0] if meds else None

    if due_med:
        st.markdown(f"""
            <div class="focus-card">
                <span class="focus-badge">⏰ आता घेण्याची गोळी • वेळ {due_med.get('scheduledTime')}</span>
                <h2 class="med-title">{due_med.get('marathiName' if lang == 'mr' else 'name')}</h2>
                <p style="font-size: 1.2rem; color: #2E7D32; font-weight: 700; margin: 6px 0 0 0;">{due_med.get('dosage')}</p>
                <p class="med-instruction">👉 सूचना: {due_med.get('instruction')}</p>
                <p style="color: #6B7774; font-size: 0.85rem; margin: 4px 0 0 0;">उद्देश: {due_med.get('purpose')}</p>
            </div>
        """, unsafe_allow_html=True)

        col_act1, col_act2 = st.columns(2)
        with col_act1:
            if st.button("✅ मी गोळी घेतली (Mark Taken)", type="primary", use_container_width=True):
                record_dose(due_med.get('id'), 'TAKEN', 'ELDERLY')
                st.balloons()
                st.success("शाब्बास! गोळी घेतल्याची नोंद झाली. 🙏")
        with col_act2:
            if st.button("⚠️ आज वगळली (Skip)", use_container_width=True):
                record_dose(due_med.get('id'), 'SKIPPED', 'ELDERLY', skip_reason="Patient skipped")
                st.info("गोळी वगळल्याची नोंद झाली.")

    st.write("")
    st.markdown("### 📋 आजचे संपूर्ण वेळापत्रक")

    for m in meds:
        st.markdown(f"""
            <div class="sched-item">
                <div>
                    <span style="font-size: 0.75rem; font-weight: 700; color: #154D44; background: #E9F1EE; padding: 2px 8px; border-radius: 6px;">
                        {m.get('timingCategory')} • {m.get('scheduledTime')}
                    </span>
                    <h4 style="margin: 4px 0 2px 0; font-size: 1.1rem; color: #1E2927;">{m.get('marathiName' if lang == 'mr' else 'name')}</h4>
                    <span style="font-size: 0.85rem; color: #6B7774;">{m.get('dosage')} — {m.get('instruction')}</span>
                </div>
                <div style="text-align: right;">
                    <span style="color: #2E7D32; font-weight: 700; font-size: 0.9rem;">नियोजित ⏱️</span>
                </div>
            </div>
        """, unsafe_allow_html=True)

    # Simple Mood Check-in
    st.write("")
    st.markdown("### 💖 आज कसे वाटत आहे?")
    c_feel1, c_feel2, c_feel3 = st.columns(3)
    with c_feel1:
        if st.button("🙂 छान वाटतंय", use_container_width=True):
            add_vital({"mood": "GOOD", "notes": "Feeling cheerful"})
            st.success("आनंदी मूड नोंदवला गेला! 😊")
    with c_feel2:
        if st.button("😐 ठीक आहे", use_container_width=True):
            add_vital({"mood": "OKAY", "notes": "Normal"})
            st.info("ठीक मूड नोंदवला गेला.")
    with c_feel3:
        if st.button("😵 चक्कर / थकवा", use_container_width=True):
            add_vital({"mood": "TIRED", "notes": "Dizziness / Tiredness"})
            st.warning("थकव्याची नोंद झाली. कुटुंबियांना सूचित केले आहे.")

# ==============================================================================
# TAB 2: सर्व औषधे (MEDICATIONS LIST & SIMPLE ADD FORM)
# ==============================================================================
with t2:
    st.markdown("### 💊 चालू औषधे (Prescriptions)")
    for m in meds:
        with st.container():
            st.markdown(f"""
                <div class="clean-card">
                    <div style="display: flex; justify-content: space-between; align-items: start;">
                        <div>
                            <span style="background: #E9F1EE; color: #154D44; font-size: 0.75rem; font-weight: 700; padding: 3px 8px; border-radius: 6px;">
                                {m.get('timingCategory')} • {m.get('scheduledTime')}
                            </span>
                            <h3 style="margin: 6px 0 2px 0; color: #154D44;">{m.get('name')}</h3>
                            <p style="margin: 0; font-size: 0.95rem; font-weight: 600; color: #1E2927;">{m.get('dosage')} • {m.get('instruction')}</p>
                            <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #6B7774;">डॉक्टर: {m.get('prescribingDoctor')} • उद्देश: {m.get('purpose')}</p>
                        </div>
                    </div>
                </div>
            """, unsafe_allow_html=True)

    with st.expander("➕ नवीन औषध जोडा (Add New Medicine)"):
        with st.form("simple_add_med"):
            new_name = st.text_input("गोळीचे नाव (Medicine Name)", placeholder="उदा. Amlodipine 5mg")
            c_d1, c_d2 = st.columns(2)
            with c_d1:
                new_dose = st.text_input("डोस (Dosage)", value="1 Tablet")
                new_cat = st.selectbox("वेळ वर्गवारी", ["MORNING (सकाळ)", "AFTERNOON (दुपार)", "NIGHT (रात्र)"])
            with c_d2:
                new_time = st.text_input("नक्की वेळ (24H)", value="08:30")
                new_inst = st.text_input("सूचना (Instruction)", value="After Breakfast / न्याहारीनंतर")
            new_doc = st.text_input("डॉक्टरांचे नाव", value="Dr. Ananya Kulkarni")

            if st.form_submit_button("औषध सेव्ह करा (Save)"):
                cat_val = new_cat.split(" ")[0]
                add_medication({
                    "name": new_name,
                    "marathiName": new_name,
                    "dosage": new_dose,
                    "timingCategory": cat_val,
                    "scheduledTime": new_time,
                    "instruction": new_inst,
                    "prescribingDoctor": new_doc,
                    "purpose": "Blood Pressure / Sugar"
                })
                st.success(f"{new_name} यशस्वीरित्या जोडले!")
                st.rerun()

# ==============================================================================
# TAB 3: डॉक्टरांच्या भेटी (APPOINTMENTS - SIMPLE & DIRECT)
# ==============================================================================
with t3:
    st.markdown("### 🩺 आगामी भेटी (Upcoming Doctor Consultations)")
    apps = get_appointments()
    for a in apps:
        st.markdown(f"""
            <div class="clean-card">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                    <div>
                        <span style="background: #E8F0EC; color: #154D44; font-size: 0.75rem; font-weight: 700; padding: 4px 10px; border-radius: 8px;">
                            {a.get('specialty')}
                        </span>
                        <h3 style="margin: 8px 0 2px 0; color: #154D44;">{a.get('doctorName')}</h3>
                        <p style="margin: 0; color: #6B7774; font-size: 0.85rem;">🏥 {a.get('hospital')}</p>
                    </div>
                    <div style="text-align: right;">
                        <span style="font-size: 1.1rem; font-weight: 800; color: #1E2927;">{a.get('date')}</span><br/>
                        <span style="font-size: 0.85rem; color: #6B7774;">{a.get('time')}</span>
                    </div>
                </div>
                <div style="margin-top: 10px; font-size: 0.85rem; background: #F8F9F7; padding: 8px 12px; border-radius: 10px;">
                    <strong>उद्देश:</strong> {a.get('purpose')}
                </div>
                <div style="margin-top: 8px;">
                    <a href="tel:{a.get('phone')}" style="text-decoration: none; font-size: 0.9rem; font-weight: 700; color: #154D44;">
                        📞 थेट कॉल करा: {a.get('phone')}
                    </a>
                </div>
            </div>
        """, unsafe_allow_html=True)

# ==============================================================================
# TAB 4: आरोग्य नोंदी (VITALS & HEALTH STATUS)
# ==============================================================================
with t4:
    st.markdown("### 💖 रक्तदाब व साखर तपासणी (Vitals)")
    vits = get_vitals()

    col_v1, col_v2 = st.columns(2)
    with col_v1:
        st.markdown(f"""
            <div class="clean-card" style="text-align: center;">
                <span style="font-size: 0.8rem; color: #6B7774; font-weight: 700; text-transform: uppercase;">रक्तदाब (Blood Pressure)</span>
                <h2 style="font-size: 2.2rem; color: #154D44; margin: 6px 0;">{vits[0].get('bpSystolic')}/{vits[0].get('bpDiastolic')}</h2>
                <span style="color: #2E7D32; font-size: 0.85rem; font-weight: 700;">सामान्य (Normal) ✅</span>
            </div>
        """, unsafe_allow_html=True)
    with col_v2:
        st.markdown(f"""
            <div class="clean-card" style="text-align: center;">
                <span style="font-size: 0.8rem; color: #6B7774; font-weight: 700; text-transform: uppercase;">रक्तातील साखर (Sugar)</span>
                <h2 style="font-size: 2.2rem; color: #154D44; margin: 6px 0;">{vits[0].get('bloodSugar')} <span style="font-size: 1rem; color: #6B7774;">mg/dL</span></h2>
                <span style="color: #2E7D32; font-size: 0.85rem; font-weight: 700;">नियंत्रणात (In Range) ✅</span>
            </div>
        """, unsafe_allow_html=True)

    with st.expander("📝 नवीन तपासणी नोंदवा (Log New Vitals)"):
        with st.form("new_vital_form"):
            col_in1, col_in2 = st.columns(2)
            with col_in1:
                sys = st.number_input("Systolic BP (वरचा)", 90, 220, 124)
                dia = st.number_input("Diastolic BP (खालचा)", 60, 140, 82)
            with col_in2:
                sug = st.number_input("Blood Sugar mg/dL", 60, 400, 135)
                pul = st.number_input("Pulse bpm (नाडी)", 50, 150, 74)
            if st.form_submit_button("नोंद सेव्ह करा"):
                add_vital({
                    "mood": "GOOD",
                    "bpSystolic": sys,
                    "bpDiastolic": dia,
                    "bloodSugar": sug,
                    "pulseRate": pul,
                    "notes": "Daily check"
                })
                st.success("नोंद झाली!")
                st.rerun()

# ==============================================================================
# TAB 5: कुटुंब व मदत (FAMILY, CAREGIVERS & EMERGENCY SOS)
# ==============================================================================
with t5:
    st.markdown("### 👨‍👩‍👧 काळजीवाहू व कुटुंब संपर्क (Family Circle)")
    fams = get_family_members()
    for f in fams:
        st.markdown(f"""
            <div class="clean-card">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <span style="background: #154D44; color: white; padding: 2px 8px; border-radius: 6px; font-size: 0.75rem; font-weight: 700;">
                            {f.get('relationship')}
                        </span>
                        <h4 style="margin: 4px 0 2px 0; color: #1E2927;">{f.get('name')}</h4>
                        <span style="font-size: 0.85rem; color: #6B7774;">📞 {f.get('phone')} • ✉️ {f.get('email')}</span>
                    </div>
                    <div>
                        <a href="tel:{f.get('phone')}" style="display: inline-block; background: #E9F1EE; color: #154D44; padding: 8px 14px; border-radius: 12px; font-weight: 700; text-decoration: none;">
                            📞 कॉल करा
                        </a>
                    </div>
                </div>
            </div>
        """, unsafe_allow_html=True)

    st.write("")
    st.markdown("---")
    st.markdown("### 🚨 तातडीची मदत (Emergency SOS)")
    st.caption("अडचण आल्यास हे बटण दाबा — कुटुंबियांना तातडीचा फोन व सायरन वाजेल")

    if st.button("🚨 EMERGENCY SOS दाबा (तातडीची मदत)", type="primary", use_container_width=True):
        trigger_sos(patient.get('name'))
        st.error("🚨 तातडीचा अलर्ट पाठवला आहे! मुलगा राजेश जोशी (+91 98765 43210) यांना कॉल केला जात आहे.")
