async function test() {
    try {
        console.log("Logging in as admin...");
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'superadmin@ewm.com', password: 'Admin@123' })
        });
        const loginData = await loginRes.json();
        console.log("Login response:", loginData);
        if (!loginData.token) return;
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
        console.log("Vault response:", vaultData);
        
        const targetUserId = vaultData.data[1].id;
        console.log("Target user:", vaultData.data[1].email, targetUserId);
        
        console.log("Trying to impersonate...");
        const impRes = await fetch(`http://localhost:5000/api/v1/auth/admin/impersonate/${targetUserId}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const impData = await impRes.json();
        console.log("Success:", impData.message || impData);
    } catch (e) {
        console.error("Error:", e.message);
    }
}
test();
