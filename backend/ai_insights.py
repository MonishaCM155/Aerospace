import os
import json
import time
import hashlib
import requests
from pathlib import Path
from fastapi import FastAPI, Query
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY")
GROQ_MODEL = "llama-3.1-8b-instant"
GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

CACHE_DIR = Path(__file__).resolve().parent / ".ai_cache"
CACHE_DIR.mkdir(exist_ok=True)

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

# -------------------- CACHE --------------------

def _cache_path(city: str, aqi: int):
    key = f"{city.lower()}_{aqi}"
    h = hashlib.sha1(key.encode()).hexdigest()
    return CACHE_DIR / f"{h}.json"

def load_cache(city: str, aqi: int, max_age=3600):
    p = _cache_path(city, aqi)
    if not p.exists():
        return None
    try:
        data = json.loads(p.read_text())
        if time.time() - data["_ts"] > max_age:
            return None
        return data["payload"]
    except Exception:
        return None

def save_cache(city: str, aqi: int, payload: dict):
    p = _cache_path(city, aqi)
    p.write_text(json.dumps({
        "_ts": time.time(),
        "payload": payload
    }, indent=2))

# -------------------- AI --------------------

def build_prompt(city: str, aqi: int):
    return f"""
You are an air-quality expert.

Return ONLY valid JSON with exactly these keys:
- "causes": 3–5 bullet points (each ≥ 6 words)
- "solutions": 3–5 bullet points (each ≥ 6 words)
- "health": 2–3 short sentences

City: {city}
AQI: {aqi}

Be realistic, urban, India-relevant where applicable.
No markdown. No commentary. JSON only.
"""

def call_groq(prompt: str):
    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json"
    }

    body = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": "You are a precise environmental analyst."},
            {"role": "user", "content": prompt}
        ],
        "temperature": 0.3,
        "max_tokens": 450
    }

    r = requests.post(GROQ_URL, headers=headers, json=body, timeout=30)
    r.raise_for_status()
    return r.json()["choices"][0]["message"]["content"]

def extract_json(text: str):
    start = text.find("{")
    end = text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("No JSON found")
    return json.loads(text[start:end+1])

def normalize(parsed: dict):
    causes = parsed.get("causes", [])
    solutions = parsed.get("solutions", [])
    health = parsed.get("health", "")

    if isinstance(health, list):
        health = " ".join(health)

    causes = [c.strip() for c in causes if isinstance(c, str) and len(c.split()) >= 6]
    solutions = [s.strip() for s in solutions if isinstance(s, str) and len(s.split()) >= 6]

    if len(causes) < 3 or len(solutions) < 3 or len(health.split()) < 8:
        raise ValueError("Schema mismatch")

    return {
        "causes": causes[:5],
        "solutions": solutions[:5],
        "health": health.strip()
    }

# -------------------- API --------------------

@app.get("/api/insights")
def insights(
    city: str = Query(...),
    aqi: int = Query(...),
    force: bool = Query(False)
):
    if not force:
        cached = load_cache(city, aqi)
        if cached:
            return {"source": "cache", **cached}

    try:
        prompt = build_prompt(city, aqi)
        raw = call_groq(prompt)
        parsed = extract_json(raw)
        payload = normalize(parsed)

        save_cache(city, aqi, payload)
        return {"source": "ai", **payload}

    except Exception as e:
        return {
            "source": "fallback",
            "causes": [
                "Elevated air pollution from urban activities",
                "Vehicular emissions during peak traffic hours",
                "Weather conditions trapping particulate matter"
            ],
            "solutions": [
                "Limit outdoor exposure during poor air quality",
                "Use public transport and cleaner fuels",
                "Monitor official air quality advisories"
            ],
            "health": "Sensitive individuals may experience respiratory discomfort. Reduce prolonged outdoor activity.",
            "error": str(e)
        }
