// メインのJavaScript - ページナビゲーションとサイドバー制御

document.addEventListener('DOMContentLoaded', () => {
    console.log('アプリケーション初期化開始');

    // --- DOM要素の取得 ---
    const navItems = document.querySelectorAll('.nav-item');
    const pages = document.querySelectorAll('.page');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.querySelector('.sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const mainContent = document.querySelector('.main-content');

    // --- サイドバーの表示/非表示切り替え ---
    function toggleSidebar() {
        const isOpen = sidebar.classList.contains('open');
        
        if (isOpen) {
            // サイドバーを閉じる
            sidebar.classList.remove('open');
            sidebarOverlay.classList.remove('active');
            menuToggle.classList.remove('active');
            mainContent.classList.remove('sidebar-open');
        } else {
            // サイドバーを開く
            sidebar.classList.add('open');
            sidebarOverlay.classList.add('active');
            menuToggle.classList.add('active');
            mainContent.classList.add('sidebar-open');
        }
    }

    // --- ページ切り替え機能 ---
    function switchPage(targetPageId) {
        // アクティブページを切り替え
        pages.forEach(page => {
            if (page.id === targetPageId) {
                page.classList.add('active');
            } else {
                page.classList.remove('active');
            }
        });

        // 特定のページでの初期化処理
        switch (targetPageId) {
            case 'weather':
                console.log('天気ページを初期化');
                if (typeof fetchNationalWeather === 'function') {
                    fetchNationalWeather();
                }
                break;
            
            case 'calendar':
                console.log('カレンダーページを初期化');
                if (typeof initializeCalendar === 'function') {
                    // 少し遅延させて確実に要素が準備されるようにする
                    setTimeout(initializeCalendar, 100);
                }
                break;
            
            case 'closet':
                console.log('クローゼットページを初期化');
                if (typeof renderCloset === 'function') {
                    renderCloset();
                }
                break;
            
            case 'gemini':
                console.log('AIページを初期化');
                if (typeof initializeGemini === 'function') {
                    initializeGemini();
                }
                break;
        }

        // モバイルサイズでサイドバーを閉じる
        if (window.innerWidth <= 768) {
            toggleSidebar();
        }
    }

    // --- イベントリスナーの設定 ---

    // ハンバーガーメニューボタンのクリックイベント
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
        console.log('メニューボタンのイベントリスナーを設定しました');
    } else {
        console.error('メニューボタンが見つかりません');
    }

    // オーバーレイのクリックでサイドバーを閉じる
    if (sidebarOverlay) {
        sidebarOverlay.addEventListener('click', toggleSidebar);
    }

    // サイドバーのナビゲーションアイテムクリック
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            // アクティブなスタイルを変更
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // 表示ページを切り替え
            const targetPageId = item.dataset.page;
            switchPage(targetPageId);
        });
    });

    // --- 各機能の初期化 ---
    
    // 天気機能の初期化
    if (typeof initializeWeather === 'function') {
        console.log('天気機能を初期化');
        initializeWeather();
    }

    // クローゼット機能の初期化
    if (typeof initializeCloset === 'function') {
        console.log('クローゼット機能を初期化');
        initializeCloset();
    }

    // Gemini機能の初期化
    if (typeof initializeGeminiFeature === 'function') {
        console.log('Gemini機能を初期化');
        initializeGeminiFeature();
    }

    // --- 初期表示の設定 ---
    
    // デフォルトでホームページを表示
    const defaultPage = 'home';
    const defaultNavItem = document.querySelector(`[data-page="${defaultPage}"]`);
    if (defaultNavItem) {
        defaultNavItem.classList.add('active');
    }

    pages.forEach(page => {
        if (page.id === defaultPage) {
            page.classList.add('active');
        } else {
            page.classList.remove('active');
        }
    });

    // --- ウィンドウリサイズ対応 ---
    window.addEventListener('resize', () => {
        // デスクトップサイズの場合、サイドバーの状態をリセット
        if (window.innerWidth > 768) {
            if (sidebar.classList.contains('open')) {
                sidebarOverlay.classList.remove('active');
            }
        }
    });

    // --- Escキーでサイドバーを閉じる ---
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && sidebar.classList.contains('open')) {
            toggleSidebar();
        }
    });

    console.log('アプリケーション初期化完了✨');
});