import React, { useState } from 'react';
import { useEffect } from 'react';
import AmazonHeader from './components/AmazonHeader';
import AmazonContent from './components/AmazonContent';
import BottomNavigation from './components/BottomNavigation';
import MoreModal from './components/MoreModal';
import StoreSessionModal from './components/StoreSessionModal';
import ScanModal from './components/ScanModal';
import CartModal from './components/CartModal';
import CheckoutModal from './components/CheckoutModal';
import SessionResumeModal from './components/SessionResumeModal';
import { CartItem } from './types';

interface SavedSession {
  cartItems: CartItem[];
  hasActiveSession: boolean;
  timestamp: number;
}

function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isMoreModalOpen, setIsMoreModalOpen] = useState(false);
  const [isStoreSessionModalOpen, setIsStoreSessionModalOpen] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);
  const [isCartModalOpen, setIsCartModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isSessionResumeModalOpen, setIsSessionResumeModalOpen] = useState(false);
  const [hasActiveSession, setHasActiveSession] = useState(false);
  const [savedSession, setSavedSession] = useState<SavedSession | null>(null);

  // Load saved session on app start
  useEffect(() => {
    const loadSavedSession = () => {
      try {
        const saved = localStorage.getItem('amazonSession');
        if (saved) {
          const session: SavedSession = JSON.parse(saved);
          const now = Date.now();
          const sessionAge = now - session.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge < maxAge && session.cartItems.length > 0) {
            setSavedSession(session);
            setIsSessionResumeModalOpen(true);
          } else {
            // Clear expired session
            localStorage.removeItem('amazonSession');
          }
        }
      } catch (error) {
        console.error('Error loading saved session:', error);
        localStorage.removeItem('amazonSession');
      }
    };

    loadSavedSession();

    // Listen for resume session events from banner
    const handleResumeEvent = () => {
      const saved = localStorage.getItem('amazonSession');
      if (saved) {
        const session: SavedSession = JSON.parse(saved);
        setSavedSession(session);
        setIsSessionResumeModalOpen(true);
      }
    };

    window.addEventListener('resumeSession', handleResumeEvent);
    return () => window.removeEventListener('resumeSession', handleResumeEvent);
  }, []);

  // Save session whenever cart or session state changes
  useEffect(() => {
    if (cartItems.length > 0 || hasActiveSession) {
      const session: SavedSession = {
        cartItems,
        hasActiveSession,
        timestamp: Date.now()
      };
      localStorage.setItem('amazonSession', JSON.stringify(session));
    } else {
      localStorage.removeItem('amazonSession');
    }
    
    // Dispatch custom event to notify components of session changes
    window.dispatchEvent(new CustomEvent('sessionUpdated'));
  }, [cartItems, hasActiveSession]);

  const handleAddToCart = (newItem: CartItem) => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.product.id === newItem.product.id);
      if (existingItem) {
        return prev.map(item =>
          item.product.id === newItem.product.id
            ? { ...item, quantity: newItem.quantity }
            : item
        );
      }
      return [...prev, newItem];
    });
  };

  const handleUpdateQuantity = (productId: string, quantity: number) => {
    if (quantity === 0) {
      setCartItems(prev => prev.filter(item => item.product.id !== productId));
    } else {
      setCartItems(prev =>
        prev.map(item =>
          item.product.id === productId
            ? { ...item, quantity }
            : item
        )
      );
    }
  };

  const handleRemoveItem = (productId: string) => {
    setCartItems(prev => prev.filter(item => item.product.id !== productId));
  };

  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    if (tab === 'cart') {
      setIsCartModalOpen(true);
    }
  };

  const handleMoreClick = () => {
    setIsMoreModalOpen(true);
  };

  const handleSelfCheckoutClick = () => {
    setIsMoreModalOpen(false);
    if (hasActiveSession) {
      setIsScanModalOpen(true);
    } else {
      setIsStoreSessionModalOpen(true);
    }
  };

  const handleSessionStart = () => {
    setHasActiveSession(true);
    setIsScanModalOpen(true);
  };

  const handleCheckout = () => {
    setIsCartModalOpen(false);
    setIsCheckoutModalOpen(true);
  };

  const handleOrderComplete = () => {
    setCartItems([]);
    setHasActiveSession(false);
    localStorage.removeItem('amazonSession');
    // Dispatch event to immediately update session banner
    window.dispatchEvent(new CustomEvent('sessionUpdated'));
    setIsCheckoutModalOpen(false);
    setActiveTab('home');
  };

  const handleResumeSession = () => {
    if (savedSession) {
      setCartItems(savedSession.cartItems);
      setHasActiveSession(savedSession.hasActiveSession);
      setActiveTab('home');
    }
    setIsSessionResumeModalOpen(false);
    setSavedSession(null);
    // Open scan modal directly for continuing shopping
    setIsScanModalOpen(true);
  };

  const handleStartFresh = () => {
    localStorage.removeItem('amazonSession');
    setCartItems([]);
    setHasActiveSession(false);
    // Dispatch event to immediately update session banner
    window.dispatchEvent(new CustomEvent('sessionUpdated'));
    setIsSessionResumeModalOpen(false);
    setSavedSession(null);
    setActiveTab('home');
  };

  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col relative max-w-md mx-auto overflow-hidden">
      <AmazonHeader />
      <AmazonContent />
      
      <BottomNavigation
        activeTab={activeTab}
        onTabChange={handleTabChange}
        cartItems={totalItems}
        onMoreClick={handleMoreClick}
      />

      <MoreModal
        isOpen={isMoreModalOpen}
        onClose={() => setIsMoreModalOpen(false)}
        onSelfCheckoutClick={handleSelfCheckoutClick}
      />

      <StoreSessionModal
        isOpen={isStoreSessionModalOpen}
        onClose={() => setIsStoreSessionModalOpen(false)}
        onSessionStart={handleSessionStart}
      />

      <ScanModal
        isOpen={isScanModalOpen}
        onClose={() => setIsScanModalOpen(false)}
        onAddToCart={handleAddToCart}
        cartItems={cartItems}
        hasActiveSession={hasActiveSession}
      />

      <CartModal
        isOpen={isCartModalOpen}
        onClose={() => setIsCartModalOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
      />

      <CheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        cartItems={cartItems}
        onOrderComplete={handleOrderComplete}
      />

      <SessionResumeModal
        isOpen={isSessionResumeModalOpen}
        onClose={() => setIsSessionResumeModalOpen(false)}
        savedSession={savedSession}
        onResumeSession={handleResumeSession}
        onStartFresh={handleStartFresh}
      />
    </div>
  );
}

export default App;