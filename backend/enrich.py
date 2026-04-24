def city_context(city, aqi):
    if aqi > 200:
        causes = [
            "Heavy vehicular congestion",
            "Construction dust accumulation",
            "Industrial and diesel emissions",
            "Low wind dispersion"
        ]
        solutions = [
            "Strict vehicular emission control",
            "Dust suppression at construction sites",
            "Shift to electric public transport",
            "Long-term urban air planning"
        ]
    elif aqi > 100:
        causes = [
            "Traffic density",
            "Localized industrial activity",
            "Seasonal pollution buildup"
        ]
        solutions = [
            "Cleaner fuel adoption",
            "Improved traffic flow",
            "Green buffer zones"
        ]
    else:
        causes = [
            "Moderate urban emissions"
        ]
        solutions = [
            "Sustained monitoring",
            "Promotion of clean mobility"
        ]
    return causes, solutions
