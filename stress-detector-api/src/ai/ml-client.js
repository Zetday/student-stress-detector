/**
 * ML Client — communicates with the three FastAPI microservices:
 *   1. Prediction Service  (port 8000) — stress level prediction
 *   2. Recommendation Service (port 8001) — personalized recommendations
 *   3. Insight Service (port 8002) — AI-generated insights
 *
 * If any ML service is unavailable, methods return null so the Express
 * request still succeeds (activity is saved; prediction is simply null).
 */

const PREDICT_SERVICE_URL = process.env.PREDICT_SERVICE_URL || 'http://localhost:8000';
const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:8001';
const INSIGHT_SERVICE_URL = process.env.INSIGHT_SERVICE_URL || 'http://localhost:8002';
const ML_TIMEOUT_MS = 10_000; // 10 seconds

/**
 * Predict stress level from daily activity data.
 * @param {object} activityPayload  — the fields from daily_activities
 * @returns {{ status, prediction: { stress_level_label, confidence_score, probabilities } } | null}
 */
export const predictStress = async (activityPayload) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    const res = await fetch(`${PREDICT_SERVICE_URL}/predict`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(activityPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[ML Client] predictStress → HTTP ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[ML Client] predictStress → request timed out');
    } else {
      console.warn('[ML Client] predictStress → service unreachable:', err.message);
    }
    return null;
  }
};

/**
 * Generate AI insight text from weekly summary or daily data.
 * @param {object} insightPayload — insight request body matching InsightRequest schema
 * @returns {{ success, insight_text, ... } | null}
 */
export const generateInsight = async (insightPayload) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    const res = await fetch(`${INSIGHT_SERVICE_URL}/insights`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(insightPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[ML Client] generateInsight → HTTP ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[ML Client] generateInsight → request timed out');
    } else {
      console.warn('[ML Client] generateInsight → service unreachable:', err.message);
    }
    return null;
  }
};

/**
 * Generate personalized recommendations based on stress level and input features.
 * @param {object} recommendationPayload — recommendation request body matching RecommendationRequest schema
 * @returns {{ success, count, recommendations: [...] } | null}
 */
export const generateRecommendation = async (recommendationPayload) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), ML_TIMEOUT_MS);

    const res = await fetch(`${RECOMMENDATION_SERVICE_URL}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(recommendationPayload),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[ML Client] generateRecommendation → HTTP ${res.status}`);
      return null;
    }

    return await res.json();
  } catch (err) {
    if (err.name === 'AbortError') {
      console.warn('[ML Client] generateRecommendation → request timed out');
    } else {
      console.warn('[ML Client] generateRecommendation → service unreachable:', err.message);
    }
    return null;
  }
};
