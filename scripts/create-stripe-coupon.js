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

async function createReferralCoupon() {
  try {
    console.log('🔧 Setting up Stripe Referral Discount Coupon...\n');

    // Check if we have the required environment variables
    if (!process.env.STRIPE_SECRET_KEY) {
      console.error('❌ STRIPE_SECRET_KEY is missing from environment variables');
      console.log('💡 Make sure you have a .env file in your project root with STRIPE_SECRET_KEY');
      return;
    }

    // Create the referral discount coupon
    console.log('🎫 Creating referral discount coupon...');
    const coupon = await stripe.coupons.create({
      percent_off: 50, // 50% discount
      duration: 'forever', // Permanent discount
      name: 'Referral Discount',
      metadata: {
        discount_type: 'referral',
        discount_percentage: '50'
      }
    });
    console.log('✅ Coupon created:', coupon.id);

    console.log('\n🎉 Setup complete!');
    console.log('\n📋 Add this to your environment variables:');
    console.log(`STRIPE_REFERRAL_COUPON_ID=${coupon.id}`);
    
    console.log('\n📝 Summary:');
    console.log(`- Coupon ID: ${coupon.id}`);
    console.log(`- Discount: 50% off`);
    console.log(`- Duration: Forever`);
    console.log(`- Name: Referral Discount`);

    console.log('\n💡 This coupon will be automatically applied to:');
    console.log('- New checkout sessions for users with discounts');
    console.log('- Existing subscriptions when users get discounts');

  } catch (error) {
    console.error('❌ Error creating Stripe coupon:', error.message);
    
    if (error.type === 'StripeInvalidRequestError') {
      console.log('\n💡 This might be because:');
      console.log('- The Stripe secret key is invalid');
      console.log('- You\'re using test keys in production or vice versa');
      console.log('- The Stripe account doesn\'t have the required permissions');
    }
  }
}

// Run the script
createReferralCoupon(); 