import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/v1';

// Test với token admin (thay bằng token thực tế của bạn)
const ADMIN_TOKEN = 'your-admin-token-here';

async function testDashboardAPI() {
  try {
    console.log('🧪 Testing Dashboard API...\n');
    
    const response = await fetch(`${API_URL}/stats/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${ADMIN_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', JSON.stringify(data, null, 2));
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDashboardAPI();
