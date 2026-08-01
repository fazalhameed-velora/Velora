import React, { useState, useEffect } from 'react';
import { Cookie, X } from 'lucide-react';
import session from '../../utils/session';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = session.getCookieConsent();
    if (!consent) {
      const timer = setTimeout(() => setVisible(true), 3000);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!visible) return null;

  const handleAccept = () => {
    session.setCookieConsent('accepted');
    setVisible(false);
  };

  const handleDecline = () => {
    session.setCookieConsent('declined');
    setVisible(false);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 sm:p-6 animate-slide-up">
      <div className="max-w-4xl mx-auto bg-white dark:bg-surface-900 rounded-2xl shadow-2xl border border-surface-100 dark:border-surface-800 p-5 sm:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-primary-50 dark:bg-primary-900/20 flex items-center justify-center flex-shrink-0">
            <Cookie size={24} className="text-primary-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-base font-bold text-surface-900 dark:text-white mb-1">
              We Value Your Privacy
            </h3>
            <p className="text-sm text-surface-500 leading-relaxed">
              We use cookies to enhance your shopping experience, remember your cart and preferences,
              and analyze site traffic. By clicking "Accept", you consent to our use of cookies.
            </p>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={handleDecline}
              className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-800 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
            >
              Decline
            </button>
            <button
              onClick={handleAccept}
              className="flex-1 sm:flex-none px-4 py-2.5 text-sm font-medium text-white bg-primary-600 rounded-xl hover:bg-primary-700 transition-colors shadow-sm shadow-primary-600/25"
            >
              Accept All
            </button>
          </div>
          <button
            onClick={handleAccept}
            className="absolute top-3 right-3 sm:static p-1 text-surface-400 hover:text-surface-600 transition-colors"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
