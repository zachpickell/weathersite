const apiKey = 'API_KEY'; // Replace with your own API key

document.addEventListener('DOMContentLoaded', function() {
    const spinner = document.getElementById('loading-spinner');
    const searchBar = document.getElementById('search-bar');
    const searchButton = document.getElementById('search-btn');

    function fetchWeather(location) {
        spinner.style.display = 'flex';

        fetch(`https://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=7`)
        .then(response => response.json())
        .then(weatherData => {
            let setCurrentWeather = document.getElementById('current-loc');
            setCurrentWeather.innerHTML = weatherData.location.name + ', ' + weatherData.location.region;
            console.log(weatherData);
            let setWeeklyWeather = document.getElementById('weekly-weather');
            setWeeklyWeather.innerHTML = ''; // Clear previous weather data
            let weeklyWeather = weatherData.forecast.forecastday;

            let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
            weeklyWeather.forEach(day => {
                let date = new Date(day.date_epoch * 1000);
                day.date = days[date.getDay()];
            });

            const today = new Date().toDateString();
            weeklyWeather.forEach(day => {
                const dayDate = new Date(day.date_epoch * 1000).toDateString();
                const isActive = dayDate === today ? 'id="active"' : '';
                setWeeklyWeather.innerHTML += `
                    <div class="day" ${isActive}>
                        <p>${day.date}</p>
                        <img src="https:${day.day.condition.icon}" alt="${day.day.condition.text}">
                        <p>Lowest: ${day.day.mintemp_f} °F</p>
                        <p>Highest: ${day.day.maxtemp_f} °F</p>
                    </div>
                `;
            });

            spinner.style.display = 'none';
        })
        .catch(error => {
            console.error('Error fetching weather data:', error);
            spinner.style.display = 'none';
        });
    }

    searchButton.addEventListener('click', function() {
        const location = searchBar.value;
        if (location) {
            fetchWeather(location);
        }
    });

    fetch('https://api.ipify.org?format=json')
    .then(response => response.json())
    .then(data => {
        const userIp = data.ip;
        fetchWeather(userIp);
    });

    const recommendations = document.getElementById('recommendations');
    searchBar.addEventListener('input', function() {
        const location = searchBar.value;
        if (location) {
            fetch(`https://api.weatherapi.com/v1/search.json?key=${apiKey}&q=${location}`)
            .then(response => response.json())
            .then(data => {
                recommendations.innerHTML = ''; 
                recommendations.style.display = 'flex';
                data.forEach(location => {
                    recommendations.innerHTML += `
                        <div class="recommendation" onclick="fetchWeather('${location.name}')">
                            <p>${location.name}, ${location.region}, ${location.country}</p>
                        </div>
                    `;
                });
            });
        } else {
            recommendations.innerHTML = '';
            recommendations.style.display = 'none';
        }
    });

    // if user presses enter key
    searchBar.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const location = searchBar.value;
            if (location) {
                fetchWeather(location);
            }
        }
    });

    // if user clicks one of the recommendations
    recommendations.addEventListener('click', function(e) {
        const location = e.target.innerText
        fetchWeather(location);
        searchBar.value = location;
        recommendations.style.display = 'none';
    });
});