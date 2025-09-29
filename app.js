// Application state
const appState = {
    currentTab: 'server',
    currentServer: null,
    currentView: 'folders',
    currentPath: [],
    editingFile: null,
    selectedStartupFile: null,
    editingServerId: null,
    servers: {
        proxy: {
            id: "proxy",
            name: "Proxy Server",
            type: "velocity",
            status: "stopped",
            startupFile: "velocity-3.3.0-SNAPSHOT-385.jar",
            files: ["velocity.toml", "plugins/", "logs/", "velocity-3.3.0-SNAPSHOT-385.jar"],
            console: []
        },
        s1: {
            id: "s1",
            name: "Game Server 1", 
            type: "fabric",
            status: "stopped",
            startupFile: null, // 未設定
            files: ["server.properties", "mods/", "world/", "logs/", "fabric-server-launch.jar"],
            console: []
        },
        s2: {
            id: "s2",
            name: "Game Server 2",
            type: "paper", 
            status: "running",
            startupFile: "paper-1.21.1-131.jar",
            files: ["server.properties", "plugins/", "world/", "bukkit.yml", "paper-1.21.1-131.jar"],
            console: ["[INFO] Done! For help, type \"help\"", "[INFO] Timings Reset"]
        }
    },
    currentUser: {
        role: "normal", // normal, member, admin
        name: null,
        isLoggedIn: false
    }
};

// 初期化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // イベントリスナーの設定
    setupEventListeners();

    // 初期表示の設定
    renderServerFolders();
    renderSettingsTab();
    checkAuthState();
}

function setupEventListeners() {
    // タブ切り替え
    const navBtns = document.querySelectorAll('.nav-btn');
    navBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            const tab = e.target.dataset.tab;
            switchTab(tab);
        });
    });

    // モバイルメニュー
    const navToggle = document.querySelector('.nav-toggle');
    const navMobile = document.querySelector('.nav-mobile');

    navToggle?.addEventListener('click', () => {
        navMobile.classList.toggle('show');
    });

    // コンソールコマンド送信
    const commandInput = document.getElementById('consoleCommandInput');
    commandInput?.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            sendConsoleCommand();
        }
    });
}

function switchTab(tabName) {
    // ナビゲーションボタンの更新
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.tab === tabName) {
            btn.classList.add('active');
        }
    });

    // タブコンテンツの表示/非表示
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });

    document.getElementById(tabName + '-tab').classList.add('active');
    appState.currentTab = tabName;

    // モバイルメニューを閉じる
    document.querySelector('.nav-mobile').classList.remove('show');
}

// ===== SERVER TAB =====

function renderServerFolders() {
    const folderGrid = document.querySelector('.folder-grid');
    if (!folderGrid) return;

    folderGrid.innerHTML = '';

    Object.values(appState.servers).forEach(server => {
        const folderItem = document.createElement('div');
        folderItem.className = 'folder-item';
        folderItem.dataset.server = server.id;
        folderItem.onclick = () => openServerDetail(server.id);

        const statusClass = server.status === 'running' ? 'running' : 'stopped';
        const statusText = server.status === 'running' ? '実行中' : '停止中';

        const startupFileInfo = server.startupFile 
            ? 起動: 
            : '起動ファイル未設定';

        folderItem.innerHTML = 
            <div class="folder-icon">📁</div>
            <div class="folder-name"></div>
            <div class="folder-status "></div>
            <div class="startup-file-info"></div>
        ;

        folderGrid.appendChild(folderItem);
    });
}

function openServerDetail(serverId) {
    if (appState.currentUser.role === 'normal' && !appState.currentUser.isLoggedIn) {
        alert('ログインが必要です');
        return;
    }

    const server = appState.servers[serverId];
    if (!server) return;

    appState.currentServer = serverId;
    appState.currentView = 'server-detail';

    // 表示の切り替え
    document.getElementById('serverFolderView').classList.add('hidden');
    document.getElementById('serverDetailView').classList.remove('hidden');

    // サーバー詳細情報の表示
    updateServerDetailView(server);
}

function updateServerDetailView(server) {
    // ヘッダー情報
    document.getElementById('serverDetailTitle').textContent = server.name;

    const statusElement = document.getElementById('serverDetailStatus');
    statusElement.textContent = server.status === 'running' ? '実行中' : '停止中';
    statusElement.className = 'server-status ' + server.status;

    // 起動ファイル情報
    const startupFileElement = document.getElementById('currentStartupFile');
    startupFileElement.textContent = server.startupFile || '未設定';

    // コンソール表示
    updateConsoleDisplay(server.console);

    // ボタンの状態更新
    updateControlButtons(server);
}

