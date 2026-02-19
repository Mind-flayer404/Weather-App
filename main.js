// ===== Configuration =====
const API_KEY = "a76dee04b6775e3a1715e7727a72d097";
const API_URL = "https://api.openweathermap.org/data/2.5/weather";

// ===== Background Image Map =====
// Curated Unsplash photos mapped to weather conditions + day/night
const BACKGROUNDS = {
    clear_day: "https://images.unsplash.com/photo-1517483000871-1dbf64a6e1c6?w=1920&q=80",
    clear_night: "https://images.unsplash.com/photo-1507400492013-162706c8c05e?w=1920&q=80",
    clouds_day: "https://images.unsplash.com/photo-1534088568595-a066f410bcda?w=1920&q=80",
    clouds_night: "https://images.unsplash.com/photo-1501752076865-83b0c610c5a1?w=1920&q=80",
    rain: "https://images.unsplash.com/photo-1519692933481-e162a57d6721?w=1920&q=80",
    drizzle: "https://images.unsplash.com/photo-1556485689-33e55ab56127?w=1920&q=80",
    thunderstorm: "https://images.unsplash.com/photo-1605727216801-e27ce1d0cc28?w=1920&q=80",
    snow: "https://images.unsplash.com/photo-1491002052546-bf38f186af56?w=1920&q=80",
    mist: "https://images.unsplash.com/photo-1487621167305-5d248087c724?w=1920&q=80",
    default: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1920&q=80"
};

// ===== DOM Elements =====
const els = {
    bgCurrent: document.getElementById("bgCurrent"),
    bgNext: document.getElementById("bgNext"),
    searchBar: document.getElementById("searchBar"),
    searchBtn: document.getElementById("searchBtn"),
    loading: document.getElementById("loading"),
    error: document.getElementById("error"),
    errorMsg: document.getElementById("errorMsg"),
    content: document.getElementById("weatherContent"),
    cityName: document.getElementById("cityName"),
    dateTime: document.getElementById("dateTime"),
    weatherIcon: document.getElementById("weatherIcon"),
    temp: document.getElementById("temp"),
    desc: document.getElementById("desc"),
    feelsLike: document.getElementById("feelsLike"),
    maxTemp: document.getElementById("maxTemp"),
    minTemp: document.getElementById("minTemp"),
    humidity: document.getElementById("humidity"),
    wind: document.getElementById("wind"),
    pressure: document.getElementById("pressure"),
    visibility: document.getElementById("visibility"),
    sunrise: document.getElementById("sunrise"),
    sunset: document.getElementById("sunset"),
};

let currentBgLayer = "current"; // tracks which layer is visible

// ===== Background Logic =====
function getBackgroundKey(weatherMain, iconCode) {
    const isNight = iconCode.endsWith("n");
    const condition = weatherMain.toLowerCase();

    switch (condition) {
        case "clear":
            return isNight ? "clear_night" : "clear_day";
        case "clouds":
            return isNight ? "clouds_night" : "clouds_day";
        case "rain":
            return "rain";
        case "drizzle":
            return "drizzle";
        case "thunderstorm":
            return "thunderstorm";
        case "snow":
            return "snow";
        case "mist":
        case "smoke":
        case "haze":
        case "dust":
        case "fog":
        case "sand":
        case "ash":
        case "squall":
        case "tornado":
            return "mist";
        default:
            return "default";
    }
}

function setBackground(key) {
    const url = BACKGROUNDS[key] || BACKGROUNDS.default;

    // Preload image before crossfading
    const img = new Image();
    img.onload = () => {
        if (currentBgLayer === "current") {
            els.bgNext.style.backgroundImage = `url('${url}')`;
            els.bgNext.style.opacity = "1";
            els.bgCurrent.style.opacity = "0";
            currentBgLayer = "next";
        } else {
            els.bgCurrent.style.backgroundImage = `url('${url}')`;
            els.bgCurrent.style.opacity = "1";
            els.bgNext.style.opacity = "0";
            currentBgLayer = "current";
        }
    };
    img.src = url;
}

// ===== UI State =====
function showState(state) {
    els.loading.classList.remove("show");
    els.error.classList.remove("show");
    els.content.classList.remove("show");

    if (state === "loading") els.loading.classList.add("show");
    if (state === "error") els.error.classList.add("show");
    if (state === "content") els.content.classList.add("show");
}

// ===== Utility =====
function formatTime(timestamp, timezoneOffset) {
    const date = new Date((timestamp + timezoneOffset) * 1000);
    const hours = date.getUTCHours().toString().padStart(2, "0");
    const minutes = date.getUTCMinutes().toString().padStart(2, "0");
    return `${hours}:${minutes}`;
}

function formatDate(timezoneOffset) {
    const now = new Date();
    const utc = now.getTime() + now.getTimezoneOffset() * 60000;
    const local = new Date(utc + timezoneOffset * 1000);
    return local.toLocaleDateString("en-US", {
        weekday: "long",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
    });
}

// ===== Fetch Weather =====
async function fetchWeather(city) {
    if (!city || !city.trim()) return;

    showState("loading");

    try {
        const response = await fetch(
            `${API_URL}?q=${encodeURIComponent(city.trim())}&units=metric&appid=${API_KEY}`
        );

        if (!response.ok) {
            if (response.status === 404) {
                els.errorMsg.textContent = `City "${city}" not found. Please check the spelling.`;
            } else {
                els.errorMsg.textContent = "Something went wrong. Please try again later.";
            }
            showState("error");
            return;
        }

        const data = await response.json();

        // Update UI
        els.cityName.textContent = data.name + ", " + data.sys.country;
        els.dateTime.textContent = formatDate(data.timezone);
        els.temp.textContent = Math.round(data.main.temp);
        els.weatherIcon.src = `https://openweathermap.org/img/wn/${data.weather[0].icon}@4x.png`;
        els.weatherIcon.alt = data.weather[0].description;
        els.desc.textContent = data.weather[0].description;
        els.feelsLike.textContent = `Feels like ${Math.round(data.main.feels_like)}°C`;
        els.maxTemp.textContent = `${Math.round(data.main.temp_max)}°C`;
        els.minTemp.textContent = `${Math.round(data.main.temp_min)}°C`;
        els.humidity.textContent = `${data.main.humidity}%`;
        els.wind.textContent = `${data.wind.speed} km/h`;
        els.pressure.textContent = `${data.main.pressure} hPa`;
        els.visibility.textContent = data.visibility
            ? `${(data.visibility / 1000).toFixed(1)} km`
            : "N/A";
        els.sunrise.textContent = formatTime(data.sys.sunrise, data.timezone);
        els.sunset.textContent = formatTime(data.sys.sunset, data.timezone);

        // Change background based on weather
        const bgKey = getBackgroundKey(data.weather[0].main, data.weather[0].icon);
        setBackground(bgKey);

        showState("content");
    } catch (err) {
        console.error("Weather fetch error:", err);
        els.errorMsg.textContent = "Network error. Check your connection and try again.";
        showState("error");
    }
}

// ===== Search =====
function search() {
    const city = els.searchBar.value.trim();
    if (city) {
        fetchWeather(city);
        els.searchBar.blur();
    }
}

els.searchBtn.addEventListener("click", search);
els.searchBar.addEventListener("keyup", (e) => {
    if (e.key === "Enter") search();
});

// ===== Init =====
// Set a default background immediately
els.bgCurrent.style.backgroundImage = `url('${BACKGROUNDS.default}')`;
fetchWeather("Paris");