import express from "express";
import path from "path";
import dotenv from "dotenv";
import { GoogleGenAI, Type } from "@google/genai";
import { createServer as createViteServer } from "vite";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '10mb' }));

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok" });
});

// Proxy route for Gemini API
app.post("/api/gemini/generate", async (req, res) => {
  try {
    const { prompt, systemInstruction, responseMimeType, responseSchema, useSearch, useMaps } = req.body;
    
    // Get the key from header or environment
    const customKey = req.headers["x-gemini-key"] as string;
    const apiKey = (customKey && customKey.trim() !== "") ? customKey : process.env.GEMINI_API_KEY;

    if (!apiKey) {
      return res.status(401).json({ 
        error: "No Gemini API key found. Please input your personal Gemini API key in the Setup panel or configure it in AI Studio settings." 
      });
    }

    // Initialize Google Gen AI
    const ai = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });

    const config: any = {};
    if (systemInstruction) {
      config.systemInstruction = systemInstruction;
    }
    if (responseMimeType) {
      config.responseMimeType = responseMimeType;
    }
    if (responseSchema) {
      config.responseSchema = responseSchema;
    }

    // Grounding tools if requested
    const tools: any[] = [];
    if (useSearch) {
      tools.push({ googleSearch: {} });
    }
    if (useMaps) {
      // For maps grounding
      tools.push({ googleMaps: {} });
    }

    if (tools.length > 0) {
      config.tools = tools;
      if (useSearch && useMaps) {
        // Warning: googleMaps cannot be combined with googleSearch. We prioritize search or maps based on input.
        // Let's keep whichever was selected or only search if both are true.
        config.tools = useMaps ? [{ googleMaps: {} }] : [{ googleSearch: {} }];
      }
    }

    // Call the model
    // We use gemini-3.5-flash for most requests (fast & reliable) or gemini-3.1-pro-preview for complex tasks if requested
    const modelName = req.body.model || "gemini-3.5-flash";

    const response = await ai.models.generateContent({
      model: modelName,
      contents: prompt,
      config: config
    });

    res.json({
      text: response.text,
      groundingMetadata: response.candidates?.[0]?.groundingMetadata || null
    });
  } catch (error: any) {
    console.error("Gemini proxy error:", error);
    res.status(500).json({ error: error.message || "An error occurred during AI generation" });
  }
});

// Setup Vite middleware or static server
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite dev server middleware mounted.");
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log("Production static server configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Study Hub server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
