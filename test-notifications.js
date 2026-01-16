/**
 * Quick test script for notifications
 * Run this in Node.js or browser console
 * 
 * Make sure you're logged in to the app first!
 */

// Test 1: Check reminders endpoint
async function testReminders() {
  try {
    const response = await fetch('http://localhost:3000/api/notifications/reminders', {
      credentials: 'include', // Include cookies for auth
    });
    const data = await response.json();
    console.log('✅ Reminders Test Result:', data);
    return data;
  } catch (error) {
    console.error('❌ Reminders Test Error:', error);
  }
}

// Test 2: Send manual notification
async function testManualSend() {
  try {
    const response = await fetch('http://localhost:3000/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies for auth
      body: JSON.stringify({
        type: 'event',
        itemId: 'test-id-' + Date.now(),
        itemTitle: 'Test Event - ' + new Date().toLocaleString(),
        itemDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0], // Tomorrow
        itemTime: '10:00',
        creatorName: 'Test User'
      })
    });
    const data = await response.json();
    console.log('✅ Manual Send Test Result:', data);
    return data;
  } catch (error) {
    console.error('❌ Manual Send Test Error:', error);
  }
}

// Run tests
console.log('🧪 Starting notification tests...');
console.log('Make sure you are logged in to the app!');
console.log('');

// Uncomment the test you want to run:
// testReminders();
// testManualSend();

// Or run both:
// Promise.all([testReminders(), testManualSend()]);



