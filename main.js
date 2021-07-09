const api_key = "a76dee04b6775e3a1715e7727a72d097";
const url = "https://api.openweathermap.org/data/2.5/weather?q=";
const unit = "&units=metric&appid="
fetchWeather();

async function fetchWeather(city){
    
    const response = await fetch(url + city + unit + api_key);
    const data = await response.json();
    const name = data.name;
    const temp = data.main.temp;
    const icon = data.weather[0].icon;
    const desc = data.weather[0].description;
    const max_temp = data.main.temp_max;
    const min_temp = data.main.temp_min;
    const humidity = data.main.humidity;
    const wind = data.wind.speed;
    
    document.querySelector(".city-name").innerText = "Weather in " + name;
    document.querySelector(".temp").innerText = temp + " °C";
    document.querySelector(".icon").src = "https://openweathermap.org/img/wn/" + icon + "@2x.png";
    document.querySelector(".max-temp").innerText = "Max temp: " + max_temp + " °C";
    document.querySelector(".min-temp").innerText = "Min temp: " + min_temp + " °C";
    document.querySelector(".desc").innerText = desc;
    document.querySelector(".humidity").innerText = "Humidity: " + humidity + "%";
    document.querySelector(".wind").innerText = "Wind speed: " + wind + " km/h";
}

function srch(){
    fetchWeather(document.querySelector(".search-bar").value);
}

document.querySelector(".btn").addEventListener("click",() => srch());
document.querySelector(".search-bar").addEventListener("keyup", function(event){
    if(event.key == "Enter"){
        srch();
    }
});

fetchWeather("paris");