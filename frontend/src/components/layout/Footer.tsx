import React from 'react';
import { Link } from 'react-router-dom';
import { Package, Mail, Phone, MapPin, ArrowRight } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-surface-950 text-surface-300">
      {/* Newsletter */}
      <div className="border-b border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Stay Updated</h3>
              <p className="text-surface-400 text-sm">Get the latest deals and new arrivals in your inbox.</p>
            </div>
            <div className="flex w-full md:w-auto">
              <input type="email" placeholder="Enter your email" className="flex-1 md:w-72 h-10 px-4 rounded-l-xl bg-surface-800 border border-surface-700 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 placeholder:text-surface-500" />
              <button className="h-10 px-5 bg-primary-600 text-white rounded-r-xl font-medium text-sm hover:bg-primary-700 transition-colors flex items-center gap-1.5">
                Subscribe <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center group">
  <img
    src="/logo512.png"
    alt="Velora"
    className="w-9 h-9 object-contain rounded-xl transition-transform duration-200 group-hover:scale-105"
  />

  <span className="text-xl font-bold text-white">elora</span>
</Link>
            <p className="text-sm text-surface-400 mb-4">Your one-stop shop for the latest tech accessories and gadgets.</p>
            <div className="flex flex-col gap-2 text-sm text-surface-400">
              <div className="flex items-center gap-2"><Phone size={14} /> +92 312 456789</div>
              <div className="flex items-center gap-2"><Mail size={14} /> velora@gmail.com</div>
              <div className="flex items-center gap-2"><MapPin size={14} /> Karachi, Pakistan</div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold text-white mb-4">Quick Links</h4>
            <div className="flex flex-col gap-2.5">
              {['/shop', '/shop?isFeatured=true', '/shop?isNewArrival=true', '/shop?isBestSeller=true'].map((to, i) => (
                <Link key={to} to={to} className="text-sm text-surface-400 hover:text-white transition-colors">
                  {['Shop All', 'Featured', 'New Arrivals', 'Best Sellers'][i]}
                </Link>
              ))}
            </div>
          </div>

          {/* Categories */}
          <div>
            <h4 className="font-semibold text-white mb-4">Categories</h4>
            <div className="flex flex-col gap-2.5">
              {['Mobile Phones', 'Earbuds', 'Headphones', 'Chargers', 'Power Banks', 'Covers'].map(cat => (
                <Link key={cat} to={`/shop?category=${cat.toLowerCase().replace(/ /g, '-')}`} className="text-sm text-surface-400 hover:text-white transition-colors">
                  {cat}
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <h4 className="font-semibold text-white mb-4">Support</h4>
            <div className="flex flex-col gap-2.5">
              {['FAQ', 'Shipping Policy', 'Return Policy', 'Privacy Policy', 'Terms of Service'].map(item => (
                <span key={item} className="text-sm text-surface-400 hover:text-white transition-colors cursor-pointer">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-surface-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-sm text-surface-500">© {currentYear} Velora. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
