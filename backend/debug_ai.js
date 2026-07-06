require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

async function test() {
    try {
        const API_KEY = process.env.GEMINI_API_KEY;
        const genAI = new GoogleGenerativeAI(API_KEY);
        
        const tools = [
          {
            functionDeclarations: [
              {
                name: "getLeaveBalance",
                description: "Fetch the current employee's remaining leave balance and PTO.",
                parameters: { type: "OBJECT", properties: {} }
              }
            ]
          }
        ];

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash-latest",
            tools: tools
        });

        const chat = model.startChat();
        let result = await chat.sendMessage("What is my leave balance?");
        console.log("Success:", result.response.text());
        console.log("Function Call:", result.response.functionCalls());
    } catch (e) {
        console.error("AI Error Debug:");
        console.error(e);
    }
}
test();
