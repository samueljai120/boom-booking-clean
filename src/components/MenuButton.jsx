import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/Button';
import { 
  MoreVertical,
  Brain,
  Zap,
  BarChart3,
  Users,
  Calendar as CalendarIcon,
  Settings,
  User,
  LogOut,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const MenuButton = ({ 
  sidebarOpen,
  onShowAIBooking,
  onShowAIAnalytics,
  onShowAnalytics,
  onShowCustomerBase,
  onShowInstructions,
  onShowSettings,
  onLogout,
  user
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const menuItems = [
    // Only include AI features if they have valid onClick handlers
    ...(onShowAIBooking && onShowAIBooking.toString() !== '() => {}' ? [{
      id: 'ai-assistant',
      label: 'AI Assistant',
      icon: Brain,
      onClick: onShowAIBooking,
      className: 'text-purple-600 hover:text-purple-700 hover:bg-purple-50'
    }] : []),
    ...(onShowAIAnalytics && onShowAIAnalytics.toString() !== '() => {}' ? [{
      id: 'ai-analytics',
      label: 'AI Analytics',
      icon: Zap,
      onClick: onShowAIAnalytics,
      className: 'text-blue-600 hover:text-blue-700 hover:bg-blue-50'
    }] : []),
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      onClick: onShowAnalytics,
      className: ''
    },
    {
      id: 'customer-base',
      label: 'Customer Base',
      icon: Users,
      onClick: onShowCustomerBase,
      className: ''
    },
    {
      id: 'instructions',
      label: 'Instructions',
      icon: CalendarIcon,
      onClick: onShowInstructions,
      className: ''
    },
    {
      id: 'settings',
      label: 'Settings',
      icon: Settings,
      onClick: onShowSettings,
      className: ''
    }
  ];

  const handleItemClick = (onClick) => {
    onClick();
    setIsOpen(false);
  };

  const handleLogout = () => {
    onLogout();
    setIsOpen(false);
  };

  if (sidebarOpen) {
    // When sidebar is open, show individual buttons as before
    return (
      <div className="space-y-2">
        {menuItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            className={`w-full justify-start ${item.className}`}
            onClick={item.onClick}
          >
            <item.icon className="w-4 h-4 mr-3" />
            {item.label}
          </Button>
        ))}
        
        {/* User Profile Section */}
        <div className="pt-2 mt-2 border-t border-gray-200">
          <div className="flex items-center space-x-3 p-2 mb-2">
            <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.username || 'Staff User'}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.email || 'admin@boomkaraoke.com'}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleLogout}
          >
            <LogOut className="w-4 h-4 mr-3" />
            Logout
          </Button>
        </div>
      </div>
    );
  }

  // When sidebar is collapsed, show compact menu button with dropdown
  return (
    <div className="relative" ref={menuRef}>
      <Button
        variant="ghost"
        size="icon"
        className="h-12 w-12 relative"
        onClick={() => setIsOpen(!isOpen)}
        title="Menu"
      >
        <MoreVertical className="w-6 h-6" />
        {isOpen && (
          <ChevronUp className="w-3 h-3 absolute -top-1 -right-1 text-gray-400" />
        )}
      </Button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute bottom-14 left-0 w-56 bg-white border border-gray-200 rounded-lg shadow-lg z-50 py-2">
          {/* Menu Items */}
          <div className="px-2 space-y-1">
            {menuItems.map((item) => (
              <button
                key={item.id}
                className={`w-full flex items-center px-3 py-2 text-sm rounded-md hover:bg-gray-50 transition-colors ${item.className}`}
                onClick={() => handleItemClick(item.onClick)}
              >
                <item.icon className="w-4 h-4 mr-3" />
                {item.label}
              </button>
            ))}
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 my-2" />

          {/* User Profile Section */}
          <div className="px-2">
            <div className="flex items-center space-x-3 px-3 py-2 mb-2">
              <div className="w-8 h-8 bg-gray-300 rounded-lg flex items-center justify-center">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {user?.username || 'Staff User'}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {user?.email || 'admin@boomkaraoke.com'}
                </p>
              </div>
            </div>
            <button
              className="w-full flex items-center px-3 py-2 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
              onClick={handleLogout}
            >
              <LogOut className="w-4 h-4 mr-3" />
              Logout
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MenuButton;
