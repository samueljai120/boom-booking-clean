import React, { useState } from 'react';
import { Button } from './ui/Button';
import { Card, CardContent } from './ui/Card';
import { 
  Menu, 
  X, 
  Brain, 
  Zap, 
  BarChart3, 
  Users, 
  CalendarIcon, 
  Settings, 
  User, 
  LogOut, 
  HelpCircle, 
  Bell, 
  CreditCard, 
  Globe, 
  Shield, 
  BookOpen, 
  Home, 
  Clock, 
  Mail, 
  MessageSquare, 
  Database, 
  Key,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

const ComprehensiveMenuButton = ({ 
  sidebarOpen, 
  onToggleSidebar,
  onShowAIBooking,
  onShowAIAnalytics,
  onShowAnalytics,
  onShowCustomerBase,
  onShowInstructions,
  onShowSettings 
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({});
  const { user, logout } = useAuth();
  const { currentTenant } = useTenant();

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
  };

  const menuSections = [
    {
      id: 'features',
      title: 'App Features',
      icon: Home,
      items: [
        { id: 'ai-assistant', label: 'AI Assistant', icon: Brain, action: onShowAIBooking, color: 'text-purple-600' },
        { id: 'ai-analytics', label: 'AI Analytics', icon: Zap, action: onShowAIAnalytics, color: 'text-blue-600' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, action: onShowAnalytics },
        { id: 'customer-base', label: 'Customer Base', icon: Users, action: onShowCustomerBase },
        { id: 'instructions', label: 'Instructions', icon: CalendarIcon, action: onShowInstructions },
      ]
    },
    {
      id: 'settings',
      title: 'Settings & Configuration',
      icon: Settings,
      items: [
        { id: 'general-settings', label: 'General Settings', icon: Settings, action: onShowSettings },
        { id: 'subdomain', label: 'Subdomain & Branding', icon: Globe, action: () => window.location.href = '/settings?section=subdomain' },
        { id: 'notifications', label: 'Notifications', icon: Bell, action: () => window.location.href = '/settings?section=notifications' },
        { id: 'billing', label: 'Billing & Subscriptions', icon: CreditCard, action: () => window.location.href = '/settings?section=billing' },
        { id: 'security', label: 'Security & Privacy', icon: Shield, action: () => window.location.href = '/settings?section=security' },
      ]
    },
    {
      id: 'integrations',
      title: 'Integrations & Tools',
      icon: Database,
      items: [
        { id: 'email-manager', label: 'Email Manager', icon: Mail, action: () => window.location.href = '/settings?section=email' },
        { id: 'feedback-system', label: 'Feedback System', icon: MessageSquare, action: () => window.location.href = '/settings?section=feedback' },
        { id: 'calendar-integration', label: 'Calendar Integration', icon: CalendarIcon, action: () => window.location.href = '/settings?section=calendar' },
        { id: 'api-keys', label: 'API Keys', icon: Key, action: () => window.location.href = '/settings?section=api' },
      ]
    },
    {
      id: 'help',
      title: 'Help & Support',
      icon: HelpCircle,
      items: [
        { id: 'documentation', label: 'Documentation', icon: BookOpen, action: () => window.location.href = '/docs' },
        { id: 'help-center', label: 'Help Center', icon: HelpCircle, action: () => window.location.href = '/help' },
        { id: 'contact-support', label: 'Contact Support', icon: MessageSquare, action: () => window.location.href = '/contact' },
      ]
    }
  ];

  const handleMenuItemClick = (action) => {
    if (action) {
      action();
    }
    setIsMenuOpen(false);
  };

  if (!sidebarOpen) {
    return (
      <div className="relative">
        <Button 
          variant="ghost" 
          size="icon"
          className="h-12 w-12"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Menu"
        >
          <Menu className="w-6 h-6" />
        </Button>
        
        {isMenuOpen && (
          <div className="absolute bottom-14 left-0 w-80 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Menu</h3>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)}>
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-2">
              {menuSections.map((section) => (
                <div key={section.id} className="mb-2">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <section.icon className="w-4 h-4" />
                      <span>{section.title}</span>
                    </div>
                    {expandedSections[section.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  
                  {expandedSections[section.id] && (
                    <div className="ml-6 space-y-1">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleMenuItemClick(item.action)}
                          className={`w-full flex items-center space-x-2 p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded ${item.color || ''}`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* User Profile Section */}
              <div className="border-t border-gray-200 pt-2 mt-2">
                <div className="p-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-gray-500" />
                    <span className="text-sm font-medium text-gray-700">Profile</span>
                  </div>
                  {user && (
                    <div className="ml-6 mt-1">
                      <p className="text-xs text-gray-600">{user.name}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                      {currentTenant && (
                        <p className="text-xs text-blue-600">{currentTenant.name}</p>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 p-2 text-left text-sm text-red-600 hover:bg-red-50 rounded"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <Button 
        variant="ghost" 
        className="w-full justify-start"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <Menu className="w-4 h-4 mr-3" />
        Menu
      </Button>
      
      {isMenuOpen && (
        <Card className="absolute bottom-16 left-2 right-2 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-4">
            <div className="space-y-4">
              {menuSections.map((section) => (
                <div key={section.id}>
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-2 text-left text-sm font-medium text-gray-700 hover:bg-gray-50 rounded"
                  >
                    <div className="flex items-center space-x-2">
                      <section.icon className="w-4 h-4" />
                      <span>{section.title}</span>
                    </div>
                    {expandedSections[section.id] ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </button>
                  
                  {expandedSections[section.id] && (
                    <div className="ml-6 space-y-1 mt-2">
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleMenuItemClick(item.action)}
                          className={`w-full flex items-center space-x-2 p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded ${item.color || ''}`}
                        >
                          <item.icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* User Profile Section */}
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center space-x-2 p-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-700">Profile</span>
                </div>
                {user && (
                  <div className="ml-6 space-y-1">
                    <div className="p-2 bg-gray-50 rounded">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                      {currentTenant && (
                        <p className="text-xs text-blue-600 font-medium">{currentTenant.name}</p>
                      )}
                    </div>
                    
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-2 p-2 text-left text-sm text-red-600 hover:bg-red-50 rounded"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ComprehensiveMenuButton;
