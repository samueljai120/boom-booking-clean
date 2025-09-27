import React, { useState } from 'react';
import { Button } from './ui/Button';
import { 
  Menu, 
  Plus, 
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
  ChevronRight,
  ChevronDown,
  Sparkles,
  Crown,
  Star
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTenant } from '../contexts/TenantContext';

const FloatingActionButton = ({ 
  onShowAIBooking,
  onShowAIAnalytics,
  onShowAnalytics,
  onShowCustomerBase,
  onShowInstructions,
  onShowSettings,
  onCreateBooking
}) => {
  const [isHovered, setIsHovered] = useState(false);
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

  const handleMenuItemClick = (action) => {
    if (action) {
      action();
    }
    setIsMenuOpen(false);
  };

  const menuSections = [
    {
      id: 'features',
      title: 'App Features',
      icon: Sparkles,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
      hoverColor: 'hover:bg-purple-100',
      items: [
        { id: 'ai-assistant', label: 'AI Assistant', icon: Brain, action: onShowAIBooking, color: 'text-purple-600', badge: 'NEW' },
        { id: 'ai-analytics', label: 'AI Analytics', icon: Zap, action: onShowAIAnalytics, color: 'text-blue-600', badge: 'AI' },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, action: onShowAnalytics, color: 'text-green-600' },
        { id: 'customer-base', label: 'Customer Base', icon: Users, action: onShowCustomerBase, color: 'text-orange-600' },
        { id: 'instructions', label: 'Instructions', icon: CalendarIcon, action: onShowInstructions, color: 'text-indigo-600' },
      ]
    },
    {
      id: 'settings',
      title: 'Settings & Configuration',
      icon: Settings,
      color: 'text-gray-600',
      bgColor: 'bg-gray-50',
      hoverColor: 'hover:bg-gray-100',
      items: [
        { id: 'general-settings', label: 'General Settings', icon: Settings, action: onShowSettings, color: 'text-gray-600' },
        { id: 'subdomain', label: 'Subdomain & Branding', icon: Globe, action: () => window.location.href = '/settings?section=subdomain', color: 'text-blue-600' },
        { id: 'notifications', label: 'Notifications', icon: Bell, action: () => window.location.href = '/settings?section=notifications', color: 'text-yellow-600' },
        { id: 'billing', label: 'Billing & Subscriptions', icon: CreditCard, action: () => window.location.href = '/settings?section=billing', color: 'text-green-600' },
        { id: 'security', label: 'Security & Privacy', icon: Shield, action: () => window.location.href = '/settings?section=security', color: 'text-red-600' },
      ]
    }
  ];

  return (
    <div className="fixed bottom-4 left-4 sm:bottom-6 sm:left-6 z-50">
      {/* Floating Action Button Container */}
      <div 
        className="relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onFocus={() => setIsHovered(true)}
        onBlur={() => setIsHovered(false)}
        role="group"
        aria-label="Quick Actions"
      >
        {/* Main FAB Button */}
        <Button 
          variant="ghost" 
          size="icon"
          className={`h-16 w-16 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:scale-110 rounded-full border-2 border-white ${
            isHovered ? 'scale-110' : ''
          }`}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="Quick Actions"
        >
          <Menu className="w-8 h-8" />
        </Button>

        {/* Hover Expanded Actions */}
        {isHovered && (
          <div className="absolute bottom-20 left-0 flex flex-col space-y-3 animate-in slide-in-from-bottom-2 duration-300" role="menu" aria-label="Quick action menu">
            {/* Add New Booking Button */}
            <Button
              onClick={() => {
                if (onCreateBooking) {
                  onCreateBooking();
                }
                setIsHovered(false);
              }}
              className="h-12 w-12 bg-gradient-to-br from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 rounded-full border-2 border-white flex items-center justify-center"
              title="Add New Booking"
              aria-label="Add New Booking"
              role="menuitem"
            >
              <Plus className="w-6 h-6" />
            </Button>

            {/* Menu Button */}
            <Button
              onClick={() => {
                setIsMenuOpen(true);
                setIsHovered(false);
              }}
              className="h-12 w-12 bg-gradient-to-br from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-110 rounded-full border-2 border-white flex items-center justify-center"
              title="Menu"
              aria-label="Open Menu"
              role="menuitem"
            >
              <Menu className="w-6 h-6" />
            </Button>
          </div>
        )}

        {/* Menu Panel */}
        {isMenuOpen && (
          <div className="absolute bottom-20 left-0 w-80 bg-white/95 backdrop-blur-md border border-gray-200/50 rounded-2xl shadow-2xl z-50 max-h-96 overflow-y-auto animate-in slide-in-from-bottom-2 duration-300" role="dialog" aria-label="Application menu" aria-modal="true">
            <div className="p-4 border-b border-gray-200/50 bg-gradient-to-r from-blue-50/80 to-purple-50/80 backdrop-blur-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">Menu</h3>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMenuOpen(false)} className="hover:bg-gray-200/50 rounded-full" aria-label="Close menu">
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
            
            <div className="p-3">
              {menuSections.map((section) => (
                <div key={section.id} className="mb-3">
                  <button
                    onClick={() => toggleSection(section.id)}
                    className={`w-full flex items-center justify-between p-3 text-left text-sm font-semibold text-gray-700 ${section.bgColor} ${section.hoverColor} rounded-lg transition-all duration-200`}
                    aria-expanded={expandedSections[section.id]}
                    aria-controls={`section-${section.id}`}
                  >
                    <div className="flex items-center space-x-2">
                      <section.icon className={`w-4 h-4 ${section.color}`} />
                      <span>{section.title}</span>
                    </div>
                    {expandedSections[section.id] ? (
                      <ChevronDown className="w-4 h-4 text-gray-500" />
                    ) : (
                      <ChevronRight className="w-4 h-4 text-gray-500" />
                    )}
                  </button>
                  
                  {expandedSections[section.id] && (
                    <div id={`section-${section.id}`} className="ml-4 space-y-1 mt-2 animate-in slide-in-from-top-2 duration-200" role="group" aria-label={`${section.title} options`}>
                      {section.items.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleMenuItemClick(item.action)}
                          className={`w-full flex items-center justify-between p-2 text-left text-sm text-gray-600 hover:bg-gray-50 rounded-lg transition-all duration-200 group`}
                          role="menuitem"
                          aria-label={item.label}
                        >
                          <div className="flex items-center space-x-2">
                            <item.icon className={`w-4 h-4 ${item.color} group-hover:scale-110 transition-transform duration-200`} />
                            <span className="font-medium">{item.label}</span>
                          </div>
                          {item.badge && (
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              item.badge === 'NEW' ? 'bg-purple-100 text-purple-600' : 
                              item.badge === 'AI' ? 'bg-blue-100 text-blue-600' : 
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {item.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {/* User Profile Section */}
              <div className="border-t border-gray-200/50 pt-3 mt-3">
                <div className="p-3 mb-2 bg-gradient-to-r from-gray-50/80 to-blue-50/80 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-gray-700">Profile</span>
                  </div>
                  {user && (
                    <div className="ml-10 mt-2 space-y-1">
                      <p className="text-sm font-medium text-gray-900">{user.name}</p>
                      <p className="text-xs text-gray-600">{user.email}</p>
                      {currentTenant && (
                        <div className="flex items-center space-x-1">
                          <Crown className="w-3 h-3 text-yellow-500" />
                          <p className="text-xs text-blue-600 font-medium">{currentTenant.name}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2 p-2 text-left text-sm text-red-600 hover:bg-red-50 rounded-lg transition-all duration-200 group"
                  role="menuitem"
                  aria-label="Logout"
                >
                  <LogOut className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FloatingActionButton;
