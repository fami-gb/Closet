// 天気機能関連のJavaScript

// 選択された地点の情報を保存
let selectedLocation = {
    city: '東京',
    lat: 35.6762,
    lon: 139.6503
};

// --- 全国の天気データ ---
const majorCities = [
    { name: '札幌', lat: 43.0642, lon: 141.3469 },
    { name: '仙台', lat: 38.2682, lon: 140.8694 },
    { name: '東京', lat: 35.6762, lon: 139.6503 },
    { name: '横浜', lat: 35.4437, lon: 139.6380 },
    { name: '名古屋', lat: 35.1815, lon: 136.9066 },
    { name: '京都', lat: 35.0116, lon: 135.7681 },
    { name: '大阪', lat: 34.6937, lon: 135.5023 },
    { name: '神戸', lat: 34.6901, lon: 135.1956 },
    { name: '広島', lat: 34.3853, lon: 132.4553 },
    { name: '福岡', lat: 33.5904, lon: 130.4017 },
    { name: '沖縄', lat: 26.2124, lon: 127.6792 }
];

// OpenWeatherMap API Key
const WEATHER_API_KEY = 'a5ea9ddc9b7d6e0c0d5555185743180d';

// 天気アイコンを取得する関数
function getWeatherIcon(weatherCode, isDay = true) {
    const weatherIcons = {
        '01d': '☀️', '01n': '🌙',
        '02d': '⛅', '02n': '☁️',
        '03d': '☁️', '03n': '☁️',
        '04d': '☁️', '04n': '☁️',
        '09d': '🌧️', '09n': '🌧️',
        '10d': '🌦️', '10n': '🌧️',
        '11d': '⛈️', '11n': '⛈️',
        '13d': '❄️', '13n': '❄️',
        '50d': '🌫️', '50n': '🌫️'
    };
    return weatherIcons[weatherCode] || '🌤️';
}

// 全国の天気を取得する関数
async function fetchNationalWeather() {
    const weatherGrid = document.getElementById('weather-grid');
    
    try {
        weatherGrid.innerHTML = '<div class="loading-message">天気情報を読み込み中...</div>';
        
        const weatherPromises = majorCities.map(async (city) => {
            try {
                const response = await fetch(
                    `https://api.openweathermap.org/data/2.5/weather?lat=${city.lat}&lon=${city.lon}&appid=${WEATHER_API_KEY}&units=metric&lang=ja`
                );
                
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                
                const data = await response.json();
                return { ...data, cityName: city.name };
            } catch (error) {
                console.error(`Error fetching weather for ${city.name}:`, error);
                return {
                    cityName: city.name,
                    error: true,
                    main: { temp: 0, feels_like: 0, humidity: 0 },
                    weather: [{ description: 'データ取得エラー', icon: '❌' }],
                    wind: { speed: 0 }
                };
            }
        });

        const weatherData = await Promise.all(weatherPromises);
        displayNationalWeather(weatherData);
        
    } catch (error) {
        console.error('Error fetching national weather:', error);
        weatherGrid.innerHTML = `
            <div class="error-message">
                ❌ 天気情報の取得に失敗しました<br>
                しばらく待ってから再度お試しください
            </div>
        `;
    }
}

