# ============================================================
# main.py — CekTenang Recommendation Service
# Run: uvicorn main:app --reload --port 8001
# ============================================================
import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
import joblib

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
ARTIFACT_DIR = os.path.join(BASE_DIR, 'artifacts')

app = FastAPI(
    title="CekTenang — Recommendation Service",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ARTIFACT = joblib.load(os.path.join(ARTIFACT_DIR, "recommendation_engine.joblib"))
KB = ARTIFACT["knowledge_base"]


class InputFeatures(BaseModel):
    sleep_hours: Optional[float] = None
    mood_score: Optional[float] = None
    physical_activity: Optional[float] = None
    screen_time: Optional[float] = None
    study_hours: Optional[float] = None
    fatigue_score: Optional[float] = None
    financial_stress: Optional[float] = None
    health_score: Optional[float] = None
    caffeine_intake: Optional[float] = None

class RecommendationRequest(BaseModel):
    user_id: int
    stress_prediction_id: int
    stress_level: str                   # "low" | "medium" | "high"
    input_features: InputFeatures
    period_type: str = "daily"          # "daily" | "weekly"
    weekly_summary_id: Optional[int] = None
    max_recommendations: int = 3

class RecommendationItem(BaseModel):
    user_id: int
    stress_prediction_id: int
    weekly_summary_id: Optional[int]
    period_type: str
    category: str
    title: str
    recommendation_text: str
    priority_level: str
    created_at: str

class RecommendationResponse(BaseModel):
    success: bool
    count: int
    recommendations: List[RecommendationItem]


def detect_categories(feats: dict, stress_level: str, period_type: str) -> list:
    relevant = []
    sl = stress_level.lower()

    if period_type == "weekly":
        if sl in ("medium", "high"):
            relevant.append("weekly_target")
        return relevant

    if sl == "low":
        return ["maintenance"]

    if feats.get("study_hours", 0) > 7 or sl == "high":
        relevant.append("workload")
    if feats.get("fatigue_score", 0) >= 7:
        relevant.append("recovery")
    if feats.get("mood_score") is not None and feats["mood_score"] < 5:
        relevant.append("mood_regulation")
    if feats.get("sleep_hours") is not None and feats["sleep_hours"] < 7:
        relevant.append("sleep")
    if feats.get("physical_activity") is not None and feats["physical_activity"] < 20:
        relevant.append("physical_activity")
    if feats.get("screen_time", 0) > 4:
        relevant.append("digital_habit")
    if feats.get("financial_stress", 0) >= 6:
        relevant.append("financial_habit")
    if feats.get("health_score") is not None and feats["health_score"] < 4:
        relevant.append("health")
    if feats.get("caffeine_intake", 0) >= 3:
        relevant.append("caffeine")

    if not relevant:
        relevant = ["workload", "mood_regulation"]

    seen, unique = set(), []
    for c in relevant:
        if c not in seen:
            seen.add(c); unique.append(c)
    return unique


@app.get("/")
def root():
    return {"service": "CekTenang Recommendation", "status": "running"}

@app.get("/health")
def health():
    return {"status": "ok", "kb_version": ARTIFACT.get("version"), "service": "recommendation"}

@app.post("/recommendations", response_model=RecommendationResponse)
def create_recommendations(req: RecommendationRequest):
    sl = req.stress_level.lower()
    if sl not in ("low", "medium", "high"):
        raise HTTPException(422, "stress_level harus low / medium / high")

    feats = req.input_features.dict()
    cats = detect_categories(feats, sl, req.period_type)
    if req.period_type == "daily":
        cats = cats[:req.max_recommendations]

    now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    pref_map = {"high": "High", "medium": "Medium", "low": "Low"}
    items = []

    for cat in cats:
        entries = KB.get(cat, [])
        if not entries: continue
        pref = [e for e in entries if e["priority"] == pref_map.get(sl, "Medium")]
        e = pref[0] if pref else entries[0]
        items.append(RecommendationItem(
            user_id=req.user_id,
            stress_prediction_id=req.stress_prediction_id,
            weekly_summary_id=req.weekly_summary_id,
            period_type=req.period_type,
            category=cat,
            title=e["title"],
            recommendation_text=e["text"],
            priority_level=e["priority"],
            created_at=now,
        ))

    return RecommendationResponse(success=True, count=len(items), recommendations=items)
