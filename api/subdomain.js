// Vercel API Route: /api/subdomain
import { sql, initDatabase } from '../lib/neon-db.js';
import { 
  extractSubdomain, 
  validateSubdomain, 
  checkSubdomainAvailability,
  getReservedSubdomains 
} from '../lib/subdomain-middleware.js';

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
        return await getSubdomainInfo(req, res);
      case 'POST':
        return await checkAvailability(req, res);
      default:
        return res.status(405).json({
          success: false,
          error: 'Method not allowed'
        });
    }
  } catch (error) {
    console.error('Subdomain API error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
}

// Get current subdomain information
async function getSubdomainInfo(req, res) {
  try {
    const subdomain = extractSubdomain(req);
    
    if (!subdomain) {
      return res.status(200).json({
        success: true,
        data: {
          subdomain: null,
          tenant: null,
          isMainDomain: true
        }
      });
    }

    // Get tenant by subdomain
    const tenantResult = await sql`
      SELECT 
        t.id, t.name, t.subdomain, t.domain, t.plan_type, t.status,
        t.settings, t.created_at, t.updated_at
      FROM tenants t
      WHERE t.subdomain = ${subdomain} 
        AND t.status = 'active'
    `;

    const tenant = tenantResult.length > 0 ? tenantResult[0] : null;

    res.status(200).json({
      success: true,
      data: {
        subdomain: subdomain,
        tenant: tenant ? {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          domain: tenant.domain,
          planType: tenant.plan_type,
          status: tenant.status,
          settings: tenant.settings,
          createdAt: tenant.created_at
        } : null,
        isMainDomain: false,
        isValid: !!tenant
      }
    });
  } catch (error) {
    console.error('Error getting subdomain info:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get subdomain information'
    });
  }
}

// Check subdomain availability
async function checkAvailability(req, res) {
  try {
    const { subdomain } = req.body;

    if (!subdomain) {
      return res.status(400).json({
        success: false,
        error: 'Subdomain is required'
      });
    }

    // Check availability
    const availability = await checkSubdomainAvailability(subdomain);

    // Get reserved subdomains for reference
    const reservedSubdomains = getReservedSubdomains();

    res.status(200).json({
      success: true,
      data: {
        subdomain: subdomain.toLowerCase(),
        available: availability.available,
        reason: availability.reason,
        reservedSubdomains: reservedSubdomains.slice(0, 20) // Show first 20 reserved subdomains
      }
    });
  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to check subdomain availability'
    });
  }
}
