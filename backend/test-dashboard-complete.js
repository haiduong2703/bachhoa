// Complete test script for Dashboard API
import fetch from 'node-fetch';

const API_URL = 'http://localhost:5000/api/v1';

// Test credentials (sử dụng admin account từ seeder)
const ADMIN_EMAIL = 'admin@bachhoa.com';
const ADMIN_PASSWORD = 'admin123';

async function testDashboardAPI() {
  try {
    console.log('🔐 Step 1: Login as Admin...\n');
    
    // Login to get token
    const loginResponse = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD
      })
    });
    
    const loginData = await loginResponse.json();
    
    if (loginData.status !== 'success') {
      console.error('❌ Login failed:', loginData);
      return;
    }
    
    const token = loginData.data.token;
    console.log('✅ Login successful!');
    console.log('Token:', token.substring(0, 20) + '...\n');
    
    // Test Dashboard API
    console.log('📊 Step 2: Fetching Dashboard Stats...\n');
    
    const dashboardResponse = await fetch(`${API_URL}/stats/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    const dashboardData = await dashboardResponse.json();
    
    console.log('Status:', dashboardResponse.status);
    console.log('Response:', JSON.stringify(dashboardData, null, 2));
    
    if (dashboardData.status === 'success') {
      console.log('\n✅ Dashboard API is working correctly!');
      console.log('\n📈 Summary:');
      console.log('- Total Users:', dashboardData.data.totalUsers);
      console.log('- Total Products:', dashboardData.data.totalProducts);
      console.log('- Total Orders:', dashboardData.data.totalOrders);
      console.log('- Total Revenue:', dashboardData.data.totalRevenue);
      console.log('- Pending Orders:', dashboardData.data.pendingOrders);
      console.log('- Low Stock Products:', dashboardData.data.lowStockProducts);
    } else {
      console.log('\n❌ Dashboard API returned error');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testDashboardAPI();
