from collections import defaultdict

def aggregate_countries(cities):
    bucket = defaultdict(list)

    for c in cities:
        bucket[c["country"]].append(c)

    countries = []

    for country, group in bucket.items():
        avg = round(sum(c["aqi"] for c in group) / len(group))

        forecast = [
            round(sum(c["forecast"][i] for c in group) / len(group))
            for i in range(6)
        ]

        countries.append({
            "country": country,
            "currentAQI": avg,
            "forecast": forecast,
            "min": min(forecast),
            "max": max(forecast),
            "citiesUsed": len(group)
        })

    countries.sort(key=lambda x: x["currentAQI"], reverse=True)
    return countries
