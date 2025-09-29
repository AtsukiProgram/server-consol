const admin = require('firebase-admin');
const DiscordService = require('./discordService');

class AuthService {
    constructor() {
        this.discordService = new DiscordService();
        this.initializeFirebase();
    }

    initializeFirebase() {
        if (admin.apps.length === 0) {
            try {
                const serviceAccount = {
                    type: "service_account",
                    project_id: process.env.FIREBASE_PROJECT_ID,
                    private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
                    private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
                    client_email: process.env.FIREBASE_CLIENT_EMAIL,
                    client_id: process.env.FIREBASE_CLIENT_ID,
                    auth_uri: process.env.FIREBASE_AUTH_URI,
                    token_uri: process.env.FIREBASE_TOKEN_URI,
                };

                admin.initializeApp({
                    credential: admin.credential.cert(serviceAccount)
                });

                this.db = admin.firestore();
                console.log('🔥 Firebase initialized');

            } catch (error) {
                console.log('⚠️  Firebase not configured - using local auth');
                this.useLocalAuth = true;
            }
        }
    }

    async authenticateWithDiscord(code) {
        try {
            // Discord認証
            const tokenData = await this.discordService.exchangeCodeForToken(code);
            const discordUser = await this.discordService.getDiscordUser(tokenData.access_token);

            // ユーザー情報の処理
            const userData = await this.processUser(discordUser);

            // カスタムトークン生成
            const customToken = await this.createCustomToken(userData.id);

            return {
                success: true,
                customToken,
                user: userData
            };

        } catch (error) {
            throw new Error(Authentication failed: );
        }
    }

    async processUser(discordUser) {
        const userData = {
            id: discordUser.id,
            username: discordUser.username,
            discriminator: discordUser.discriminator,
            avatar: discordUser.avatar,
            email: discordUser.email,
            role: 'normal' // デフォルト権限
        };

        if (this.useLocalAuth) {
            // ローカル認証の場合
            return userData;
        }

        try {
            // Firebase Firestoreでユーザー管理
            const userRef = this.db.collection('users').doc(discordUser.id);
            const userDoc = await userRef.get();

            if (userDoc.exists) {
                userData.role = userDoc.data().role || 'normal';
            }

            await userRef.set({
                ...userData,
                lastLogin: admin.firestore.FieldValue.serverTimestamp(),
                updatedAt: admin.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

        } catch (error) {
            console.error('User processing error:', error);
        }

        return userData;
    }

    async createCustomToken(userId) {
        if (this.useLocalAuth) {
            // ローカル認証用のダミートークン
            return Buffer.from(JSON.stringify({ uid: userId, exp: Date.now() + 3600000 })).toString('base64');
        }

        try {
            return await admin.auth().createCustomToken(userId);
        } catch (error) {
            throw new Error('Token creation failed');
        }
    }

    async verifyToken(token) {
        if (this.useLocalAuth) {
            try {
                const decoded = JSON.parse(Buffer.from(token, 'base64').toString());
                if (decoded.exp > Date.now()) {
                    return { id: decoded.uid, role: 'admin' }; // デモ用
                }
            } catch (error) {
                return null;
            }
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(token);
            return { id: decodedToken.uid, role: 'member' };
        } catch (error) {
            return null;
        }
    }

    async getUserPermissions(userId) {
        if (this.useLocalAuth) {
            return { role: 'admin' }; // デモ用
        }

        try {
            const userDoc = await this.db.collection('users').doc(userId).get();
            return userDoc.exists ? userDoc.data() : { role: 'normal' };
        } catch (error) {
            return { role: 'normal' };
        }
    }
}

module.exports = AuthService;
