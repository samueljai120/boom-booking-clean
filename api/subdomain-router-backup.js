// Subdomain Router API - Handles subdomain-based tenant routing
import { sql, initDatabase } from '../lib/neon-db.js';
import { extractSubdomain } from '../lib/subdomain-middleware.js';

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

    // Extract subdomain from request (either from Host header or query parameter)
    let subdomain = extractSubdomain(req);
    
    // If no subdomain from Host header, check query parameter
    if (!subdomain && req.query.subdomain) {
      subdomain = req.query.subdomain.toLowerCase();
    }
    
    if (!subdomain) {
      return res.status(200).json({
        success: true,
        data: {
          subdomain: null,
          tenant: null,
          isMainDomain: true,
          message: 'Main domain - no subdomain detected'
        }
      });
    }

    console.log(`🔍 Detected subdomain: ${subdomain}`);

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

    if (!tenant) {
      return res.status(404).json({
        success: false,
        error: 'Tenant not found',
        data: {
          subdomain: subdomain,
          tenant: null,
          isMainDomain: false,
          isValid: false
        }
      });
    }

    console.log(`✅ Found tenant: ${tenant.name} (${tenant.subdomain})`);

    // Return tenant information
    res.status(200).json({
      success: true,
      data: {
        subdomain: subdomain,
        tenant: {
          id: tenant.id,
          name: tenant.name,
          subdomain: tenant.subdomain,
          domain: tenant.domain,
          planType: tenant.plan_type,
          status: tenant.status,
          settings: tenant.settings,
          createdAt: tenant.created_at
        },
        isMainDomain: false,
        isValid: true
      }
    });

  } catch (error) {
    console.error('❌ Subdomain router error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Subdomain service unavailable'
    });
  }
}
