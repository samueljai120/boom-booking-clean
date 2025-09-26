// Vercel API Route: /api/business-hours
import { sql, initDatabase } from '../lib/neon-db.js';
import { withTenantContext } from '../lib/subdomain-middleware.js';

async function businessHoursHandler(req, res) {
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

  // Add cache-busting headers
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  try {
    // Initialize database if needed
    await initDatabase();
    
    // Handle different HTTP methods
    switch (req.method) {
      case 'GET':
        return await getBusinessHours(req, res);
      case 'PUT':
      case 'POST':
        return await updateBusinessHours(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Business hours API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Get business hours
async function getBusinessHours(req, res) {
  try {
    // Get tenant from middleware (either from subdomain or query param)
    const tenant = req.tenant;
    const tenant_id = tenant ? tenant.id : req.query.tenant_id;
    
    // Check if this is the main domain or localhost development
    const host = req.headers.host || req.headers['x-forwarded-host'];
    const isMainDomain = host && (
      host.includes('boom-booking-clean.vercel.app') || 
      host.includes('boom-booking-clean-v1.vercel.app')
    );
    const isLocalhost = host && (
      host.includes('localhost') || 
      host.includes('127.0.0.1') ||
      host.includes('0.0.0.0')
    );
    
    // If no tenant_id provided, tenant is null/invalid, OR this is the main domain/localhost, return default business hours
    if (!tenant_id || !tenant || isMainDomain || isLocalhost) {
      const defaultBusinessHours = [
        { weekday: 1, day: 'monday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 2, day: 'tuesday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 3, day: 'wednesday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 4, day: 'thursday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 5, day: 'friday', openTime: '09:00', closeTime: '23:00', open: '09:00', close: '23:00', isOpen: true, isClosed: false },
        { weekday: 6, day: 'saturday', openTime: '10:00', closeTime: '23:00', open: '10:00', close: '23:00', isOpen: true, isClosed: false },
        { weekday: 0, day: 'sunday', openTime: '10:00', closeTime: '21:00', open: '10:00', close: '21:00', isOpen: true, isClosed: false }
      ];

      return res.status(200).json({
        success: true,
        data: {
          businessHours: defaultBusinessHours
        },
        message: isMainDomain ? 'Default business hours (main domain)' : isLocalhost ? 'Default business hours (localhost development)' : 'Default business hours (no tenant specified)'
      });
    }
    
    // Get business hours from database with tenant filtering
    const result = await sql`
      SELECT id, tenant_id, day_of_week, open_time, close_time, is_closed
      FROM business_hours
      WHERE tenant_id = ${tenant_id}
      ORDER BY day_of_week
    `;
    
    // If no business hours found for tenant, return default hours
    if (result.length === 0) {
      const defaultBusinessHours = [
        { weekday: 1, day: 'monday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 2, day: 'tuesday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 3, day: 'wednesday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 4, day: 'thursday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
        { weekday: 5, day: 'friday', openTime: '09:00', closeTime: '23:00', open: '09:00', close: '23:00', isOpen: true, isClosed: false },
        { weekday: 6, day: 'saturday', openTime: '10:00', closeTime: '23:00', open: '10:00', close: '23:00', isOpen: true, isClosed: false },
        { weekday: 0, day: 'sunday', openTime: '10:00', closeTime: '21:00', open: '10:00', close: '21:00', isOpen: true, isClosed: false }
      ];

      return res.status(200).json({
        success: true,
        data: {
          businessHours: defaultBusinessHours
        },
        message: 'Default business hours (no tenant data found)'
      });
    }

    // Convert to frontend format
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const businessHours = result.map(row => ({
      weekday: row.day_of_week,
      day: dayNames[row.day_of_week],
      openTime: row.open_time,
      closeTime: row.close_time,
      open: row.open_time,
      close: row.close_time,
      isOpen: !row.is_closed,
      isClosed: row.is_closed
    }));

    res.status(200).json({
      success: true,
      data: {
        businessHours
      },
      tenant: tenant ? {
        id: tenant.id,
        name: tenant.name,
        subdomain: tenant.subdomain,
        planType: tenant.plan_type
      } : null
    });
  } catch (error) {
    console.error('Error getting business hours:', error);
    
    // Fallback to static data
    const businessHours = [
      { weekday: 1, day: 'monday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
      { weekday: 2, day: 'tuesday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
      { weekday: 3, day: 'wednesday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
      { weekday: 4, day: 'thursday', openTime: '09:00', closeTime: '22:00', open: '09:00', close: '22:00', isOpen: true, isClosed: false },
      { weekday: 5, day: 'friday', openTime: '09:00', closeTime: '23:00', open: '09:00', close: '23:00', isOpen: true, isClosed: false },
      { weekday: 6, day: 'saturday', openTime: '10:00', closeTime: '23:00', open: '10:00', close: '23:00', isOpen: true, isClosed: false },
      { weekday: 0, day: 'sunday', openTime: '10:00', closeTime: '21:00', open: '10:00', close: '21:00', isOpen: true, isClosed: false }
    ];

    res.status(200).json({
      success: true,
      data: {
        businessHours
      }
    });
  }
}

// Update business hours
async function updateBusinessHours(req, res) {
  try {
    // Get tenant from middleware
    const tenant = req.tenant;
    const tenant_id = tenant ? tenant.id : req.query.tenant_id;
    
    if (!tenant_id) {
      return res.status(400).json({
        success: false,
        error: 'Tenant ID is required'
      });
    }

    const { hours, businessHours } = req.body;
    const hoursData = hours || businessHours;
    
    if (!hoursData || !Array.isArray(hoursData)) {
      return res.status(400).json({
        success: false,
        error: 'Business hours data is required'
      });
    }

    // Convert frontend format to backend format
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Delete existing business hours for this tenant (using UUID)
    await sql`
      DELETE FROM business_hours 
      WHERE tenant_id = ${tenant_id}
    `;

    // Insert new business hours
    for (const hour of hoursData) {
      // Handle both frontend formats: weekday (0-6) or day name
      let dayOfWeek;
      if (typeof hour.weekday === 'number') {
        dayOfWeek = hour.weekday;
      } else if (hour.day) {
        dayOfWeek = dayNames.indexOf(hour.day.toLowerCase());
      } else {
        continue; // Skip invalid entries
      }
      
      if (dayOfWeek !== -1) {
        const openTime = hour.openTime || hour.open;
        const closeTime = hour.closeTime || hour.close;
        const isClosed = hour.isClosed !== undefined ? hour.isClosed : !hour.isOpen;
        
        await sql`
          INSERT INTO business_hours (tenant_id, day_of_week, open_time, close_time, is_closed)
          VALUES (${tenant_id}, ${dayOfWeek}, ${openTime}, ${closeTime}, ${isClosed})
        `;
      }
    }

    // Return updated business hours
    const result = await sql`
      SELECT id, tenant_id, day_of_week, open_time, close_time, is_closed
      FROM business_hours
      WHERE tenant_id = ${tenant_id}
      ORDER BY day_of_week
    `;

    const updatedBusinessHours = result.map(row => ({
      weekday: row.day_of_week,
      day: dayNames[row.day_of_week],
      openTime: row.open_time,
      closeTime: row.close_time,
      open: row.open_time,
      close: row.close_time,
      isOpen: !row.is_closed,
      isClosed: row.is_closed
    }));

    res.status(200).json({
      success: true,
      data: {
        businessHours: updatedBusinessHours
      },
      message: 'Business hours updated successfully'
    });

  } catch (error) {
    console.error('Error updating business hours:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to update business hours'
    });
  }
}

// Export with tenant context middleware
export default withTenantContext(businessHoursHandler);
