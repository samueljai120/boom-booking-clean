// Subdomain middleware for tenant detection and routing
import { sql } from './neon-db.js';

/**
 * Extract subdomain from request headers
 * @param {Object} req - Request object
 * @returns {string|null} - Subdomain or null
 */
export function extractSubdomain(req) {
  try {
    // Get host from headers
    const host = req.headers.host || req.headers['x-forwarded-host'];
    
    if (!host) {
      return null;
    }

    // Remove port if present
    const hostname = host.split(':')[0];
    
    // Split by dots
    const parts = hostname.split('.');
    
    // If we have at least 3 parts (subdomain.domain.tld), return the first part
    if (parts.length >= 3) {
      const subdomain = parts[0];
      
      // Exclude common non-tenant subdomains and main domain patterns
      const excludedSubdomains = [
        'www', 'api', 'admin', 'app', 'staging', 'dev', 'test',
        'boom-booking-clean', 'boom-booking-clean-v1' // Main domain patterns
      ];
      
      if (!excludedSubdomains.includes(subdomain.toLowerCase())) {
        return subdomain.toLowerCase();
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting subdomain:', error);
    return null;
  }
}

/**
 * Get tenant by subdomain
 * @param {string} subdomain - Subdomain to lookup
 * @returns {Object|null} - Tenant object or null
 */
export async function getTenantBySubdomain(subdomain) {
  try {
    if (!subdomain) {
      return null;
    }

    const result = await sql`
      SELECT 
        t.id, t.name, t.subdomain, t.domain, t.plan_type, t.status,
        t.settings, t.created_at, t.updated_at
      FROM tenants t
      WHERE t.subdomain = ${subdomain} 
        AND t.status = 'active'
    `;

    return result.length > 0 ? result[0] : null;
  } catch (error) {
    console.error('Error getting tenant by subdomain:', error);
    return null;
  }
}

/**
 * Middleware to inject tenant context into request
 * @param {Function} handler - API handler function
 * @returns {Function} - Wrapped handler with tenant context
 */
export function withTenantContext(handler) {
  return async (req, res) => {
    try {
      // Extract subdomain from request
      const subdomain = extractSubdomain(req);
      
      // Get tenant by subdomain
      let tenant = null;
      if (subdomain) {
        tenant = await getTenantBySubdomain(subdomain);
      }
      
      // If no tenant found by subdomain, check if tenant_id is provided in query/body
      if (!tenant && req.query.tenant_id) {
        const tenantResult = await sql`
          SELECT 
            t.id, t.name, t.subdomain, t.domain, t.plan_type, t.status,
            t.settings, t.created_at, t.updated_at
          FROM tenants t
          WHERE t.id = ${req.query.tenant_id} 
            AND t.status = 'active'
        `;
        tenant = tenantResult.length > 0 ? tenantResult[0] : null;
      }
      
      // Inject tenant context into request
      req.tenant = tenant;
      req.subdomain = subdomain;
      
      // Check if this is the main domain (boom-booking-clean.vercel.app)
      const host = req.headers.host || req.headers['x-forwarded-host'];
      const isMainDomain = host && (
        host.includes('boom-booking-clean.vercel.app') || 
        host.includes('boom-booking-clean-v1.vercel.app')
      );
      
      // If tenant is required but not found, return error (unless this is the main domain)
      if (!tenant && req.method !== 'OPTIONS' && !isMainDomain) {
        return res.status(404).json({
          success: false,
          error: 'Tenant not found or inactive',
          subdomain: subdomain
        });
      }
      
      // Call the original handler
      return await handler(req, res);
    } catch (error) {
      console.error('Tenant context middleware error:', error);
      return res.status(500).json({
        success: false,
        error: 'Internal server error'
      });
    }
  };
}

/**
 * Validate subdomain format
 * @param {string} subdomain - Subdomain to validate
 * @returns {boolean} - Whether subdomain is valid
 */
export function validateSubdomain(subdomain) {
  if (!subdomain || typeof subdomain !== 'string') {
    return false;
  }
  
  // Subdomain rules:
  // - 3-63 characters
  // - Only alphanumeric characters and hyphens
  // - Cannot start or end with hyphen
  // - Cannot contain consecutive hyphens
  
  const subdomainRegex = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/;
  
  return subdomain.length >= 3 && 
         subdomain.length <= 63 && 
         subdomainRegex.test(subdomain) &&
         !subdomain.includes('--');
}

/**
 * Get reserved subdomains that cannot be used
 * @returns {Array} - Array of reserved subdomains
 */
export function getReservedSubdomains() {
  return [
    'www', 'api', 'admin', 'app', 'staging', 'dev', 'test', 'demo',
    'mail', 'email', 'ftp', 'blog', 'shop', 'store', 'support',
    'help', 'docs', 'status', 'monitor', 'metrics', 'logs',
    'cdn', 'assets', 'static', 'media', 'images', 'files',
    'secure', 'ssl', 'tls', 'vpn', 'proxy', 'gateway',
    'auth', 'login', 'signup', 'register', 'account',
    'billing', 'payment', 'checkout', 'order', 'invoice',
    'dashboard', 'panel', 'console', 'control', 'manage'
  ];
}

/**
 * Check if subdomain is available
 * @param {string} subdomain - Subdomain to check
 * @returns {Object} - Availability result
 */
export async function checkSubdomainAvailability(subdomain) {
  try {
    // Validate format
    if (!validateSubdomain(subdomain)) {
      return {
        available: false,
        reason: 'Invalid subdomain format'
      };
    }
    
    // Check if reserved
    const reserved = getReservedSubdomains();
    if (reserved.includes(subdomain.toLowerCase())) {
      return {
        available: false,
        reason: 'Subdomain is reserved'
      };
    }
    
    // Check if already exists
    const existing = await sql`
      SELECT id FROM tenants 
      WHERE subdomain = ${subdomain.toLowerCase()} AND deleted_at IS NULL
    `;
    
    if (existing.length > 0) {
      return {
        available: false,
        reason: 'Subdomain already taken'
      };
    }
    
    return {
      available: true,
      reason: 'Available'
    };
  } catch (error) {
    console.error('Error checking subdomain availability:', error);
    return {
      available: false,
      reason: 'Error checking availability'
    };
  }
}