function updateConsoleDisplay(consoleLines) {
    const consoleContent = document.getElementById('serverConsole');
    if (!consoleContent) return;

    if (consoleLines.length === 0) {
        consoleContent.textContent = 'サーバーが停止中です...';
        consoleContent.style.color = '#6c757d';
    } else {
        consoleContent.textContent = consoleLines.join('\n');
        consoleContent.style.color = '#00ff00';
    }

    // 自動スクロール
    consoleContent.scrollTop = consoleContent.scrollHeight;
}

function updateControlButtons(server) {
    const isRunning = server.status === 'running';
    const hasStartupFile = server.startupFile !== null;
    const isAdmin = appState.currentUser.role === 'admin';
    const isMemberOrAdmin = ['member', 'admin'].includes(appState.currentUser.role);

    // 起動/停止ボタン
    const startStopBtn = document.getElementById('startStopBtn');
    startStopBtn.textContent = isRunning ? '停止' : '起動';
    startStopBtn.disabled = !isAdmin || (!hasStartupFile && !isRunning);
    startStopBtn.className = isRunning ? 'btn btn-secondary' : 'btn btn-primary';

    // 再起動ボタン
    const restartBtn = document.getElementById('restartBtn');
    restartBtn.disabled = !isAdmin || !hasStartupFile;

    // コンソール入力
    const commandInput = document.getElementById('consoleCommandInput');
    const sendCommandBtn = document.getElementById('sendCommandBtn');
    commandInput.disabled = !isAdmin || !isRunning;
    sendCommandBtn.disabled = !isAdmin || !isRunning;

    if (!hasStartupFile && !isRunning) {
        showAlert('起動ファイルが設定されていません。設定タブで起動ファイルを選択してください。', 'warning');
    }
}

function goBackToFolders() {
    appState.currentView = 'folders';
    appState.currentServer = null;

    document.getElementById('serverFolderView').classList.remove('hidden');
    document.getElementById('serverDetailView').classList.add('hidden');
}

function toggleServerState() {
    if (!appState.currentServer) return;

    const server = appState.servers[appState.currentServer];
    if (server.status === 'running') {
        stopServer();
    } else {
        startServer();
    }
}

function startServer() {
    if (!appState.currentServer) return;

    const server = appState.servers[appState.currentServer];
    if (!server.startupFile) {
        alert('起動ファイルが設定されていません');
        return;
    }

    // シミュレーション: サーバー起動
    server.status = 'running';
    server.console = [
        [INFO] Starting server with ,
        '[INFO] Loading properties',
        '[INFO] Default game type: SURVIVAL',
        '[INFO] Done! For help, type "help"'
    ];

    updateServerDetailView(server);
    renderServerFolders();

    showAlert(${server.name} を起動しました, 'success');
}

function stopServer() {
    if (!appState.currentServer) return;

    const server = appState.servers[appState.currentServer];

    // シミュレーション: サーバー停止
    server.status = 'stopped';
    server.console = [];

    updateServerDetailView(server);
    renderServerFolders();

    showAlert(${server.name} を停止しました, 'success');
}

function restartServer() {
    stopServer();
    setTimeout(() => {
        startServer();
    }, 2000);
}

function sendConsoleCommand() {
    const commandInput = document.getElementById('consoleCommandInput');
    const command = commandInput.value.trim();

    if (!command || !appState.currentServer) return;

    const server = appState.servers[appState.currentServer];
    server.console.push(> );
    server.console.push([INFO] Command executed: );

    updateConsoleDisplay(server.console);
    commandInput.value = '';
}

function changeStartupFile() {
    if (!appState.currentServer) return;

    appState.editingServerId = appState.currentServer;
    showStartupFileModal();
}

// ===== 起動ファイル選択モーダル =====

function showStartupFileModal() {
    const modal = document.getElementById('startupFileModal');
    modal.classList.remove('hidden');

    renderStartupFileList();
}

function closeStartupFileModal() {
    const modal = document.getElementById('startupFileModal');
    modal.classList.add('hidden');

    appState.selectedStartupFile = null;
    appState.editingServerId = null;
}

function renderStartupFileList() {
    const browser = document.getElementById('startupFileBrowser');
    const server = appState.servers[appState.editingServerId];

    if (!server || !browser) return;

    browser.innerHTML = '';

    // 起動可能ファイルのフィルタリング
    const executableFiles = server.files.filter(file => 
        file.endsWith('.jar') || 
        file.endsWith('.exe') || 
        file.endsWith('.bat') || 
        file.endsWith('.sh')
    );

    if (executableFiles.length === 0) {
        browser.innerHTML = '<p>起動可能なファイルが見つかりません</p>';
        return;
    }

    executableFiles.forEach(file => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        fileItem.onclick = () => selectStartupFile(file);

        const icon = getFileIcon(file);

        fileItem.innerHTML = 
            <span class="file-icon"></span>
            <span class="file-name"></span>
        ;

        browser.appendChild(fileItem);
    });
}

