def pm25_to_aqi(pm):
    breakpoints = [
        (0.0, 12.0, 0, 50),
        (12.1, 35.4, 51, 100),
        (35.5, 55.4, 101, 150),
        (55.5, 150.4, 151, 200),
        (150.5, 250.4, 201, 300),
        (250.5, 350.4, 301, 400),
        (350.5, 500.4, 401, 500),
    ]
    for c_low, c_high, a_low, a_high in breakpoints:
        if c_low <= pm <= c_high:
            return round(((a_high - a_low) / (c_high - c_low)) * (pm - c_low) + a_low)
    return 500
