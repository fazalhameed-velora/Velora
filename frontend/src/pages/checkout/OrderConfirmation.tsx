import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, MessageCircle, Home, ShoppingBag, Truck, Clock } from 'lucide-react';

export default function OrderConfirmation() {
  const location = useLocation();
  const orderData = location.state?.orderData;

  // Calculate estimated delivery date (3-5 business days from now)
  const getEstimatedDelivery = () => {
    const now = new Date();
    const deliveryDate = new Date(now);
    // Add 4 business days (excluding weekends)
    let businessDaysAdded = 0;
    while (businessDaysAdded < 4) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      const day = deliveryDate.getDay();
      if (day !== 0 && day !== 6) { // Not Sunday or Saturday
        businessDaysAdded++;
      }
    }
    return deliveryDate.toLocaleDateString('en-PK', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full text-center">
        {/* Success Icon */}
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center animate-bounce">
          <CheckCircle size={48} className="text-green-600 dark:text-green-400" />
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-surface-900 dark:text-white mb-3">
          Order Placed Successfully!
        </h1>
        
        {/* Order Number */}
        {orderData?.orderId && (
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-surface-100 dark:bg-surface-800 rounded-xl mb-4">
            <span className="text-sm text-surface-500">Order</span>
            <span className="font-mono font-bold text-surface-900 dark:text-white">#{orderData.orderId.slice(-8).toUpperCase()}</span>
          </div>
        )}
        
        <p className="text-surface-500 mb-8">
          Thank you for your order. We'll contact you shortly to confirm.
        </p>

        {/* Delivery Estimate Card */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 rounded-2xl border border-primary-200 dark:border-primary-800 p-6 mb-6">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Truck size={24} className="text-primary-600" />
            <span className="font-semibold text-primary-700 dark:text-primary-400">Estimated Delivery</span>
          </div>
          <div className="flex items-center justify-center gap-2">
            <Clock size={16} className="text-primary-500" />
            <span className="text-xl font-bold text-primary-700 dark:text-primary-300">
              {getEstimatedDelivery()}
            </span>
          </div>
          <p className="text-sm text-primary-600 dark:text-primary-400 mt-2">
            Free shipping • 3-4 business days
          </p>
        </div>

        {/* Order Info Card */}
        <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-6 mb-8 text-left">
          <div className="flex items-center gap-3 mb-4">
            <Package size={20} className="text-primary-600" />
            <span className="font-semibold text-surface-900 dark:text-white">What's Next?</span>
          </div>
          <ul className="space-y-3 text-sm text-surface-600 dark:text-surface-400">
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Your order has been received</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>We'll confirm your order via WhatsApp</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Free shipping on your order</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>Cash on Delivery available</span>
            </li>
          </ul>
        </div>

        {/* WhatsApp Button */}
        <a
          href={`https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER || '923070528980'}?text=Hi, I just placed an order on Velora. Can you confirm my order?`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors mb-6"
        >
          <MessageCircle size={18} />
          Confirm on WhatsApp
        </a>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-600 text-white rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            <Home size={16} />
            Go Home
          </Link>
          <Link
            to="/shop"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-xl font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