function selectStartupFile(fileName) {
    // 既存の選択を解除
    document.querySelectorAll('.file-item').forEach(item => {
        item.classList.remove('selected');
    });

    // 新しい選択を設定
    event.target.closest('.file-item').classList.add('selected');
    appState.selectedStartupFile = fileName;

    // 表示を更新
    document.getElementById('selectedFileDisplay').textContent = fileName;
    document.getElementById('confirmStartupBtn').disabled = false;
}

function confirmStartupFileSelection() {
    if (!appState.selectedStartupFile || !appState.editingServerId) return;

    const server = appState.servers[appState.editingServerId];
    server.startupFile = appState.selectedStartupFile;

    // 表示を更新
    if (appState.currentServer === appState.editingServerId) {
        updateServerDetailView(server);
    }
    renderServerFolders();

    closeStartupFileModal();
    showAlert('起動ファイルを設定しました', 'success');
}

function filterStartupFiles() {
    // フィルタリング機能 (後で実装)
    renderStartupFileList();
}

function getFileIcon(fileName) {
    const ext = fileName.split('.').pop().toLowerCase();
    const icons = {
        'jar': '☕',
        'exe': '⚙️',
        'bat': '📝',
        'sh': '🐚'
    };
    return icons[ext] || '📄';
}

// ===== SETTINGS TAB =====

function renderSettingsTab() {
    const serverCards = document.getElementById('serverSettingsCards');
    if (!serverCards) return;

    serverCards.innerHTML = '';

    Object.values(appState.servers).forEach(server => {
        const card = document.createElement('div');
        card.className = 'server-card';

        const startupFileStatus = server.startupFile 
            ? <span style="color: #28a745;">✓ </span>
            : '<span style="color: #dc3545;">未設定</span>';

        card.innerHTML = 
            <div class="server-card-header">
                <h4></h4>
                <span class="server-type"></span>
            </div>
            <div class="server-info">
                <p><strong>タイプ:</strong> </p>
                <p><strong>状態:</strong> </p>
                <p><strong>起動ファイル:</strong> </p>
            </div>
            <div class="server-card-actions">
                <button class="btn btn-secondary btn-small" onclick="editServerConfig('')">編集</button>
                <button class="btn btn-secondary btn-small" onclick="deleteServer('')">削除</button>
            </div>
        ;

        serverCards.appendChild(card);
    });
}

function addNewServerFolder() {
    if (appState.currentUser.role !== 'admin') {
        alert('管理者権限が必要です');
        return;
    }

    appState.editingServerId = null;
    showServerConfigModal();
}

function editServerConfig(serverId) {
    if (appState.currentUser.role !== 'admin') {
        alert('管理者権限が必要です');
        return;
    }

    appState.editingServerId = serverId;
    const server = appState.servers[serverId];

    // フォームに現在の値を設定
    document.getElementById('serverName').value = server.name;
    document.getElementById('serverType').value = server.type;
    document.getElementById('modalSelectedStartupFile').textContent = server.startupFile || '未選択';

    showServerConfigModal('サーバー設定を編集');
}

function showServerConfigModal(title = '新しいサーバーを追加') {
    const modal = document.getElementById('serverConfigModal');
    document.getElementById('configModalTitle').textContent = title;
    modal.classList.remove('hidden');
}

function closeServerConfigModal() {
    const modal = document.getElementById('serverConfigModal');
    modal.classList.add('hidden');

    // フォームをリセット
    document.getElementById('serverConfigForm').reset();
    document.getElementById('modalSelectedStartupFile').textContent = '未選択';
    appState.editingServerId = null;
}

function selectStartupFileForModal() {
    // モーダル用の起動ファイル選択 (簡略化)
    const files = [
        'server.jar',
        'paper-1.21.1-131.jar',
        'fabric-server-launch.jar',
        'velocity-3.3.0-SNAPSHOT-385.jar',
        'forge-47.2.0-installer.jar'
    ];

    const selectedFile = prompt('起動ファイルを入力してください:\n' + files.join('\n'));
    if (selectedFile) {
        document.getElementById('modalSelectedStartupFile').textContent = selectedFile;
        appState.selectedStartupFile = selectedFile;
    }
}

