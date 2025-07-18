import React, { useState, useEffect } from 'react';
import { X, Scan, CheckCircle, AlertCircle, ShoppingCart } from 'lucide-react';
import { Product, CartItem } from '../types';
import { products } from '../data/products';

const SessionTimer: React.FC = () => {
  const [timeRemaining, setTimeRemaining] = useState('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const closing = new Date();
      closing.setHours(23, 0, 0, 0); // 11:00 PM
      
      if (closing < now) {
        closing.setDate(closing.getDate() + 1);
      }
      
      const diff = closing.getTime() - now.getTime();
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      
      setTimeRemaining(`${hours}h ${minutes}m until store closes`);
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-xs text-gray-600 bg-yellow-50 px-2 py-1 rounded">
      ⏰ {timeRemaining}
    </div>
  );
};

interface ScanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddToCart: (item: CartItem) => void;
  cartItems: CartItem[];
  hasActiveSession: boolean;
}

const ScanModal: React.FC<ScanModalProps> = ({
  isOpen,
  onClose,
  onAddToCart,
  cartItems,
  hasActiveSession
}) => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isPrimeMember] = useState(true); // Simulate Prime membership
  const [primeDealsApplied, setPrimeDealsApplied] = useState<{[key: string]: number}>({});

  useEffect(() => {
    if (isOpen) {
      // Reset state when modal opens
      setScannedProduct(null);
      setScanSuccess(false);
      setScanError(null);
      setIsScanning(false);
    }
  }, [isOpen]);

  const simulateBarcodeScan = () => {
    setIsScanning(true);
    setScanError(null);
    
    // Simulate scanning delay
    setTimeout(() => {
      const randomProduct = products[Math.floor(Math.random() * products.length)];
      
      // Apply Prime deals to certain products
      if (isPrimeMember && Math.random() > 0.6) {
        const discount = Math.floor(Math.random() * 20) + 5; // 5-25% discount
        setPrimeDealsApplied(prev => ({
          ...prev,
          [randomProduct.id]: discount
        }));
      }
      
      setScannedProduct(randomProduct);
      setScanSuccess(true);
      setIsScanning(false);
    }, 2000);
  };

  const handleAddToCart = () => {
    if (scannedProduct) {
      const existingItem = cartItems.find(item => item.product.id === scannedProduct.id);
      
      if (existingItem) {
        onAddToCart({
          ...existingItem,
          quantity: existingItem.quantity + 1
        });
      } else {
        onAddToCart({
          product: scannedProduct,
          quantity: 1,
          scannedAt: new Date()
        });
      }
      
      // Reset for next scan
      setScannedProduct(null);
      setScanSuccess(false);
    }
  };

  if (!isOpen) return null;

  const currentPrimeDiscount = scannedProduct ? primeDealsApplied[scannedProduct.id] : 0;
  const discountedPrice = scannedProduct && currentPrimeDiscount 
    ? scannedProduct.price * (1 - currentPrimeDiscount / 100)
    : scannedProduct?.price || 0;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-gray-800">Self Checkout</h2>
              {isPrimeMember && (
                <span className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">prime</span>
              )}
            </div>
            {hasActiveSession && (
              <div className="mt-1">
                <div className="flex items-center space-x-2 mb-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-green-600 font-medium">Session Active</span>
                  {isPrimeMember && (
                    <span className="text-xs text-blue-600 font-medium">• Prime Benefits Active</span>
                  )}
                </div>
                <SessionTimer />
              </div>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Prime Benefits Banner */}
        {isPrimeMember && hasActiveSession && (
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-3 mx-4 mt-4 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="bg-white text-blue-600 px-2 py-0.5 rounded text-xs font-bold">prime</span>
                  <span className="text-sm font-medium">Member Benefits Active</span>
                </div>
                <div className="text-xs opacity-90">
                  • Exclusive deals on select items • Member rewards
                </div>
              </div>
              <div className="text-2xl">⭐</div>
            </div>
          </div>
        )}

        {/* Scan Area */}
        <div className="p-6">
          {!scannedProduct && !isScanning && (
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <div className="relative">
                  <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                    <Scan className="w-16 h-16 text-gray-400" />
                  </div>
                  <div className="absolute inset-0 border-2 border-amazon-orange rounded-lg"></div>
                  <div className="absolute top-4 left-4 w-6 h-6 border-l-2 border-t-2 border-amazon-orange"></div>
                  <div className="absolute top-4 right-4 w-6 h-6 border-r-2 border-t-2 border-amazon-orange"></div>
                  <div className="absolute bottom-4 left-4 w-6 h-6 border-l-2 border-b-2 border-amazon-orange"></div>
                  <div className="absolute bottom-4 right-4 w-6 h-6 border-r-2 border-b-2 border-amazon-orange"></div>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                Position the barcode within the frame and tap scan
              </p>
              {isPrimeMember && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center justify-center space-x-2">
                    <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">prime</span>
                    <span className="text-sm text-blue-700 font-medium">
                      Scan for exclusive Prime deals!
                    </span>
                  </div>
                </div>
              )}
              <button
                onClick={simulateBarcodeScan}
                className="bg-amazon-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                <Scan className="w-5 h-5 inline mr-2" />
                Start Scanning
              </button>
            </div>
          )}

          {isScanning && (
            <div className="text-center">
              <div className="bg-gray-100 rounded-lg p-8 mb-4">
                <div className="relative">
                  <div className="w-48 h-48 mx-auto bg-gray-200 rounded-lg flex items-center justify-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-amazon-orange"></div>
                  </div>
                  <div className="absolute inset-0 border-2 border-amazon-orange rounded-lg animate-pulse"></div>
                </div>
              </div>
              <div className="space-y-2">
                <p className="text-amazon-orange font-medium">Scanning barcode...</p>
                {isPrimeMember && (
                  <p className="text-blue-600 text-sm">Checking for Prime deals...</p>
                )}
              </div>
            </div>
          )}

          {scannedProduct && scanSuccess && (
            <div className="text-center">
              <div className="bg-green-50 rounded-lg p-4 mb-4">
                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-green-700 font-medium">Product scanned successfully!</p>
                {currentPrimeDiscount > 0 && (
                  <div className="mt-2 bg-blue-100 border border-blue-200 rounded-lg p-2">
                    <div className="flex items-center justify-center space-x-2">
                      <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">prime</span>
                      <span className="text-blue-700 text-sm font-medium">
                        {currentPrimeDiscount}% Prime Member Discount Applied!
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="bg-white border rounded-lg p-4 mb-4 text-left">
                <div className="flex items-center space-x-4">
                  <img
                    src={scannedProduct.image}
                    alt={scannedProduct.name}
                    className="w-16 h-16 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-800">{scannedProduct.name}</h3>
                    <p className="text-sm text-gray-600">{scannedProduct.category}</p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-yellow-500">★</span>
                      <span className="text-sm">{scannedProduct.rating}</span>
                      <span className="text-sm text-gray-500">({scannedProduct.reviews})</span>
                      {currentPrimeDiscount > 0 && (
                        <span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs font-bold">prime</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    {currentPrimeDiscount > 0 ? (
                      <div>
                        <div className="text-sm text-gray-500 line-through">
                          ${scannedProduct.price.toFixed(2)}
                        </div>
                        <div className="text-lg font-bold text-blue-600">
                          ${discountedPrice.toFixed(2)}
                        </div>
                        <div className="text-xs bg-blue-100 text-blue-700 px-1 py-0.5 rounded">
                          Save ${(scannedProduct.price - discountedPrice).toFixed(2)}
                        </div>
                      </div>
                    ) : (
                      <div className="text-lg font-bold text-amazon-orange">
                        ${scannedProduct.price.toFixed(2)}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={handleAddToCart}
                  className={`flex-1 py-3 rounded-lg font-medium transition-colors ${
                    currentPrimeDiscount > 0 
                      ? 'bg-blue-600 hover:bg-blue-700 text-white' 
                      : 'bg-amazon-orange hover:bg-orange-600 text-white'
                  }`}
                >
                  <ShoppingCart className="w-5 h-5 inline mr-2" />
                  {currentPrimeDiscount > 0 ? 'Add with Prime Discount' : 'Add to Cart'}
                </button>
                <button
                  onClick={() => {
                    setScannedProduct(null);
                    setScanSuccess(false);
                    setPrimeDealsApplied(prev => {
                      const updated = { ...prev };
                      if (scannedProduct) {
                        delete updated[scannedProduct.id];
                      }
                      return updated;
                    });
                  }}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
                >
                  Scan Another
                </button>
              </div>
            </div>
          )}

          {scanError && (
            <div className="text-center">
              <div className="bg-red-50 rounded-lg p-4 mb-4">
                <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-2" />
                <p className="text-red-700 font-medium">Scan failed</p>
                <p className="text-red-600 text-sm">{scanError}</p>
              </div>
              <button
                onClick={simulateBarcodeScan}
                className="bg-amazon-orange hover:bg-orange-600 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ScanModal;