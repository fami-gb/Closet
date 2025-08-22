// アプリの状態
let currentTab = 'home';
let clothes = JSON.parse(localStorage.getItem('closet-clothes') || '[]');
let outfits = JSON.parse(localStorage.getItem('closet-outfits') || '{}');
let selectedDate = new Date().toISOString().split('T')[0];
let weatherData = null;

// 天気情報を取得
async function fetchWeather() {
    try {
        // 方法1: 自動位置取得
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const lat = position.coords.latitude;
                const lon = position.coords.longitude;
                await getWeatherData(lat, lon);
            }, () => {
                // 位置情報取得失敗時は固定座標を使用
                useFixedLocation();
            });
        } else {
            useFixedLocation();
        }
    } catch (error) {
        console.log('天気情報取得エラー:', error);
        setDummyWeather();
    }
}

// 方法2: 固定座標を使用
function useFixedLocation() {
    const lat = 36.0; // 
    const lon = 140.0; // 
    getWeatherData(lat, lon);
}

// 天気データを取得
async function getWeatherData(lat, lon) {
    try {
        // ここにあなたのAPIキーを入力してください
        const apiKey = 'a5ea9ddc9b7d6e0c0d5555185743180d'; // ←ここを変更！
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&lang=ja`;
        
        const response = await fetch(url);
        if (response.ok) {
            weatherData = await response.json();
            updateWeatherDisplay();
        } else {
            console.log('API応答エラー:', response.status);
            setDummyWeather();
        }
    } catch (error) {
        console.log('天気API接続エラー:', error);
        setDummyWeather();
    }
}

// ダミー天気データ（デモ用）
function setDummyWeather() {
    weatherData = {
        main: { temp: 22 },
        weather: [{ main: 'Clear', description: '晴れ', icon: '01d' }],
        name: '富士市'
    };
    updateWeatherDisplay();
}

// 天気表示の更新
function updateWeatherDisplay() {
    if (weatherData) {
        document.getElementById('weather-temp').textContent = Math.round(weatherData.main.temp) + '°C';
        document.getElementById('weather-desc').textContent = weatherData.weather[0].description;
        
        // 天気アイコンの更新
        const iconElement = document.getElementById('weather-icon');
        const weatherMain = weatherData.weather[0].main;
        
        let icon = '☀️';
        let iconClass = 'weather-icon-sunny';
        
        switch (weatherMain) {
            case 'Clear':
                icon = '☀️';
                iconClass = 'weather-icon-sunny';
                break;
            case 'Clouds':
                icon = '☁️';
                iconClass = 'weather-icon-cloudy';
                break;
            case 'Rain':
                icon = '🌧️';
                iconClass = 'weather-icon-rainy';
                break;
            case 'Snow':
                icon = '❄️';
                iconClass = 'weather-icon-snowy';
                break;
            case 'Thunderstorm':
                icon = '⛈️';
                iconClass = 'weather-icon-cloudy';
                break;
            default:
                icon = '🌤️';
                iconClass = 'weather-icon-cloudy';
        }
        
        iconElement.innerHTML = icon;
        iconElement.className = `weather-icon ${iconClass}`;
    }
}

// 画像をリサイズして保存
function resizeImage(file, callback) {
    const canvas = document.getElementById('image-preview');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.onload = function() {
        // キャンバスサイズを設定
        const maxSize = 200;
        let { width, height } = img;
        
        if (width > height) {
            if (width > maxSize) {
                height = height * (maxSize / width);
                width = maxSize;
            }
        } else {
            if (height > maxSize) {
                width = width * (maxSize / height);
                height = maxSize;
            }
        }
        
        canvas.width = width;
        canvas.height = height;
        canvas.classList.remove('hidden');
        
        // 画像を描画
        ctx.drawImage(img, 0, 0, width, height);
        
        // Base64データURLを取得
        const dataURL = canvas.toDataURL('image/jpeg', 0.8);
        callback(dataURL);
    };
    
    img.src = URL.createObjectURL(file);
}

// カテゴリー別のCSSクラス
function getCategoryClass(category) {
    const classes = {
        tops: 'category-tops',
        bottoms: 'category-bottoms',
        shoes: 'category-shoes',
        accessories: 'category-accessories'
    };
    return `category-tag ${classes[category] || 'category-tag'}`;
}

// タブの切り替え
function showTab(tab) {
    // 全てのスクリーンを非表示
    document.getElementById('home-screen').classList.add('hidden');
    document.getElementById('clothes-screen').classList.add('hidden');
    document.getElementById('calendar-screen').classList.add('hidden');

    // 選択されたスクリーンを表示
    document.getElementById(tab + '-screen').classList.remove('hidden');

    // タブボタンのスタイル更新
    document.querySelectorAll('.nav-button').forEach(btn => {
        btn.classList.remove('nav-button-active');
    });
    document.getElementById(tab + '-tab').classList.add('nav-button-active');

    currentTab = tab;

    // タブに応じてコンテンツを更新
    if (tab === 'home') updateHomeScreen();
    if (tab === 'clothes') updateClothesScreen();
    if (tab === 'calendar') updateCalendarScreen();
}

// 服追加モーダルの表示/非表示
function showAddClothes() {
    document.getElementById('add-clothes-modal').classList.remove('hidden');
}

function hideAddClothes() {
    document.getElementById('add-clothes-modal').classList.add('hidden');
    document.getElementById('clothes-name').value = '';
    document.getElementById('clothes-category').value = 'tops';
    document.getElementById('clothes-color').value = '';
    document.getElementById('clothes-image').value = '';
    document.getElementById('image-preview').classList.add('hidden');
}

// 服を追加
function addClothes() {
    const name = document.getElementById('clothes-name').value.trim();
    const category = document.getElementById('clothes-category').value;
    const color = document.getElementById('clothes-color').value.trim();
    const imageFile = document.getElementById('clothes-image').files[0];

    if (name) {
        if (imageFile) {
            resizeImage(imageFile, function(dataURL) {
                const clothesItem = {
                    id: Date.now(),
                    name: name,
                    category: category,
                    color: color,
                    image: dataURL,
                    addedDate: new Date().toISOString()
                };

                clothes.push(clothesItem);
                localStorage.setItem('closet-clothes', JSON.stringify(clothes));
                hideAddClothes();
                updateClothesScreen();
                updateHomeScreen();
                updateCalendarScreen();
            });
        } else {
            const clothesItem = {
                id: Date.now(),
                name: name,
                category: category,
                color: color,
                image: null,
                addedDate: new Date().toISOString()
            };

            clothes.push(clothesItem);
            localStorage.setItem('closet-clothes', JSON.stringify(clothes));
            hideAddClothes();
            updateClothesScreen();
            updateHomeScreen();
            updateCalendarScreen();
        }
    }
}

// ホーム画面の更新
function updateHomeScreen() {
    // 今日の服装
    const todayOutfit = outfits[selectedDate];
    const todayOutfitEl = document.getElementById('today-outfit');
    
    if (todayOutfit && todayOutfit.length > 0) {
        todayOutfitEl.innerHTML = todayOutfit.map(clothesId => {
            const item = clothes.find(c => c.id === clothesId);
            if (item) {
                return `<div class="outfit-item ${getCategoryClass(item.category).replace('category-tag ', '')}">
                    <p class="outfit-item-name">${item.name}</p>
                    <p class="outfit-item-category">${item.category}</p>
                </div>`;
            }
            return '';
        }).join('');
    } else {
        todayOutfitEl.innerHTML = '<p class="empty-state">まだ記録されていません</p>';
    }

    // おすすめ
    const recommendations = getRecommendations();
    const recommendationsEl = document.getElementById('recommendations');
    
    if (recommendations.length > 0) {
        recommendationsEl.innerHTML = recommendations.map(item => `
            <div class="recommend-item ${getCategoryClass(item.category).replace('category-tag ', '')}">
                <div class="recommend-item-info">
                    <p class="recommend-item-name">${item.name}</p>
                    <p class="recommend-item-category">${item.category}</p>
                </div>
                <button onclick="wearClothes(${item.id})" class="recommend-button">
                    着る
                </button>
            </div>
        `).join('');
    } else {
        recommendationsEl.innerHTML = '<p class="empty-state">服を登録してください</p>';
    }
}

// 服の管理画面の更新
function updateClothesScreen() {
    const clothesListEl = document.getElementById('clothes-list');
    
    if (clothes.length > 0) {
        clothesListEl.innerHTML = clothes.map(item => `
            <div class="clothes-item">
                <div class="clothes-item-content">
                    <div class="clothes-item-info">
                        <h3 class="clothes-item-name">${item.name}</h3>
                        <span class="${getCategoryClass(item.category)}">
                            ${item.category}
                        </span>
                        ${item.color ? `<p class="clothes-item-color">色: ${item.color}</p>` : ''}
                    </div>
                    ${item.image ? `
                        <div class="clothes-item-image">
                            <img src="${item.image}" alt="${item.name}">
                        </div>
                    ` : `
                        <div class="clothes-item-placeholder">
                            📷
                        </div>
                    `}
                </div>
            </div>
        `).join('');
    } else {
        clothesListEl.innerHTML = '<p class="empty-state-large">服を追加してください</p>';
    }
}

// カレンダー画面の更新
function updateCalendarScreen() {
    document.getElementById('date-picker').value = selectedDate;
    
    // 選択した日の服装
    const selectedDateOutfit = outfits[selectedDate];
    const selectedDateOutfitEl = document.getElementById('selected-date-outfit');
    
    if (selectedDateOutfit && selectedDateOutfit.length > 0) {
        selectedDateOutfitEl.innerHTML = selectedDateOutfit.map(clothesId => {
            const item = clothes.find(c => c.id === clothesId);
            if (item) {
                return `<div class="outfit-item ${getCategoryClass(item.category).replace('category-tag ', '')}">${item.name}</div>`;
            }
            return '';
        }).join('');
    } else {
        selectedDateOutfitEl.innerHTML = '<p class="empty-state">この日は記録がありません</p>';
    }

    // チェックリスト
    const checklistEl = document.getElementById('clothes-checklist');
    
    if (clothes.length > 0) {
        checklistEl.innerHTML = clothes.map(item => `
            <div class="checkbox-item">
                <input
                    type="checkbox"
                    ${selectedDateOutfit && selectedDateOutfit.includes(item.id) ? 'checked' : ''}
                    onchange="toggleOutfit(${item.id})"
                />
                <span class="checkbox-label ${getCategoryClass(item.category).replace('category-tag ', '')}">${item.name}</span>
            </div>
        `).join('');
    } else {
        checklistEl.innerHTML = '<p class="empty-state">服を追加してください</p>';
    }
}

// 日付の更新
function updateSelectedDate() {
    selectedDate = document.getElementById('date-picker').value;
    updateCalendarScreen();
    if (currentTab === 'home') updateHomeScreen();
}

// 服装の切り替え
function toggleOutfit(clothesId) {
    const currentOutfit = outfits[selectedDate] || [];
    
    if (currentOutfit.includes(clothesId)) {
        outfits[selectedDate] = currentOutfit.filter(id => id !== clothesId);
    } else {
        outfits[selectedDate] = [...currentOutfit, clothesId];
    }
    
    localStorage.setItem('closet-outfits', JSON.stringify(outfits));
    updateCalendarScreen();
    if (currentTab === 'home') updateHomeScreen();
}

// 服を着る
function wearClothes(clothesId) {
    const currentOutfit = outfits[selectedDate] || [];
    if (!currentOutfit.includes(clothesId)) {
        outfits[selectedDate] = [...currentOutfit, clothesId];
        localStorage.setItem('closet-outfits', JSON.stringify(outfits));
        updateHomeScreen();
    }
}

// レコメンド機能
function getRecommendations() {
    if (clothes.length === 0) return [];
    
    const recentOutfits = Object.values(outfits).flat();
    const lessWornClothes = clothes.filter(item => 
        !recentOutfits.includes(item.id) || 
        recentOutfits.filter(id => id === item.id).length < 2
    );
    
    return lessWornClothes.slice(0, 3);
}

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('date-picker').value = selectedDate;
    updateHomeScreen();
    fetchWeather(); // 天気情報を取得
    
    // 画像選択時の処理
    document.getElementById('clothes-image').addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            resizeImage(file, function(dataURL) {
                console.log('画像をリサイズしました');
            });
        }
    });
});
                