import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { CheckCircle, Package, MessageCircle, Home, ShoppingBag, Truck, Clock, Printer } from 'lucide-react';

export default function OrderConfirmation() {
  const location = useLocation();
  const orderData = location.state?.orderData;

  // Calculate estimated delivery date (3-5 business days from now)
  const getEstimatedDelivery = () => {
    const now = new Date();
    const deliveryDate = new Date(now);
    let businessDaysAdded = 0;
    while (businessDaysAdded < 4) {
      deliveryDate.setDate(deliveryDate.getDate() + 1);
      const day = deliveryDate.getDay();
      if (day !== 0 && day !== 6) {
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

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const orderNumber = orderData?.orderId ? `#${orderData.orderId.slice(-8).toUpperCase()}` : 'N/A';
    const orderDate = new Date().toLocaleDateString('en-PK', { year: 'numeric', month: 'long', day: 'numeric' });
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Receipt - Velora</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; color: #333; }
          .header { text-align: center; border-bottom: 2px solid #4c6ef5; padding-bottom: 15px; margin-bottom: 20px; }
          .logo { font-size: 28px; font-weight: bold; color: #4c6ef5; }
          .order-info { background: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 20px; }
          .order-row { display: flex; justify-content: space-between; margin-bottom: 8px; }
          .label { color: #666; }
          .value { font-weight: 600; }
          .delivery { background: #e7f5ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; text-align: center; }
          .delivery-title { color: #1971c2; font-weight: 600; margin-bottom: 5px; }
          .delivery-date { font-size: 18px; font-weight: bold; color: #1864ab; }
          .footer { text-align: center; margin-top: 20px; padding-top: 15px; border-top: 1px solid #ddd; color: #666; font-size: 12px; }
          .whatsapp { color: #25d366; font-weight: 600; }
          @media print { body { padding: 10px; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo">VELORA</div>
          <p style="color: #666; margin: 5px 0 0 0;">Tech Accessories & Gadgets</p>
        </div>
        
        <div class="order-info">
          <div class="order-row">
            <span class="label">Order Number:</span>
            <span class="value">${orderNumber}</span>
          </div>
          <div class="order-row">
            <span class="label">Order Date:</span>
            <span class="value">${orderDate}</span>
          </div>
          <div class="order-row">
            <span class="label">Payment Method:</span>
            <span class="value">Cash on Delivery</span>
          </div>
          <div class="order-row">
            <span class="label">Shipping:</span>
            <span class="value" style="color: #2f9e44;">Free</span>
          </div>
        </div>
        
        <div class="delivery">
          <div class="delivery-title">📦 Estimated Delivery</div>
          <div class="delivery-date">${getEstimatedDelivery()}</div>
        </div>
        
        ${orderData?.items && orderData.items.length > 0 ? `
        <div style="margin-bottom: 20px;">
          <h3 style="margin: 0 0 10px 0; font-weight: 600; border-bottom: 1px solid #ddd; padding-bottom: 8px;">Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; font-size: 13px;">
            <thead>
              <tr style="background: #f8f9fa;">
                <th style="text-align: left; padding: 8px 5px;">Item</th>
                <th style="text-align: center; padding: 8px 5px;">Qty</th>
                <th style="text-align: right; padding: 8px 5px;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${orderData.items.map((item: any) => `
                <tr style="border-bottom: 1px solid #eee;">
                  <td style="padding: 8px 5px;">${item.name || 'Product'}</td>
                  <td style="text-align: center; padding: 8px 5px;">${item.quantity}</td>
                  <td style="text-align: right; padding: 8px 5px;">Rs. ${((item.price || 0) * (item.quantity || 1)).toLocaleString()}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          <div style="margin-top: 10px; padding-top: 10px; border-top: 2px solid #4c6ef5;">
            <div class="order-row">
              <span class="label">Subtotal:</span>
              <span class="value">Rs. ${orderData.items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0).toLocaleString()}</span>
            </div>
            <div class="order-row">
              <span class="label">Shipping:</span>
              <span class="value" style="color: #2f9e44;">Free</span>
            </div>
            <div class="order-row" style="font-size: 16px; margin-top: 5px;">
              <span class="label" style="font-weight: 600;">Total:</span>
              <span class="value" style="color: #4c6ef5;">Rs. ${orderData.total?.toLocaleString() || orderData.items.reduce((sum: number, item: any) => sum + ((item.price || 0) * (item.quantity || 1)), 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
        ` : ''}
        
        <div style="background: #f0f0f0; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
          <p style="margin: 0 0 10px 0; font-weight: 600;">What's Next:</p>
          <ul style="margin: 0; padding-left: 20px; color: #555;">
            <li>Your order has been received</li>
            <li>We'll confirm via WhatsApp</li>
            <li>Free shipping on your order</li>
          </ul>
        </div>
        
        <div class="footer">
          <p>Questions? Contact us on WhatsApp:</p>
          <p class="whatsapp">+92 307 0528980</p>
          <p style="margin-top: 15px;">Thank you for shopping with Velora! ❤️</p>
        </div>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
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
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors mb-4"
        >
          <MessageCircle size={18} />
          Confirm on WhatsApp
        </a>

        {/* Print Receipt Button */}
        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-6 py-3 bg-surface-100 dark:bg-surface-800 text-surface-700 dark:text-surface-300 rounded-xl font-medium hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors mb-6 ml-0 sm:ml-3"
        >
          <Printer size={18} />
          Print Receipt
        </button>

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
