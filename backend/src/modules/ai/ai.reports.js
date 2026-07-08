const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.generateExecutiveSummary = async (dashboardData) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return "AI Summary is offline. Please configure GEMINI_API_KEY.";

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
            You are the Chief Operating Officer of an Enterprise company.
            Review the following aggregated HR & Operations data and provide a concise, 1-2 paragraph "Executive Summary".
            Highlight any key risks (like burnout or open tickets) and summarize the distribution of the workforce and assets.
            
            DATA:
            ${JSON.stringify(dashboardData)}
            
            Write the summary in a professional, insightful, and slightly encouraging tone.
        `;

        const result = await model.generateContent(prompt);
        return result.response.text();
    } catch (error) {
        console.error("AI Report Summary Error:", error);
        return "Failed to generate AI insights due to an error.";
    }
};
