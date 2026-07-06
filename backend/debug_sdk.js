require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const chat = model.startChat();
        let result = await chat.sendMessage("hi");
        let call = result.response.functionCalls();
        console.log("Call:", call);
        console.log("Text:", result.response.text());
    } catch (e) {
        console.error(e);
    }
}
test();
