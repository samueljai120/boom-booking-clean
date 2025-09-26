import React, { useState, useEffect } from 'react';
import { useTenant } from '../contexts/TenantContext';
import { Card } from './ui/Card';
import { Button } from './ui/Button';
import { Badge } from './ui/Badge';

const BillingDashboard = () => {
  const { currentTenant, getBillingInfo, getUsageStats } = useTenant();
  const [billingInfo, setBillingInfo] = useState(null);
  const [usageStats, setUsageStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadBillingData = async () => {
      if (!currentTenant) {
        setLoading(false);
        return;
      }

      try {
        const [billing, usage] = await Promise.all([
          getBillingInfo(),
          getUsageStats()
        ]);
        
        setBillingInfo(billing);
        setUsageStats(usage);
      } catch (error) {
        console.error('Error loading billing data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadBillingData();
  }, [currentTenant, getBillingInfo, getUsageStats]);

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!currentTenant) {
    return (
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Tenant Selected</h3>
        <p className="text-gray-500">Please select a tenant to view billing information.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Billing Dashboard</h2>
          <p className="text-gray-600">Manage your subscription and usage</p>
        </div>
        <div className="flex items-center space-x-3">
          <Badge className={getPlanBadgeColor(currentTenant.planType)}>
            {currentTenant.planType.toUpperCase()}
          </Badge>
          <Badge className={getStatusBadgeColor(currentTenant.status)}>
            {currentTenant.status.toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Billing Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-semibold">$</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Plan</p>
              <p className="text-lg font-semibold text-gray-900 capitalize">
                {currentTenant.planType}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 font-semibold">📅</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Trial Ends</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(currentTenant.trialEndsAt)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 font-semibold">🏢</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Created</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatDate(currentTenant.createdAt)}
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <span className="text-yellow-600 font-semibold">💰</span>
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Revenue</p>
              <p className="text-lg font-semibold text-gray-900">
                {usageStats ? formatCurrency(usageStats.current.totalRevenue) : '$0.00'}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Usage Statistics */}
      {usageStats && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Usage Statistics</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Rooms</span>
                <span className="text-sm text-gray-900">
                  {usageStats.current.roomCount} / {usageStats.limits.rooms === -1 ? '∞' : usageStats.limits.rooms}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    usageStats.status.roomLimitReached ? 'bg-red-500' : 'bg-blue-500'
                  }`}
                  style={{ 
                    width: `${usageStats.limits.rooms === -1 ? 0 : 
                      Math.min(100, (usageStats.current.roomCount / usageStats.limits.rooms) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Bookings (This Month)</span>
                <span className="text-sm text-gray-900">
                  {usageStats.current.bookingCount} / {usageStats.limits.bookings === -1 ? '∞' : usageStats.limits.bookings}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    usageStats.status.bookingLimitReached ? 'bg-red-500' : 'bg-green-500'
                  }`}
                  style={{ 
                    width: `${usageStats.limits.bookings === -1 ? 0 : 
                      Math.min(100, (usageStats.current.bookingCount / usageStats.limits.bookings) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium text-gray-500">Users</span>
                <span className="text-sm text-gray-900">
                  {usageStats.current.userCount} / {usageStats.limits.users === -1 ? '∞' : usageStats.limits.users}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    usageStats.status.userLimitReached ? 'bg-red-500' : 'bg-purple-500'
                  }`}
                  style={{ 
                    width: `${usageStats.limits.users === -1 ? 0 : 
                      Math.min(100, (usageStats.current.userCount / usageStats.limits.users) * 100)}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>

          {usageStats.status.needsUpgrade && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <span className="text-yellow-400">⚠️</span>
                </div>
                <div className="ml-3">
                  <h4 className="text-sm font-medium text-yellow-800">Usage Limit Reached</h4>
                  <p className="text-sm text-yellow-700 mt-1">
                    You've reached your plan limits. Consider upgrading to continue using the service.
                  </p>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Stripe Information */}
      {billingInfo?.stripe && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-500">Customer ID</span>
              <span className="text-sm text-gray-900 font-mono">
                {billingInfo.stripe.customerId}
              </span>
            </div>
            
            {billingInfo.stripe.subscription && (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Subscription Status</span>
                  <Badge className={getStatusBadgeColor(billingInfo.stripe.subscription.status)}>
                    {billingInfo.stripe.subscription.status.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-500">Current Period</span>
                  <span className="text-sm text-gray-900">
                    {formatDate(billingInfo.stripe.subscription.currentPeriodStart)} - {formatDate(billingInfo.stripe.subscription.currentPeriodEnd)}
                  </span>
                </div>
              </>
            )}
          </div>
        </Card>
      )}

      {/* Actions */}
      <div className="flex space-x-4">
        <Button className="bg-blue-600 hover:bg-blue-700">
          Manage Subscription
        </Button>
        <Button variant="outline">
          View Invoices
        </Button>
        <Button variant="outline">
          Update Payment Method
        </Button>
      </div>
    </div>
  );
};

export default BillingDashboard;