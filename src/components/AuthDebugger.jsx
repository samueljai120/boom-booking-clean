import React from 'react';
import { useAuth } from '../contexts/AuthContext';

const AuthDebugger = () => {
  const { user, token, loading, isAuthenticated } = useAuth();
  
  console.log('🐛 AuthDebugger - Current auth state:', {
    user: user ? 'Present' : 'Missing',
    token: token ? 'Present' : 'Missing',
    loading,
    isAuthenticated,
    localStorageToken: localStorage.getItem('authToken') ? 'Present' : 'Missing',
    localStorageUser: localStorage.getItem('user') ? 'Present' : 'Missing'
  });
  
  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg text-xs max-w-sm">
      <h3 className="font-bold mb-2">🔍 Auth Debug Info</h3>
      <div className="space-y-1">
        <div>User: {user ? '✅ Present' : '❌ Missing'}</div>
        <div>Token: {token ? '✅ Present' : '❌ Missing'}</div>
        <div>Loading: {loading ? '⏳ Yes' : '✅ No'}</div>
        <div>Authenticated: {isAuthenticated ? '✅ Yes' : '❌ No'}</div>
        <div>LS Token: {localStorage.getItem('authToken') ? '✅ Present' : '❌ Missing'}</div>
        <div>LS User: {localStorage.getItem('user') ? '✅ Present' : '❌ Missing'}</div>
      </div>
    </div>
  );
};

export default AuthDebugger;
