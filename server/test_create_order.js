import fetch from 'node-fetch';

/**
 * Test script to create a sample order
 * Run with: node test_create_order.js
 */

const API_URL = 'http://localhost:5000';

// You need to get your token from localStorage in the browser
// Or login first to get a token
const ADMIN_TOKEN = 'YOUR_TOKEN_HERE'; // Replace with your actual token

async function createTestOrder() {
  try {
    console.log('🧪 Creating test order...\n');

    const orderData = {
      customer_id: 1, // Make sure customer with ID 1 exists
      items: [
        {
          product_id: 1, // Make sure product with ID 1 exists
          quantity: 2
        }
      ],
      shipping_address: {
        name: 'John Doe',
        phone: '+1234567890',
        address: '123 Main Street, Apt 4B',
        city: 'New York',
        state: 'NY',
        postal_code: '10001',
        country: 'USA'
      },
      payment_method: 'stripe',
      payment_transaction_id: `test_${Date.now()}`,
      payment_status: 'paid',
      notes: 'Test order created via script'
    };

    const response = await fetch(`${API_URL}/api/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${ADMIN_TOKEN}`
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Order created successfully!\n');
      console.log('📦 Order Details:');
      console.log('   Order Number:', result.order.order_number);
      console.log('   Total Amount: $' + result.order.total_amount);
      console.log('   Status:', result.order.order_status);
      console.log('   Payment Status:', result.order.payment_status);
      console.log('   Items:', result.order.items.length);
      
      if (result.order.campaign_entries && result.order.campaign_entries.length > 0) {
        console.log('\n🎁 Campaign Entries:');
        result.order.campaign_entries.forEach(entry => {
          console.log(`   - Ticket: ${entry.ticket_number} for ${entry.campaign_title}`);
        });
      }
    } else {
      console.error('❌ Error:', result.message);
    }

  } catch (error) {
    console.error('❌ Error creating order:', error.message);
  }
}

// Run the test
createTestOrder();
