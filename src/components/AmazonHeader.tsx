import React from 'react';
import { useEffect, useState } from 'react';
import { Search, Camera, Mic, MapPin } from 'lucide-react';

const AmazonHeader: React.FC = () => {
  const [hasActiveSession, setHasActiveSession] = useState(false);

  useEffect(() => {
    const checkSession = () => {
      try {
        const saved = localStorage.getItem('amazonSession');
        if (saved) {
          const session = JSON.parse(saved);
          const now = Date.now();
          const sessionAge = now - session.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          setHasActiveSession(
            sessionAge < maxAge && 
            (session.hasActiveSession || session.cartItems.length > 0) &&
            session.cartItems.length > 0
          );
        } else {
          setHasActiveSession(false);
        }
      } catch (error) {
        setHasActiveSession(false);
      }
    };

    checkSession();
    
    // Listen for storage changes from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'amazonSession') {
        checkSession();
      }
    };
    
    // Listen for custom events from the app for immediate updates
    const handleSessionUpdate = () => {
      checkSession();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sessionUpdated', handleSessionUpdate);
    
    // Reduced polling frequency since we now have event-driven updates
    const interval = setInterval(checkSession, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessionUpdated', handleSessionUpdate);
    };
  }, []);

  return (
    <div className="bg-amazon-dark text-white">
      {/* Top Status Bar */}
      <div className="flex justify-between items-center px-4 py-1 text-xs bg-black bg-opacity-20">
        <div className="flex items-center space-x-2">
          <span className="font-medium">9:41</span>
        </div>
        <div className="flex items-center space-x-1 text-white">
          <div className="flex space-x-1">
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white rounded-full"></div>
            <div className="w-1 h-3 bg-white opacity-50 rounded-full"></div>
          </div>
          <span className="text-xs">📶</span>
          <span className="text-xs">📶</span>
          <div className="flex items-center">
            <div className="w-6 h-3 border border-white rounded-sm">
              <div className="w-4 h-2 bg-white rounded-sm m-0.5"></div>
            </div>
          </div>
        </div>
      </div>

      {/* Amazon Logo and Location */}
      <div className="px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            <div className="flex items-center">
              <span className="text-2xl font-bold tracking-tight">amazon</span>
              <span className="text-sm ml-1">.com</span>
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-4 text-sm">
          <div className="relative">
            <span className="text-lg">🔔</span>
            <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></div>
          </div>
          <div className="relative">
            <span className="text-lg">🛒</span>
            {hasActiveSession && (
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            )}
          </div>
        </div>
      </div>

      {/* Delivery Location */}
      <div className="px-4 pb-2">
        <div className="flex items-center text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="text-gray-200">Deliver to</span>
          <span className="ml-1 font-medium">John - New York 10001</span>
          <span className="ml-1 text-gray-300">▼</span>
          {hasActiveSession && (
            <div className="ml-2 bg-green-500 text-white px-2 py-0.5 rounded-full text-xs font-medium animate-pulse">
              Session Active
            </div>
          )}
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-4 pb-4">
        <div className="bg-white rounded-md flex items-center px-3 py-3 shadow-sm">
          <Search className="w-5 h-5 text-gray-500 mr-3" />
          <input
            type="text"
            placeholder="Search Amazon"
            className="flex-1 outline-none text-gray-700 text-base"
          />
          <div className="flex items-center space-x-2 ml-3">
            <Camera className="w-5 h-5 text-gray-500" />
            <Mic className="w-5 h-5 text-gray-500" />
          </div>
        </div>
      </div>

      {/* Service Shortcuts */}
      <div className="px-4 pb-4">
        <div className="flex space-x-3 overflow-x-auto">
          <ServiceCard icon="💳" label="Pay" color="bg-blue-500" />
          <ServiceCard icon="⚡" label="miniTV" color="bg-purple-500" />
          <ServiceCard icon="🥬" label="Fresh" color="bg-green-500" />
          <ServiceCard icon="🛍️" label="Fashion" color="bg-pink-500" />
          <ServiceCard icon="📱" label="Mobiles" color="bg-orange-500" />
          <ServiceCard icon="🏠" label="Home" color="bg-indigo-500" />
          <ServiceCard icon="🎮" label="Gaming" color="bg-red-500" />
        </div>
      </div>
    </div>
  );
};

const ServiceCard: React.FC<{ icon: string; label: string; color: string }> = ({ icon, label, color }) => {
  return (
    <div className="bg-white rounded-lg p-3 min-w-[70px] text-center shadow-sm">
      <div className={`w-8 h-8 ${color} rounded-full flex items-center justify-center mx-auto mb-1`}>
        <span className="text-white text-sm">{icon}</span>
      </div>
      <div className="text-xs text-gray-800 font-medium">{label}</div>
    </div>
  );
};

export default AmazonHeader;