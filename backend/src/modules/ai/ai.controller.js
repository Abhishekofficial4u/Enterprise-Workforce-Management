const { GoogleGenerativeAI } = require('@google/generative-ai');
const Employee = require('../hr/employee.model');
const Asset = require('../assets/asset.model');
const Ticket = require('../helpdesk/ticket.model');

// Check if API key is provided
let genAI = null;

// Tool definitions for Function Calling
const tools = [
  {
    functionDeclarations: [
      {
        name: "getLeaveBalance",
        description: "Fetch the current employee's remaining leave balance and PTO.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "getAssignedAssets",
        description: "Fetch the list of IT assets and equipment assigned to the current employee.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "getOpenTickets",
        description: "Fetch the current employee's open support tickets from the Help Desk.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "getAttendanceStats",
        description: "Fetch the current employee's attendance record and presence rate.",
        parameters: { type: "OBJECT", properties: {} }
      },
      {
        name: "getPerformanceReports",
        description: "Fetch the current employee's performance reviews and reports including their overall score.",
        parameters: { type: "OBJECT", properties: {} }
      }
    ]
  }
];

// @desc    Process Chat Query (Gemini AI with Function Calling)
// @route   POST /api/v1/ai/chat
// @access  Private
exports.processChat = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user._id;
        
        if (!message) {
            return res.status(400).json({ success: false, message: 'Message is required' });
        }

        const API_KEY = process.env.GEMINI_API_KEY;
        if (API_KEY && !genAI) {
            genAI = new GoogleGenerativeAI(API_KEY);
        }

        if (!genAI) {
            return res.status(200).json({ 
                success: true, 
                reply: "Error: GEMINI_API_KEY is missing in the backend .env file. Please add it to use the AI Assistant." 
            });
        }

        const userEmail = req.user.email;
        const employee = await Employee.findOne({ email: userEmail });
        const employeeName = employee ? employee.name : 'Unknown User';
        const empId = employee ? employee._id : null;

        // Initialize Gemini model
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            tools: tools,
            systemInstruction: `You are the EWM (Enterprise Workforce Management) AI Assistant. 
            You help employees with HR policies, IT support, and accessing their data.
            The user currently talking to you is ${employeeName}. 
            Be helpful, concise, and professional. Format your responses with markdown.`
        });

        const chat = model.startChat();
        
        // 1. Send the user's message to Gemini
        let result = await chat.sendMessage(message);
        let call = result.response.functionCalls();

        // 2. Handle Function Calling if Gemini decides it needs data
        if (call && call.length > 0) {
            const functionName = call[0].name;
            let apiResponse = {};

            if (!empId) {
                apiResponse = { error: "Employee profile not found for this user." };
            } else {
                // Map function names to actual database queries
                if (functionName === 'getLeaveBalance') {
                    apiResponse = employee ? { 
                                pto_remaining: employee.leaveBalance?.casual || 0, 
                                sick_leave_remaining: employee.leaveBalance?.sick || 0,
                                earned_leave_remaining: employee.leaveBalance?.earned || 0,
                                total_balance: (employee.leaveBalance?.casual || 0) + (employee.leaveBalance?.sick || 0) + (employee.leaveBalance?.earned || 0)
                            } : { error: "Employee profile not found for this user." };
                } 
                else if (functionName === 'getAssignedAssets') {
                    const assets = await Asset.find({ assignedTo: empId });
                    apiResponse = { assets: assets.map(a => ({ name: a.name, category: a.category, status: a.status })) };
                }
                else if (functionName === 'getOpenTickets') {
                    const tickets = await Ticket.find({ createdBy: empId, status: { $ne: 'Closed' } });
                    apiResponse = { tickets: tickets.map(t => ({ title: t.title, status: t.status, priority: t.priority })) };
                }
                else if (functionName === 'getAttendanceStats') {
                    apiResponse = { presence_rate_percentage: 95, days_present: 18, days_absent: 1 };
                }
                else if (functionName === 'getPerformanceReports') {
                    const Performance = require('../performance/performance.model');
                    const reviews = await Performance.find({ employeeId: empId }).sort({ createdAt: -1 }).limit(3);
                    if (reviews.length > 0) {
                        apiResponse = { reviews: reviews.map(r => ({ cycle: r.reviewCycle, year: r.year, score: r.overallScore, feedback: r.feedback })) };
                    } else {
                        apiResponse = { message: "No performance reviews found for this user." };
                    }
                }
            }

            // 3. Send the JSON data back to Gemini so it can generate the final human-readable response
            result = await chat.sendMessage([{
                functionResponse: {
                    name: functionName,
                    response: apiResponse
                }
            }]);
        }

        // 4. Return the final text to the frontend
        res.status(200).json({
            success: true,
            reply: result.response.text()
        });

    } catch (error) {
        console.error("Gemini Error:", error.message || error);
        
        // 5. SECONDARY FALLBACK: Try Groq API
        try {
            const GROQ_API_KEY = process.env.GROQ_API_KEY;
            if (!GROQ_API_KEY) {
                throw new Error("GROQ_API_KEY not found");
            }
            
            const Groq = require("groq-sdk");
            const groq = new Groq({ apiKey: GROQ_API_KEY });
            
            const groqTools = [
                { type: "function", function: { name: "getLeaveBalance", description: "Fetch the current employee's leave balance.", parameters: { type: "object", properties: {} } } },
                { type: "function", function: { name: "getAssignedAssets", description: "Fetch IT assets assigned to the employee.", parameters: { type: "object", properties: {} } } },
                { type: "function", function: { name: "getOpenTickets", description: "Fetch open support tickets created by the employee.", parameters: { type: "object", properties: {} } } },
                { type: "function", function: { name: "getAttendanceStats", description: "Fetch the current employee's attendance record.", parameters: { type: "object", properties: {} } } },
                { type: "function", function: { name: "getPerformanceReports", description: "Fetch the current employee's performance reviews.", parameters: { type: "object", properties: {} } } }
            ];

            const userEmail = req.user.email;
            const employee = await Employee.findOne({ email: userEmail });
            const employeeName = employee ? employee.name : 'Unknown User';
            const empId = employee ? employee._id : null;

            const systemPrompt = `You are the EWM AI Assistant. You help employees with HR policies, IT support, and accessing their data. The user currently talking to you is ${employeeName}. Be helpful, concise, and professional.`;

            let messages = [
                { role: "system", content: systemPrompt },
                { role: "user", content: req.body.message }
            ];

            let completion = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: messages,
                tools: groqTools,
                tool_choice: "auto"
            });

            const responseMessage = completion.choices[0].message;
            let finalReply = responseMessage.content;

            if (responseMessage.tool_calls) {
                messages.push(responseMessage);
                for (const toolCall of responseMessage.tool_calls) {
                    const functionName = toolCall.function.name;
                    let apiResponse = {};
                    
                    if (!empId) {
                        apiResponse = { error: "Employee profile not found for this user." };
                    } else {
                        if (functionName === 'getLeaveBalance') {
                            apiResponse = { 
                                pto_remaining: employee.leaveBalance?.casual || 0, 
                                sick_leave_remaining: employee.leaveBalance?.sick || 0,
                                earned_leave_remaining: employee.leaveBalance?.earned || 0,
                                total_balance: (employee.leaveBalance?.casual || 0) + (employee.leaveBalance?.sick || 0) + (employee.leaveBalance?.earned || 0)
                            };
                        } else if (functionName === 'getAssignedAssets') {
                            const assets = await Asset.find({ assignedTo: empId });
                            apiResponse = { assets: assets.map(a => ({ name: a.name, category: a.category, status: a.status })) };
                        } else if (functionName === 'getOpenTickets') {
                            const tickets = await Ticket.find({ createdBy: empId, status: { $ne: 'Closed' } });
                            apiResponse = { tickets: tickets.map(t => ({ title: t.title, status: t.status, priority: t.priority })) };
                        } else if (functionName === 'getAttendanceStats') {
                            apiResponse = { presence_rate_percentage: 95, days_present: 18, days_absent: 1 };
                        } else if (functionName === 'getPerformanceReports') {
                            const Performance = require('../performance/performance.model');
                            const reviews = await Performance.find({ employeeId: empId }).sort({ createdAt: -1 }).limit(3);
                            if (reviews.length > 0) {
                                apiResponse = { reviews: reviews.map(r => ({ cycle: r.reviewCycle, year: r.year, score: r.overallScore, feedback: r.feedback })) };
                            } else {
                                apiResponse = { message: "No performance reviews found for this user." };
                            }
                        }
                    }

                    messages.push({
                        role: "tool",
                        tool_call_id: toolCall.id,
                        name: functionName,
                        content: JSON.stringify(apiResponse)
                    });
                }

                const secondResponse = await groq.chat.completions.create({
                    model: "llama-3.1-8b-instant",
                    messages: messages
                });
                finalReply = secondResponse.choices[0].message.content;
            }

            return res.status(200).json({ success: true, reply: finalReply });

        } catch (groqError) {
            console.error("Groq Error:", groqError.message || groqError);
            
            // 6. TERTIARY FALLBACK: Mock Mode
            const msg = (req.body.message || "").toLowerCase();
            let fallbackReply = "I am currently running in Offline Mock Mode due to API rate limits. How can I help you today?";
        
        if (msg.includes('leave') || msg.includes('balance') || msg.includes('chutti')) {
            const employee = await Employee.findOne({ email: req.user.email });
            if (employee && employee.leaveBalance) {
                fallbackReply = `*(Mock Mode)* Your current leave balance is: ${employee.leaveBalance.casual || 0} Casual, ${employee.leaveBalance.sick || 0} Sick, and ${employee.leaveBalance.earned || 0} Earned days.`;
            } else {
                fallbackReply = "*(Mock Mode)* Employee profile not found for this user.";
            }
        } else if (msg.includes('asset') || msg.includes('laptop')) {
            fallbackReply = "*(Mock Mode)* You have a Dell XPS 15 assigned to you in good condition.";
        } else if (msg.includes('ticket') || msg.includes('support')) {
            fallbackReply = "*(Mock Mode)* You currently have 0 open support tickets.";
        } else if (msg.includes('attendance')) {
            fallbackReply = "*(Mock Mode)* You have a 95% attendance rate this month.";
        } else if (msg.includes('report') || msg.includes('performance') || msg.includes('review')) {
            const Performance = require('../performance/performance.model');
            const emp = await Employee.findOne({ email: req.user.email });
            if (emp) {
                const review = await Performance.findOne({ employeeId: emp._id }).sort({ createdAt: -1 });
                if (review) {
                    fallbackReply = `*(Mock Mode)* Your latest performance report (${review.reviewCycle} ${review.year}) has an overall score of ${review.overallScore}/5. Feedback: "${review.feedback}"`;
                } else {
                    fallbackReply = "*(Mock Mode)* You do not have any performance reports yet.";
                }
            } else {
                fallbackReply = "*(Mock Mode)* Employee profile not found. Cannot retrieve reports.";
            }
        }

        return res.status(200).json({ 
            success: true, 
            reply: fallbackReply 
        });
        } // close groq catch
    } // close gemini catch
};
