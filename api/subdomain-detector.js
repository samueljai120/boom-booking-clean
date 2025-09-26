// Vercel API Route: /api/subdomain-detector
import { sql, initDatabase } from '../lib/neon-db.js';

export default async function handler(req, res) {
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

    // Extract subdomain from Host header
    const host = req.headers.host || '';
    console.log(`🔍 Detecting subdomain from host: ${host}`);
    
    // Parse subdomain from host
    const parts = host.split('.');
    let subdomain = null;
    
    // Check if this is a subdomain (more than 2 parts)
    if (parts.length > 2) {
      subdomain = parts[0];
      console.log(`🔍 Detected subdomain: ${subdomain}`);
    }
    
    // If no subdomain from Host header, check query parameter
    if (!subdomain && req.query.subdomain) {
      subdomain = req.query.subdomain.toLowerCase();
      console.log(`🔍 Using subdomain from query: ${subdomain}`);
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
        error: 'Tenant not found or inactive',
        subdomain: subdomain
      });
    }

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
    console.error('❌ Subdomain detector error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error.message : 'Subdomain service unavailable'
    });
  }
}
