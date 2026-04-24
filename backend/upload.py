import json
from pathlib import Path
from datetime import datetime
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "public" / "output.json"
def upload(cities):
    payload = {"updatedAt": datetime.utcnow().isoformat(timespec="seconds") + "Z","cities": cities}
    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(payload, f, indent=2)
