// Vercel API Route: /api/rooms
import { sql, initDatabase } from '../lib/neon-db.js';
import { withTenantContext } from '../lib/subdomain-middleware.js';

async function roomsHandler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    // Initialize database if needed
    await initDatabase();
    
    // Get tenant from middleware (either from subdomain or query param)
    const tenant = req.tenant;
    const tenantId = tenant ? tenant.id : req.query.tenant_id;
    
    // Validate tenant_id is provided
    if (!tenantId) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required'
      });
    }
    
    // Get rooms from database with tenant filtering
    const result = await sql`
      SELECT id, tenant_id, name, capacity, category, description, price_per_hour, is_active, metadata
      FROM rooms
      WHERE tenant_id = ${tenantId} AND is_active = true AND deleted_at IS NULL
      ORDER BY id
    `;

    const rooms = result.map(row => ({
      id: row.id,
      tenantId: row.tenant_id,
      name: row.name,
      capacity: row.capacity,
      category: row.category,
      description: row.description,
      pricePerHour: parseFloat(row.price_per_hour),
      isActive: row.is_active,
      metadata: row.metadata
    }));

    res.status(200).json({
      success: true,
      data: rooms,
      tenant: tenant ? {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        planType: tenant.plan_type
      } : null
    });
  } catch (error) {
    console.error('Database error:', error);
    
    // Fallback to static data
    const rooms = [
      { id: 1, name: 'Room A', capacity: 4, category: 'Standard', isActive: true },
      { id: 2, name: 'Room B', capacity: 6, category: 'Premium', isActive: true },
      { id: 3, name: 'Room C', capacity: 8, category: 'VIP', isActive: true }
    ];

    res.status(200).json({
      success: true,
      data: rooms
    });
  }
}

// Export with tenant context middleware
export default withTenantContext(roomsHandler);
