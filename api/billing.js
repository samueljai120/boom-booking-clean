// Vercel API Route: /api/billing
import { sql, initDatabase } from '../lib/neon-db.js';
import Stripe from 'stripe';

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Check if Stripe is configured
  if (!stripe) {
    return res.status(500).json({
      success: false,
      error: 'Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.'
    });
  }

  try {
    // Initialize database if needed
    await initDatabase();

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await getBillingInfo(req, res);
      case 'POST':
        return await createSubscription(req, res);
      case 'PUT':
        return await updateSubscription(req, res);
      case 'DELETE':
        return await cancelSubscription(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Billing API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Get billing information
async function getBillingInfo(req, res) {
  try {
    const { tenant_id } = req.query;

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required'
      });
    }

    const tenant = await sql`
      SELECT 
        id, name, plan_type, status, stripe_customer_id, 
        subscription_id, subscription_status, trial_ends_at,
        created_at
      FROM tenants 
      WHERE id = ${tenant_id} AND deleted_at IS NULL
    `;

    if (tenant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const tenantData = tenant[0];
    let stripeData = null;

    // Get Stripe customer and subscription data if exists
    if (tenantData.stripe_customer_id) {
      try {
        const customer = await stripe.customers.retrieve(tenantData.stripe_customer_id);
        stripeData = {
          customerId: customer.id,
          email: customer.email,
          name: customer.name,
          created: customer.created
        };

        if (tenantData.subscription_id) {
          const subscription = await stripe.subscriptions.retrieve(tenantData.subscription_id);
          stripeData.subscription = {
            id: subscription.id,
            status: subscription.status,
            currentPeriodStart: subscription.current_period_start,
            currentPeriodEnd: subscription.current_period_end,
            cancelAtPeriodEnd: subscription.cancel_at_period_end,
            items: subscription.items.data.map(item => ({
              id: item.id,
              priceId: item.price.id,
              quantity: item.quantity
            }))
          };
        }
      } catch (stripeError) {
        console.error('Stripe error:', stripeError);
        // Continue without Stripe data
      }
    }

    // Get usage statistics
    const usage = await sql`
      SELECT 
        COUNT(DISTINCT r.id) as room_count,
        COUNT(DISTINCT b.id) as booking_count,
        COUNT(DISTINCT tu.user_id) as user_count
      FROM tenants t
      LEFT JOIN rooms r ON t.id = r.tenant_id AND r.deleted_at IS NULL
      LEFT JOIN bookings b ON t.id = b.tenant_id AND b.deleted_at IS NULL
      LEFT JOIN tenant_users tu ON t.id = tu.tenant_id
      WHERE t.id = ${tenant_id}
    `;

    const billingInfo = {
      tenant: {
        id: tenantData.id,
        name: tenantData.name,
        planType: tenantData.plan_type,
        status: tenantData.status,
        trialEndsAt: tenantData.trial_ends_at,
        createdAt: tenantData.created_at
      },
      stripe: stripeData,
      usage: {
        roomCount: parseInt(usage[0].room_count),
        bookingCount: parseInt(usage[0].booking_count),
        userCount: parseInt(usage[0].user_count)
      },
      limits: getPlanLimits(tenantData.plan_type)
    };

    res.status(200).json({
      success: true,
      data: billingInfo
    });
  } catch (error) {
    console.error('Error fetching billing info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch billing information'
    });
  }
}

