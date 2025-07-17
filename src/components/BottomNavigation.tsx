import React from 'react';
import { Home, User, ShoppingCart, Menu, MoreHorizontal } from 'lucide-react';

interface BottomNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  cartItems: number;
  onMoreClick: () => void;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({
  activeTab,
  onTabChange,
  cartItems,
  onMoreClick
}) => {
  return (
    <div className="bg-white border-t border-gray-300 px-2 py-2 shadow-lg backdrop-blur-sm fixed bottom-0 left-0 right-0 z-40 max-w-md mx-auto">
      <div className="flex items-center justify-around">
        <NavItem
          icon={Home}
          label="Home"
          isActive={activeTab === 'home'}
          onClick={() => onTabChange('home')}
        />
        
        <NavItem
          icon={User}
          label="Account"
          isActive={activeTab === 'account'}
          onClick={() => onTabChange('account')}
        />
        
        <NavItem
          icon={ShoppingCart}
          label="Cart"
          isActive={activeTab === 'cart'}
          onClick={() => onTabChange('cart')}
          badge={cartItems > 0 ? cartItems : undefined}
        />

        <NavItem
          icon={Menu}
          label="Menu"
          isActive={activeTab === 'menu'}
          onClick={() => onTabChange('menu')}
        />

        <NavItem
          icon={MoreHorizontal}
          label="More"
          isActive={activeTab === 'more'}
          onClick={onMoreClick}
        />
      </div>
    </div>
  );
};

const NavItem: React.FC<{
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  isActive: boolean;
  onClick: () => void;
  badge?: number;
}> = ({ icon: Icon, label, isActive, onClick, badge }) => {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center py-2 px-3 relative transition-colors ${
        isActive ? 'text-amazon-orange' : 'text-gray-500'
      }`}
    >
      <div className="relative">
        <Icon className="w-5 h-5" />
        {badge && (
          <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
            {badge}
          </div>
        )}
      </div>
      <span className="text-xs mt-1 font-medium">{label}</span>
    </button>
  );
};

export default BottomNavigation;