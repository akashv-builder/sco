import React from 'react';
import { X, ShoppingCart, Clock, Package } from 'lucide-react';
import { CartItem } from '../types';

interface SavedSession {
  cartItems: CartItem[];
  hasActiveSession: boolean;
  timestamp: number;
}

interface SessionResumeModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedSession: SavedSession | null;
  onResumeSession: () => void;
  onStartFresh: () => void;
}

const SessionResumeModal: React.FC<SessionResumeModalProps> = ({
  isOpen,
  onClose,
  savedSession,
  onResumeSession,
  onStartFresh
}) => {
  if (!isOpen || !savedSession) return null;

  const { cartItems, hasActiveSession, timestamp } = savedSession;
  const total = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  const totalItems = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  
  // Calculate time since last activity
  const now = Date.now();
  const timeDiff = now - timestamp;
  const hours = Math.floor(timeDiff / (1000 * 60 * 60));
  const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
  
  let timeAgo = '';
  if (hours > 0) {
    timeAgo = `${hours}h ${minutes}m ago`;
  } else if (minutes > 0) {
    timeAgo = `${minutes}m ago`;
  } else {
    timeAgo = 'Just now';
  }

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div>
            <h2 className="text-xl font-bold text-gray-800">Welcome Back!</h2>
            <p className="text-sm text-gray-600">Resume your shopping session</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {/* Session Status */}
          <div className="bg-blue-50 rounded-lg p-4 mb-6">
            <div className="flex items-center space-x-3 mb-3">
              <div className={`w-3 h-3 rounded-full ${hasActiveSession ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <div>
                <h3 className="font-medium text-gray-800">
                  {hasActiveSession ? 'Active Session Found' : 'Previous Session Found'}
                </h3>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Clock className="w-4 h-4" />
                  <span>Last activity: {timeAgo}</span>
                </div>
              </div>
            </div>
            
            {hasActiveSession && (
              <div className="bg-green-100 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-700 font-medium">
                    Store session is still active
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Cart Preview */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <ShoppingCart className="w-5 h-5 text-amazon-orange" />
                <h3 className="font-medium text-gray-800">Your Cart</h3>
              </div>
              <div className="bg-amazon-orange text-white px-2 py-1 rounded-full text-xs font-medium">
                {totalItems} item{totalItems !== 1 ? 's' : ''}
              </div>
            </div>

            {/* Show first 3 items */}
            <div className="space-y-3 mb-3">
              {cartItems.slice(0, 3).map((item) => (
                <div key={item.product.id} className="flex items-center space-x-3">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="w-10 h-10 object-cover rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {item.product.name}
                    </p>
                    <p className="text-xs text-gray-600">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-sm font-medium text-amazon-orange">
                    ${(item.product.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))}
              
              {cartItems.length > 3 && (
                <div className="flex items-center justify-center py-2 text-sm text-gray-500">
                  <Package className="w-4 h-4 mr-1" />
                  +{cartItems.length - 3} more item{cartItems.length - 3 !== 1 ? 's' : ''}
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 pt-3">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800">Total:</span>
                <span className="text-lg font-bold text-amazon-orange">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={onResumeSession}
              className="w-full bg-amazon-orange hover:bg-orange-600 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
            >
              <ShoppingCart className="w-5 h-5" />
              <span>Continue Shopping</span>
            </button>
            
            <button
              onClick={onStartFresh}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-lg font-medium transition-colors"
            >
              Start Fresh Session
            </button>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Sessions are automatically saved and expire after 24 hours</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SessionResumeModal;