// Create subscription
async function createSubscription(req, res) {
  try {
    const { tenant_id, price_id, payment_method_id: _payment_method_id } = req.body;

    if (!tenant_id || !price_id) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID and price ID are required'
      });
    }

    // Get tenant information
    const tenant = await sql`
      SELECT id, name, plan_type, stripe_customer_id
      FROM tenants 
      WHERE id = ${tenant_id} AND deleted_at IS NULL
    `;

    if (tenant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const tenantData = tenant[0];
    let customerId = tenantData.stripe_customer_id;

    // Create Stripe customer if doesn't exist
    if (!customerId) {
      const customer = await stripe.customers.create({
        name: tenantData.name,
        metadata: {
          tenant_id: tenant_id
        }
      });
      customerId = customer.id;

      // Update tenant with customer ID
      await sql`
        UPDATE tenants 
        SET stripe_customer_id = ${customerId}
        WHERE id = ${tenant_id}
      `;
    }

    // Create subscription
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: price_id }],
      payment_behavior: 'default_incomplete',
      payment_settings: { save_default_payment_method: 'on_subscription' },
      expand: ['latest_invoice.payment_intent'],
    });

    // Update tenant with subscription info
    const planType = getPlanTypeFromPriceId(price_id);
    await sql`
      UPDATE tenants 
      SET 
        subscription_id = ${subscription.id},
        subscription_status = ${subscription.status},
        plan_type = ${planType},
        updated_at = NOW()
      WHERE id = ${tenant_id}
    `;

    res.status(201).json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        clientSecret: subscription.latest_invoice.payment_intent.client_secret,
        status: subscription.status
      }
    });
  } catch (error) {
    console.error('Error creating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription'
    });
  }
}

// Update subscription
async function updateSubscription(req, res) {
  try {
    const { tenant_id, price_id } = req.body;

    if (!tenant_id || !price_id) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID and price ID are required'
      });
    }

    // Get tenant subscription info
    const tenant = await sql`
      SELECT subscription_id, plan_type
      FROM tenants 
      WHERE id = ${tenant_id} AND deleted_at IS NULL
    `;

    if (tenant.length === 0 || !tenant[0].subscription_id) {
      return res.status(404).json({
        success: false,
        error: 'Active subscription not found'
      });
    }

    const subscriptionId = tenant[0].subscription_id;

    // Update subscription in Stripe
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
    const updatedSubscription = await stripe.subscriptions.update(subscriptionId, {
      items: [{
        id: subscription.items.data[0].id,
        price: price_id,
      }],
      proration_behavior: 'create_prorations',
    });

    // Update tenant plan type
    const planType = getPlanTypeFromPriceId(price_id);
    await sql`
      UPDATE tenants 
      SET 
        plan_type = ${planType},
        subscription_status = ${updatedSubscription.status},
        updated_at = NOW()
      WHERE id = ${tenant_id}
    `;

    res.status(200).json({
      success: true,
      data: {
        subscriptionId: updatedSubscription.id,
        status: updatedSubscription.status,
        planType: planType
      }
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update subscription'
    });
  }
}

// Cancel subscription
async function cancelSubscription(req, res) {
  try {
    const { tenant_id } = req.body;

    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required'
      });
    }

    // Get tenant subscription info
    const tenant = await sql`
      SELECT subscription_id
      FROM tenants 
      WHERE id = ${tenant_id} AND deleted_at IS NULL
    `;

    if (tenant.length === 0 || !tenant[0].subscription_id) {
      return res.status(404).json({
        success: false,
        error: 'Active subscription not found'
      });
    }

    const subscriptionId = tenant[0].subscription_id;

    // Cancel subscription in Stripe
    const subscription = await stripe.subscriptions.update(subscriptionId, {
      cancel_at_period_end: true,
    });

    // Update tenant status
    await sql`
      UPDATE tenants 
      SET 
        subscription_status = ${subscription.status},
        plan_type = 'free',
        updated_at = NOW()
      WHERE id = ${tenant_id}
    `;

    res.status(200).json({
      success: true,
      data: {
        subscriptionId: subscription.id,
        status: subscription.status,
        cancelAtPeriodEnd: subscription.cancel_at_period_end
      }
    });
  } catch (error) {
    console.error('Error canceling subscription:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription'
    });
  }
}

// Helper functions
function getPlanLimits(planType) {
  const limits = {
    free: { rooms: 1, bookings: 50, users: 1 },
    basic: { rooms: 5, bookings: 500, users: 5 },
    pro: { rooms: 20, bookings: 2000, users: 20 },
    business: { rooms: -1, bookings: -1, users: -1 } // -1 means unlimited
  };
  return limits[planType] || limits.free;
}

function getPlanTypeFromPriceId(priceId) {
  // Map Stripe price IDs to plan types
  const priceMap = {
    'price_free': 'free',
    'price_basic': 'basic', 
    'price_pro': 'pro',
    'price_business': 'business'
  };
  return priceMap[priceId] || 'free';
}
