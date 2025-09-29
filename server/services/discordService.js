// 簡略化されたDiscord認証サービス (通知機能なし)
const { Client, GatewayIntentBits } = require('discord.js');
const axios = require('axios');

class DiscordService {
    constructor() {
        this.client = new Client({
            intents: [GatewayIntentBits.Guilds]
        });
    }

    async initialize() {
        if (!process.env.DISCORD_BOT_TOKEN) {
            console.log('⚠️  Discord Bot Token not found - Discord features disabled');
            return;
        }

        try {
            await this.client.login(process.env.DISCORD_BOT_TOKEN);
            console.log('🤖 Discord bot connected (login-only mode)');

            this.client.once('ready', () => {
                console.log(✅ Discord bot ready: );
            });

        } catch (error) {
            console.error('❌ Discord bot connection failed:', error.message);
        }
    }

    async exchangeCodeForToken(code) {
        try {
            const response = await axios.post('https://discord.com/api/oauth2/token', 
                new URLSearchParams({
                    client_id: process.env.DISCORD_CLIENT_ID,
                    client_secret: process.env.DISCORD_CLIENT_SECRET,
                    grant_type: 'authorization_code',
                    code: code,
                    redirect_uri: process.env.DISCORD_REDIRECT_URI
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }
            );

            return response.data;
        } catch (error) {
            throw new Error('Discord token exchange failed');
        }
    }

    async getDiscordUser(accessToken) {
        try {
            const response = await axios.get('https://discord.com/api/users/@me', {
                headers: {
                    Authorization: Bearer 
                }
            });

            return response.data;
        } catch (error) {
            throw new Error('Failed to fetch Discord user');
        }
    }

    async shutdown() {
        if (this.client) {
            await this.client.destroy();
            console.log('🤖 Discord bot disconnected');
        }
    }
}

module.exports = DiscordService;
