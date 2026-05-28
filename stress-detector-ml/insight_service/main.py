# ============================================================
# main.py — CekTenang Insight Service
# Run: uvicorn main:app --reload --port 8002
# ============================================================
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import numpy as np
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACT_DIR = os.path.join(BASE_DIR, 'artifacts')

app = FastAPI(
    title="CekTenang — Insight Service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ARTIFACT          = joblib.load(os.path.join(ARTIFACT_DIR, "insight_engine.joblib"))
DAILY_TEMPLATES   = ARTIFACT["daily_templates"]
WEEKLY_TEMPLATES  = ARTIFACT["weekly_templates"]
KNOWN_FACTORS     = ARTIFACT["known_factors"]


# ---- Pydantic Schemas ----

class InputFeatures(BaseModel):
    sleep_hours        : Optional[float] = None
    mood_score         : Optional[float] = None
    study_hours        : Optional[float] = None
    physical_activity  : Optional[float] = None
    screen_time        : Optional[float] = None
    fatigue_score      : Optional[float] = None
    financial_stress   : Optional[float] = None
    health_score       : Optional[float] = None
    caffeine_intake    : Optional[float] = None

class InsightRequest(BaseModel):
    user_id              : int
    stress_prediction_id : int
    stress_level         : str                       # "low" | "medium" | "high"
    input_features       : InputFeatures
    period_type          : str = "daily"             # "daily" | "weekly"
    weekly_summary_id    : Optional[int] = None
    weekly_stress_levels : Optional[List[str]] = None  # wajib jika weekly

class InsightResponse(BaseModel):
    success              : bool
    user_id              : int
    stress_prediction_id : int
    weekly_summary_id    : Optional[int]
    period_type          : str
    insight_text         : str
    created_at           : str


# ---- Helper Functions ----

def detect_factors(feats: dict, sl: str) -> List[str]:
    if sl == "low":
        return ["Stable Routine"]
    scores = {}
    if feats.get("study_hours", 0) > 7:
        scores["Academic Pressure"] = feats["study_hours"] - 7
    if feats.get("sleep_hours") is not None and feats["sleep_hours"] < 7:
        scores["Sleep Deficit"] = 7 - feats["sleep_hours"]
    if feats.get("mood_score") is not None and feats["mood_score"] < 5:
        scores["Low Mood"] = 5 - feats["mood_score"]
    if feats.get("fatigue_score", 0) >= 7:
        scores["High Fatigue"] = feats["fatigue_score"] - 6
    if feats.get("screen_time", 0) > 4:
        scores["High Screen Time"] = feats["screen_time"] - 4
    if feats.get("physical_activity") is not None and feats["physical_activity"] < 20:
        scores["Low Physical Activity"] = (20 - feats["physical_activity"]) / 20
    if feats.get("financial_stress", 0) >= 6:
        scores["Financial Worry"] = feats["financial_stress"] - 5
    if feats.get("health_score") is not None and feats["health_score"] < 4:
        scores["Health Issue"] = 4 - feats["health_score"]
    if feats.get("caffeine_intake", 0) >= 3:
        scores["High Caffeine Intake"] = feats["caffeine_intake"] - 2
    detected = sorted(scores, key=scores.get, reverse=True)[:2]
    return detected if detected else (["Academic Pressure"] if sl == "high" else ["Low Mood"])


def render_insight(sl: str, factors: List[str]) -> str:
    template = DAILY_TEMPLATES.get(sl, DAILY_TEMPLATES["medium"])
    if "{factors}" in template:
        return template.format(factors=" + ".join(factors))
    return template


def weekly_trend(levels: List[str]) -> str:
    sm = {"low": 1, "medium": 2, "high": 3}
    s = [sm.get(x.lower(), 2) for x in levels]
    if s.count(3) >= 3:
        return "high_days"
    mid = len(s) // 2
    diff = sum(s[mid:]) / len(s[mid:]) - sum(s[:mid]) / len(s[:mid])
    if diff > 0.3: return "worsening"
    if diff < -0.3: return "improving"
    return "stable"


# ---- Endpoints ----

@app.get("/")
def root():
    return {"service": "CekTenang Insight Service", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok", "version": ARTIFACT.get("version"), "service": "insight"}

@app.post("/insights", response_model=InsightResponse)
def create_insight(req: InsightRequest):
    sl = req.stress_level.lower()
    if sl not in ("low", "medium", "high"):
        raise HTTPException(422, "stress_level harus low / medium / high")

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    feats = req.input_features.dict()

    if req.period_type == "weekly":
        if not req.weekly_stress_levels:
            raise HTTPException(422, "weekly_stress_levels wajib diisi untuk period_type weekly")
        trend = weekly_trend(req.weekly_stress_levels)
        text = WEEKLY_TEMPLATES[trend]
    else:
        factors = detect_factors(feats, sl)
        text = render_insight(sl, factors)

    return InsightResponse(
        success=True,
        user_id=req.user_id,
        stress_prediction_id=req.stress_prediction_id,
        weekly_summary_id=req.weekly_summary_id,
        period_type=req.period_type,
        insight_text=text,
        created_at=now,
    )
