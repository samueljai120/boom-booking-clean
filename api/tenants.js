// Vercel API Route: /api/tenants
import { sql, initDatabase } from '../lib/neon-db.js';
// import jwt from 'jsonwebtoken'; // TODO: Implement JWT validation

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
        return await getTenants(req, res);
      case 'POST':
        return await createTenant(req, res);
      case 'PUT':
        return await updateTenant(req, res);
      case 'DELETE':
        return await deleteTenant(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Tenants API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Get tenants
async function getTenants(req, res) {
  try {
    const { id, subdomain } = req.query;
    
    let query = `
      SELECT 
        t.id, t.name, t.subdomain, t.domain, t.plan_type, t.status,
        t.settings, t.stripe_customer_id, t.subscription_id, t.subscription_status,
        t.trial_ends_at, t.created_at, t.updated_at,
        COUNT(tu.user_id) as user_count,
        COUNT(r.id) as room_count,
        COUNT(b.id) as booking_count
      FROM tenants t
      LEFT JOIN tenant_users tu ON t.id = tu.tenant_id
      LEFT JOIN rooms r ON t.id = r.tenant_id AND r.deleted_at IS NULL
      LEFT JOIN bookings b ON t.id = b.tenant_id AND b.deleted_at IS NULL
      WHERE t.deleted_at IS NULL
    `;
    
    const params = [];
    
    if (id) {
      query += ` AND t.id = $${params.length + 1}`;
      params.push(id);
    }
    
    if (subdomain) {
      query += ` AND t.subdomain = $${params.length + 1}`;
      params.push(subdomain);
    }
    
    query += ` GROUP BY t.id ORDER BY t.created_at DESC`;
    
    const result = await sql.unsafe(query, params);
    
    const tenants = result.map(row => ({
      id: row.id,
      name: row.name,
      subdomain: row.subdomain,
      domain: row.domain,
      planType: row.plan_type,
      status: row.status,
      settings: row.settings,
      stripeCustomerId: row.stripe_customer_id,
      subscriptionId: row.subscription_id,
      subscriptionStatus: row.subscription_status,
      trialEndsAt: row.trial_ends_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
      stats: {
        userCount: parseInt(row.user_count),
        roomCount: parseInt(row.room_count),
        bookingCount: parseInt(row.booking_count)
      }
    }));

    res.status(200).json({
      success: true,
      data: tenants
    });
  } catch (error) {
    console.error('Error fetching tenants:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch tenants'
    });
  }
}

// Create tenant
async function createTenant(req, res) {
  try {
    const { 
      name, 
      subdomain, 
      domain, 
      plan_type = 'free',
      settings = {},
      user_id 
    } = req.body;

    // Validate required fields
    if (!name || !subdomain) {
      return res.status(400).json({
        success: false,
        error: 'Name and subdomain are required'
      });
    }

    // Check if subdomain already exists
    const existingTenant = await sql`
      SELECT id FROM tenants 
      WHERE subdomain = ${subdomain} AND deleted_at IS NULL
    `;

    if (existingTenant.length > 0) {
      return res.status(400).json({
        success: false,
        error: 'Subdomain already exists'
      });
    }

    // Create tenant
    const tenantResult = await sql`
      INSERT INTO tenants (
        name, subdomain, domain, plan_type, status, settings, trial_ends_at
      )
      VALUES (
        ${name}, ${subdomain}, ${domain}, ${plan_type}, 'active', 
        ${settings}, 
        ${plan_type === 'free' ? null : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)}
      )
      RETURNING *
    `;

    const tenant = tenantResult[0];

    // If user_id provided, link user to tenant as owner
    if (user_id) {
      await sql`
        INSERT INTO tenant_users (tenant_id, user_id, role)
        VALUES (${tenant.id}, ${user_id}, 'owner')
      `;
    }

    // Create default business hours for the tenant
    const businessHours = [
      { day: 1, open: '09:00', close: '22:00', closed: false },
      { day: 2, open: '09:00', close: '22:00', closed: false },
      { day: 3, open: '09:00', close: '22:00', closed: false },
      { day: 4, open: '09:00', close: '22:00', closed: false },
      { day: 5, open: '09:00', close: '23:00', closed: false },
      { day: 6, open: '10:00', close: '23:00', closed: false },
      { day: 0, open: '10:00', close: '21:00', closed: false }
    ];

    for (const hour of businessHours) {
      await sql`
        INSERT INTO business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
        VALUES (${tenant.id}, ${hour.day}, ${hour.open}, ${hour.close}, ${hour.closed})
      `;
    }

    const tenantResponse = {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      planType: tenant.plan_type,
      status: tenant.status,
      settings: tenant.settings,
      stripeCustomerId: tenant.stripe_customer_id,
      subscriptionId: tenant.subscription_id,
      subscriptionStatus: tenant.subscription_status,
      trialEndsAt: tenant.trial_ends_at,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at
    };

    res.status(201).json({
      success: true,
      data: tenantResponse
    });
  } catch (error) {
    console.error('Error creating tenant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to create tenant'
    });
  }
}

// Update tenant
async function updateTenant(req, res) {
  try {
    const { id } = req.query;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required'
      });
    }

    // Build dynamic update query
    const updateFields = [];
    const params = [];
    
    Object.keys(updates).forEach((key) => {
      if (updates[key] !== undefined) {
        const dbKey = key === 'planType' ? 'plan_type' : 
                     key === 'stripeCustomerId' ? 'stripe_customer_id' :
                     key === 'subscriptionId' ? 'subscription_id' :
                     key === 'subscriptionStatus' ? 'subscription_status' :
                     key === 'trialEndsAt' ? 'trial_ends_at' :
                     key === 'createdAt' ? 'created_at' :
                     key === 'updatedAt' ? 'updated_at' : key;
        
        updateFields.push(`${dbKey} = $${params.length + 1}`);
        params.push(updates[key]);
      }
    });

    if (updateFields.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No valid fields to update'
      });
    }

    updateFields.push(`updated_at = NOW()`);
    params.push(id);

    const query = `
      UPDATE tenants 
      SET ${updateFields.join(', ')}
      WHERE id = $${params.length} AND deleted_at IS NULL
      RETURNING *
    `;

    const result = await sql.unsafe(query, params);

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    const tenant = result[0];

    const tenantResponse = {
      id: tenant.id,
      name: tenant.name,
      subdomain: tenant.subdomain,
      domain: tenant.domain,
      planType: tenant.plan_type,
      status: tenant.status,
      settings: tenant.settings,
      stripeCustomerId: tenant.stripe_customer_id,
      subscriptionId: tenant.subscription_id,
      subscriptionStatus: tenant.subscription_status,
      trialEndsAt: tenant.trial_ends_at,
      createdAt: tenant.created_at,
      updatedAt: tenant.updated_at
    };

    res.status(200).json({
      success: true,
      data: tenantResponse
    });
  } catch (error) {
    console.error('Error updating tenant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update tenant'
    });
  }
}

// Delete tenant (soft delete)
async function deleteTenant(req, res) {
  try {
    const { id } = req.query;

    if (!id) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required'
      });
    }

    const result = await sql`
      UPDATE tenants 
      SET deleted_at = NOW(), updated_at = NOW()
      WHERE id = ${id} AND deleted_at IS NULL
      RETURNING id
    `;

    if (result.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Tenant deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting tenant:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete tenant'
    });
  }
}
