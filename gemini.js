// Gemini AI機能関連のJavaScript

let geminiApiKey = localStorage.getItem('gemini-api-key') || '';

// Gemini関連の要素を取得
function getGeminiElements() {
    return {
        geminiApiKeyInput: document.getElementById('gemini-api-key'),
        saveApiKeyBtn: document.getElementById('save-api-key'),
        resetApiKeyBtn: document.getElementById('reset-api-key'),
        apiSetupCard: document.getElementById('api-setup-card'),
        chatContainer: document.getElementById('chat-container'),
        chatMessages: document.getElementById('chat-messages'),
        userInput: document.getElementById('user-input'),
        sendMessageBtn: document.getElementById('send-message'),
        quickQuestions: document.querySelectorAll('.suggestion-btn')
    };
}

// --- Gemini API関連の初期化 ---
function initializeGemini() {
    const elements = getGeminiElements();
    
    if (geminiApiKey) {
        if (elements.apiSetupCard) elements.apiSetupCard.style.display = 'none';
        if (elements.chatContainer) elements.chatContainer.style.display = 'block';
    } else {
        if (elements.apiSetupCard) elements.apiSetupCard.style.display = 'block';
        if (elements.chatContainer) elements.chatContainer.style.display = 'none';
    }
}

// --- APIキー保存 ---
function saveApiKey() {
    const elements = getGeminiElements();
    const apiKey = elements.geminiApiKeyInput?.value.trim();
    
    if (apiKey) {
        geminiApiKey = apiKey;
        localStorage.setItem('gemini-api-key', apiKey);
        if (elements.apiSetupCard) elements.apiSetupCard.style.display = 'none';
        if (elements.chatContainer) elements.chatContainer.style.display = 'block';
        alert('💖APIキーが保存されたよ〜✨');
    } else {
        alert('💔APIキーを入力してね💔');
    }
}

// --- APIキー初期化 ---
function resetApiKey() {
    if (confirm('💔本当にAPIキーを消しちゃう？💔\nチャット履歴も全部消えちゃうよ〜')) {
        geminiApiKey = '';
        localStorage.removeItem('gemini-api-key');
        const elements = getGeminiElements();
        if (elements.geminiApiKeyInput) elements.geminiApiKeyInput.value = '';
        if (elements.apiSetupCard) elements.apiSetupCard.style.display = 'block';
        if (elements.chatContainer) elements.chatContainer.style.display = 'none';
        if (elements.chatMessages) elements.chatMessages.innerHTML = '';
    }
}

// --- メッセージ送信 ---
async function sendMessage(message) {
    if (!message.trim()) return;

    const elements = getGeminiElements();
    
    // ユーザーメッセージを表示
    addMessage(message, 'user');
    if (elements.userInput) elements.userInput.value = '';

    // ローディング表示
    const loadingDiv = addMessage('💭考え中...', 'ai', true);

    try {
        const response = await callGeminiAPI(message);
        // ローディングメッセージを削除
        if (loadingDiv && loadingDiv.parentNode) {
            loadingDiv.parentNode.removeChild(loadingDiv);
        }
        addMessage(response, 'ai');
    } catch (error) {
        console.error('Gemini API error:', error);
        // ローディングメッセージを削除
        if (loadingDiv && loadingDiv.parentNode) {
            loadingDiv.parentNode.removeChild(loadingDiv);
        }
        
        let errorMessage = '💔ごめんね〜、今AIちゃんとお話できないの💔';
        
        if (error.message.includes('400')) {
            errorMessage = '💔質問の内容に問題があるかも？💔\n別の聞き方で試してみて〜✨';
        } else if (error.message.includes('401') || error.message.includes('403')) {
            errorMessage = '💔APIキーに問題があるかも💔\n設定を確認してね〜💖';
        }
        
        addMessage(errorMessage, 'ai');
    }
}

// --- メッセージをチャットに追加 ---
function addMessage(text, sender, isLoading = false) {
    const elements = getGeminiElements();
    const chatMessages = elements.chatMessages;
    
    if (!chatMessages) return null;

    const messageDiv = document.createElement('div');
    messageDiv.className = sender === 'user' ? 'user-message' : 'ai-message';
    if (isLoading) messageDiv.classList.add('loading');
    
    const prefix = sender === 'user' ? '👤 あなた: ' : '🤖 AIちゃん: ';
    messageDiv.innerHTML = `<strong>${prefix}</strong>${text}`;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    return messageDiv;
}

// --- Gemini APIを呼び出し ---
async function callGeminiAPI(message) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent`;

    const payload = {
        contents: [{
            parts: [{
                text: `毒舌ファッションデザイナーになりきって、以下の質問に答えてください。

質問: ${message}`
            }]
        }]
    };

    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': geminiApiKey
        },
        body: JSON.stringify(payload)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        throw new Error('Invalid response format');
    }
    
    return data.candidates[0].content.parts[0].text;
}

// Gemini機能のイベントリスナーを設定
function setupGeminiEventListeners() {
    const elements = getGeminiElements();
    
    // --- APIキー保存ボタン ---
    if (elements.saveApiKeyBtn) {
        elements.saveApiKeyBtn.addEventListener('click', saveApiKey);
    }

    // --- APIキーリセットボタン ---
    if (elements.resetApiKeyBtn) {
        elements.resetApiKeyBtn.addEventListener('click', resetApiKey);
    }

    // --- メッセージ送信ボタン ---
    if (elements.sendMessageBtn) {
        elements.sendMessageBtn.addEventListener('click', () => {
            const message = elements.userInput?.value;
            if (message) {
                sendMessage(message);
            }
        });
    }

    // --- Enterキーで送信 ---
    if (elements.userInput) {
        elements.userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                const message = elements.userInput.value;
                if (message) {
                    sendMessage(message);
                }
            }
        });
    }

    // --- クイック質問ボタン ---
    elements.quickQuestions.forEach(btn => {
        btn.addEventListener('click', () => {
            const question = btn.dataset.question;
            if (question) {
                if (elements.userInput) elements.userInput.value = question;
                sendMessage(question);
            }
        });
    });
}

// Gemini機能の初期化
function initializeGeminiFeature() {
    console.log('Gemini機能初期化開始');
    
    // 初期状態の設定
    initializeGemini();
    
    // イベントリスナーの設定
    setupGeminiEventListeners();
    
    console.log('Gemini機能初期化完了');
}
