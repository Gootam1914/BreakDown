const { GoogleGenAI } = require('@google/genai');

// Safely initialize the Google AI SDK using the correct 2026 syntax framework
let ai = null;
if (process.env.GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
}

exports.analyzeBlueprint = async (req, res, next) => {
    console.log("[API HIT] /api/ai/analyze triggered.");
    try {
        const { text, userId } = req.body;
        console.log(`[INPUT RECEIVED] User ID: ${userId}, Prompt Length: ${text ? text.length : 0} chars`);

        if (!text) {
            return res.status(400).json({ success: false, error: "Directive payload empty." });
        }

        if (!ai) {
            console.error("[CRITICAL] Gemini API Key is missing from your .env file!");
            return res.status(500).json({ success: false, error: "Gemini Key Not Configured" });
        }

        const systemPrompt = `
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

        console.log("[AI CALL] Contacting gemini-2.5-flash server arrays...");
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Directive: "${text}"`,
            config: {
                systemInstruction: systemPrompt,
                responseMimeType: 'application/json'
            }
        });

        console.log("[AI SUCCESS] Payload returned cleanly from Gemini.");
        const generatedData = JSON.parse(response.text);

        // --- SAFE DATABASE PERSISTENCE LAYER ---
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient();

            console.log("[DB OPERATION] Attempting to log metrics to Supabase...");

            // Upsert User profile container
            await prisma.user.upsert({
                where: { id: userId },
                update: {},
                create: { id: userId, name: 'Architect' }
            });

            const newConversation = await prisma.conversation.create({
                data: { title: generatedData.title || "New Strategy", userId: userId }
            });

            const savedBlueprint = await prisma.blueprint.create({
                data: {
                    conversationId: newConversation.id,
                    userId: userId,
                    title: generatedData.title || "New Strategy",
                    description: generatedData.description || "",
                    score: parseFloat(generatedData.score) || 0.0,
                    metrics: generatedData.metrics || {}
                }
            });

            if (generatedData.tasks && Array.isArray(generatedData.tasks)) {
                for (const t of generatedData.tasks) {
                    await prisma.task.create({
                        data: {
                            blueprintId: savedBlueprint.id,
                            title: t.title,
                            durationDays: parseInt(t.durationDays) || 1,
                            complexity: t.complexity || "Medium"
                        }
                    });
                }
            }
            console.log("[DB SUCCESS] User session synchronized cleanly with Supabase cloud.");

            return res.json({ success: true, conversationId: newConversation.id, blueprint: generatedData });

        } catch (dbError) {
            // This is the safety switch: If the database password/URL layout fails, print it, but don't crash the AI response!
            console.error("--- [SUPABASE CONNECTION ERROR REPORT] ---");
            console.error("Your database rejected the saving mechanism. Error details:");
            console.error(dbError.message || dbError);
            console.error("------------------------------------------");
            console.log("[FALLBACK ROUTE ACTIVATED] Processing request via client sandbox mode.");

            // Send back the data anyway so the user can see their blueprint on screen!
            return res.json({ success: true, conversationId: "mock_conv_" + Date.now(), blueprint: generatedData });
        }

    } catch (error) {
        console.error("[CRITICAL ENGINE FAILURE]:", error);
        next(error);
    }
};