import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List, Union
from groq import Groq
from dotenv import load_dotenv
from rag_engine import RAGEngine
import json

# ============================================================
# Configuration
# ============================================================
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
load_dotenv(os.path.join(BASE_DIR, '.env'))

# Initialize Groq client
GROQ_API_KEY = os.getenv("GROQ_API_KEY")
groq_client = None
if GROQ_API_KEY:
    try:
        groq_client = Groq(api_key=GROQ_API_KEY)
        print("[Groq] Client initialized successfully!")
    except Exception as e:
        print(f"[Groq] Error initializing client: {e}")
else:
    print("[Groq] WARNING: GROQ_API_KEY not found.")

# RAG engine (loaded at startup)
rag_engine = None

# ============================================================
# FastAPI App
# ============================================================
app = FastAPI(
    title="CekTenang RAG Service",
    description="Evidence-based weekly insight & recommendation service powered by RAG",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Pydantic Schemas
# ============================================================
class DailyHistoryItem(BaseModel):
    activity_date: Optional[str] = None
    sleep_hours: Optional[float] = None
    physical_activity_minutes: Optional[float] = None
    study_hours: Optional[float] = None
    screen_time_hours: Optional[float] = None
    social_media_hours: Optional[float] = None
    caffeine_intake_mg: Optional[float] = None
    mood_score: Optional[float] = None
    fatigue_level: Optional[float] = None
    assignment_load: Optional[float] = None
    deadline_pressure: Optional[float] = None
    social_interaction_score: Optional[float] = None
    financial_worry_score: Optional[float] = None
    health_condition_score: Optional[float] = None
    social_media_ratio: Optional[float] = None
    study_screen_balance: Optional[float] = None
    academic_pressure_index: Optional[float] = None
    recovery_index: Optional[float] = None
    digital_pressure_index: Optional[float] = None
    stress_level: Optional[str] = None

class WeeklyRAGRequest(BaseModel):
    user_id: Union[str, int]
    weekly_stress_prediction: str
    history: List[DailyHistoryItem]

class RAGTextItem(BaseModel):
    category: str
    priority_level: str
    title: str
    text: str

class WeeklyRAGResponse(BaseModel):
    success: bool
    user_id: Union[str, int]
    insight: str
    recommendations: List[RAGTextItem]


# ============================================================
# Startup
# ============================================================
@app.on_event("startup")
def startup_rag():
    """Load RAG engine at startup. If it fails, /weekly-rag returns error."""
    global rag_engine
    try:
        rag_engine = RAGEngine()
        print("[RAG] Engine initialized successfully!")
    except Exception as e:
        print(f"[RAG] WARNING: RAG disabled - {e}")


# ============================================================
# Endpoints
# ============================================================
@app.get("/")
def root():
    return {
        "service": "CekTenang RAG Service",
        "status": "running",
        "endpoints": ["/weekly-rag", "/health"]
    }

@app.get("/health")
def health():
    return {
        "status": "ok",
        "services": {
            "groq_client": groq_client is not None,
            "rag_vectorstore": rag_engine is not None
        }
    }

@app.post("/weekly-rag", response_model=WeeklyRAGResponse)
def generate_weekly_rag(req: WeeklyRAGRequest):
    if not groq_client:
        raise HTTPException(status_code=500, detail="Groq API client is not configured. Please set GROQ_API_KEY.")

    # 1. Structure student data context
    history_summary = []
    for idx, day in enumerate(req.history):
        day_info = f"Day {idx+1} ({day.activity_date or 'N/A'}): "
        metrics = []
        if day.sleep_hours is not None:
            metrics.append(f"Sleep: {day.sleep_hours} hrs")
        if day.study_hours is not None:
            metrics.append(f"Study: {day.study_hours} hrs")
        if day.screen_time_hours is not None:
            metrics.append(f"Screen Time: {day.screen_time_hours} hrs")
        if day.physical_activity_minutes is not None:
            metrics.append(f"Exercise: {day.physical_activity_minutes} mins")
        if day.mood_score is not None:
            metrics.append(f"Mood: {day.mood_score}/10")
        if day.fatigue_level is not None:
            metrics.append(f"Fatigue: {day.fatigue_level}/10")
        if day.academic_pressure_index is not None:
            metrics.append(f"Academic Pressure Index: {day.academic_pressure_index:.2f}")
        if day.recovery_index is not None:
            metrics.append(f"Recovery Index: {day.recovery_index:.2f}")
        if day.digital_pressure_index is not None:
            metrics.append(f"Digital Pressure Index: {day.digital_pressure_index:.2f}")
        if day.stress_level is not None:
            metrics.append(f"Predicted Stress: {day.stress_level}")

        day_info += ", ".join(metrics)
        history_summary.append(day_info)

    history_context = "\n".join(history_summary)

    # 2. RAG: Retrieve scientific evidence
    rag_context = ""
    if rag_engine is not None:
        try:
            history_dicts = [
                day.model_dump() if hasattr(day, 'model_dump') else day.dict()
                for day in req.history
            ]
            query = rag_engine.build_rag_query(history_dicts, req.weekly_stress_prediction)
            rag_context = rag_engine.retrieve_context(query, top_k=3)
            print(f"[RAG] Retrieved context for user {req.user_id} ({len(rag_context)} chars)")
            print(f"[RAG] Query: {query[:200]}...")
        except Exception as e:
            print(f"[RAG] Retrieval failed, proceeding without evidence: {e}")
            rag_context = ""
    else:
        print("[RAG] Engine not available, proceeding without scientific evidence.")

    # 3. System instruction (rules only)
    system_instruction = (
        "Anda adalah asisten AI psikolog dan coach gaya hidup mahasiswa yang empati, profesional, dan solutif.\n"
        "Tugas Anda adalah menganalisis data aktivitas mingguan mahasiswa untuk mendeteksi tren stres, kesehatan, dan produktivitas mereka.\n\n"
        "ATURAN OUTPUT:\n"
        "1. Output WAJIB berupa objek JSON valid dengan struktur persis seperti berikut:\n"
        "{\n"
        "  \"insight\": \"1 kalimat analisis mendalam tentang tren stres dan faktor dominan mahasiswa selama seminggu ini.\",\n"
        "  \"recommendations\": [\n"
        "    {\n"
        "      \"category\": \"kategori rekomendasi (pilih salah satu dari: academic, health, lifestyle, sleep, social, mindfulness)\",\n"
        "      \"priority_level\": \"tingkat prioritas (pilih salah satu dari: low, medium, high, urgent)\",\n"
        "      \"title\": \"Judul Rekomendasi 1 (Singkat, Tindakan)\",\n"
        "      \"text\": \"Tindakan konkret, praktis, dan personal untuk dilakukan.\"\n"
        "    },\n"
        "    {\n"
        "      \"category\": \"kategori rekomendasi (pilih salah satu dari: academic, health, lifestyle, sleep, social, mindfulness)\",\n"
        "      \"priority_level\": \"tingkat prioritas (pilih salah satu dari: low, medium, high, urgent)\",\n"
        "      \"title\": \"Judul Rekomendasi 2 (Singkat, Tindakan)\",\n"
        "      \"text\": \"Tindakan konkret lainnya yang berbeda dari rekomendasi 1.\"\n"
        "    },\n"
        "    {\n"
        "      \"category\": \"kategori rekomendasi (pilih salah satu dari: academic, health, lifestyle, sleep, social, mindfulness)\",\n"
        "      \"priority_level\": \"tingkat prioritas (pilih salah satu dari: low, medium, high, urgent)\",\n"
        "      \"title\": \"Judul Rekomendasi 3 (Singkat, Tindakan)\",\n"
        "      \"text\": \"Tindakan konkret lainnya yang berbeda dari rekomendasi 1 & 2.\"\n"
        "    }\n"
        "  ]\n"
        "}\n\n"
        "2. Jumlah INSIGHT harus TEPAT 1.\n"
        "3. Jumlah REKOMENDASI harus TEPAT 3.\n"
        "4. Gunakan Bahasa Indonesia yang ramah, memotivasi, dan tidak kaku (gunakan sebutan 'kamu').\n"
        "5. HINDARI REDUNDANSI/PENGULANGAN antara isi insight dengan ketiga rekomendasi. Setiap rekomendasi harus membahas aspek yang berbeda.\n"
        "6. JANGAN berikan penjelasan teks tambahan di luar JSON tersebut."
    )

    # 4. User prompt (student data + scientific evidence + instructions)
    evidence_section = ""
    if rag_context:
        evidence_section = (
            f"\n\nSCIENTIFIC EVIDENCE:\n"
            f"{rag_context}\n\n"
            "INSTRUKSI PENGGUNAAN EVIDENCE:\n"
            "- Gunakan evidence ilmiah yang diberikan sebagai dasar utama insight dan rekomendasi.\n"
            "- Jika evidence kurang lengkap, berikan rekomendasi konservatif yang tidak bertentangan dengan evidence tersebut.\n"
            "- Jangan membuat klaim ilmiah baru yang tidak didukung konteks.\n"
            "- Sebutkan temuan ilmiah secara natural dalam teks (tanpa format sitasi formal)."
        )

    user_prompt = (
        f"Analisis data historis seminggu berikut untuk User ID: {req.user_id}.\n\n"
        f"STUDENT DATA:\n"
        f"Prediksi Tingkat Stres Mingguan: {req.weekly_stress_prediction}\n\n"
        f"Data Historis Harian:\n"
        f"{history_context}"
        f"{evidence_section}\n\n"
        "Kembalikan respon dalam format JSON sesuai spesifikasi di instruksi sistem."
    )

    # 5. Call Groq API
    try:
        response = groq_client.chat.completions.create(
            model="openai/gpt-oss-20b",
            messages=[
                {"role": "system", "content": system_instruction},
                {"role": "user", "content": user_prompt}
            ],
            response_format={"type": "json_object"},
            temperature=0.7,
            max_tokens=800
        )

        raw_content = response.choices[0].message.content
        result_json = json.loads(raw_content)

        if "insight" not in result_json or "recommendations" not in result_json:
            raise ValueError("Response JSON missing required keys.")

        insight_raw = result_json["insight"]
        if isinstance(insight_raw, dict):
            insight_text = insight_raw.get("text", insight_raw.get("title", str(insight_raw)))
        else:
            insight_text = str(insight_raw)

        recommendations_data = result_json["recommendations"]

        recommendations_items = []
        valid_categories = {"academic", "health", "lifestyle", "sleep", "social", "mindfulness"}
        valid_priorities = {"low", "medium", "high", "urgent"}

        for item in recommendations_data[:3]:
            cat = str(item.get("category", "lifestyle")).lower().strip()
            if cat not in valid_categories:
                cat = "lifestyle"

            priority = str(item.get("priority_level", "medium")).lower().strip()
            if priority not in valid_priorities:
                priority = "medium"

            recommendations_items.append(RAGTextItem(
                category=cat,
                priority_level=priority,
                title=item.get("title", "Rekomendasi Tindakan"),
                text=item.get("text", "Lakukan aktivitas yang seimbang.")
            ))

        while len(recommendations_items) < 3:
            recommendations_items.append(RAGTextItem(
                category="lifestyle",
                priority_level="medium",
                title="Jaga Keseimbangan",
                text="Luangkan waktu 15 menit untuk relaksasi atau aktivitas tanpa layar."
            ))

        return WeeklyRAGResponse(
            success=True,
            user_id=req.user_id,
            insight=insight_text,
            recommendations=recommendations_items
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Gagal menghasilkan RAG AI insight/rekomendasi: {str(e)}"
        )
