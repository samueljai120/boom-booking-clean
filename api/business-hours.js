// Vercel API Route: /api/business-hours
import { sql, initDatabase } from '../lib/neon-db.js';
import { withTenantContext } from '../lib/subdomain-middleware.js';

async function businessHoursHandler(req, res) {
  // CORS headers are handled by vercel.json configuration

  try {
    // Initialize database if needed
    await initDatabase();
    
    // Get tenant from middleware (either from subdomain or query param)
    const tenant = req.tenant;
    const tenant_id = tenant ? tenant.id : req.query.tenant_id;
    
    // If no tenant_id provided or tenant is null/invalid, return default business hours
    if (!tenant_id || !tenant) {
      const defaultBusinessHours = [
        { day: 'monday', open: '09:00', close: '22:00', isOpen: true },
        { day: 'tuesday', open: '09:00', close: '22:00', isOpen: true },
        { day: 'wednesday', open: '09:00', close: '22:00', isOpen: true },
        { day: 'thursday', open: '09:00', close: '22:00', isOpen: true },
        { day: 'friday', open: '09:00', close: '23:00', isOpen: true },
        { day: 'saturday', open: '10:00', close: '23:00', isOpen: true },
        { day: 'sunday', open: '10:00', close: '21:00', isOpen: true }
      ];

      return res.status(200).json({
        success: true,
        data: {
          businessHours: defaultBusinessHours
        },
        message: 'Default business hours (no tenant specified)'
      });
    }
    
    // Get business hours from database with tenant filtering
    const result = await sql`
      SELECT id, tenant_id, day_of_week, open_time, close_time, is_closed
      FROM business_hours
      WHERE tenant_id = ${tenant_id}
      ORDER BY day_of_week
    `;

    // Convert to frontend format
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const businessHours = result.map(row => ({
      day: dayNames[row.day_of_week],
      open: row.open_time,
      close: row.close_time,
      isOpen: !row.is_closed
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
    console.error('Database error:', error);
    
    // Fallback to static data
    const businessHours = [
      { day: 'monday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'tuesday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'wednesday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'thursday', open: '09:00', close: '22:00', isOpen: true },
      { day: 'friday', open: '09:00', close: '23:00', isOpen: true },
      { day: 'saturday', open: '10:00', close: '23:00', isOpen: true },
      { day: 'sunday', open: '10:00', close: '21:00', isOpen: true }
    ];

    res.status(200).json({
      success: true,
      data: {
        businessHours
      }
    });
  }
}

// Export with tenant context middleware
export default withTenantContext(businessHoursHandler);
