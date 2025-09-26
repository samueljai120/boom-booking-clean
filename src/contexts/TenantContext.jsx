import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const TenantContext = createContext();

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};

export const TenantProvider = ({ children }) => {
  const [currentTenant, setCurrentTenant] = useState(null);
  const [tenants, setTenants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [subdomainInfo, setSubdomainInfo] = useState(null);

  // Detect subdomain and load tenant on mount
  useEffect(() => {
    const detectSubdomainAndLoadTenant = async () => {
      try {
        // Get subdomain information from API
        const response = await fetch('/api/subdomain');
        const result = await response.json();
        
        if (result.success) {
          setSubdomainInfo(result.data);
          
          // If we have a valid tenant from subdomain, use it
          if (result.data.tenant && result.data.isValid) {
            setCurrentTenant(result.data.tenant);
            return;
          }
        }
        
        // Fallback to localStorage if no subdomain tenant
        const savedTenant = localStorage.getItem('currentTenant');
        if (savedTenant) {
          try {
            setCurrentTenant(JSON.parse(savedTenant));
          } catch (err) {
            console.error('Error parsing saved tenant:', err);
            localStorage.removeItem('currentTenant');
          }
        }
      } catch (error) {
        console.error('Error detecting subdomain:', error);
        // Fallback to localStorage
        const savedTenant = localStorage.getItem('currentTenant');
        if (savedTenant) {
          try {
            setCurrentTenant(JSON.parse(savedTenant));
          } catch (err) {
            console.error('Error parsing saved tenant:', err);
            localStorage.removeItem('currentTenant');
          }
        }
      }
    };

    detectSubdomainAndLoadTenant();
  }, []);

  // Save current tenant to localStorage when it changes
  useEffect(() => {
    if (currentTenant) {
      localStorage.setItem('currentTenant', JSON.stringify(currentTenant));
    } else {
      localStorage.removeItem('currentTenant');
    }
  }, [currentTenant]);

  // Fetch all tenants
  const fetchTenants = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tenants');
      const result = await response.json();
      
      if (result.success) {
        setTenants(result.data);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to fetch tenants');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to fetch tenants: ' + err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Create a new tenant
  const createTenant = async (tenantData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/tenants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tenantData),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const newTenant = result.data;
        setTenants(prev => [newTenant, ...prev]);
        toast.success('Tenant created successfully!');
        return newTenant;
      } else {
        throw new Error(result.error || 'Failed to create tenant');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to create tenant: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Update tenant
  const updateTenant = async (tenantId, updates) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tenants?id=${tenantId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });
      
      const result = await response.json();
      
      if (result.success) {
        const updatedTenant = result.data;
        setTenants(prev => prev.map(t => t.id === tenantId ? updatedTenant : t));
        
        // Update current tenant if it's the one being updated
        if (currentTenant && currentTenant.id === tenantId) {
          setCurrentTenant(updatedTenant);
        }
        
        toast.success('Tenant updated successfully!');
        return updatedTenant;
      } else {
        throw new Error(result.error || 'Failed to update tenant');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to update tenant: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Delete tenant
  const deleteTenant = async (tenantId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/tenants?id=${tenantId}`, {
        method: 'DELETE',
      });
      
      const result = await response.json();
      
      if (result.success) {
        setTenants(prev => prev.filter(t => t.id !== tenantId));
        
        // Clear current tenant if it's the one being deleted
        if (currentTenant && currentTenant.id === tenantId) {
          setCurrentTenant(null);
        }
        
        toast.success('Tenant deleted successfully!');
        return true;
      } else {
        throw new Error(result.error || 'Failed to delete tenant');
      }
    } catch (err) {
      setError(err.message);
      toast.error('Failed to delete tenant: ' + err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Switch to a different tenant
  const switchTenant = (tenant) => {
    setCurrentTenant(tenant);
    toast.success(`Switched to ${tenant.name}`);
  };

  // Get tenant by subdomain
  const getTenantBySubdomain = async (subdomain) => {
    try {
      const response = await fetch(`/api/tenants?subdomain=${subdomain}`);
      const result = await response.json();
      
      if (result.success && result.data.length > 0) {
        return result.data[0];
      }
      return null;
    } catch (err) {
      console.error('Error fetching tenant by subdomain:', err);
      return null;
    }
  };

  // Get billing information for current tenant
  const getBillingInfo = async () => {
    if (!currentTenant) return null;
    
    try {
      const response = await fetch(`/api/billing?tenant_id=${currentTenant.id}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching billing info:', err);
      return null;
    }
  };

  // Get usage statistics for current tenant
  const getUsageStats = async (period = 'current_month') => {
    if (!currentTenant) return null;
    
    try {
      const response = await fetch(`/api/usage?tenant_id=${currentTenant.id}&period=${period}`);
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      return null;
    } catch (err) {
      console.error('Error fetching usage stats:', err);
      return null;
    }
  };

  // Check usage limits before creating resources
  const checkUsageLimits = async (resourceType, resourceCount = 1) => {
    if (!currentTenant) return { canProceed: false, error: 'No tenant selected' };
    
    try {
      const response = await fetch('/api/usage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          tenant_id: currentTenant.id,
          resource_type: resourceType,
          resource_count: resourceCount
        }),
      });
      
      const result = await response.json();
      
      if (result.success !== undefined) {
        return result.data;
      }
      return { canProceed: false, error: 'Failed to check usage limits' };
    } catch (err) {
      console.error('Error checking usage limits:', err);
      return { canProceed: false, error: err.message };
    }
  };

  // Check subdomain availability
  const checkSubdomainAvailability = async (subdomain) => {
    try {
      const response = await fetch('/api/subdomain', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subdomain }),
      });
      
      const result = await response.json();
      
      if (result.success) {
        return result.data;
      }
      return { available: false, reason: 'Error checking availability' };
    } catch (err) {
      console.error('Error checking subdomain availability:', err);
      return { available: false, reason: err.message };
    }
  };

  // Get current subdomain information
  const getSubdomainInfo = () => {
    return subdomainInfo;
  };

  // Check if currently on a subdomain
  const isOnSubdomain = () => {
    return subdomainInfo && subdomainInfo.subdomain && !subdomainInfo.isMainDomain;
  };

  // Get subdomain URL for a tenant
  const getSubdomainUrl = (tenant) => {
    if (!tenant || !tenant.subdomain) return null;
    
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    
    // If we're on localhost, use localhost with port
    if (hostname === 'localhost' || hostname === '127.0.0.1') {
      const port = window.location.port;
      return `${protocol}//${tenant.subdomain}.${hostname}${port ? ':' + port : ''}`;
    }
    
    // For production, construct subdomain URL
    const domainParts = hostname.split('.');
    if (domainParts.length >= 2) {
      const baseDomain = domainParts.slice(-2).join('.');
      return `${protocol}//${tenant.subdomain}.${baseDomain}`;
    }
    
    return `${protocol}//${tenant.subdomain}.${hostname}`;
  };

  const value = {
    // State
    currentTenant,
    tenants,
    loading,
    error,
    subdomainInfo,
    
    // Actions
    fetchTenants,
    createTenant,
    updateTenant,
    deleteTenant,
    switchTenant,
    getTenantBySubdomain,
    getBillingInfo,
    getUsageStats,
    checkUsageLimits,
    
    // Subdomain functions
    checkSubdomainAvailability,
    getSubdomainInfo,
    isOnSubdomain,
    getSubdomainUrl,
    
    // Utilities
    setCurrentTenant,
    clearError: () => setError(null)
  };

  return (
    <TenantContext.Provider value={value}>
      {children}
    </TenantContext.Provider>
  );
};
