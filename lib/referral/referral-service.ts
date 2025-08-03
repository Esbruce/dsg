import { supabaseAdmin } from '@/lib/supabase/admin';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/types/database';
import Stripe from 'stripe';

type User = Database['public']['Tables']['users']['Row'];

export interface ReferralData {
  referralLink: string;
  hasBeenReferred: boolean;
  referrerInfo?: {
    id: string;
    createdAt: string;
  };
}

export class ReferralService {
  /**
   * Get referral link for a user (using their UUID)
   */
  async getReferralLink(userId: string): Promise<string> {
    return `${process.env.NEXT_PUBLIC_BASE_URL}/signup?ref=${userId}`;
  }

  /**
   * Get referral data for a user
   */
  async getReferralData(userId: string): Promise<ReferralData> {
    try {
      // Get referral link
      const referralLink = await this.getReferralLink(userId);

      // Check if user has been referred by someone
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('referred_by')
        .eq('id', userId)
        .single();

      const hasBeenReferred = !!user?.referred_by;

      // If they have been referred, get referrer info
      let referrerInfo = undefined;
      if (hasBeenReferred && user?.referred_by) {
        const { data: referrer } = await supabaseAdmin
          .from('users')
          .select('id, created_at')
          .eq('id', user.referred_by)
          .single();

        if (referrer) {
          referrerInfo = {
            id: referrer.id,
            createdAt: referrer.created_at
          };
        }
      }

      return {
        referralLink,
        hasBeenReferred,
        referrerInfo
      };
    } catch (error) {
      console.error('Error getting referral data:', error);
      throw new Error('Failed to get referral data');
    }
  }

  /**
   * Validate and get referrer from referral UUID
   */
  async getReferrerFromUUID(referralUUID: string): Promise<string | null> {
    try {
      // Validate UUID format
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(referralUUID)) {
        console.error('Invalid UUID format:', referralUUID);
        return null;
      }

      // Check if user exists
      const { data: user, error } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('id', referralUUID)
        .single();

      if (error || !user) {
        console.error('User not found for referral UUID:', referralUUID);
        return null;
      }

      return user.id;
    } catch (error) {
      console.error('Error getting referrer from UUID:', error);
      return null;
    }
  }

  /**
   * Get referral data for authenticated user
   */
  async getCurrentUserReferralData(): Promise<ReferralData> {
    const supabase = await createClient();
    const { data: { user }, error } = await supabase.auth.getUser();

    if (error || !user) {
      throw new Error('User not authenticated');
    }

    return this.getReferralData(user.id);
  }

  /**
   * Convert referral when referred user completes payment
   */
  async convertReferral(referredUserId: string): Promise<void> {
    try {
      console.log('🔄 Converting referral for user:', referredUserId);
      
      // Get referred user's data
      const { data: referredUser } = await supabaseAdmin
        .from('users')
        .select('referred_by')
        .eq('id', referredUserId)
        .single();

      if (!referredUser?.referred_by) {
        console.log('❌ No referrer found for user:', referredUserId);
        return; // No referrer found
      }

      console.log('✅ Found referrer:', referredUser.referred_by);

      // Update referrer's flags
      const { error: updateError } = await supabaseAdmin
        .from('users')
        .update({ 
          has_reffered_paid_user: true,
          discounted: true // Set discount flag
        })
        .eq('id', referredUser.referred_by);

      if (updateError) {
        console.error('❌ Error updating referrer flags:', updateError);
        return;
      }

      console.log('✅ Updated referrer flags for user:', referredUser.referred_by);

      // Apply referral reward to Stripe balance
      await this.applyReferralReward(referredUser.referred_by);
    } catch (error) {
      console.error('❌ Error converting referral:', error);
    }
  }

  /**
   * Apply referral reward to referrer's Stripe balance
   */
  async applyReferralReward(referrerId: string): Promise<void> {
    try {
      console.log('💰 Applying referral reward to user:', referrerId);
      
      // Get referrer's Stripe customer ID
      const { data: referrer } = await supabaseAdmin
        .from('users')
        .select('stripe_customer_id')
        .eq('id', referrerId)
        .single();

      if (!referrer?.stripe_customer_id) {
        console.log('❌ Referrer has no Stripe customer ID:', referrerId);
        return;
      }

      // Calculate reward (50% of subscription price)
      const subscriptionPrice = parseInt(process.env.SUBSCRIPTION_PRICE_CENTS || '250'); // Default to £2.50 (250 cents)
      const referralReward = Math.floor(subscriptionPrice * 0.5); // 50% discount

      // Add balance to Stripe customer
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
      await stripe.customers.update(referrer.stripe_customer_id, {
        balance: -referralReward // Negative = credit
      });

      console.log(`✅ Applied $${referralReward/100} referral reward to user ${referrerId}`);
    } catch (error) {
      console.error('❌ Error applying referral reward:', error);
    }
  }

  /**
   * Get referrer's discount status
   */
  async getReferrerDiscountStatus(userId: string): Promise<{
    hasDiscount: boolean;
    discountPercentage: number;
  }> {
    try {
      const { data: user } = await supabaseAdmin
        .from('users')
        .select('discounted')
        .eq('id', userId)
        .single();

      const hasDiscount = user?.discounted || false;
      const discountPercentage = hasDiscount ? 50 : 0; // 50% discount

      return {
        hasDiscount,
        discountPercentage
      };
    } catch (error) {
      console.error('❌ Error getting referrer discount status:', error);
      return { hasDiscount: false, discountPercentage: 0 };
    }
  }
}

// Export singleton instance
export const referralService = new ReferralService(); 