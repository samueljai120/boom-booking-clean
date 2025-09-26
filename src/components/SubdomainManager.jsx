import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';
import { toast } from 'react-hot-toast';

const SubdomainManager = () => {
  const { 
    currentTenant, 
    subdomainInfo, 
    checkSubdomainAvailability, 
    getSubdomainUrl,
    isOnSubdomain 
  } = useTenant();
  
  const [subdomain, setSubdomain] = useState('');
  const [availability, setAvailability] = useState(null);
  const [checking, setChecking] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (currentTenant?.subdomain) {
      setSubdomain(currentTenant.subdomain);
    }
  }, [currentTenant]);

  const handleCheckAvailability = async () => {
    if (!subdomain.trim()) {
      toast.error('Please enter a subdomain');
      return;
    }

    setChecking(true);
    try {
      const result = await checkSubdomainAvailability(subdomain.trim());
      setAvailability(result);
      
      if (result.available) {
        toast.success('Subdomain is available!');
      } else {
        toast.error(`Subdomain not available: ${result.reason}`);
      }
    } catch (error) {
      toast.error('Error checking subdomain availability');
    } finally {
      setChecking(false);
    }
  };

  const handleUpdateSubdomain = async () => {
    if (!subdomain.trim() || !availability?.available) {
      toast.error('Please check subdomain availability first');
      return;
    }

    setUpdating(true);
    try {
      // Update tenant subdomain via API
      const response = await fetch('/api/tenants', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: currentTenant.id,
          subdomain: subdomain.trim()
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        toast.success('Subdomain updated successfully!');
        // Refresh the page to load the new subdomain
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error(result.error || 'Failed to update subdomain');
      }
    } catch (error) {
      toast.error('Error updating subdomain');
    } finally {
      setUpdating(false);
    }
  };

  const handleVisitSubdomain = () => {
    if (!currentTenant?.subdomain) return;
    
    const subdomainUrl = getSubdomainUrl(currentTenant);
    if (subdomainUrl) {
      window.open(subdomainUrl, '_blank');
    }
  };

  const getAvailabilityBadge = () => {
    if (!availability) return null;
    
    const colors = {
      available: 'bg-green-100 text-green-800',
      unavailable: 'bg-red-100 text-red-800'
    };
    
    return (
      <Badge className={colors[availability.available ? 'available' : 'unavailable']}>
        {availability.available ? 'Available' : 'Unavailable'}
      </Badge>
    );
  };

  const getSubdomainStatus = () => {
    if (!subdomainInfo) return null;
    
    if (subdomainInfo.isMainDomain) {
      return (
        <Badge className="bg-blue-100 text-blue-800">
          Main Domain
        </Badge>
      );
    }
    
    if (subdomainInfo.isValid) {
      return (
        <Badge className="bg-green-100 text-green-800">
          Active Subdomain
        </Badge>
      );
    }
    
    return (
      <Badge className="bg-red-100 text-red-800">
        Invalid Subdomain
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Subdomain Management</h3>
          {getSubdomainStatus()}
        </div>
        
        <div className="space-y-4">
          {/* Current Subdomain Info */}
          {subdomainInfo && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Current Subdomain</h4>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Subdomain:</span>
                  <code className="bg-white px-2 py-1 rounded text-sm font-mono">
                    {subdomainInfo.subdomain || 'None'}
                  </code>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <span className="text-sm">
                    {subdomainInfo.isMainDomain ? 'Main Domain' : 
                     subdomainInfo.isValid ? 'Valid Tenant Subdomain' : 'Invalid Subdomain'}
                  </span>
                </div>
                {subdomainInfo.tenant && (
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-gray-600">Tenant:</span>
                    <span className="text-sm font-medium">{subdomainInfo.tenant.name}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Subdomain Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Subdomain
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                value={subdomain}
                onChange={(e) => setSubdomain(e.target.value)}
                placeholder="Enter subdomain (e.g., mycompany)"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                disabled={updating}
              />
              <Button
                onClick={handleCheckAvailability}
                disabled={checking || !subdomain.trim()}
                className="px-4 py-2"
              >
                {checking ? 'Checking...' : 'Check'}
              </Button>
            </div>
            <p className="text-xs text-gray-500">
              Subdomain must be 3-63 characters, alphanumeric and hyphens only
            </p>
          </div>

          {/* Availability Result */}
          {availability && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <span className="text-sm font-medium text-gray-700">Availability:</span>
                {getAvailabilityBadge()}
              </div>
              <p className="text-sm text-gray-600">{availability.reason}</p>
              
              {availability.available && (
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-sm text-green-800">
                    <strong>Preview URL:</strong> {subdomain}.{window.location.hostname}
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3">
            {availability?.available && (
              <Button
                onClick={handleUpdateSubdomain}
                disabled={updating}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700"
              >
                {updating ? 'Updating...' : 'Update Subdomain'}
              </Button>
            )}
            
            {currentTenant?.subdomain && (
              <Button
                onClick={handleVisitSubdomain}
                variant="outline"
                className="px-4 py-2"
              >
                Visit Subdomain
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* Subdomain Benefits */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Subdomain Benefits</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Professional Branding</h4>
            <p className="text-sm text-gray-600">
              Your customers will see your subdomain (e.g., mycompany.yourapp.com) 
              instead of the main domain, creating a professional white-label experience.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Easy Access</h4>
            <p className="text-sm text-gray-600">
              Customers can bookmark and share your subdomain URL directly, 
              making it easier to access your booking system.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">SEO Benefits</h4>
            <p className="text-sm text-gray-600">
              Subdomains can help with search engine optimization and 
              make your business more discoverable online.
            </p>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium text-gray-900">Enterprise Ready</h4>
            <p className="text-sm text-gray-600">
              Subdomains are essential for enterprise customers who need 
              professional branding and custom domain support.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default SubdomainManager;
