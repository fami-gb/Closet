// カレンダー機能関連のJavaScript

// カレンダーUIのセットアップ
function setupCalendarUI() {
    const calendarTitle = document.getElementById('calendar-title');
    const calendarTable = document.getElementById('simple-calendar');
    
    if (!calendarTable) return;

    // カレンダーのヘッダーを追加
    if (!calendarTable.querySelector('thead')) {
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th style="padding:8px; background:#f0f0f0; border:1px solid #ddd;">日</th>
                <th style="padding:8px; background:#f0f0f0; border:1px solid #ddd;">月</th>
                <th style="padding:8px; background:#f0f0f0; border:1px solid #ddd;">火</th>
                <th style="padding:8px; background:#f0f0f0; border:1px solid #ddd;">水</th>
                <th style="padding:8px; background:#f0f0f0; border:1px solid #ddd;">木</th>
                <th style="padding:8px; background:#f0f0f0; border:1px solid #ddd;">金</th>
                <th style="padding:8px; background:#f0f0f0; border:1px solid #ddd;">土</th>
            </tr>
        `;
        calendarTable.appendChild(thead);
    }

    // tbody要素を追加
    if (!calendarTable.querySelector('tbody')) {
        const tbody = document.createElement('tbody');
        calendarTable.appendChild(tbody);
    }
}

// カレンダーUIを生成
function renderCalendar(year, month) {
    const calendarTitle = document.getElementById('calendar-title');
    const calendarTable = document.getElementById('simple-calendar');
    
    if (!calendarTitle || !calendarTable) return;

    console.log('カレンダーを生成中:', year, month);
    
    calendarTitle.textContent = `${year}年${month}月`;
    
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();
    
    let html = '';
    let day = 1;
    
    // 6週間分のカレンダーを生成
    for (let i = 0; i < 6; i++) {
        html += '<tr>';
        for (let j = 0; j < 7; j++) {
            if (i === 0 && j < startDay) {
                // 前月の日付（空白）
                html += '<td style="padding:8px; border:1px solid #ddd; text-align:center; color:#ccc;"></td>';
            } else if (day > daysInMonth) {
                // 来月の日付（空白）
                html += '<td style="padding:8px; border:1px solid #ddd; text-align:center; color:#ccc;"></td>';
            } else {
                // 当月の日付
                const today = new Date();
                const isToday = today.getFullYear() === year && 
                               today.getMonth() === month - 1 && 
                               today.getDate() === day;
                
                const bgColor = isToday ? 'background-color: var(--secondary-color); color: white;' : '';
                html += `<td data-date="${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}" 
                            style="padding:8px; border:1px solid #ddd; text-align:center; cursor:pointer; ${bgColor}" 
                            onmouseover="this.style.backgroundColor='#f0f0f0'" 
                            onmouseout="this.style.backgroundColor='${isToday ? 'var(--secondary-color)' : 'white'}'">${day}</td>`;
                day++;
            }
        }
        html += '</tr>';
        
        // 全ての日付を表示したら終了
        if (day > daysInMonth) break;
    }
    
    const tbody = calendarTable.querySelector('tbody');
    if (tbody) {
        tbody.innerHTML = html;
        console.log('カレンダー生成完了');
    } else {
        console.error('tbody要素が見つかりません');
    }
}

// 年・月セレクトを初期化
function initCalendarSelects() {
    // 既存のセレクトボックスがない場合は作成
    let calendarYear = document.getElementById('calendar-year');
    let calendarMonth = document.getElementById('calendar-month');
    
    if (!calendarYear || !calendarMonth) {
        const calendarTitle = document.getElementById('calendar-title');
        if (calendarTitle && calendarTitle.parentNode) {
            const selectContainer = document.createElement('div');
            selectContainer.style.cssText = 'display:flex; justify-content:center; align-items:center; gap:10px; margin-bottom:10px;';
            selectContainer.innerHTML = `
                <select id="calendar-year" style="padding:5px; border:1px solid #ccc; border-radius:4px;"></select>
                <select id="calendar-month" style="padding:5px; border:1px solid #ccc; border-radius:4px;"></select>
            `;
            calendarTitle.parentNode.insertBefore(selectContainer, calendarTitle);
            
            calendarYear = document.getElementById('calendar-year');
            calendarMonth = document.getElementById('calendar-month');
        }
    }
    
    if (!calendarYear || !calendarMonth) return;

    const now = new Date();
    const thisYear = now.getFullYear();
    
    // 既存のオプションをクリア（重複を防ぐ）
    calendarYear.innerHTML = '';
    calendarMonth.innerHTML = '';
    
    // 年は±5年分
    for (let y = thisYear - 5; y <= thisYear + 5; y++) {
        const option = document.createElement('option');
        option.value = y;
        option.textContent = `${y}年`;
        calendarYear.appendChild(option);
    }
    
    // 月
    for (let m = 1; m <= 12; m++) {
        const option = document.createElement('option');
        option.value = m;
        option.textContent = `${m}月`;
        calendarMonth.appendChild(option);
    }
    
    // 初期値
    calendarYear.value = thisYear;
    calendarMonth.value = now.getMonth() + 1;
    
    return { calendarYear, calendarMonth };
}

// 日付クリックイベント
function setupCalendarEvents() {
    const calendarTable = document.getElementById('simple-calendar');
    
    if (calendarTable) {
        calendarTable.addEventListener('click', (e) => {
            const td = e.target.closest('td[data-date]');
            if (td) {
                const date = td.dataset.date;
                console.log('選択された日付:', date);
                
                // 選択された日付のスタイルを変更
                const allCells = calendarTable.querySelectorAll('td[data-date]');
                allCells.forEach(cell => {
                    if (cell !== td) {
                        cell.style.backgroundColor = 'white';
                        cell.style.color = 'black';
                    }
                });
                
                td.style.backgroundColor = 'var(--primary-color)';
                td.style.color = 'white';
                
                // ここでその日のコーデ情報などを表示する処理を追加可能
                alert(`💕${date}のコーデを見る機能は準備中だよ〜💕`);
            }
        });
    }
}

// カレンダー機能の初期化
function initializeCalendar() {
    console.log('カレンダー初期化開始');
    
    // カレンダーUIのセットアップ
    setupCalendarUI();
    
    // 年・月セレクトの初期化
    const selects = initCalendarSelects();
    if (!selects) {
        console.error('カレンダーセレクトの初期化に失敗');
        return;
    }
    
    const { calendarYear, calendarMonth } = selects;
    
    // 年・月選択イベント
    calendarYear.addEventListener('change', () => {
        renderCalendar(Number(calendarYear.value), Number(calendarMonth.value));
    });
    
    calendarMonth.addEventListener('change', () => {
        renderCalendar(Number(calendarYear.value), Number(calendarMonth.value));
    });
    
    // 日付クリックイベントのセットアップ
    setupCalendarEvents();
    
    // 初期カレンダー表示
    const now = new Date();
    renderCalendar(now.getFullYear(), now.getMonth() + 1);
    
    console.log('カレンダー初期化完了');
}
