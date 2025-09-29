const { NodeSSH } = require('node-ssh');
const EventEmitter = require('events');

class ServerManager extends EventEmitter {
    constructor() {
        super();
        this.connections = new Map();
        this.serverConfigs = new Map();
        this.startupFiles = new Map(); // 起動ファイル管理

        // デモ用サーバー設定
        this.initializeDemoServers();
    }

    initializeDemoServers() {
        this.serverConfigs.set('proxy', {
            id: 'proxy',
            name: 'Proxy Server',
            type: 'velocity',
            host: '192.168.1.100',
            port: 22,
            username: 'minecraft',
            serverPath: '/home/minecraft/proxy',
            status: 'stopped'
        });

        this.serverConfigs.set('s1', {
            id: 's1',
            name: 'Game Server 1',
            type: 'fabric',
            host: '192.168.1.101',
            port: 22,
            username: 'minecraft',
            serverPath: '/home/minecraft/server1',
            status: 'stopped'
        });

        this.serverConfigs.set('s2', {
            id: 's2',
            name: 'Game Server 2',
            type: 'paper',
            host: '192.168.1.102',
            port: 22,
            username: 'minecraft',
            serverPath: '/home/minecraft/server2',
            status: 'running'
        });

        // デフォルト起動ファイル設定
        this.startupFiles.set('proxy', 'velocity-3.3.0-SNAPSHOT-385.jar');
        this.startupFiles.set('s1', null); // 未設定
        this.startupFiles.set('s2', 'paper-1.21.1-131.jar');

        console.log('📁 Demo servers initialized with startup file support');
    }

    async getAllServers() {
        const servers = [];

        for (const [serverId, config] of this.serverConfigs) {
            const startupFile = this.startupFiles.get(serverId);
            servers.push({
                id: serverId,
                name: config.name,
                type: config.type,
                status: config.status,
                startupFile: startupFile,
                canStart: startupFile !== null
            });
        }

        return servers;
    }

    async setStartupFile(serverId, startupFile) {
        if (!this.serverConfigs.has(serverId)) {
            throw new Error(Server  not found);
        }

        this.startupFiles.set(serverId, startupFile);

        // 起動ファイル検証 (実際のSSH接続時に実装)
        console.log(📂 Startup file set for : );

        this.emit('startupFileChanged', serverId, startupFile);
        return { success: true };
    }

    async getStartupFile(serverId) {
        return this.startupFiles.get(serverId) || null;
    }

    async validateStartupFile(serverId, startupFile) {
        // 実際の実装では SSH で ファイルの存在確認
        const config = this.serverConfigs.get(serverId);
        if (!config) return false;

        // デモ用: 拡張子チェック
        const validExtensions = ['.jar', '.exe', '.bat', '.sh'];
        return validExtensions.some(ext => startupFile.endsWith(ext));
    }

    async startServer(serverId) {
        const config = this.serverConfigs.get(serverId);
        const startupFile = this.startupFiles.get(serverId);

        if (!config) {
            throw new Error(Server  not found);
        }

        if (!startupFile) {
            throw new Error(Startup file not configured for );
        }

        try {
            // 実際のSSH接続での起動コマンド実行
            const startCommand = this.buildStartCommand(config.type, startupFile);
            console.log(🚀 Starting  with: );

            // デモ用: 状態更新
            config.status = 'running';

            this.emit('serverStarted', serverId, {
                success: true,
                startupFile: startupFile,
                command: startCommand
            });

            return { 
                success: true, 
                message: Server started with ,
                startupFile: startupFile
            };

        } catch (error) {
            console.error(Failed to start server :, error);
            throw error;
        }
    }

    async stopServer(serverId) {
        const config = this.serverConfigs.get(serverId);

        if (!config) {
            throw new Error(Server  not found);
        }

        try {
            console.log(🛑 Stopping );

            // デモ用: 状態更新
            config.status = 'stopped';

            this.emit('serverStopped', serverId);

            return { 
                success: true, 
                message: Server  stopped
            };

        } catch (error) {
            console.error(Failed to stop server :, error);
            throw error;
        }
    }

    buildStartCommand(serverType, startupFile) {
        const javaArgs = '-server -Xmx4G';

        switch (serverType) {
            case 'velocity':
                return java  -jar ;
            case 'fabric':
                return java  -jar  nogui;
            case 'paper':
            case 'spigot':
                return java  -jar  nogui;
            case 'forge':
                return java  -jar  nogui;
            default:
                return java  -jar  nogui;
        }
    }

    async connectToServer(serverId) {
        const config = this.serverConfigs.get(serverId);
        if (!config) {
            throw new Error(Server configuration not found: );
        }

        // 実際のSSH接続実装
        try {
            console.log(🔗 Connecting to  at :);

            // デモ用: 接続成功をシミュレート
            this.emit('serverConnected', serverId);
            return true;

        } catch (error) {
            console.error(Connection failed for :, error);
            this.emit('serverConnectionFailed', serverId, error.message);
            return false;
        }
    }

    async listFiles(serverId, path = '.') {
        // デモ用ファイル一覧
        const demoFiles = {
            'proxy': [
                { name: 'velocity.toml', type: 'file', size: '2.1 KB' },
                { name: 'velocity-3.3.0-SNAPSHOT-385.jar', type: 'file', size: '12.5 MB', executable: true },
                { name: 'plugins', type: 'directory', size: '-' },
                { name: 'logs', type: 'directory', size: '-' }
            ],
            's1': [
                { name: 'server.properties', type: 'file', size: '1.8 KB' },
                { name: 'fabric-server-launch.jar', type: 'file', size: '8.2 MB', executable: true },
                { name: 'mods', type: 'directory', size: '-' },
                { name: 'world', type: 'directory', size: '-' },
                { name: 'logs', type: 'directory', size: '-' }
            ],
            's2': [
                { name: 'server.properties', type: 'file', size: '1.9 KB' },
                { name: 'paper-1.21.1-131.jar', type: 'file', size: '15.3 MB', executable: true },
                { name: 'bukkit.yml', type: 'file', size: '1.2 KB' },
                { name: 'plugins', type: 'directory', size: '-' },
                { name: 'world', type: 'directory', size: '-' },
                { name: 'logs', type: 'directory', size: '-' }
            ]
        };

        return demoFiles[serverId] || [];
    }

    async executeCommand(serverId, command) {
        console.log(💻 Executing command on : );

        // デモ用: コマンド実行結果をシミュレート
        return {
            success: true,
            stdout: Command '' executed on ,
            stderr: '',
            code: 0
        };
    }

    async addServerConfig(serverId, config) {
        this.serverConfigs.set(serverId, {
            id: serverId,
            ...config,
            status: 'stopped'
        });

        // 起動ファイルが指定されている場合は設定
        if (config.startupFile) {
            this.startupFiles.set(serverId, config.startupFile);
        }

        console.log(➕ Server configuration added: );
    }

    getServerStatus(serverId) {
        const config = this.serverConfigs.get(serverId);
        if (!config) {
            return { status: 'unknown', error: 'Server not found' };
        }

        return {
            status: config.status,
            startupFile: this.startupFiles.get(serverId),
            canStart: this.startupFiles.get(serverId) !== null
        };
    }
}

module.exports = ServerManager;
