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

async function createStripePrice() {
  try {
    console.log('🔧 Setting up Stripe Price ID for DSG Pro Subscription...\n');

    // Check if we have the required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is missing from environment variables');
      console.log('💡 Make sure you have a .env file in your project root with STRIPE_SECRET_KEY');
      return;
    }

    // Create the product first
    console.log('📦 Creating product...');
    const product = await stripe.products.create({
      name: 'DSG Pro Subscription',
      description: 'Unlimited medical note summaries',
      metadata: {
        type: 'subscription',
        service: 'medical_summaries'
      }
    });
    console.log('✅ Product created:', product.id);

    // Create the price
    console.log('💰 Creating price...');
    const price = await stripe.prices.create({
      product: product.id,
      unit_amount: 250, // £2.50 in pence
      currency: 'gbp',
      recurring: {
        interval: 'month'
      },
      metadata: {
        subscription_type: 'monthly',
        original_price_cents: '250'
      }
    });
    console.log('✅ Price created:', price.id);

    console.log('\n🎉 Setup complete!');
    console.log('\n📋 Add this to your environment variables:');
    console.log(`STRIPE_PRICE_ID=${price.id}`);
    console.log(`STRIPE_PRODUCT_ID=${product.id}`);
    
    console.log('\n📝 Summary:');
    console.log(`- Product ID: ${product.id}`);
    console.log(`- Price ID: ${price.id}`);
    console.log(`- Amount: £2.50/month`);
    console.log(`- Currency: GBP`);
    console.log(`- Interval: Monthly`);

  } catch (error) {
    console.error('❌ Error creating Stripe price:', error.message);
    
    if (error.type === 'StripeInvalidRequestError') {
      console.log('\n💡 This might be because:');
      console.log('- The Stripe secret key is invalid');
      console.log('- You\'re using test keys in production or vice versa');
      console.log('- The Stripe account doesn\'t have the required permissions');
    }
  }
}

// Run the script
createStripePrice(); 