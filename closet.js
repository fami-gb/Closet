// 服の管理機能関連のJavaScript

// --- サンプルデータ ---
const initialItems = [
    { id: 1, name: '白いTシャツ', category: 'tops', image: 'https://via.placeholder.com/150/ffffff/000000?Text=T-Shirt', date: '2024-01-01' },
    { id: 2, name: 'ブルージーンズ', category: 'bottoms', image: 'https://via.placeholder.com/150/0000FF/FFFFFF?Text=Jeans', date: '2024-01-02' },
    { id: 3, name: '黒いジャケット', category: 'outerwear', image: 'https://via.placeholder.com/150/000000/FFFFFF?Text=Jacket', date: '2024-01-03' }
];

let clothingItems = [...initialItems];
let currentFilter = 'all';
let currentSort = 'newest';
let editingItemId = null; // 編集中のアイテムIDを保持

// カテゴリー名を日本語に変換
function getCategoryName(category) {
    const categoryNames = {
        'tops': 'トップス',
        'bottoms': 'ボトムス',
        'outerwear': 'アウター',
        'shoes': 'シューズ',
        'accessory': 'アクセサリー'
    };
    return categoryNames[category] || category;
}

// 服をフィルタリング・ソートして表示
function renderCloset() {
    const itemGallery = document.getElementById('item-gallery');
    if (!itemGallery) return;

    // フィルタリング
    let filteredItems = clothingItems;
    if (currentFilter !== 'all') {
        filteredItems = clothingItems.filter(item => item.category === currentFilter);
    }

    // ソート
    filteredItems = [...filteredItems].sort((a, b) => {
        switch (currentSort) {
            case 'newest':
                return new Date(b.date || '2024-01-01') - new Date(a.date || '2024-01-01');
            case 'oldest':
                return new Date(a.date || '2024-01-01') - new Date(b.date || '2024-01-01');
            case 'name':
                return a.name.localeCompare(b.name);
            case 'category':
                return a.category.localeCompare(b.category);
            default:
                return 0;
        }
    });

    // 表示
    itemGallery.innerHTML = '';
    if (filteredItems.length === 0) {
        itemGallery.innerHTML = `
            <div style="grid-column: 1 / -1; text-align: center; padding: 40px; color: #666;">
                <p>💝まだアイテムがないよ〜</p>
                <p>右下の ➕ ボタンから可愛い服を追加してね💕</p>
            </div>
        `;
        return;
    }

    filteredItems.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.classList.add('clothing-item');
        itemDiv.dataset.id = item.id;
        itemDiv.innerHTML = `
            <div class="category-badge">${getCategoryName(item.category)}</div>
            <img src="${item.image}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150/cccccc/000000?Text=No+Image'">
            <div class="item-name">${item.name}</div>
            <div class="item-actions">
                <button class="edit-btn" title="編集">✏️</button>
                <button class="delete-btn" title="削除">🗑️</button>
            </div>
        `;
        itemGallery.appendChild(itemDiv);
    });
}

// モーダル表示/非表示
function openModal(mode = 'add', item = null) {
    const modal = document.getElementById('addItemModal');
    const modalTitle = document.getElementById('modal-title');
    const itemNameInput = document.getElementById('itemName');
    const itemDateInput = document.getElementById('itemDate');
    const itemCategorySelect = document.getElementById('itemCategory');
    const imagePreview = document.getElementById('imagePreview');

    if (!modal) return;

    modal.style.display = 'flex';
    
    if (mode === 'edit' && item) {
        modalTitle.textContent = '💖服を編集💖';
        itemNameInput.value = item.name;
        itemDateInput.value = item.date || '';
        itemCategorySelect.value = item.category;
        imagePreview.innerHTML = `<img src="${item.image}" alt="Preview">`;
        editingItemId = item.id;
    } else {
        modalTitle.textContent = '💖新しい服を登録💖';
        itemNameInput.value = '';
        itemDateInput.value = '';
        itemCategorySelect.value = 'tops';
        imagePreview.innerHTML = 'クリックして画像を選択';
        editingItemId = null;
    }
}

function closeModal() {
    const modal = document.getElementById('addItemModal');
    if (modal) {
        modal.style.display = 'none';
    }
    editingItemId = null;
}

// 画像プレビュー機能
function setupImagePreview() {
    const imagePreview = document.getElementById('imagePreview');
    const imageInput = document.getElementById('itemImageInput');

    if (imagePreview && imageInput) {
        imagePreview.addEventListener('click', () => imageInput.click());
        
        imageInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    imagePreview.innerHTML = `<img src="${e.target.result}" alt="Preview">`;
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// 服の保存/更新処理
function saveItem() {
    const name = document.getElementById('itemName').value.trim();
    const date = document.getElementById('itemDate').value;
    const category = document.getElementById('itemCategory').value;
    const imagePreview = document.getElementById('imagePreview');
    const imageSrc = imagePreview.querySelector('img')?.src || 'https://via.placeholder.com/150/cccccc/000000?Text=No+Image';

    if (!name) {
        alert('💔アイテム名を入力してね💔');
        return;
    }

    if (editingItemId) {
        // 編集モード
        const itemIndex = clothingItems.findIndex(item => item.id === editingItemId);
        if (itemIndex !== -1) {
            clothingItems[itemIndex] = {
                ...clothingItems[itemIndex],
                name,
                date,
                category,
                image: imageSrc
            };
        }
    } else {
        // 新規追加モード
        const newItem = {
            id: Date.now(),
            name,
            date: date || new Date().toISOString().split('T')[0],
            category,
            image: imageSrc
        };
        clothingItems.push(newItem);
    }

    renderCloset();
    closeModal();
}

// 服の編集/削除
function handleItemActions() {
    const itemGallery = document.getElementById('item-gallery');
    if (!itemGallery) return;

    itemGallery.addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;

        const parentItem = target.closest('.clothing-item');
        const itemId = Number(parentItem.dataset.id);

        if (target.classList.contains('edit-btn')) {
            const item = clothingItems.find(item => item.id === itemId);
            if (item) {
                openModal('edit', item);
            }
        }

        if (target.classList.contains('delete-btn')) {
            if (confirm('💔本当にこのアイテムを削除しますか？💔')) {
                clothingItems = clothingItems.filter(item => item.id !== itemId);
                renderCloset();
            }
        }
    });
}

// カテゴリーフィルターとソート機能
function setupFiltersAndSort() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    const sortSelect = document.getElementById('sort-select');

    // フィルターボタンのイベント
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.category;
            renderCloset();
        });
    });

    // ソートセレクトのイベント
    if (sortSelect) {
        sortSelect.addEventListener('change', () => {
            currentSort = sortSelect.value;
            renderCloset();
        });
    }
}

// 服の管理機能の初期化
function initializeCloset() {
    const fab = document.getElementById('fab');
    const modal = document.getElementById('addItemModal');
    const cancelBtn = document.getElementById('cancel-btn');
    const saveBtn = document.getElementById('save-btn');

    // FABボタンのクリックイベント
    if (fab) {
        fab.addEventListener('click', () => openModal('add'));
    }

    // モーダルのイベント
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModal);
    }

    if (saveBtn) {
        saveBtn.addEventListener('click', saveItem);
    }

    if (modal) {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
    }

    // 各種機能の初期化
    setupImagePreview();
    handleItemActions();
    setupFiltersAndSort();
    
    // 初期表示
    renderCloset();
}
