import React from 'react';

function getWeatherEmoji(main) {
    switch (main.toLowerCase()) {
        case 'clear':
            return '☀️';
        case 'clouds':
            return '☁️';
        case 'rain':
        case 'drizzle':
            return '🌧️';
        case 'thunderstorm':
            return '⛈️';
        case 'snow':
            return '❄️';
        case 'mist':
        case 'fog':
        case 'haze':
            return '🌫️';
        default:
            return '🌡️';
    }
}

function WeatherWidget({ weather }) {
    if (!weather || !weather.weather || !weather.weather[0]) return null;
    const main = weather.weather[0].main;
    const emoji = getWeatherEmoji(main);
    return (
        <div className="weather-widget" style={{
            // background: "rgb(182, 207, 20)",
            borderRadius: '10px',
            padding: '16px',
            margin: '16px 0',
            boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
        }}>
            <h4 style={{ margin: '0 0 8px 0' }}>Weather near your location</h4>
            <div style={{ fontSize: '2rem' }}>{emoji} {weather.weather[0].description}</div>
            <div><strong>City:</strong> {weather.name}</div>
            <div><strong>Temperature:</strong> {weather.main.temp}°C</div>
        </div>
    );
}

export default WeatherWidget;
