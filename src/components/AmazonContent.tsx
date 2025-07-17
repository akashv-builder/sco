import React from 'react';
import { useEffect, useState } from 'react';
import { ShoppingCart, Clock } from 'lucide-react';

const AmazonContent: React.FC = () => {
  const [savedSession, setSavedSession] = useState<any>(null);

  useEffect(() => {
    const checkSavedSession = () => {
      try {
        const saved = localStorage.getItem('amazonSession');
        if (saved) {
          const session = JSON.parse(saved);
          const now = Date.now();
          const sessionAge = now - session.timestamp;
          const maxAge = 24 * 60 * 60 * 1000; // 24 hours
          
          if (sessionAge < maxAge && session.cartItems.length > 0) {
            setSavedSession(session);
          } else {
            setSavedSession(null);
          }
        } else {
          setSavedSession(null);
        }
      } catch (error) {
        setSavedSession(null);
      }
    };

    checkSavedSession();
    
    // Listen for storage changes to update immediately
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'amazonSession') {
        checkSavedSession();
      }
    };
    
    // Listen for custom events from the app
    const handleSessionUpdate = () => {
      checkSavedSession();
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('sessionUpdated', handleSessionUpdate);
    
    // Check periodically but less frequently
    const interval = setInterval(checkSavedSession, 30000); // Check every 30 seconds
    
    return () => {
      clearInterval(interval);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sessionUpdated', handleSessionUpdate);
    };
  }, []);

  const handleResumeFromBanner = () => {
    try {
      const saved = localStorage.getItem('amazonSession');
      if (saved) {
        const session = JSON.parse(saved);
        const now = Date.now();
        const sessionAge = now - session.timestamp;
        const maxAge = 24 * 60 * 60 * 1000; // 24 hours
        
        if (sessionAge < maxAge && session.cartItems.length > 0) {
          // Trigger the session resume modal by dispatching a custom event
          window.dispatchEvent(new CustomEvent('resumeSession'));
        }
      }
    } catch (error) {
      console.error('Error resuming session:', error);
    }
  };

  return (
    <div className="flex-1 bg-gray-100 overflow-y-auto">
      {/* Category Navigation */}
      <div className="bg-white px-4 py-3 border-b border-gray-200">
        <div className="flex space-x-6 overflow-x-auto">
          <CategoryTab label="All" isActive />
          <CategoryTab label="Fresh" />
          <CategoryTab label="Mobiles" />
          <CategoryTab label="Fashion" />
          <CategoryTab label="Electronics" />
          <CategoryTab label="Home" />
          <CategoryTab label="Beauty" />
          <CategoryTab label="Books" />
        </div>
      </div>

      {/* Session Resume Banner */}
      {savedSession && (
        <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 mx-4 mt-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center mb-2">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse mr-2"></div>
                <span className="text-sm font-medium">Resume Shopping Session</span>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <ShoppingCart className="w-4 h-4" />
                <span className="text-sm">
                  {savedSession.cartItems.reduce((sum: number, item: any) => sum + item.quantity, 0)} items in cart
                </span>
                <span className="text-sm opacity-75">•</span>
                <Clock className="w-4 h-4" />
                <span className="text-sm opacity-75">
                  {(() => {
                    const timeDiff = Date.now() - savedSession.timestamp;
                    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
                    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
                    return hours > 0 ? `${hours}h ${minutes}m ago` : `${minutes}m ago`;
                  })()}
                </span>
              </div>
              <div className="text-lg font-bold mb-2">
                ${savedSession.cartItems.reduce((sum: number, item: any) => sum + (item.product.price * item.quantity), 0).toFixed(2)}
              </div>
              <button
                onClick={handleResumeFromBanner}
                className="bg-white text-green-700 px-4 py-2 rounded text-sm font-medium hover:bg-gray-100 transition-colors"
              >
                Continue Shopping
              </button>
            </div>
            <div className="ml-4">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <ShoppingCart className="w-8 h-8" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prime Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 mx-4 mt-4 rounded-lg shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center mb-2">
              <span className="bg-white text-blue-600 px-2 py-1 rounded text-xs font-bold mr-2">prime</span>
              <span className="text-sm font-medium">Great Indian Festival</span>
            </div>
            <div className="flex items-center space-x-2 mb-2">
              <span className="text-sm line-through opacity-80">$1,299</span>
              <span className="text-xl font-bold">$649</span>
              <span className="bg-red-500 text-white px-1 py-0.5 rounded text-xs">52% off</span>
            </div>
            <p className="text-sm mb-2">Samsung 138 cm (55") QLED TV</p>
            <div className="bg-amazon-orange text-white px-2 py-1 rounded text-xs font-medium inline-block">
              Save extra with exchange
            </div>
            <div className="text-xs mt-2 opacity-90">
              FREE delivery by tomorrow
            </div>
          </div>
          <div className="ml-4">
            <img
              src="https://images.pexels.com/photos/1201996/pexels-photo-1201996.jpeg?auto=compress&cs=tinysrgb&w=300"
              alt="Samsung TV"
              className="w-24 h-24 object-contain rounded"
            />
          </div>
        </div>
      </div>

      {/* Today's Deals */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Today's Deals</h3>
            <span className="text-sm text-blue-600">See all</span>
          </div>
        </div>
        <div className="p-4">
          <div className="flex space-x-3 overflow-x-auto">
            <DealItem
              image="https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg?auto=compress&cs=tinysrgb&w=200"
              discount="Up to 70% off"
              title="Clothing"
            />
            <DealItem
              image="https://images.pexels.com/photos/1080721/pexels-photo-1080721.jpeg?auto=compress&cs=tinysrgb&w=200"
              discount="Min 40% off"
              title="Home & Kitchen"
            />
            <DealItem
              image="https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=200"
              discount="Up to 50% off"
              title="Electronics"
            />
            <DealItem
              image="https://images.pexels.com/photos/264547/pexels-photo-264547.jpeg?auto=compress&cs=tinysrgb&w=200"
              discount="Min 30% off"
              title="Groceries"
            />
          </div>
        </div>
      </div>

      {/* Sponsored Products */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-gray-800">Sponsored</h3>
            <span className="text-xs text-gray-500">Ad</span>
          </div>
        </div>
        <div className="p-4">
          <ProductCard
            image="https://images.pexels.com/photos/1275229/pexels-photo-1275229.jpeg?auto=compress&cs=tinysrgb&w=300"
            title="Apple iPhone 15 (128GB) - Blue"
            rating={4.5}
            reviews={12543}
            originalPrice={899}
            currentPrice={829}
            discount={13}
            prime={true}
            delivery="FREE delivery by tomorrow"
          />
        </div>
      </div>

      {/* Frequently bought together */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Frequently bought together</h3>
        </div>
        <div className="p-4">
          <div className="flex items-center space-x-2 mb-4">
            <img
              src="https://images.pexels.com/photos/1275229/pexels-photo-1275229.jpeg?auto=compress&cs=tinysrgb&w=100"
              alt="iPhone"
              className="w-16 h-16 object-cover rounded border"
            />
            <span className="text-lg font-bold text-gray-600">+</span>
            <img
              src="https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=100"
              alt="Case"
              className="w-16 h-16 object-cover rounded border"
            />
            <span className="text-lg font-bold text-gray-600">+</span>
            <img
              src="https://images.pexels.com/photos/4219654/pexels-photo-4219654.jpeg?auto=compress&cs=tinysrgb&w=100"
              alt="Charger"
              className="w-16 h-16 object-cover rounded border"
            />
          </div>
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm text-gray-600">Total: </span>
              <span className="text-lg font-bold text-amazon-orange">$1,279</span>
            </div>
            <button className="bg-amazon-orange text-white px-4 py-2 rounded text-sm font-medium">
              Add all to Cart
            </button>
          </div>
        </div>
      </div>

      {/* Recommended for you */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Recommended for you</h3>
        </div>
        <div className="p-4 space-y-4">
          <ProductCard
            image="https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=300"
            title="Samsung Galaxy S24 5G (Phantom Black, 128GB)"
            rating={4.3}
            reviews={1250}
            originalPrice={999}
            currentPrice={799}
            discount={24}
            prime={true}
            delivery="FREE delivery by tomorrow"
          />
          <ProductCard
            image="https://images.pexels.com/photos/1649771/pexels-photo-1649771.jpeg?auto=compress&cs=tinysrgb&w=300"
            title="Wireless Bluetooth Headphones with Noise Cancellation"
            rating={4.2}
            reviews={856}
            originalPrice={499}
            currentPrice={399}
            discount={40}
            prime={false}
            delivery="FREE delivery by Wed, Nov 15"
          />
        </div>
      </div>

      {/* Brand Spotlight */}
      <div className="bg-gradient-to-r from-gray-800 to-gray-900 mx-4 mt-4 rounded-lg p-4 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold mb-1">SAMSUNG</h3>
            <h4 className="text-lg font-semibold mb-1">Galaxy S24 5G</h4>
            <p className="text-sm opacity-90 mb-2">Starting $799</p>
            <div className="flex space-x-2">
              <div className="bg-amazon-orange text-white px-2 py-1 rounded text-xs font-medium">
                No Cost EMI
              </div>
              <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                Exchange Offer
              </div>
            </div>
          </div>
          <div>
            <img
              src="https://images.pexels.com/photos/404280/pexels-photo-404280.jpeg?auto=compress&cs=tinysrgb&w=150"
              alt="Samsung Phone"
              className="w-20 h-24 object-contain"
            />
          </div>
        </div>
      </div>

      {/* Recently viewed */}
      <div className="bg-white mx-4 mt-4 rounded-lg shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">Keep shopping for</h3>
        </div>
        <div className="p-4">
          <div className="flex space-x-3 overflow-x-auto">
            <RecentItem
              image="https://images.pexels.com/photos/161559/background-bitter-breakfast-bright-161559.jpeg?auto=compress&cs=tinysrgb&w=150"
              title="Organic Bananas"
              price="$2.99"
            />
            <RecentItem
              image="https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?auto=compress&cs=tinysrgb&w=150"
              title="Organic Milk"
              price="$4.99"
            />
            <RecentItem
              image="https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=150"
              title="Wonder Bread"
              price="$1.99"
            />
          </div>
        </div>
      </div>

      {/* Bottom padding to account for fixed navigation */}
      <div className="h-20 pb-4"></div>
    </div>
  );
};

const CategoryTab: React.FC<{ label: string; isActive?: boolean }> = ({ label, isActive = false }) => {
  return (
    <div className={`pb-2 border-b-2 ${isActive ? 'border-amazon-orange text-amazon-orange' : 'border-transparent text-gray-600'}`}>
      <span className="text-sm font-medium whitespace-nowrap">{label}</span>
    </div>
  );
};

const DealItem: React.FC<{
  image: string;
  discount: string;
  title: string;
}> = ({ image, discount, title }) => {
  return (
    <div className="min-w-[120px] text-center">
      <div className="w-20 h-20 mx-auto mb-2 rounded-lg overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="text-xs font-medium text-red-600 mb-1">{discount}</div>
      <div className="text-xs text-gray-700">{title}</div>
    </div>
  );
};

const ProductCard: React.FC<{
  image: string;
  title: string;
  rating: number;
  reviews: number;
  originalPrice: number;
  currentPrice: number;
  discount: number;
  prime: boolean;
  delivery: string;
}> = ({ image, title, rating, reviews, originalPrice, currentPrice, discount, prime, delivery }) => {
  return (
    <div className="flex space-x-3">
      <img src={image} alt={title} className="w-24 h-24 object-cover rounded" />
      <div className="flex-1">
        <h4 className="text-sm font-medium text-gray-800 mb-1 line-clamp-2">{title}</h4>
        <div className="flex items-center space-x-1 mb-1">
          <div className="flex items-center">
            <span className="text-yellow-500 text-sm">★</span>
            <span className="text-sm text-gray-600 ml-1">{rating}</span>
          </div>
          <span className="text-xs text-gray-500">({reviews.toLocaleString()})</span>
        </div>
        <div className="flex items-center space-x-2 mb-1">
          <span className="text-lg font-bold text-gray-900">${currentPrice.toLocaleString()}</span>
          <span className="text-sm text-gray-500 line-through">${originalPrice.toLocaleString()}</span>
          <span className="text-xs bg-red-500 text-white px-1 py-0.5 rounded">-{discount}%</span>
        </div>
        {prime && (
          <div className="flex items-center space-x-2 mb-1">
            <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">prime</span>
          </div>
        )}
        <div className="text-xs text-gray-600">{delivery}</div>
      </div>
    </div>
  );
};

const RecentItem: React.FC<{
  image: string;
  title: string;
  price: string;
}> = ({ image, title, price }) => {
  return (
    <div className="min-w-[100px] text-center">
      <div className="w-16 h-16 mx-auto mb-2 rounded overflow-hidden">
        <img src={image} alt={title} className="w-full h-full object-cover" />
      </div>
      <div className="text-xs text-gray-700 mb-1">{title}</div>
      <div className="text-xs font-medium text-amazon-orange">{price}</div>
    </div>
  );
};

export default AmazonContent;