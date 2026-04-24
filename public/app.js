function getNextDates(n){
  const out = [];
  const base = new Date();
  for(let i=1;i<=n;i++){
    const d = new Date(base);
    d.setDate(base.getDate()+i);
    out.push(d.toLocaleDateString(undefined,{month:'short',day:'numeric'}));
  }
  return out;
}

fetch("output.json").then(r=>r.ok?r.json():Promise.reject(r.status)).then(data=>{
  const root = document.getElementById("cards");
  if(!data || !Array.isArray(data.cities) || data.cities.length===0){
    root.innerHTML = '<div style="padding:40px;color:#666">No data available</div>';
    return;
  }

  root.innerHTML = "";

  data.cities.forEach((c,i)=>{
    const colorClass = c.aqi<=100?"green":c.aqi<=200?"yellow":"red";
    const forecast = Array.isArray(c.forecast)?c.forecast: [];
    const dates = Array.isArray(c.forecast_dates) && c.forecast_dates.length===forecast.length ? c.forecast_dates : getNextDates(forecast.length || 6);
    const bars = (forecast.length?forecast: [0,0,0,0,0,0]).slice(0,6).map((v,idx)=>`
      <div class="bar-wrapper">
        <div class="bar ${colorClass}" style="height:${Math.max(24,Math.min(160, (v/2)||24))}px"></div>
        <div class="bar-value">${v||'--'}</div>
        <div class="bar-date">${dates[idx]||''}</div>
      </div>
    `).join("");

    const card = document.createElement("div");
    card.className = "card";
    card.onclick = ()=>location.href = `city.html?city=${encodeURIComponent(c.city)}`;
    card.innerHTML = `
      <div class="card-left">
        <div class="rank">${i+1}</div>
        <h2>${c.city}</h2>
        <div class="forecast">${bars}</div>
      </div>
      <div class="card-right">
        <div class="aqi-box ${colorClass}">AQI<br><span style="font-size:36px">${c.aqi}</span></div>
      </div>
    `;
    root.appendChild(card);
  });
}).catch(err=>{
  const root = document.getElementById("cards");
  root.innerHTML = `<div style="padding:40px;color:#666">Failed to load data</div>`;
  console.error(err);
});
