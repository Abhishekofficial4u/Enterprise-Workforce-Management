const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

/**
 * Generates a draft performance review based on goals and peer feedback
 * @param {Object} employee - The employee document
 * @param {Array} goals - Array of goal documents
 * @param {Array} feedbackList - Array of peer feedback documents
 * @returns {Object} { reviewText, recommendedRating }
 */
exports.generatePerformanceDraft = async (employee, goals, feedbackList) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not configured');
        }

        const goalsSummary = goals.map(g => 
            `- ${g.title} (Status: ${g.status}, Progress: ${g.progress}%)`
        ).join('\n');

        const feedbackSummary = feedbackList.map(f => 
            `Strengths: ${f.strengths}\nAreas for Improvement: ${f.areasForImprovement}`
        ).join('\n\n');

        const prompt = `
        You are an expert HR Manager writing a formal performance review summary for an employee.

        Employee Details:
        - Name: ${employee.name}
        - Department: ${employee.department}
        - Designation: ${employee.designation}

        Their Goals/KPIs for this period:
        ${goalsSummary || 'No formal goals recorded.'}

        Peer Feedback Received (Anonymized):
        ${feedbackSummary || 'No peer feedback received.'}

        Based on the above, please generate a professional Performance Review Draft. 
        It should include:
        1. A brief executive summary of their performance.
        2. Recognition of key achievements/strengths based on goals and feedback.
        3. Constructive areas for improvement.
        4. A recommended Overall Rating out of 5 (e.g. 4.5/5) based strictly on progress and feedback tone.

        Return ONLY a JSON object with this exact structure (no markdown fences, no extra text):
        {
            "reviewText": "The comprehensive review text covering summary, achievements, and improvement areas formatted nicely with paragraphs.",
            "recommendedRating": 4.5
        }
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        let cleanedResponse = responseText;
        if (cleanedResponse.startsWith('```json')) {
            cleanedResponse = cleanedResponse.substring(7);
            if (cleanedResponse.endsWith('```')) {
                cleanedResponse = cleanedResponse.substring(0, cleanedResponse.length - 3);
            }
        }
        
        const parsedData = JSON.parse(cleanedResponse);
        return parsedData;

    } catch (error) {
        console.error('Error in AI Performance Draft:', error);
        throw error;
    }
};
