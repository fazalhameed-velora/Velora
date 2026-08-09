import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, MessageCircle, ArrowRight, Home, ShoppingBag } from 'lucide-react';

export default function OrderConfirmation() {
  const location = useLocation();
  const orderData = location.state?.orderData;

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
        <p className="text-surface-500 mb-8">
          Thank you for your order. We'll contact you shortly to confirm.
        </p>

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
