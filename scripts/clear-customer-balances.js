const Stripe = require('stripe');
const path = require('path');
const fs = require('fs');

// Load environment variables from .env file if it exists
function loadEnvFile() {
  const envPath = path.join(__dirname, '..', '.env');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    
    lines.forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        const value = valueParts.join('=').trim();
        if (!process.env[key.trim()]) {
          process.env[key.trim()] = value.replace(/^["']|["']$/g, '');
        }
      }
    });
  }
}

// Load environment variables
loadEnvFile();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-05-28.basil',
});

async function clearCustomerBalances() {
  try {
    console.log('🧹 Clearing customer balances from old discount system...\n');

    // Check if we have the required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is missing from environment variables');
      return;
    }

    // List all customers with negative balances
    console.log('🔍 Finding customers with negative balances...');
    const customers = await stripe.customers.list({
      limit: 100,
    });

    let clearedCount = 0;
    let totalCleared = 0;

    for (const customer of customers.data) {
      if (customer.balance && customer.balance < 0) {
        console.log(`💰 Customer ${customer.id} has balance: £${(customer.balance / 100).toFixed(2)}`);
        
        try {
          // Reset balance to 0
          await stripe.customers.update(customer.id, {
            balance: 0
          });
          
          console.log(`✅ Cleared balance for customer ${customer.id}`);
          clearedCount++;
          totalCleared += Math.abs(customer.balance);
        } catch (error) {
          console.error(`❌ Failed to clear balance for customer ${customer.id}:`, error.message);
        }
      }
    }

    console.log('\n🎉 Balance clearing complete!');
    console.log(`📊 Summary:`);
    console.log(`- Customers processed: ${customers.data.length}`);
    console.log(`- Balances cleared: ${clearedCount}`);
    console.log(`- Total amount cleared: £${(totalCleared / 100).toFixed(2)}`);

    if (clearedCount === 0) {
      console.log('✅ No negative balances found to clear');
    }

  } catch (error) {
    console.error('❌ Error clearing customer balances:', error.message);
  }
}

// Run the script
clearCustomerBalances(); 