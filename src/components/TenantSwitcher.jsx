import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const TenantSwitcher = () => {
  const { 
    currentTenant, 
    tenants, 
    loading, 
    fetchTenants, 
    switchTenant, 
    createTenant 
  } = useTenant();
  
  const [isOpen, setIsOpen] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTenantData, setNewTenantData] = useState({
    name: '',
    subdomain: '',
    plan_type: 'free'
  });

  useEffect(() => {
    if (tenants.length === 0) {
      fetchTenants();
    }
  }, [tenants.length, fetchTenants]);

  const handleTenantSelect = (tenant) => {
    switchTenant(tenant);
    setIsOpen(false);
  };

  const handleCreateTenant = async (e) => {
    e.preventDefault();
    try {
      await createTenant(newTenantData);
      setNewTenantData({ name: '', subdomain: '', plan_type: 'free' });
      setShowCreateForm(false);
      setIsOpen(false);
    } catch (error) {
      console.error('Error creating tenant:', error);
    }
  };

  const getPlanBadgeColor = (planType) => {
    const colors = {
      free: 'bg-gray-100 text-gray-800',
      basic: 'bg-blue-100 text-blue-800',
      pro: 'bg-purple-100 text-purple-800',
      business: 'bg-green-100 text-green-800'
    };
    return colors[planType] || colors.free;
  };

  const getStatusBadgeColor = (status) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      inactive: 'bg-gray-100 text-gray-800',
      suspended: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.inactive;
  };

  return (
    <div className="relative">
      {/* Current Tenant Display */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        variant="outline"
        className="flex items-center space-x-2 min-w-0"
      >
        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <span className="text-blue-600 font-semibold text-sm">
            {currentTenant ? currentTenant.name.charAt(0).toUpperCase() : '?'}
          </span>
        </div>
        <div className="flex-1 min-w-0 text-left">
          <p className="text-sm font-medium text-gray-900 truncate">
            {currentTenant ? currentTenant.name : 'Select Tenant'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {currentTenant ? `${currentTenant.subdomain}.boom-booking.com` : 'No tenant selected'}
          </p>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-900">Switch Tenant</h3>
              <Button
                onClick={() => setShowCreateForm(!showCreateForm)}
                variant="outline"
                className="text-xs px-2 py-1"
              >
                {showCreateForm ? 'Cancel' : 'New Tenant'}
              </Button>
            </div>

            {/* Create Tenant Form */}
            {showCreateForm && (
              <form onSubmit={handleCreateTenant} className="mb-4 p-3 bg-gray-50 rounded-lg">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Tenant Name
                    </label>
                    <input
                      type="text"
                      value={newTenantData.name}
                      onChange={(e) => setNewTenantData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="My Karaoke Business"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Subdomain
                    </label>
                    <input
                      type="text"
                      value={newTenantData.subdomain}
                      onChange={(e) => setNewTenantData(prev => ({ ...prev, subdomain: e.target.value.toLowerCase() }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                      placeholder="my-karaoke"
                      required
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Will be available at: {newTenantData.subdomain || 'subdomain'}.boom-booking.com
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Plan Type
                    </label>
                    <select
                      value={newTenantData.plan_type}
                      onChange={(e) => setNewTenantData(prev => ({ ...prev, plan_type: e.target.value }))}
                      className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="free">Free</option>
                      <option value="basic">Basic</option>
                      <option value="pro">Pro</option>
                      <option value="business">Business</option>
                    </select>
                  </div>
                  
                  <Button
                    type="submit"
                    className="w-full text-xs py-1"
                    disabled={loading}
                  >
                    {loading ? 'Creating...' : 'Create Tenant'}
                  </Button>
                </div>
              </form>
            )}

            {/* Tenant List */}
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {loading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-xs text-gray-500 mt-2">Loading tenants...</p>
                </div>
              ) : tenants.length === 0 ? (
                <div className="text-center py-4">
                  <p className="text-xs text-gray-500">No tenants found</p>
                  <p className="text-xs text-gray-400 mt-1">Create your first tenant to get started</p>
                </div>
              ) : (
                tenants.map((tenant) => (
                  <div
                    key={tenant.id}
                    onClick={() => handleTenantSelect(tenant)}
                    className={`p-3 rounded-lg cursor-pointer transition-colors ${
                      currentTenant?.id === tenant.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-semibold text-xs">
                              {tenant.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {tenant.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                              {tenant.subdomain}.boom-booking.com
                            </p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-1 ml-2">
                        <Badge className={getPlanBadgeColor(tenant.planType)}>
                          {tenant.planType}
                        </Badge>
                        <Badge className={getStatusBadgeColor(tenant.status)}>
                          {tenant.status}
                        </Badge>
                      </div>
                    </div>
                    
                    {currentTenant?.id === tenant.id && (
                      <div className="mt-2 flex items-center text-xs text-blue-600">
                        <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        Currently selected
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default TenantSwitcher;