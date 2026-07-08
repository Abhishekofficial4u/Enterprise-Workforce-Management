const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.screenCandidate = async (candidate, job) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return { matchScore: 50, strengths: ['AI offline'], missingSkills: ['AI offline'] };

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: `You are an expert HR Technical Recruiter. Compare the candidate's profile/resume to the job description.
            Return ONLY a valid JSON object with:
            - "matchScore": a number from 0 to 100 representing how well they match.
            - "strengths": an array of strings (top 3 matching skills/experiences).
            - "missingSkills": an array of strings (top 2-3 critical skills they are missing).`
        });

        const prompt = `
            JOB TITLE: ${job.title}
            JOB REQUIREMENTS: ${job.requirements}
            ---
            CANDIDATE NAME: ${candidate.firstName} ${candidate.lastName}
            CANDIDATE SKILLS/RESUME: ${candidate.skills}
            CANDIDATE EXPERIENCE: ${candidate.experience}
        `;

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        if (text.startsWith('```')) text = text.replace(/```/g, '').trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("AI Recruitment Screen Error:", error);
        return { matchScore: 0, strengths: ['Error'], missingSkills: ['Error processing'] };
    }
};
