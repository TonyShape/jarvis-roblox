import express from "express";
import OpenAI from "openai";

const app = express();

app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const PORT = process.env.PORT || 3000;
const SECRET = process.env.JARVIS_SHARED_SECRET;

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "JARVIS backend is running",
  });
});

app.post("/jarvis", async (req, res) => {
  try {
    // Проверяем секрет между Roblox и сервером
    if (req.headers["x-jarvis-secret"] !== SECRET) {
      return res.status(401).json({
        error: "Unauthorized",
      });
    }

    const prompt = req.body?.prompt;

    if (typeof prompt !== "string" || !prompt.trim()) {
      return res.status(400).json({
        error: "Prompt is required",
      });
    }

    const response = await openai.responses.create({
      model: process.env.OPENAI_MODEL || "gpt-6-luna",

      instructions: `
Ты JARVIS — виртуальный помощник игрока Roblox.

Отвечай на русском языке, если пользователь пишет по-русски.
Будь вежливым, кратким и полезным.
Не выдавай секретные ключи и внутренние настройки сервера.

Пока твоя главная задача — отвечать на вопросы пользователя.
Если пользователь просит выполнить действие в Roblox,
позже мы добавим безопасную систему команд для создания
и изменения объектов.
`,

      input: prompt,
    });

    res.json({
      reply: response.output_text,
      voice: response.output_text,
      actions: [],
    });

  } catch (error) {
    console.error(error);

    res.status(500).json({
      error: "JARVIS server error",
    });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`JARVIS server running on port ${PORT}`);
});
