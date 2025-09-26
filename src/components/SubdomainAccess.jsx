import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from './ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card';
import { Building2, Users, Calendar, Settings } from 'lucide-react';

const SubdomainAccess = () => {
  const [subdomain, setSubdomain] = useState('');
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Check if there's a subdomain in URL params
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const subdomainParam = urlParams.get('subdomain');
    if (subdomainParam) {
      setSubdomain(subdomainParam);
      handleSubdomainAccess(subdomainParam);
    }
  }, []);

  const handleSubdomainAccess = async (subdomainValue = subdomain) => {
    if (!subdomainValue.trim()) {
      setError('Please enter a subdomain');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/subdomain-router?subdomain=${subdomainValue}`);
      const data = await response.json();

      if (data.success && data.data.tenant) {
        setTenant(data.data.tenant);
        // Update URL to include subdomain
        const newUrl = new URL(window.location);
        newUrl.searchParams.set('subdomain', subdomainValue);
        window.history.replaceState({}, '', newUrl);
      } else {
        setError(data.error || 'Tenant not found');
        setTenant(null);
      }
    } catch (error) {
      setError('Failed to access subdomain');
      setTenant(null);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoAccess = () => {
    setSubdomain('demo');
    handleSubdomainAccess('demo');
  };

  const handleLogin = () => {
    if (tenant) {
      // Navigate to login with subdomain context
      navigate(`/login?subdomain=${tenant.subdomain}`);
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Building2 className="mx-auto h-12 w-12 text-blue-600" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Access Your Venue
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your subdomain to access your karaoke venue management system
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Subdomain Access</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!tenant ? (
              <>
                <div>
                  <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                    Subdomain
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      id="subdomain"
                      value={subdomain}
                      onChange={(e) => setSubdomain(e.target.value)}
                      placeholder="your-venue"
                      className="flex-1 min-w-0 block w-full px-3 py-2 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      .boom-booking.com
                    </span>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button
                    onClick={() => handleSubdomainAccess()}
                    disabled={loading || !subdomain.trim()}
                    className="flex-1"
                  >
                    {loading ? 'Accessing...' : 'Access Venue'}
                  </Button>
                  
                  <Button
                    onClick={handleDemoAccess}
                    variant="outline"
                    className="flex-1"
                  >
                    Demo Access
                  </Button>
                </div>

                {error && (
                  <div className="text-red-600 text-sm text-center">
                    {error}
                  </div>
                )}
              </>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="mx-auto h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
                    <Building2 className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="mt-2 text-lg font-medium text-gray-900">
                    {tenant.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {tenant.subdomain}.boom-booking.com
                  </p>
                  <p className="text-xs text-gray-400">
                    {tenant.planType} Plan • {tenant.status}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Button onClick={handleLogin} className="flex-1">
                    <Users className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Calendar className="h-4 w-4 mr-2" />
                    View Bookings
                  </Button>
                </div>

                <Button
                  onClick={() => {
                    setTenant(null);
                    setSubdomain('');
                    setError('');
                    window.history.replaceState({}, '', window.location.pathname);
                  }}
                  variant="ghost"
                  className="w-full"
                >
                  Switch Venue
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            Don't have a subdomain?{' '}
            <a href="/register" className="font-medium text-blue-600 hover:text-blue-500">
              Create your venue
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SubdomainAccess;
