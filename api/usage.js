// Vercel API Route: /api/usage
import { sql, initDatabase } from '../lib/neon-db.js';

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

  try {
    // Initialize database if needed
    await initDatabase();

    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await getUsageStats(req, res);
      case 'POST':
        return await checkUsageLimits(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Usage API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Get usage statistics for a tenant
async function getUsageStats(req, res) {
  try {
    const { tenant_id, period = 'current_month' } = req.query;
    
    // Check if this is the main domain (boom-booking-clean.vercel.app)
    const host = req.headers.host || req.headers['x-forwarded-host'];
    const isMainDomain = host && (
      host.includes('boom-booking-clean.vercel.app') || 
      host.includes('boom-booking-clean-v1.vercel.app')
    );

    if (!tenant_id && !isMainDomain) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required'
      });
    }
    
    // For main domain, return default usage stats
    if (isMainDomain && !tenant_id) {
      return res.status(200).json({
        success: true,
        data: {
          usage: {
            bookings_count: 0,
            total_hours: 0,
            total_revenue: 0,
            period: period
          },
          limits: {
            max_bookings: 100,
            max_hours: 1000,
            max_revenue: 10000
          }
        },
        message: 'Default usage stats (main domain)'
      });
    }

    // Get tenant plan information
    const tenant = await sql`
      SELECT plan_type, trial_ends_at
      FROM tenants 
      WHERE id = ${tenant_id} AND deleted_at IS NULL
    `;

    if (tenant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const planType = tenant[0].plan_type;
    const limits = getPlanLimits(planType);

    // Calculate date range based on period
    let dateFilter = '';
    let params = [tenant_id];
    
    if (period === 'current_month') {
      dateFilter = `AND DATE_TRUNC('month', b.created_at) = DATE_TRUNC('month', CURRENT_DATE)`;
    } else if (period === 'current_year') {
      dateFilter = `AND DATE_TRUNC('year', b.created_at) = DATE_TRUNC('year', CURRENT_DATE)`;
    } else if (period === 'last_30_days') {
      dateFilter = `AND b.created_at >= CURRENT_DATE - INTERVAL '30 days'`;
    }

    // Get current usage statistics
    const usage = await sql.unsafe(`
      SELECT 
        COUNT(DISTINCT r.id) as room_count,
        COUNT(DISTINCT b.id) as booking_count,
        COUNT(DISTINCT tu.user_id) as user_count,
        COALESCE(SUM(b.total_price), 0) as total_revenue
      FROM tenants t
      LEFT JOIN rooms r ON t.id = r.tenant_id AND r.deleted_at IS NULL
      LEFT JOIN bookings b ON t.id = b.tenant_id AND b.deleted_at IS NULL ${dateFilter}
      LEFT JOIN tenant_users tu ON t.id = tu.tenant_id
      WHERE t.id = $1
    `, params);

    // Get monthly booking trend (last 6 months)
    const trend = await sql`
      SELECT 
        DATE_TRUNC('month', created_at) as month,
        COUNT(*) as booking_count,
        SUM(total_price) as revenue
      FROM bookings 
      WHERE tenant_id = ${tenant_id} 
        AND deleted_at IS NULL
        AND created_at >= CURRENT_DATE - INTERVAL '6 months'
      GROUP BY DATE_TRUNC('month', created_at)
      ORDER BY month
    `;

    const usageData = {
      tenant: {
        id: tenant_id,
        planType: planType,
        trialEndsAt: tenant[0].trial_ends_at
      },
      limits: limits,
      current: {
        roomCount: parseInt(usage[0].room_count),
        bookingCount: parseInt(usage[0].booking_count),
        userCount: parseInt(usage[0].user_count),
        totalRevenue: parseFloat(usage[0].total_revenue || 0)
      },
      trend: trend.map(row => ({
        month: row.month,
        bookingCount: parseInt(row.booking_count),
        revenue: parseFloat(row.revenue || 0)
      })),
      status: {
        roomLimitReached: limits.rooms !== -1 && parseInt(usage[0].room_count) >= limits.rooms,
        bookingLimitReached: limits.bookings !== -1 && parseInt(usage[0].booking_count) >= limits.bookings,
        userLimitReached: limits.users !== -1 && parseInt(usage[0].user_count) >= limits.users,
        needsUpgrade: (limits.rooms !== -1 && parseInt(usage[0].room_count) >= limits.rooms) ||
                     (limits.bookings !== -1 && parseInt(usage[0].booking_count) >= limits.bookings) ||
                     (limits.users !== -1 && parseInt(usage[0].user_count) >= limits.users)
      }
    };

    res.status(200).json({
      success: true,
      data: usageData
    });
  } catch (error) {
    console.error('Error fetching usage stats:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch usage statistics'
    });
  }
}

