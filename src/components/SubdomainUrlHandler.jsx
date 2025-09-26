import React, { useEffect, useRef } from 'react';
import { useTenant } from '../contexts/TenantContext';

const SubdomainUrlHandler = () => {
  const { subdomainInfo, getSubdomainUrl, currentTenant } = useTenant();
  const hasProcessedUrl = useRef(false);

  useEffect(() => {
    // Prevent multiple URL processing
    if (hasProcessedUrl.current) return;
    
    // Handle subdomain URL format and cleanup
    const handleSubdomainUrl = () => {
      const currentUrl = new URL(window.location.href);
      const currentHostname = currentUrl.hostname;
      const currentSearch = currentUrl.search;
      
      // If we have a subdomain parameter in the URL, clean it up
      if (currentSearch.includes('subdomain=')) {
        const urlParams = new URLSearchParams(currentSearch);
        const subdomain = urlParams.get('subdomain');
        
        if (subdomain) {
          // Remove the subdomain parameter from the URL
          urlParams.delete('subdomain');
          const newSearch = urlParams.toString();
          const newUrl = `${currentUrl.protocol}//${currentUrl.host}${currentUrl.pathname}${newSearch ? '?' + newSearch : ''}`;
          
          console.log(`🧹 Cleaning up URL: ${window.location.href} → ${newUrl}`);
          window.history.replaceState({}, '', newUrl);
          hasProcessedUrl.current = true;
        }
      }
      
      // If we're on localhost and have a subdomain parameter, redirect to proper subdomain format
      if (currentHostname === 'localhost' && currentSearch.includes('subdomain=')) {
        const urlParams = new URLSearchParams(currentSearch);
        const subdomain = urlParams.get('subdomain');
        
        if (subdomain && subdomain !== 'localhost') {
          // Check if we're already on the correct subdomain format
          if (!currentHostname.includes(subdomain)) {
            // Redirect to subdomain format
            const newUrl = `http://${subdomain}.localhost:3000${currentUrl.pathname}`;
            console.log(`🔄 Redirecting to subdomain format: ${newUrl}`);
            window.location.href = newUrl;
            hasProcessedUrl.current = true;
            return;
          }
        }
      }
      
      // If we're on a subdomain and have a tenant, ensure clean URL
      if (subdomainInfo && subdomainInfo.subdomain && currentTenant) {
        const expectedHostname = `${subdomainInfo.subdomain}.localhost`;
        
        // Only redirect if we're not already on the correct subdomain
        if (currentHostname === 'localhost' && currentUrl.port === '3000') {
          const newUrl = `http://${expectedHostname}:3000${currentUrl.pathname}`;
          console.log(`🔄 Updating URL to subdomain format: ${newUrl}`);
          window.history.replaceState({}, '', newUrl);
        }
      }
    };

    // Small delay to ensure tenant context is loaded
    const timeoutId = setTimeout(handleSubdomainUrl, 100);
    
    return () => clearTimeout(timeoutId);
  }, [subdomainInfo, currentTenant]);

  return null; // This component doesn't render anything
};

export default SubdomainUrlHandler;
