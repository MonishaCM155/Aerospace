import requests
from config import CITIES, WAQI_TOKEN
def fetch_all_city_data():
    city_results = []
    for city in CITIES:
        print(f"📡 Fetching data for {city}")
        try:
            resp = requests.get(f"https://api.waqi.info/feed/{city}/", params={"token": WAQI_TOKEN}, timeout=15)
            resp.raise_for_status()
        except Exception as e:
            print(f"❌ Failed to fetch data for {city}: {e}")
            continue
        payload = resp.json()
        if payload.get("status") != "ok":
            print(f"⚠️ No data for {city}")
            continue
        data = payload["data"]
        aqi = data.get("aqi")
        if aqi is None:
            continue
        stations = []
        iaqi = data.get("iaqi", {})
        if "pm25" in iaqi:
            stations.append({"name": f"{city} Central","aqi": int(iaqi["pm25"].get("v") if isinstance(iaqi["pm25"].get("v"), (int,float)) else aqi)})
        forecast = [max(aqi - 30, 0), max(aqi - 15, 0), aqi, aqi + 10, aqi + 20, aqi + 5]
        city_results.append({"city": city,"aqi": int(aqi),"forecast": forecast,"stations": stations,"mostPollutedStation": stations[0] if stations else {"name":"N/A","aqi": aqi}})
    return city_results
