require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const aiController = require('./controllers/ai.controller');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

console.log("--------------------------------------------------");
console.log(`[INIT] Loaded DATABASE_URL: ${process.env.DATABASE_URL ? "DETECTED" : "MISSING"}`);
console.log(`[INIT] Loaded GEMINI_API_KEY: ${process.env.GEMINI_API_KEY ? "DETECTED" : "MISSING"}`);
console.log("--------------------------------------------------");

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/dashboard.html'));
});

app.post('/api/ai/analyze', aiController.analyzeBlueprint);

app.get('/api/history', async (req, res) => {
    const { userId } = req.query;
    console.log(`[ROUTE] GET /api/history requested for User: ${userId}`);

    try {
        const { PrismaClient } = require('@prisma/client');
        const prisma = new PrismaClient();

        const history = await prisma.conversation.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' }
        });
        return res.json(history);
    } catch (dbError) {
        console.warn(`[DATABASE FALLBACK] Could not fetch history from DB. Returning empty array.`);
        return res.json([]);
    }
});

app.use((err, req, res, next) => {
    console.error("--- [GLOBAL SERVER ERROR CONTAINER] ---");
    console.error(err.stack || err);
    console.error("---------------------------------------");
    res.status(500).json({ success: false, error: "Internal execution fault handler intercepted." });
});

app.listen(PORT, () => {
    console.log(`[SYSTEM ACTIVE] Minimalist core listening on http://localhost:${PORT}`);
});