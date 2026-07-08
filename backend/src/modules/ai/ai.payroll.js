const { GoogleGenerativeAI } = require('@google/generative-ai');

exports.detectPayrollAnomalies = async (payrolls) => {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return { anomalies: [], summary: 'AI unavailable' };

        // Keep payroll payload light to save tokens
        const cleanPayrolls = payrolls.map(p => ({
            id: p._id,
            employee: p.employeeId.name,
            baseSalary: p.baseSalary,
            overtimeAmount: p.overtimeAmount,
            bonus: p.bonus,
            deductions: p.deductions,
            netPay: p.netPay
        }));

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: `You are a strict Enterprise Financial Auditor. Analyze the list of payroll records for anomalies (e.g. extremely high overtime vs base salary, unusual bonuses, very high deductions).
            Return ONLY a valid JSON object with:
            - "anomalies": an array of objects { "payrollId": "...", "severity": "HIGH/MEDIUM/LOW", "reason": "..." }
            - "summary": A brief 2 sentence summary of the audit.`
        });

        const prompt = JSON.stringify(cleanPayrolls, null, 2);

        const result = await model.generateContent(prompt);
        let text = result.response.text();
        
        if (text.startsWith('```json')) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        if (text.startsWith('```')) text = text.replace(/```/g, '').trim();

        return JSON.parse(text);
    } catch (error) {
        console.error("AI Payroll Audit Error:", error);
        return { anomalies: [], summary: 'AI audit failed.' };
    }
};
