async function test() {
    try {
        console.log("Logging in as admin...");
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'superadmin@ewm.com', password: 'Admin@123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log("Got token.");
        
        console.log("Getting a user from vault...");
        const vaultRes = await fetch('http://localhost:5000/api/v1/auth/admin/credentials-vault', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ adminPassword: 'Admin@123' })
        });
        const vaultData = await vaultRes.json();
        const targetUserId = vaultData.data[1].id; // Impersonate first employee
        
        console.log("Trying to impersonate...");
        const impRes = await fetch(`http://localhost:5000/api/v1/auth/admin/impersonate/${targetUserId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const impData = await impRes.json();
        const userToken = impData.token;
        console.log("Success! Now testing AI Chat...");
        
        const payload = {
            message: "show my performance report"
        };
        const chatRes = await fetch('http://localhost:5000/api/v1/ai/chat', {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userToken}` 
            },
            body: JSON.stringify(payload)
        });
        const text = await chatRes.text();
        try {
            const chatData = JSON.parse(text);
            console.log("\n--- AI Response ---");
            console.log(JSON.stringify(chatData, null, 2));
            console.log("-------------------\n");
        } catch (e) {
            console.log("\n--- HTML ERROR ---");
            console.log(text);
        }
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
