const WEATHER_KEY = "2f8ae98bf90b60edd61f085be0c86e30";
const UNSPLASH_KEY = "YOUR_UNSPLASH_API_KEY";

const form = document.getElementById("searchForm");
const cityInput = document.getElementById("cityInput");
const loader = document.getElementById("loader");
const errorBox = document.getElementById("error");
const weatherCard = document.getElementById("weatherCard");
const aqiCard = document.getElementById("aqiCard");
const rainLayer = document.querySelector(".rain");
const themeToggle = document.getElementById("themeToggle");

const cityNameEl = document.getElementById("cityName");
const tempEl = document.getElementById("temperature");
const descEl = document.getElementById("description");
const humidityEl = document.getElementById("humidity");
const windEl = document.getElementById("wind");
const aqiValueEl = document.getElementById("aqiValue");
const aqiStatusEl = document.getElementById("aqiStatus");

/* 🌍 Auto Detect Location */
navigator.geolocation.getCurrentPosition(pos => {
    fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude);
});

/* 🔍 Search */
form.addEventListener("submit", e => {
    e.preventDefault();
    fetchWeather(cityInput.value.trim());
});

/* 🌙 Theme */
themeToggle.addEventListener("click", () => {
    document.body.classList.toggle("dark");
    localStorage.setItem("theme", document.body.classList.contains("dark"));
});

if (localStorage.getItem("theme") === "true") {
    document.body.classList.add("dark");
}

async function fetchWeather(city) {
    showLoader();
    try {
        const res = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${WEATHER_KEY}`
        );
        if (!res.ok) throw new Error("City not found");
        const data = await res.json();
        displayWeather(data);
        fetchAQI(data.coord.lat, data.coord.lon);
    } catch (e) {
        showError(e.message);
    }
}

async function fetchWeatherByCoords(lat, lon) {
    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${WEATHER_KEY}`
    );
    const data = await res.json();
    displayWeather(data);
    fetchAQI(lat, lon);
}

async function fetchAQI(lat, lon) {
    const res = await fetch(
        `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${WEATHER_KEY}`
    );
    const data = await res.json();
    const aqi = data.list[0].main.aqi;
    aqiValueEl.textContent = `AQI Level: ${aqi}`;
    aqiStatusEl.textContent = ["Good", "Fair", "Moderate", "Poor", "Very Poor"][aqi - 1];
    aqiCard.classList.remove("hidden");
}

function displayWeather(data) {
    hideError();
    weatherCard.classList.remove("hidden");

    const condition = data.weather[0].main.toLowerCase();
    const now = data.dt;
    const isDay = now > data.sys.sunrise && now < data.sys.sunset;

    cityNameEl.textContent = data.name;
    tempEl.textContent = `🌡️ ${data.main.temp} °C`;
    descEl.textContent = data.weather[0].description;
    humidityEl.textContent = `💧 ${data.main.humidity}%`;
    windEl.textContent = `💨 ${data.wind.speed} m/s`;

    updateBackground(condition, isDay);
    toggleRain(condition);
    hideLoader();
}

function updateBackground(condition, isDay) {
    let bg = "";

    if (condition.includes("clear"))
        bg = isDay
            ? "linear-gradient(to right, #fceabb, #f8b500)"
            : "linear-gradient(to right, #141E30, #243B55)";

    else if (condition.includes("cloud"))
        bg = "linear-gradient(to right, #bdc3c7, #2c3e50)";

    else if (condition.includes("rain"))
        bg = "linear-gradient(to right, #4b79a1, #283e51)";

    else if (condition.includes("snow"))
        bg = "linear-gradient(to right, #e6dada, #274046)";

    else
        bg = "linear-gradient(to right, #74ebd5, #9face6)";

    document.body.style.backgroundImage = bg;
}

function toggleRain(condition) {
    if (condition.includes("rain")) {
        rainLayer.classList.remove("hidden");
    } else {
        rainLayer.classList.add("hidden");
    }
}

function showLoader() {
    loader.classList.remove("hidden");
}

function hideLoader() {
    loader.classList.add("hidden");
}

function showError(msg) {
    errorBox.textContent = msg;
    errorBox.classList.remove("hidden");
    hideLoader();
}

function hideError() {
    errorBox.classList.add("hidden");
}
