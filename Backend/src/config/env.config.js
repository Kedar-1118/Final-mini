import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    mongoUri: process.env.MONGODB_URI,
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    jwt: {
        accessSecret: process.env.ACCESS_TOKEN_SECRET,
        accessExpiry: process.env.ACCESS_TOKEN_EXPIRY,
        refreshSecret: process.env.REFRESH_TOKEN_SECRET,
        refreshExpiry: process.env.REFRESH_TOKEN_EXPIRY,
    },
    email: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    google: {
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        redirectUri: process.env.GOOGLE_REDIRECT_URI,
    },
    geminiApiKey: process.env.GEMINI_API_KEY,
    rapidApi: {
        key: process.env['x-rapidapi-key'],
        host: process.env['x-rapidapi-host'],
        hostCmnts: process.env['x-rapidapi-host-cmnts'],
    }
};
