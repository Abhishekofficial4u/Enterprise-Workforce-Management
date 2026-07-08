const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.predictLeaveApproval = async (leaveRequest, employeeStats, teamStats) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return { probability: 50, reasoning: 'AI unavailable (no API key)' };

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: `You are an AI HR assistant. Evaluate the leave request based on the employee's history and team capacity.
            Return ONLY a valid JSON object with two keys:
            - "probability": a number from 0 to 100 representing the likelihood this should be approved.
            - "reasoning": a short 1-2 sentence explanation.`
        });

        const prompt = `
            Leave Request: ${leaveRequest.leaveType} for ${leaveRequest.duration} days. Reason: "${leaveRequest.reason}".
            Employee Stats: ${employeeStats.sickTaken} sick days taken this year. 
            Team Capacity: ${teamStats.totalMembers} total members. ${teamStats.onLeave} currently on leave.
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        // Strip markdown code block if present
        if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        if (text.startsWith('```')) text = text.replace(/```/g, '').trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("AI Leave Predict Error:", error);
        return { probability: 50, reasoning: 'AI prediction failed.' };
    }
};