function saveServerConfig() {
    const formData = {
        name: document.getElementById('serverName').value,
        type: document.getElementById('serverType').value,
        host: document.getElementById('serverHost').value,
        port: document.getElementById('serverPort').value,
        username: document.getElementById('serverUsername').value,
        path: document.getElementById('serverPath').value,
        privateKeyPath: document.getElementById('privateKeyPath').value,
        startupFile: appState.selectedStartupFile
    };

    // 必須項目チェック
    if (!formData.name || !formData.type || !formData.host) {
        alert('必須項目を入力してください');
        return;
    }

    if (appState.editingServerId) {
        // 既存サーバーの更新
        const server = appState.servers[appState.editingServerId];
        server.name = formData.name;
        server.type = formData.type;
        server.startupFile = formData.startupFile;
    } else {
        // 新規サーバーの追加
        const serverId = 'server_' + Date.now();
        appState.servers[serverId] = {
            id: serverId,
            name: formData.name,
            type: formData.type,
            status: 'stopped',
            startupFile: formData.startupFile,
            files: ['server.properties', 'logs/'],
            console: [],
            config: formData
        };
    }

    renderSettingsTab();
    renderServerFolders();
    closeServerConfigModal();

    showAlert('サーバー設定を保存しました', 'success');
}

function deleteServer(serverId) {
    if (appState.currentUser.role !== 'admin') {
        alert('管理者権限が必要です');
        return;
    }

    if (confirm('このサーバーを削除してもよろしいですか？')) {
        delete appState.servers[serverId];
        renderSettingsTab();
        renderServerFolders();
        showAlert('サーバーを削除しました', 'success');
    }
}

// ===== ACCOUNT TAB =====

function checkAuthState() {
    const loginSection = document.getElementById('loginSection');
    const userInfoSection = document.getElementById('userInfoSection');

    if (appState.currentUser.isLoggedIn) {
        loginSection.classList.add('hidden');
        userInfoSection.classList.remove('hidden');
        updateUserDisplay();
    } else {
        loginSection.classList.remove('hidden');
        userInfoSection.classList.add('hidden');
    }
}

function loginWithDiscord() {
    // Discord OAuth シミュレーション
    const testUser = prompt('テスト用: ユーザー名を入力してください (デモ用)', 'TestUser');
    if (!testUser) return;

    const testRole = prompt('テスト用: 権限を選択してください\n1: normal\n2: member\n3: admin', '1');
    const roles = { '1': 'normal', '2': 'member', '3': 'admin' };

    appState.currentUser = {
        isLoggedIn: true,
        name: testUser,
        role: roles[testRole] || 'normal'
    };

    checkAuthState();
    showAlert('ログインしました', 'success');
}

function updateUserDisplay() {
    document.getElementById('userName').textContent = appState.currentUser.name;

    const roleText = {
        'normal': '一般',
        'member': 'メンバー',
        'admin': '管理者'
    };

    document.getElementById('userRole').textContent = 
        権限: ;

    // 権限別表示の切り替え
    document.querySelectorAll('.permission-card').forEach(card => {
        card.classList.add('hidden');
    });

    const currentPermissionCard = document.getElementById(appState.currentUser.role + 'Permission');
    if (currentPermissionCard) {
        currentPermissionCard.classList.remove('hidden');
    }
}

function requestPermission() {
    showAlert('権限リクエストを送信しました。管理者の承認をお待ちください。', 'info');
}

function logout() {
    appState.currentUser = {
        role: 'normal',
        name: null,
        isLoggedIn: false
    };

    checkAuthState();
    showAlert('ログアウトしました', 'success');
}

// ===== ユーティリティ関数 =====

function showAlert(message, type = 'info') {
    // 既存のアラートを削除
    const existingAlert = document.querySelector('.alert-custom');
    if (existingAlert) {
        existingAlert.remove();
    }

    // 新しいアラートを作成
    const alert = document.createElement('div');
    alert.className = lert alert-custom alert-;
    alert.textContent = message;
    alert.style.cssText = 
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1rem 1.5rem;
        border-radius: 4px;
        z-index: 9999;
        max-width: 300px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    ;

    // タイプ別スタイル
    const styles = {
        'info': { bg: '#d1ecf1', color: '#0c5460', border: '#bee5eb' },
        'success': { bg: '#d4edda', color: '#155724', border: '#c3e6cb' },
        'warning': { bg: '#fff3cd', color: '#856404', border: '#ffeaa7' },
        'error': { bg: '#f8d7da', color: '#721c24', border: '#f5c6cb' }
    };

    const style = styles[type] || styles['info'];
    alert.style.backgroundColor = style.bg;
    alert.style.color = style.color;
    alert.style.border = 1px solid ;

    document.body.appendChild(alert);

    // 3秒後に自動削除
    setTimeout(() => {
        alert.remove();
    }, 3000);
}

// その他の機能 (プレースホルダー)
function viewServerMods() {
    alert('Mods管理機能 (未実装)');
}

function viewServerPlugins() {
    alert('Plugins管理機能 (未実装)');
}

function viewOtherFiles() {
    alert('ファイルブラウザ機能 (未実装)');
}