// 天気データを表示する関数
function displayNationalWeather(weatherData) {
    const weatherGrid = document.getElementById('weather-grid');
    
    const weatherCards = weatherData.map(data => {
        const temp = Math.round(data.main.temp);
        const feelsLike = Math.round(data.main.feels_like);
        const humidity = data.main.humidity;
        const windSpeed = Math.round(data.wind.speed * 3.6); // m/s to km/h
        const description = data.weather[0].description;
        const icon = data.error ? '❌' : getWeatherIcon(data.weather[0].icon);
        
        return `
            <div class="weather-card-item">
                <div class="weather-header">
                    <div class="weather-city">${data.cityName}</div>
                    <div class="weather-icon-large">${icon}</div>
                </div>
                <div class="weather-main">
                    <div class="weather-temp-large">${temp}°C</div>
                    <div class="weather-condition-text">${description}</div>
                </div>
                <div class="weather-details">
                    <div class="weather-detail-item">
                        <span class="weather-detail-icon">🌡️</span>
                        <span>体感: ${feelsLike}°C</span>
                    </div>
                    <div class="weather-detail-item">
                        <span class="weather-detail-icon">💧</span>
                        <span>湿度: ${humidity}%</span>
                    </div>
                    <div class="weather-detail-item">
                        <span class="weather-detail-icon">💨</span>
                        <span>風速: ${windSpeed}km/h</span>
                    </div>
                    <div class="weather-detail-item">
                        <span class="weather-detail-icon">📍</span>
                        <span>${data.cityName}</span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
    
    weatherGrid.innerHTML = weatherCards;
}

// --- サイドバー天気機能 ---
// サイドバーの天気を取得・更新
async function updateSidebarWeather() {
    const locationEl = document.getElementById('weather-location');
    const tempEl = document.getElementById('weather-temp');
    const descEl = document.getElementById('weather-desc');

    try {
        locationEl.textContent = `📍 ${selectedLocation.city}`;
        tempEl.textContent = '--°C';
        descEl.textContent = '読み込み中...';

        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${selectedLocation.lat}&lon=${selectedLocation.lon}&appid=${WEATHER_API_KEY}&units=metric&lang=ja`
        );

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const temp = Math.round(data.main.temp);
        const description = data.weather[0].description;

        tempEl.textContent = `${temp}°C`;
        descEl.textContent = description;

    } catch (error) {
        console.error('Sidebar weather error:', error);
        tempEl.textContent = '--°C';
        descEl.textContent = 'エラー';
    }
}

// 地点選択モーダルの制御
function openLocationModal() {
    const locationModal = document.getElementById('locationModal');
    locationModal.style.display = 'flex';
}

function closeLocationModal() {
    const locationModal = document.getElementById('locationModal');
    locationModal.style.display = 'none';
}

// 地点を選択・保存
function selectLocation(city, lat, lon) {
    selectedLocation = { city, lat, lon };
    localStorage.setItem('selected-location', JSON.stringify(selectedLocation));
    updateSidebarWeather();
    closeLocationModal();
}

// 現在地を取得
function getCurrentLocation() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                
                try {
                    // 座標から都市名を取得
                    const response = await fetch(
                        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=metric&lang=ja`
                    );
                    
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    
                    const data = await response.json();
                    const cityName = data.name || '現在地';
                    
                    selectLocation(cityName, lat, lon);
                } catch (error) {
                    console.error('Error getting location weather:', error);
                    selectLocation('現在地', lat, lon);
                }
            },
            (error) => {
                console.error('Geolocation error:', error);
                alert('位置情報の取得に失敗しました。');
            }
        );
    } else {
        alert('このブラウザは位置情報に対応していません。');
    }
}

// 天気機能の初期化
function initializeWeather() {
    // localStorageから保存された地点を読み込み
    const savedLocation = localStorage.getItem('selected-location');
    if (savedLocation) {
        selectedLocation = JSON.parse(savedLocation);
    }

    // 天気表示地点変更ボタン
    const weatherChangeBtn = document.getElementById('weather-change-btn');
    const locationModal = document.getElementById('locationModal');
    const locationCancelBtn = document.getElementById('location-cancel-btn');
    const locationBtns = document.querySelectorAll('.location-btn');

    if (weatherChangeBtn) {
        weatherChangeBtn.addEventListener('click', openLocationModal);
    }
    
    if (locationCancelBtn) {
        locationCancelBtn.addEventListener('click', closeLocationModal);
    }

    // 地点選択ボタンのイベント
    locationBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            if (btn.classList.contains('current-location')) {
                getCurrentLocation();
            } else {
                const city = btn.dataset.city;
                const lat = parseFloat(btn.dataset.lat);
                const lon = parseFloat(btn.dataset.lon);
                selectLocation(city, lat, lon);
            }
        });
    });

    // モーダル外クリックで閉じる
    if (locationModal) {
        locationModal.addEventListener('click', (e) => {
            if (e.target === locationModal) closeLocationModal();
        });
    }

    // サイドバー天気の初期化と定期更新
    updateSidebarWeather();
    // 10分ごとに天気を更新
    setInterval(updateSidebarWeather, 10 * 60 * 1000);
}
