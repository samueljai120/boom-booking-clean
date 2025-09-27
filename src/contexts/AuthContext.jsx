import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../lib/api';
import { useNavigate } from 'react-router-dom';
import { getApiBaseUrl } from '../utils/apiConfig';
import { useTenant } from './TenantContext';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('authToken'));
  const navigate = useNavigate();
  
  // Try to get tenant context, but don't fail if it's not available
  let clearTenantData = null;
  try {
    const tenantContext = useTenant();
    clearTenantData = tenantContext.clearTenantData;
  } catch (error) {
    // Tenant context not available, that's okay
    console.log('Tenant context not available in AuthProvider');
  }

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          // Use authAPI for session check with smart fallback
          const response = await authAPI.getSession();
          
          if (response.success) {
            setUser(response.user);
            console.log('✅ Session validated, user loaded:', response.user?.email);
          } else {
            // Session invalid, clear auth
            console.log('❌ Session invalid, clearing auth data');
            localStorage.removeItem('authToken');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        } catch (error) {
          console.error('Session check failed:', error);
          // For demo purposes, don't clear auth on network errors
          // Just set loading to false so the app can continue
          console.log('🔄 Using mock mode due to network error');
          
          // Try to restore user from localStorage if available
          const savedUser = localStorage.getItem('user');
          if (savedUser) {
            try {
              const parsedUser = JSON.parse(savedUser);
              setUser(parsedUser);
              console.log('🔄 Restored user from localStorage:', parsedUser?.email);
            } catch (parseError) {
              console.error('Failed to parse saved user:', parseError);
              localStorage.removeItem('user');
            }
          }
        }
      } else {
        // No token, check if user data exists in localStorage
        const savedUser = localStorage.getItem('user');
        if (savedUser) {
          try {
            const parsedUser = JSON.parse(savedUser);
            console.log('🔄 No token but found user in localStorage, clearing...');
            localStorage.removeItem('user');
          } catch (parseError) {
            console.error('Failed to parse saved user:', parseError);
            localStorage.removeItem('user');
          }
        }
      }
      setLoading(false);
    };

    initAuth();
  }, [token]);

  const login = async (credentials) => {
    try {
      console.log('🔐 Starting login process for:', credentials.email);
      
      // Use the authAPI which has smart fallback to mock data
      const response = await authAPI.login(credentials);
      console.log('📋 Login API response:', response);
      
      if (response.success) {
        // Handle both mock and real API response formats
        const token = response.token || response.data?.token;
        const user = response.user || response.data?.user;
        
        console.log('✅ Login successful, user data:', user);
        console.log('🔑 Token received:', token ? 'Yes' : 'No');
        console.log('🏢 User tenant_id:', user?.tenant_id);
        console.log('📋 Full response structure:', response);
        
        // Validate token and user before storing
        if (!token) {
          console.error('❌ No token received from login response');
          return {
            success: false,
            error: 'No authentication token received'
          };
        }
        
        if (!user) {
          console.error('❌ No user data received from login response');
          return {
            success: false,
            error: 'No user data received'
          };
        }
        
        // Store in localStorage with error handling
        try {
          localStorage.setItem('authToken', token);
          localStorage.setItem('user', JSON.stringify(user));
        } catch (storageError) {
          console.error('❌ Failed to store auth data in localStorage:', storageError);
          return {
            success: false,
            error: 'Failed to store authentication data'
          };
        }
        
        // Update state
        setToken(token);
        setUser(user);
        
        // Verify state was set correctly
        console.log('🔍 Verifying auth state after login:');
        console.log('   Token in localStorage:', localStorage.getItem('authToken') ? 'Present' : 'Missing');
        console.log('   User in localStorage:', localStorage.getItem('user') ? 'Present' : 'Missing');
        console.log('   Token state:', token ? 'Set' : 'Not set');
        console.log('   User state:', user ? 'Set' : 'Not set');
        
        // After successful login, redirect to dashboard
        console.log('🔄 Login successful, redirecting to dashboard...');
        setTimeout(() => {
          console.log('🚀 Executing redirect to dashboard');
          navigate('/dashboard');
        }, 100);
        
        return { success: true };
      } else {
        console.log('❌ Login failed:', response.error);
        return {
          success: false,
          error: response.error || 'Login failed'
        };
      }
    } catch (error) {
      console.error('❌ Login error:', error);
      return {
        success: false,
        error: 'Login failed - please try again'
      };
    }
  };

  // Helper function to redirect to tenant subdomain (simplified for demo)
  const redirectToTenantSubdomain = async (tenantId) => {
    console.log(`🔄 Redirecting to dashboard for tenant ID: ${tenantId}`);
    setTimeout(() => {
      console.log('🚀 Executing redirect to dashboard');
      navigate('/dashboard');
    }, 100);
  };

  const register = async (userData) => {
    try {
      const response = await authAPI.register(userData);
      
      if (response.success) {
        // Handle both mock and real API response formats
        const token = response.token || response.data?.token;
        const user = response.user || response.data?.user;
        
        localStorage.setItem('authToken', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        
        // After successful registration, redirect to subdomain if user has tenant
        if (user && user.tenant_id) {
          await redirectToTenantSubdomain(user.tenant_id);
        }
        
        return { success: true };
      } else {
        return {
          success: false,
          error: response.error || 'Registration failed'
        };
      }
    } catch (error) {
      console.error('Registration error:', error);
      return {
        success: false,
        error: error.response?.data?.error || 'Registration failed'
      };
    }
  };

  const logout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      // Logout error - error handling removed for clean version
    } finally {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      setToken(null);
      setUser(null);
      // Clear tenant data if available
      if (clearTenantData) {
        clearTenantData();
      } else {
        // Fallback: clear tenant data manually
        localStorage.removeItem('currentTenant');
      }
      // Redirect to landing page instead of login page
      navigate('/', { replace: true });
    }
  };

  const value = {
    user,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};