// Check usage limits before creating resources
async function checkUsageLimits(req, res) {
  try {
    const { tenant_id, resource_type, resource_count = 1 } = req.body;
    
    // Check if this is the main domain (boom-booking-clean.vercel.app)
    const host = req.headers.host || req.headers['x-forwarded-host'];
    const isMainDomain = host && (
      host.includes('boom-booking-clean.vercel.app') || 
      host.includes('boom-booking-clean-v1.vercel.app')
    );

    if ((!tenant_id && !isMainDomain) || !resource_type) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID and resource type are required'
      });
    }
    
    // For main domain, return default usage limits check
    if (isMainDomain && !tenant_id) {
      return res.status(200).json({
        success: true,
        data: {
          withinLimits: true,
          currentUsage: 0,
          limit: 1000,
          resourceType: resource_type
        },
        message: 'Default usage limits check (main domain)'
      });
    }

    // Get tenant plan information
    const tenant = await sql`
      SELECT plan_type, trial_ends_at
      FROM tenants 
      WHERE id = ${tenant_id} AND deleted_at IS NULL
    `;

    if (tenant.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const planType = tenant[0].plan_type;
    const limits = getPlanLimits(planType);

    // Get current usage
    let currentUsage = 0;
    let limit = -1;

    switch (resource_type) {
      case 'rooms': {
        const roomUsage = await sql`
          SELECT COUNT(*) as count FROM rooms 
          WHERE tenant_id = ${tenant_id} AND deleted_at IS NULL
        `;
        currentUsage = parseInt(roomUsage[0].count);
        limit = limits.rooms;
        break;
      }

      case 'bookings': {
        const bookingUsage = await sql`
          SELECT COUNT(*) as count FROM bookings 
          WHERE tenant_id = ${tenant_id} 
            AND deleted_at IS NULL
            AND DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE)
        `;
        currentUsage = parseInt(bookingUsage[0].count);
        limit = limits.bookings;
        break;
      }

      case 'users': {
        const userUsage = await sql`
          SELECT COUNT(*) as count FROM tenant_users 
          WHERE tenant_id = ${tenant_id}
        `;
        currentUsage = parseInt(userUsage[0].count);
        limit = limits.users;
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          error: 'Invalid resource type'
        });
    }

    const wouldExceedLimit = limit !== -1 && (currentUsage + resource_count) > limit;
    const canProceed = !wouldExceedLimit;

    const response = {
      canProceed: canProceed,
      currentUsage: currentUsage,
      requestedCount: resource_count,
      limit: limit,
      remaining: limit === -1 ? -1 : Math.max(0, limit - currentUsage),
      wouldExceedLimit: wouldExceedLimit,
      needsUpgrade: wouldExceedLimit,
      upgradeRequired: wouldExceedLimit,
      planType: planType,
      limits: limits
    };

    if (wouldExceedLimit) {
      response.error = `${resource_type} limit exceeded. Current: ${currentUsage}, Limit: ${limit}, Requested: ${resource_count}`;
    }

    res.status(canProceed ? 200 : 403).json({
      success: canProceed,
      data: response
    });
  } catch (error) {
    console.error('Error checking usage limits:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check usage limits'
    });
  }
}

// Helper function to get plan limits
function getPlanLimits(planType) {
  const limits = {
    free: { rooms: 1, bookings: 50, users: 1 },
    basic: { rooms: 5, bookings: 500, users: 5 },
    pro: { rooms: 20, bookings: 2000, users: 20 },
    business: { rooms: -1, bookings: -1, users: -1 } // -1 means unlimited
  };
  return limits[planType] || limits.free;
}
