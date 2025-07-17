import React, { useState } from 'react';
import { X, CreditCard, CheckCircle, Smartphone, Gift, Download, Mail, Check, FileText, QrCode } from 'lucide-react';
import { CartItem } from '../types';
import jsPDF from 'jspdf';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  cartItems: CartItem[];
  onOrderComplete: () => void;
}

const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  cartItems,
  onOrderComplete
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState('amazon-pay');
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discount: number} | null>(null);
  const [showBill, setShowBill] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [receiptDownloaded, setReceiptDownloaded] = useState(false);
  const [isPrimeMember] = useState(true); // Simulate Prime membership
  const [primeDiscountApplied, setPrimeDiscountApplied] = useState(false);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
  
  // Prime benefits
  const primeDiscount = isPrimeMember && primeDiscountApplied ? subtotal * 0.05 : 0; // 5% Prime discount
  const primeShipping = isPrimeMember ? 0 : (subtotal > 35 ? 0 : 5.99); // Free shipping for Prime
  const primeTax = isPrimeMember ? (subtotal - primeDiscount) * 0.0875 : subtotal * 0.0875; // Tax after Prime discount
  
  const tax = primeTax;
  const shipping = primeShipping;
  const couponDiscount = appliedCoupon ? (subtotal * appliedCoupon.discount / 100) : 0;
  const total = subtotal + tax + shipping - couponDiscount - primeDiscount;
  const orderNumber = `AMZ-${Date.now().toString().slice(-8)}`;

  const handleApplyPrimeDiscount = () => {
    if (isPrimeMember && !primeDiscountApplied) {
      setPrimeDiscountApplied(true);
    }
  };

  const handleApplyCoupon = () => {
    const validCoupons = {
      'SAVE10': { discount: 10, description: '10% off your order' },
      'WELCOME20': { discount: 20, description: '20% off for new customers' },
      'FREESHIP': { discount: 0, description: 'Free shipping' }
    };

    if (validCoupons[couponCode as keyof typeof validCoupons]) {
      setAppliedCoupon({
        code: couponCode,
        discount: validCoupons[couponCode as keyof typeof validCoupons].discount
      });
    }
  };

  const handlePayment = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      setIsComplete(true);
      // Simulate email sending
      setTimeout(() => {
        setEmailSent(true);
        setShowBill(true);
      }, 2000);
    }, 2000);
  };

  const handleDownloadReceipt = () => {
    // Generate PDF receipt
    const pdf = new jsPDF();
    
    // Header
    pdf.setFontSize(20);
    pdf.setFont(undefined, 'bold');
    pdf.text('AMAZON RECEIPT', 20, 30);
    
    pdf.setFontSize(12);
    pdf.setFont(undefined, 'normal');
    pdf.text(`Order #${orderNumber}`, 20, 45);
    pdf.text(`Date: ${new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })}`, 20, 55);
    
    // Delivery Address
    pdf.setFont(undefined, 'bold');
    pdf.text('DELIVERY ADDRESS:', 20, 75);
    pdf.setFont(undefined, 'normal');
    pdf.text('John Smith', 20, 85);
    pdf.text('123 Main Street, Apt 4B', 20, 95);
    pdf.text('New York, NY 10001', 20, 105);
    pdf.text('United States', 20, 115);
    
    // Items
    pdf.setFont(undefined, 'bold');
    pdf.text('ITEMS ORDERED:', 20, 135);
    pdf.setFont(undefined, 'normal');
    
    let yPos = 145;
    cartItems.forEach((item) => {
      const itemText = `${item.product.name} x${item.quantity}`;
      const priceText = `$${(item.product.price * item.quantity).toFixed(2)}`;
      
      // Split long product names
      const maxWidth = 120;
      const lines = pdf.splitTextToSize(itemText, maxWidth);
      
      lines.forEach((line: string, index: number) => {
        pdf.text(line, 20, yPos);
        if (index === lines.length - 1) {
          pdf.text(priceText, 150, yPos);
        }
        yPos += 10;
      });
      yPos += 5;
    });
    
    // Payment Summary
    yPos += 10;
    pdf.setFont(undefined, 'bold');
    pdf.text('PAYMENT SUMMARY:', 20, yPos);
    pdf.setFont(undefined, 'normal');
    
    yPos += 15;
    pdf.text(`Subtotal: $${subtotal.toFixed(2)}`, 20, yPos);
    yPos += 10;
    
    if (appliedCoupon) {
      pdf.text(`Coupon (${appliedCoupon.code}): -$${couponDiscount.toFixed(2)}`, 20, yPos);
      yPos += 10;
    }
    
    pdf.text(`Shipping: ${shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}`, 20, yPos);
    yPos += 10;
    pdf.text(`Tax: $${tax.toFixed(2)}`, 20, yPos);
    yPos += 10;
    
    pdf.setFont(undefined, 'bold');
    pdf.text(`Total: $${total.toFixed(2)}`, 20, yPos);
    
    yPos += 20;
    pdf.setFont(undefined, 'normal');
    pdf.text(`Payment Method: ${paymentMethods.find(p => p.id === selectedPayment)?.name}`, 20, yPos);
    
    yPos += 20;
    pdf.setFont(undefined, 'bold');
    pdf.text('Thank you for shopping with Amazon!', 20, yPos);
    
    // Save the PDF
    pdf.save(`Amazon_Receipt_${orderNumber}.pdf`);
    setReceiptDownloaded(true);
  };

  const handleCloseBill = () => {
    setShowBill(false);
    setIsComplete(false);
    setEmailSent(false);
    setReceiptDownloaded(false);
    onOrderComplete();
  };

  const paymentMethods = [
    { id: 'amazon-pay', name: 'Amazon Pay', icon: '💳', description: 'Balance: $247.83' },
    { id: 'credit-card', name: 'Credit Card', icon: '💳', description: '**** **** **** 1234' },
    { id: 'snap-ebt', name: 'SNAP EBT', icon: '🍎', description: 'EBT Balance: $156.42' },
    { id: 'apple-pay', name: 'Apple Pay', icon: '📱', description: 'Touch ID or Face ID' },
    { id: 'amazon-voucher', name: 'Amazon Gift Card', icon: '🎁', description: 'Enter gift card code' }
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-bold text-gray-800">
            {showBill ? 'Order Receipt' : 'Checkout'}
          </h2>
          <button
            onClick={showBill ? handleCloseBill : onClose}
            className="p-2 hover:bg-gray-100 rounded-full"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {showBill ? (
            /* Bill/Receipt */
            <div className="space-y-6">
              {/* Email Notification */}
              {emailSent && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center space-x-3">
                  <Mail className="w-5 h-5 text-green-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-green-800">Receipt sent to email</p>
                    <p className="text-xs text-green-600">john.smith@email.com</p>
                  </div>
                  <Check className="w-5 h-5 text-green-600" />
                </div>
              )}

              {/* Download Receipt Button */}
              <div className="flex space-x-3 mb-6">
                <button
                  onClick={handleDownloadReceipt}
                  className={`flex-1 flex items-center justify-center space-x-2 py-3 rounded-lg font-medium transition-colors ${
                    receiptDownloaded 
                      ? 'bg-green-100 text-green-700 border border-green-200' 
                      : 'bg-amazon-orange hover:bg-orange-600 text-white'
                  }`}
                >
                  {receiptDownloaded ? (
                    <>
                      <FileText className="w-5 h-5" />
                      <span>PDF Downloaded</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-5 h-5" />
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>

              {/* QR Code for Checkout */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-center">
                <h3 className="font-semibold mb-3 flex items-center justify-center">
                  <QrCode className="w-5 h-5 mr-2 text-amazon-orange" />
                  Checkout QR Code
                </h3>
                <div className="bg-white rounded-lg p-4 inline-block shadow-sm border">
                  <div className="w-32 h-32 bg-black relative">
                    {/* QR Code Pattern - Simplified representation */}
                    <div className="absolute inset-0 grid grid-cols-8 grid-rows-8 gap-px p-1">
                      {/* Corner markers */}
                      <div className="bg-white col-span-3 row-span-3 border-2 border-black">
                        <div className="w-full h-full bg-black m-1"></div>
                      </div>
                      <div className="bg-white"></div>
                      <div className="bg-white"></div>
                      <div className="bg-white col-span-3 row-span-3 border-2 border-black">
                        <div className="w-full h-full bg-black m-1"></div>
                      </div>
                      
                      {/* Data pattern - simplified */}
                      {Array.from({ length: 40 }, (_, i) => (
                        <div 
                          key={i} 
                          className={`${Math.random() > 0.5 ? 'bg-black' : 'bg-white'}`}
                        ></div>
                      ))}
                      
                      {/* Bottom left corner */}
                      <div className="bg-white col-span-3 row-span-3 border-2 border-black">
                        <div className="w-full h-full bg-black m-1"></div>
                      </div>
                      <div className="bg-white"></div>
                      <div className="bg-white"></div>
                      <div className="bg-white"></div>
                      <div className="bg-white"></div>
                      <div className="bg-white"></div>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-gray-600 mt-3">
                  Scan this code at store exit for verification
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Order #{orderNumber}
                </p>
              </div>

              <div className="text-center border-b pb-4">
                <div className="text-2xl font-bold text-green-600 mb-2">Order Confirmed!</div>
                <div className="text-sm text-gray-600">Order #{orderNumber}</div>
                <div className="text-sm text-gray-600">{new Date().toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}</div>
              </div>

              {/* Delivery Address */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Delivery Address</h3>
                <div className="text-sm text-gray-600">
                  <div>John Smith</div>
                  <div>123 Main Street, Apt 4B</div>
                  <div>New York, NY 10001</div>
                  <div>United States</div>
                </div>
              </div>

              {/* Items */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Items Ordered</h3>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div key={item.product.id} className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{item.product.name}</div>
                        <div className="text-xs text-gray-600">Qty: {item.quantity}</div>
                      </div>
                      <div className="text-sm font-medium">
                        ${(item.product.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-3">Payment Summary</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon ({appliedCoupon.code}):</span>
                      <span>-${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping:</span>
                    <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax:</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>Total:</span>
                    <span>${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div className="border-b pb-4">
                <h3 className="font-semibold mb-2">Payment Method</h3>
                <div className="text-sm text-gray-600">
                  {paymentMethods.find(p => p.id === selectedPayment)?.name}
                </div>
              </div>

              <div className="text-center text-sm text-gray-600">
                <p>Thank you for shopping with Amazon!</p>
                <p className="mt-2">You will receive a confirmation email shortly.</p>
              </div>
            </div>
          ) : !isComplete ? (
            <div>
              {/* Enhanced Order Summary Header */}
              <div className={`mb-6 rounded-lg p-4 text-white ${
                isPrimeMember 
                  ? 'bg-gradient-to-r from-blue-600 to-blue-700' 
                  : 'bg-gradient-to-r from-amazon-blue to-blue-600'
              }`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-lg font-bold">Order Summary</h3>
                    {isPrimeMember && (
                      <div className="bg-white bg-opacity-20 rounded px-2 py-1">
                        <span className="text-xs font-bold">prime</span>
                      </div>
                    )}
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-full px-3 py-1">
                    <span className="text-sm font-medium">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                {isPrimeMember && (
                  <div className="bg-white bg-opacity-10 rounded-lg p-3 mb-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Prime Benefits Active</span>
                      <span className="text-xs bg-white bg-opacity-20 rounded px-2 py-1">MEMBER</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center space-x-1">
                        <span>🚚</span>
                        <span>FREE Delivery</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>⚡</span>
                        <span>Same-day eligible</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>💰</span>
                        <span>5% Cashback</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <span>🎁</span>
                        <span>Prime Rewards</span>
                      </div>
                    </div>
                  </div>
                )}
                
                <div className="space-y-2">
                  {cartItems.slice(0, 2).map((item) => (
                    <div key={item.product.id} className="flex justify-between text-sm opacity-90">
                      <span className="truncate mr-2">{item.product.name} x{item.quantity}</span>
                      <span className="font-medium">${(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  {cartItems.length > 2 && (
                    <div className="text-sm opacity-75">
                      +{cartItems.length - 2} more item{cartItems.length - 2 !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
                <div className="border-t border-white border-opacity-30 mt-3 pt-3">
                  <div className="flex justify-between items-center">
                    <span className="font-medium">Estimated Total:</span>
                    <span className="text-xl font-bold">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Prime Exclusive Offers */}
              {isPrimeMember && !primeDiscountApplied && (
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="bg-blue-600 text-white px-2 py-1 rounded text-xs font-bold">prime</div>
                      <h3 className="font-medium text-blue-800">Exclusive Member Offer</h3>
                    </div>
                    <div className="text-blue-600 font-bold">5% OFF</div>
                  </div>
                  <p className="text-sm text-blue-700 mb-3">
                    Get an additional 5% discount on your entire order as a Prime member!
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-blue-600">
                      You'll save: <span className="font-bold">${(subtotal * 0.05).toFixed(2)}</span>
                    </div>
                    <button
                      onClick={handleApplyPrimeDiscount}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors"
                    >
                      Apply Prime Discount
                    </button>
                  </div>
                </div>
              )}

              {/* Prime Delivery Options */}
              {isPrimeMember && (
                <div className="mb-6 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center space-x-2 mb-3">
                    <div className="bg-green-600 text-white px-2 py-1 rounded text-xs font-bold">prime</div>
                    <h3 className="font-medium text-green-800">Delivery Options</h3>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-2 bg-white rounded border border-green-200">
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="delivery" defaultChecked className="text-green-600" />
                        <div>
                          <div className="text-sm font-medium text-green-800">FREE Same-Day Delivery</div>
                          <div className="text-xs text-green-600">Order within 2 hours</div>
                        </div>
                      </div>
                      <div className="text-green-600 font-bold">FREE</div>
                    </div>
                    <div className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                      <div className="flex items-center space-x-2">
                        <input type="radio" name="delivery" className="text-green-600" />
                        <div>
                          <div className="text-sm font-medium">FREE Two-Day Delivery</div>
                          <div className="text-xs text-gray-600">Standard Prime shipping</div>
                        </div>
                      </div>
                      <div className="text-green-600 font-bold">FREE</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Coupon Section */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 flex items-center">
                  <Gift className="w-5 h-5 mr-2 text-amazon-orange" />
                  Promo Code
                </h3>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    placeholder="Enter coupon code"
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amazon-orange focus:border-transparent"
                  />
                  <button
                    onClick={handleApplyCoupon}
                    className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {appliedCoupon && (
                  <div className="mt-2 text-sm text-green-600 flex items-center bg-green-50 rounded-lg p-2">
                    <CheckCircle className="w-4 h-4 mr-1" />
                    Coupon "{appliedCoupon.code}" applied! You saved ${couponDiscount.toFixed(2)}
                  </div>
                )}
                <div className="mt-2 text-xs text-gray-500 bg-gray-50 rounded p-2">
                  <strong>Try these codes:</strong> SAVE10 (10% off), WELCOME20 (20% off), FREESHIP (Free shipping)
                </div>
              </div>

              {/* Payment Methods */}
              <div className="mb-6">
                <h3 className="font-medium mb-3 flex items-center">
                  <CreditCard className="w-5 h-5 mr-2 text-amazon-orange" />
                  Payment Method
                </h3>
                <div className="space-y-2">
                  {paymentMethods.map((method) => (
                    <div
                      key={method.id}
                      className={`border rounded-lg p-3 cursor-pointer transition-all ${
                        selectedPayment === method.id
                          ? 'border-amazon-orange bg-orange-50 shadow-sm'
                          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => setSelectedPayment(method.id)}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="text-2xl">{method.icon}</div>
                        <div className="flex-1">
                          <div className="font-medium">{method.name}</div>
                          <div className="text-sm text-gray-600">{method.description}</div>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                          selectedPayment === method.id
                            ? 'border-amazon-orange bg-amazon-orange'
                            : 'border-gray-300'
                        }`}>
                          {selectedPayment === method.id && (
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Price Breakdown */}
              <div className="mb-6 bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-3">Price Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items):</span>
                    <span>${subtotal.toFixed(2)}</span>
                  </div>
                  {primeDiscount > 0 && (
                    <div className="flex justify-between text-blue-600">
                      <span>Prime Member Discount (5%):</span>
                      <span>-${primeDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  {appliedCoupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Coupon Discount ({appliedCoupon.code}):</span>
                      <span>-${couponDiscount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Shipping & Handling:</span>
                    <span className={isPrimeMember ? 'text-blue-600 font-medium' : ''}>
                      {shipping === 0 ? (isPrimeMember ? 'FREE with Prime' : 'FREE') : `$${shipping.toFixed(2)}`}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax (8.75%):</span>
                    <span>${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-base">
                    <span>Order Total:</span>
                    <span className="text-amazon-orange text-lg">${total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Place Order Button */}
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full bg-amazon-orange hover:bg-orange-600 text-white py-4 rounded-lg font-medium text-lg transition-colors disabled:opacity-50 shadow-lg"
              >
                {isProcessing ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing Payment...</span>
                  </div>
                ) : (
                  `Place Order • $${total.toFixed(2)}`
                )}
              </button>

              <div className="mt-3 text-xs text-gray-500 text-center">
                By placing your order, you agree to Amazon's privacy notice and conditions of use.
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-green-700 mb-2">Payment Successful!</h3>
              <p className="text-gray-600 mb-4">Thank you for using Amazon Self Checkout</p>
              <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                <Mail className="w-4 h-4" />
                <span>Sending receipt to your email...</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutModal;