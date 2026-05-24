const { GoogleGenAI } = require('@google/genai');

let ai = null;
if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

exports.analyzeBlueprint = async (req, res) => {
    console.log("[API] /api/ai/analyze triggered");
    try {
        const { text, userId } = req.body;
        const uid = userId || 'guest';

        if (!text) {
            return res.status(400).json({ success: false, error: "Empty prompt" });
        }

        if (!ai) {
            return res.status(500).json({ success: false, error: "Missing API Key" });
        }

        const prompt = `
You are the Breakdown Intelligence Engine. Decompose the user's project into a structured execution blueprint.
Output ONLY valid JSON matching this exact structure:
{
  "title": "Project Title",
  "description": "Overview of the project goal",
  "score": 85.5,
  "metrics": { "realism": 90, "complexity": 80 },
  "tasks": [
    { "title": "Phase 1: Initial Setup", "durationDays": 4, "complexity": "High" },
    { "title": "Phase 2: Integration Pipeline", "durationDays": 6, "complexity": "Medium" }
  ]
}`;

        console.log("[AI] Requesting data from Gemini...");
        const aiRes = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Directive: "${text}"`,
            config: {
                systemInstruction: prompt,
                responseMimeType: 'application/json'
            }
        });

        console.log("[AI] Success");
        const data = JSON.parse(aiRes.text);

        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            console.log("[DB] Saving data...");
            
            await prisma.user.upsert({
                where: { id: uid },
                update: {},
                create: { id: uid, name: 'Architect' }
            });

            const conv = await prisma.conversation.create({
                data: { title: data.title || "New Project", userId: uid }
            });

            const blueprint = await prisma.blueprint.create({
                data: {
                    conversationId: conv.id,
                    userId: uid,
                    title: data.title || "New Project",
                    description: data.description || "",
                    score: parseFloat(data.score) || 0.0,
                    metrics: data.metrics || {}
                }
            });

            if (data.tasks && Array.isArray(data.tasks)) {
                for (const t of data.tasks) {
                    await prisma.task.create({
                        data: {
                            blueprintId: blueprint.id,
                            title: t.title,
                            durationDays: parseInt(t.durationDays) || 1,
                            complexity: t.complexity || "Medium"
                        }
                    });
                }
            }
            
            console.log("[DB] Success");
            return res.json({ success: true, conversationId: conv.id, blueprint: data });

        } catch (dbErr) {
            console.error("[DB ERROR] Falling back to sandbox output:", dbErr.message || dbErr);
            return res.json({ 
                success: true, 
                conversationId: "sandbox_" + Math.floor(Math.random() * 100000), 
                blueprint: data 
            });
        }

    } catch (err) {
        console.error("[CRITICAL FAILURE]:", err);
        res.status(500).json({ success: false, error: "Server execution error" });
    }
};