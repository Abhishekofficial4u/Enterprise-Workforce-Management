require('dotenv').config();
const Groq = require("groq-sdk");
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

async function test() {
    try {
        let completion = await groq.chat.completions.create({
            model: "llama-3.1-8b-instant",
            messages: [{ role: "user", content: "Say hello!" }]
        });
        console.log("Groq says:", completion.choices[0].message.content);
    } catch (e) {
        console.error("Groq Error:", e.message);
    }
}
test();
