
const apiKey = 'a57196dd700d65ae36584fad490a14c6';

// ======================
// 🔘 EVENT LISTENERS
// ======================

document.addEventListener("DOMContentLoaded", () => {
  const defaultCity = "Abuja";

  fetchWeather(defaultCity);
  fetchForecast(defaultCity);
});


document.getElementById("searchBtn").addEventListener("click", () => {
  const city = document.getElementById("cityInput").value;

  if (city) {
    fetchWeather(city);
    fetchForecast(city);
  }
});

document.getElementById("cityInput").addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    document.getElementById("searchBtn").click();
  }
});

// ======================
// 🌤 CURRENT WEATHER
// ======================
function fetchWeather(city) {
  const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
  showLoading();
  fetch(url)
    .then(res => res.json())
    .then(data => {
      hideLoading();
      if (data.cod !== 200) {
       
        return;
      }

      // UI UPDATE
      document.getElementById("location").textContent = data.name;
      document.getElementById("temperature").textContent =
        Math.round(data.main.temp) + "°C";
      document.getElementById("condition").textContent =
        data.weather[0].description;

      document.getElementById("humidity").textContent =
        data.main.humidity;

      document.getElementById("wind").textContent =
        data.wind.speed;

      document.getElementById("feelsLike").textContent =
        Math.round(data.main.feels_like);

      // ICON
      const icon = data.weather[0].icon;
      document.getElementById("weatherIcon").src =
        `https://openweathermap.org/img/wn/${icon}@2x.png`;

      // 🎨 THEME
      setWeatherTheme(data.weather[0].main.toLowerCase());

    })
    .catch(err => console.error(err));
}

// ======================
// 📅 FORECAST + PATTERNS
// ======================
async function fetchForecast(city) {
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  const res = await fetch(url);
  const data = await res.json();

  displayForecast(data.list);
  setTrend(data.list);
  renderChart(data.list);
}

// ======================
// 📦 FORECAST CARDS
// ======================
function displayForecast(list) {
  const forecastEl = document.getElementById("forecast");
  forecastEl.innerHTML = "";

  for (let i = 0; i < list.length; i += 8) {
    const item = list[i];

    const date = new Date(item.dt_txt).toLocaleDateString("en-US", {
      weekday: "short"
    });

    const temp = Math.round(item.main.temp);
    const icon = item.weather[0].icon;

    const card = `
      <div class="forecast-card">
        <p>${date}</p>
        <img src="https://openweathermap.org/img/wn/${icon}.png" />
        <p>${temp}°C</p>
      </div>
    `;

    forecastEl.innerHTML += card;
  }
}

// ======================
// 📊 TREND / PATTERN
// ======================
function setTrend(list) {
  const today = list[0].main.temp;
  const tomorrow = list[8].main.temp;

  let text = "";

  if (tomorrow > today) {
    text = `📈 Warmer (${Math.round(today)}° → ${Math.round(tomorrow)}°)`;
  } else if (tomorrow < today) {
    text = `📉 Colder (${Math.round(today)}° → ${Math.round(tomorrow)}°)`;
  } else {
    text = "➖ Stable temperature";
  }

  document.getElementById("trendText").textContent = text;
}

// ======================
// 🎨 THEME SYSTEM
// ======================
function setWeatherTheme(condition) {
  const app = document.querySelector(".weather-app");

  if (condition.includes("cloud")) {
    app.style.background = "linear-gradient(135deg, #4b6cb7, #182848)";
  } 
  else if (condition.includes("rain")) {
    app.style.background = "linear-gradient(135deg, #2c3e50, #4ca1af)";
  } 
  else if (condition.includes("clear")) {
    app.style.background = "linear-gradient(135deg, #f7971e, #ffd200)";
  } 
  else {
    app.style.background = "linear-gradient(135deg, #02121f, #043b5c)";
  }
}


let chart;

function renderChart(list) {
  const ctx = document.getElementById("tempChart");

  const labels = [];
  const temps = [];

  for (let i = 0; i < list.length; i += 8) {
    const item = list[i];

    const date = new Date(item.dt_txt).toLocaleDateString("en-US", {
      weekday: "short"
    });

    labels.push(date);
    temps.push(Math.round(item.main.temp));
  }

  if (chart) {
    chart.destroy();
  }

  chart = new Chart(ctx, {
    type: "line",
    data: {
      labels: labels,
      datasets: [{
        label: "Temperature °C",
        data: temps,
        borderWidth: 2,
        tension: 0.4
      }]
    },
    options: {
      plugins: {
        legend: { display: false }
      }
    }
  });
}

let humidityText = "";

if (data.main.humidity > 80) {
  humidityText = "High";
} else if (data.main.humidity > 50) {
  humidityText = "Moderate";
} else {
  humidityText = "Low";
}

let windText = "";

if (data.wind.speed > 10) {
  windText = "Windy";
} else {
  windText = "Calm";
}

let feelText = "";

if (data.main.feels_like > 30) {
  feelText = "Hot";
} else if (data.main.feels_like < 15) {
  feelText = "Cold";
} else {
  feelText = "Comfortable";
}

document.getElementById("humidityStatus").textContent = humidityText;
document.getElementById("windStatus").textContent = windText;
document.getElementById("feelStatus").textContent = feelText;


function showLoading() {
  document.getElementById("loadingText").style.display = "block";
}

function hideLoading() {
  document.getElementById("loadingText").style.display = "none";
}