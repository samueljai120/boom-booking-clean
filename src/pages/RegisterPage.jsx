import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Card, CardContent } from '../components/ui/Card';
import { Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    subdomain: '',
    venueName: ''
  });
  const [loading, setLoading] = useState(false);
  const [subdomainAvailable, setSubdomainAvailable] = useState(null);
  const [checkingSubdomain, setCheckingSubdomain] = useState(false);
  const [subdomainGenerated, setSubdomainGenerated] = useState(false);
  const [customizeSubdomain, setCustomizeSubdomain] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const generateSubdomain = (venueName, email) => {
    // Create subdomain from venue name and email
    let baseSubdomain = '';
    
    if (venueName && venueName.trim()) {
      // Use venue name as base
      baseSubdomain = venueName
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '') // Remove special characters
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .substring(0, 15); // Limit length
    } else if (email && email.includes('@')) {
      // Fallback to email prefix
      baseSubdomain = email
        .split('@')[0]
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')
        .substring(0, 10);
    } else {
      // Final fallback
      baseSubdomain = 'venue';
    }
    
    // Add random suffix to ensure uniqueness
    const randomSuffix = Math.floor(Math.random() * 1000);
    return `${baseSubdomain}-${randomSuffix}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Check subdomain availability when subdomain changes
    if (name === 'subdomain' && value.length >= 3) {
      checkSubdomainAvailability(value);
    }
  };

  const handleVenueNameChange = (e) => {
    const venueName = e.target.value;
    setFormData({
      ...formData,
      venueName: venueName
    });
    
    // Auto-generate subdomain when venue name is entered
    if (venueName && venueName.trim() && !subdomainGenerated && !customizeSubdomain) {
      const generatedSubdomain = generateSubdomain(venueName, formData.email);
      setFormData(prev => ({
        ...prev,
        venueName: venueName,
        subdomain: generatedSubdomain
      }));
      setSubdomainGenerated(true);
      checkSubdomainAvailability(generatedSubdomain);
    }
  };

  const checkSubdomainAvailability = async (subdomain) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainAvailable(null);
      return;
    }

    setCheckingSubdomain(true);
    try {
      const response = await fetch(`/api/subdomain-router?subdomain=${subdomain}`);
      const result = await response.json();
      
      if (result.success && result.data.tenant) {
        setSubdomainAvailable(false); // Subdomain is taken
      } else {
        setSubdomainAvailable(true); // Subdomain is available
      }
    } catch (error) {
      console.error('Error checking subdomain:', error);
      setSubdomainAvailable(null);
    } finally {
      setCheckingSubdomain(false);
    }
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      toast.error('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return false;
    }
    if (!formData.name.trim()) {
      toast.error('Name is required');
      return false;
    }
    if (!formData.email.includes('@')) {
      toast.error('Please enter a valid email');
      return false;
    }
    if (!formData.venueName.trim()) {
      toast.error('Venue name is required');
      return false;
    }
    if (!formData.subdomain.trim()) {
      // Auto-generate subdomain if not provided
      const generatedSubdomain = generateSubdomain(formData.venueName, formData.email);
      setFormData(prev => ({
        ...prev,
        subdomain: generatedSubdomain
      }));
      setSubdomainGenerated(true);
    }
    if (formData.subdomain.length < 3) {
      toast.error('Subdomain must be at least 3 characters');
      return false;
    }
    if (!/^[a-z0-9-]+$/.test(formData.subdomain)) {
      toast.error('Subdomain can only contain lowercase letters, numbers, and hyphens');
      return false;
    }
    if (subdomainAvailable === false) {
      toast.error('This subdomain is already taken');
      return false;
    }
    if (subdomainAvailable === null && formData.subdomain.length >= 3) {
      toast.error('Please wait for subdomain availability check');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // First register the user
      const result = await register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        venueName: formData.venueName,
        subdomain: formData.subdomain
      });
      
      if (result.success) {
        toast.success('Registration successful! Welcome to Boom Booking!');
        // For now, redirect to main dashboard since subdomain system is in mock mode
        // TODO: Update this when production subdomain system is deployed
        navigate('/dashboard');
      } else {
        toast.error(result.message || 'Registration failed');
      }
    } catch (error) {
      toast.error('An error occurred during registration');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="mt-4 text-3xl font-extrabold text-gray-900">
            Create your account
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Join Boom Booking and start managing your venue with AI
          </p>
        </div>

        {/* Registration Form */}
        <Card className="mt-6">
          <CardContent className="p-6 sm:p-8">
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Enter your email"
                />
              </div>

              <div>
                <label htmlFor="venueName" className="block text-sm font-medium text-gray-700">
                  Venue Name
                </label>
                <input
                  id="venueName"
                  name="venueName"
                  type="text"
                  required
                  value={formData.venueName}
                  onChange={handleVenueNameChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="My Awesome Karaoke Venue"
                />
                <p className="mt-1 text-xs text-gray-500">
                  We'll auto-generate a subdomain for you based on your venue name
                </p>
              </div>

              <div>
                <label htmlFor="subdomain" className="block text-sm font-medium text-gray-700">
                  Your Subdomain {!customizeSubdomain && subdomainGenerated && (
                    <span className="text-xs text-green-600">(Auto-generated)</span>
                  )}
                </label>
                
                {!customizeSubdomain && subdomainGenerated ? (
                  <div className="mt-1">
                    <div className="flex rounded-md shadow-sm">
                      <div className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md bg-gray-50 text-gray-700 text-sm">
                        {formData.subdomain}
                      </div>
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                        .boom-booking-clean.vercel.app
                      </span>
                    </div>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center">
                        {subdomainAvailable === true && (
                          <span className="text-xs text-green-600">✓ Available</span>
                        )}
                        {subdomainAvailable === false && (
                          <span className="text-xs text-red-600">✗ Already taken</span>
                        )}
                        {checkingSubdomain && (
                          <span className="text-xs text-blue-600">Checking availability...</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => setCustomizeSubdomain(true)}
                        className="text-xs text-blue-600 hover:text-blue-800 underline"
                      >
                        Customize
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      id="subdomain"
                      name="subdomain"
                      type="text"
                      required
                      value={formData.subdomain}
                      onChange={(e) => {
                        const value = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '');
                        handleChange({ target: { name: 'subdomain', value } });
                      }}
                      className="flex-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-l-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                      placeholder="myvenue"
                    />
                    <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">
                      .boom-booking-clean.vercel.app
                    </span>
                  </div>
                )}
                
                <div className="mt-1 flex items-center">
                  {checkingSubdomain && (
                    <span className="text-xs text-blue-600">Checking availability...</span>
                  )}
                  {subdomainAvailable === true && customizeSubdomain && (
                    <span className="text-xs text-green-600">✓ Available</span>
                  )}
                  {subdomainAvailable === false && customizeSubdomain && (
                    <span className="text-xs text-red-600">✗ Already taken</span>
                  )}
                </div>
                
                <p className="mt-1 text-xs text-gray-500">
                  {customizeSubdomain ? (
                    <>Your customers will access your booking system at {formData.subdomain || 'myvenue'}.boom-booking-clean.vercel.app</>
                  ) : (
                    <>You can customize this later in your settings. Your URL: {formData.subdomain || 'myvenue'}.boom-booking-clean.vercel.app</>
                  )}
                </p>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Create a password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                  placeholder="Confirm your password"
                />
              </div>

              <div className="flex items-center">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900">
                  I agree to the{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Terms of Service
                  </a>{' '}
                  and{' '}
                  <a href="#" className="text-blue-600 hover:text-blue-500">
                    Privacy Policy
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Already have an account?</span>
                </div>
              </div>

              <div className="mt-6 text-center">
                <Link
                  to="/login"
                  className="font-medium text-blue-600 hover:text-blue-500"
                >
                  Sign in instead
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Benefits */}
        <div className="mt-6 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-4">🚀 What you'll get</h3>
          <div className="grid grid-cols-1 gap-3 text-sm text-gray-600">
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>AI-powered booking management</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Predictive analytics dashboard</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Revenue optimization tools</span>
            </div>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-green-500">✓</span>
              <span>Natural language booking assistant</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
