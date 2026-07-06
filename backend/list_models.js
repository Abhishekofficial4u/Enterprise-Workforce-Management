require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        // Unfortunately, the JS SDK doesn't have an easy listModels function exported in the same way, but let's try a direct fetch to the REST API.
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`);
        const data = await res.json();
        console.log("Models available:", data.models.map(m => m.name));
    } catch (e) {
        console.error("Fetch Error:", e.message);
    }
}
test();
