/**
 * Test script for Change Password functionality
 * Run with: node test-change-password.js
 */

import axios from "axios";

const API_URL = process.env.API_URL || "http://localhost:5000/api";

// Test user credentials
const testUser = {
  email: "test@example.com",
  oldPassword: "Test123",
  newPassword: "NewTest456",
};

let accessToken = "";

/**
 * Test 1: Login to get access token
 */
async function testLogin() {
  console.log("\n🧪 Test 1: Login to get access token");
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.oldPassword,
    });

    if (response.data.status === "success") {
      accessToken = response.data.data.tokens.accessToken;
      console.log("✅ Login successful");
      console.log(`   Token: ${accessToken.substring(0, 20)}...`);
      return true;
    }
  } catch (error) {
    console.log(
      "❌ Login failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
}

/**
 * Test 2: Change password with correct data
 */
async function testChangePasswordSuccess() {
  console.log("\n🧪 Test 2: Change password with correct data");
  try {
    const response = await axios.put(
      `${API_URL}/auth/change-password`,
      {
        currentPassword: testUser.oldPassword,
        newPassword: testUser.newPassword,
        confirmPassword: testUser.newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.status === "success") {
      console.log("✅ Password changed successfully");
      return true;
    }
  } catch (error) {
    console.log(
      "❌ Change password failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
}

/**
 * Test 3: Login with new password
 */
async function testLoginWithNewPassword() {
  console.log("\n🧪 Test 3: Login with new password");
  try {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email: testUser.email,
      password: testUser.newPassword,
    });

    if (response.data.status === "success") {
      accessToken = response.data.data.tokens.accessToken;
      console.log("✅ Login with new password successful");
      return true;
    }
  } catch (error) {
    console.log(
      "❌ Login with new password failed:",
      error.response?.data?.message || error.message
    );
    return false;
  }
}

/**
 * Test 4: Try to change password without confirmPassword
 */
async function testMissingConfirmPassword() {
  console.log(
    "\n🧪 Test 4: Change password without confirmPassword (should fail)"
  );
  try {
    const response = await axios.put(
      `${API_URL}/auth/change-password`,
      {
        currentPassword: testUser.newPassword,
        newPassword: "AnotherPass789",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("❌ Should have failed but succeeded");
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Correctly rejected - missing confirmPassword");
      console.log(`   Error: ${error.response.data.message}`);
      return true;
    }
    console.log("❌ Unexpected error:", error.message);
    return false;
  }
}

/**
 * Test 5: Try to change password with mismatched confirmation
 */
async function testMismatchedConfirmPassword() {
  console.log(
    "\n🧪 Test 5: Change password with mismatched confirmation (should fail)"
  );
  try {
    const response = await axios.put(
      `${API_URL}/auth/change-password`,
      {
        currentPassword: testUser.newPassword,
        newPassword: "AnotherPass789",
        confirmPassword: "DifferentPass789",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("❌ Should have failed but succeeded");
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Correctly rejected - password confirmation mismatch");
      console.log(`   Error: ${error.response.data.message}`);
      return true;
    }
    console.log("❌ Unexpected error:", error.message);
    return false;
  }
}

/**
 * Test 6: Try to change password using same as current
 */
async function testSamePassword() {
  console.log("\n🧪 Test 6: Change password to same as current (should fail)");
  try {
    const response = await axios.put(
      `${API_URL}/auth/change-password`,
      {
        currentPassword: testUser.newPassword,
        newPassword: testUser.newPassword,
        confirmPassword: testUser.newPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("❌ Should have failed but succeeded");
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Correctly rejected - new password same as current");
      console.log(`   Error: ${error.response.data.message}`);
      return true;
    }
    console.log("❌ Unexpected error:", error.message);
    return false;
  }
}

/**
 * Test 7: Try to change password with weak new password
 */
async function testWeakPassword() {
  console.log("\n🧪 Test 7: Change password with weak password (should fail)");
  try {
    const response = await axios.put(
      `${API_URL}/auth/change-password`,
      {
        currentPassword: testUser.newPassword,
        newPassword: "weak",
        confirmPassword: "weak",
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    console.log("❌ Should have failed but succeeded");
    return false;
  } catch (error) {
    if (error.response?.status === 400) {
      console.log("✅ Correctly rejected - weak password");
      console.log(`   Error: ${error.response.data.message}`);
      return true;
    }
    console.log("❌ Unexpected error:", error.message);
    return false;
  }
}

/**
 * Test 8: Change password back to original
 */
async function testChangePasswordBack() {
  console.log("\n🧪 Test 8: Change password back to original");
  try {
    const response = await axios.put(
      `${API_URL}/auth/change-password`,
      {
        currentPassword: testUser.newPassword,
        newPassword: testUser.oldPassword,
        confirmPassword: testUser.oldPassword,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (response.data.status === "success") {
      console.log("✅ Password changed back to original");
      return true;
    }
  } catch (error) {
    console.log(
      "❌ Failed to change back:",
      error.response?.data?.message || error.message
    );
    return false;
  }
}

/**
 * Run all tests
 */
async function runTests() {
  console.log("=".repeat(60));
  console.log("🚀 Starting Change Password Tests");
  console.log("=".repeat(60));

  const results = {
    passed: 0,
    failed: 0,
    total: 8,
  };

  // Run tests in sequence
  if (await testLogin()) results.passed++;
  else results.failed++;
  if (await testChangePasswordSuccess()) results.passed++;
  else results.failed++;
  if (await testLoginWithNewPassword()) results.passed++;
  else results.failed++;
  if (await testMissingConfirmPassword()) results.passed++;
  else results.failed++;
  if (await testMismatchedConfirmPassword()) results.passed++;
  else results.failed++;
  if (await testSamePassword()) results.passed++;
  else results.failed++;
  if (await testWeakPassword()) results.passed++;
  else results.failed++;
  if (await testChangePasswordBack()) results.passed++;
  else results.failed++;

  // Print summary
  console.log("\n" + "=".repeat(60));
  console.log("📊 Test Summary");
  console.log("=".repeat(60));
  console.log(`Total Tests:  ${results.total}`);
  console.log(
    `✅ Passed:    ${results.passed} (${Math.round(
      (results.passed / results.total) * 100
    )}%)`
  );
  console.log(
    `❌ Failed:    ${results.failed} (${Math.round(
      (results.failed / results.total) * 100
    )}%)`
  );
  console.log("=".repeat(60));

  process.exit(results.failed > 0 ? 1 : 0);
}

// Run tests
runTests().catch((error) => {
  console.error("❌ Test suite failed:", error.message);
  process.exit(1);
});
