const express = require("express");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const client = new OpenAI({
  baseURL: "https://api.tokenfactory.nebius.com/v1/",
  apiKey: process.env.NEBIUS_API_KEY,
});

const systemPrompt = `
Read the user's message.

Return 3 to 5 keywords describing the type of movie they need.

Examples:
- sad + wants happy → warm, comforting, happy, friendship
- scared → calm, safe, peaceful
- nostalgic → memory, childhood, past
- adventure → journey, world, action
- dark → war, intense, danger

Only return keywords separated by commas. No explanation.
`;

app.post("/analyze", async (req, res) => {
  try {
    const userText = req.body.text;

    const response = await client.chat.completions.create({
      model: "MODEL_ID",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userText }
      ],
    });

    const keywords = response.choices[0].message.content.trim().toLowerCase();

    res.json({ keywords });

  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "AI failed" });
  }
});

app.listen(3000, () => {
  console.log("Server running on http://localhost:3000");
});