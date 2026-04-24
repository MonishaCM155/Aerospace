const data = [
  {
    rank: 1,
    city: "Delhi",
    country: "India",
    aqi: 342,
    causes: ["Traffic congestion", "Low wind dispersion", "Industrial emissions"],
    solutions: ["Odd-even traffic rules", "Emission caps", "Urban green buffers"],
    forecast: [
      { day: "Mon", value: 350 },
      { day: "Tue", value: 360 },
      { day: "Wed", value: 372 },
      { day: "Thu", value: 365 },
      { day: "Fri", value: 350 },
      { day: "Sat", value: 330 },
      { day: "Sun", value: 320 }
    ]
  },
  {
    rank: 2,
    city: "Lahore",
    country: "Pakistan",
    aqi: 318,
    causes: ["Crop burning", "Vehicular emissions", "Thermal inversion"],
    solutions: ["Residue management", "Public transport", "Early alerts"],
    forecast: [
      { day: "Mon", value: 330 },
      { day: "Tue", value: 340 },
      { day: "Wed", value: 345 },
      { day: "Thu", value: 335 },
      { day: "Fri", value: 328 },
      { day: "Sat", value: 320 },
      { day: "Sun", value: 310 }
    ]
  }
];

function getColor(aqi) {
  if (aqi > 300) return "red";
  if (aqi > 150) return "yellow";
  return "green";
}

function render() {
  const container = document.getElementById("ranking-container");
  container.innerHTML = "";

  data.forEach(item => {
    const color = getColor(item.aqi);
    const values = item.forecast.map(f => f.value);
    const min = Math.min(...values);
    const max = Math.max(...values);

    const bars = item.forecast.map(f => `
      <div class="bar-wrap">
        <div class="bar ${color}" style="height:${f.value / 3.5}px">
          ${f.value}
        </div>
        <div class="day">${f.day}</div>
      </div>
    `).join("");

    container.innerHTML += `
      <div class="card">
        <div class="rank">#${item.rank}</div>

        <div class="left">
          <div class="city">${item.city} <span>, ${item.country}</span></div>
          <div class="subtitle">7-day AQI forecast</div>
          <div class="bars">${bars}</div>
        </div>

        <div class="right">
          <div class="aqi ${color}-glow">${item.aqi}</div>
          <div class="minmax">Min ${min} • Max ${max}</div>

          <div class="label">Causes</div>
          <div class="list">${item.causes.join("<br>")}</div>

          <div class="label" style="margin-top:16px;">Solutions</div>
          <div class="list">${item.solutions.join("<br>")}</div>
        </div>
      </div>
    `;
  });
}

render();
