async function testSearch() {
    try {
        const loginRes = await fetch('http://localhost:5000/api/v1/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: 'admin@company.com', password: 'password123' })
        });
        const loginData = await loginRes.json();
        const token = loginData.token;
        console.log('Login successful');

        const searchRes = await fetch('http://localhost:5000/api/v1/org/search?q=admin', {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const searchData = await searchRes.json();
        console.log('Search successful:', JSON.stringify(searchData, null, 2));

    } catch (err) {
        console.error('Error:', err.message);
    }
}

testSearch();
