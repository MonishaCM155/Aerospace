function getNextDates(n, baseAt){
  const out = [];
  const base = baseAt ? new Date(baseAt) : new Date();
  for(let i=1;i<=n;i++){
    const d = new Date(base);
    d.setDate(base.getDate()+i);
    out.push(d.toLocaleDateString(undefined,{month:'short',day:'numeric'}));
  }
  return out;
}

function mapIntel(city, aqi){
  if(aqi>200) return {
    causes:[
      "Heavy vehicular congestion",
      "Construction dust accumulation",
      "Industrial and diesel emissions",
      "Poor dispersion due to low wind"
    ],
    solutions:[
      "Enforce vehicle emission standards",
      "Strict dust control at construction sites",
      "Restrict high-emission industrial hours",
      "Issue temporary travel advisories"
    ],
    health:"High risk of respiratory stress; avoid outdoor exposure, especially for children and elderly."
  };
  if(aqi>100) return {
    causes:[
      "Traffic density",
      "Localized industrial emissions",
      "Seasonal pollutant buildup"
    ],
    solutions:[
      "Cleaner fuels and traffic flow control",
      "Targeted industrial regulation",
      "Increase urban green buffers"
    ],
    health:"Sensitive groups may experience discomfort; reduce prolonged outdoor activity."
  };
  return {
    causes:["Moderate urban emissions"],
    solutions:["Sustain clean mobility and monitoring"],
    health:"Air quality generally acceptable for most individuals."
  };
}

(async function(){
  const params = new URLSearchParams(location.search);
  const cityName = params.get("city");
  const container = document.getElementById("cityRoot");

  try{
    const resp = await fetch("output.json",{cache:"no-store"});
    if(!resp.ok) throw new Error(resp.status);
    const data = await resp.json();

    const city = (data.cities||[]).find(x=>x.city===cityName);
    if(!city){
      container.innerHTML = '<div style="padding:40px;color:#666">City not found</div>';
      return;
    }

    const forecast = Array.isArray(city.forecast)?city.forecast.slice(0,6):[0,0,0,0,0,0];
    const dates = Array.isArray(city.forecast_dates) && city.forecast_dates.length===forecast.length
      ? city.forecast_dates
      : getNextDates(forecast.length, data.updatedAt);

    const colorClass = city.aqi<=100?"green":city.aqi<=200?"yellow":"red";

    const header = document.createElement("div");
    header.className = "city-header";
    header.innerHTML = `
      <h1>${city.city}</h1>
      <div class="aqi-large ${colorClass}">${city.aqi}</div>
    `;

    const forecastStrip = document.createElement("div");
    forecastStrip.className = "forecast";
    forecastStrip.style.justifyContent = "center";
    forecastStrip.style.marginBottom = "18px";

    forecast.forEach((v,idx)=>{
      const wrapper = document.createElement("div");
      wrapper.className = "bar-wrapper";
      wrapper.innerHTML = `
        <div class="bar ${colorClass}" style="height:${Math.max(24,Math.min(160,(v/2)||24))}px"></div>
        <div class="bar-value">${v}</div>
        <div class="bar-date">${dates[idx]||""}</div>
      `;
      forecastStrip.appendChild(wrapper);
    });

    const stationsWrap = document.createElement("div");
    const stations = city.stations?.length ? city.stations : [{name:city.city+" Central",aqi:city.aqi}];

    stations.forEach(s=>{
      const sColor = s.aqi<=100?"green":s.aqi<=200?"yellow":"red";
      const row = document.createElement("div");
      stationsWrap.appendChild(row);
    });

    let intel = mapIntel(city.city, city.aqi);
    try{
      const ai = await fetch(
        `http://localhost:5050/api/insights?city=${encodeURIComponent(city.city)}&aqi=${city.aqi}`
      ).then(r=>r.json());

      if(ai?.causes && ai?.solutions){
        intel = ai;
      }
    }catch(e){}

    const insightBlock = document.createElement("div");
    insightBlock.className = "insight-grid";
    insightBlock.innerHTML = `
      <div class="insight-card">
        <h3>Major Causes</h3>
        <ul>${intel.causes.map(x=>`<li>${x}</li>`).join("")}</ul>
      </div>
      <div class="insight-card">
        <h3>Recommended Solutions</h3>
        <ul>${intel.solutions.map(x=>`<li>${x}</li>`).join("")}</ul>
      </div>
    `;

    const healthBlock = document.createElement("div");
    healthBlock.className = "health-block";
    healthBlock.innerHTML = `
      <h3>Health Impact</h3>
      <p>${intel.health}</p>
    `;

    container.innerHTML = "";
    container.appendChild(header);
    container.appendChild(forecastStrip);
    container.appendChild(stationsWrap);
    container.appendChild(insightBlock);
    container.appendChild(healthBlock);

  }catch(e){
    container.innerHTML = `<div style="padding:40px;color:#666">Failed to load city data</div>`;
    console.error(e);
  }
})();

fetch(`http://localhost:5050/api/insights?city=${city.city}&aqi=${city.aqi}`)
  .then(res => res.json())
  .then(ai => {
    document.getElementById("causes").innerHTML =
      ai.causes.map(c => `<li>${c}</li>`).join("");

    document.getElementById("solutions").innerHTML =
      ai.solutions.map(s => `<li>${s}</li>`).join("");

    document.getElementById("health").textContent = ai.health;
  });
