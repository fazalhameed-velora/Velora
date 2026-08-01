import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HelmetProvider } from 'react-helmet-async';
import { ClerkProvider, SignedIn, SignedOut, SignInButton, useAuth } from '@clerk/clerk-react';
import { Toaster } from 'react-hot-toast';
import { ThemeProvider } from './contexts/ThemeContext';
import { AuthProvider } from './contexts/AuthContext';
import { CartProvider } from './contexts/CartContext';
import { WishlistProvider } from './contexts/WishlistContext';
import { RecentlyViewedProvider } from './contexts/RecentlyViewedContext';
import MainLayout from './components/layout/MainLayout';
import AdminLayout from './components/layout/AdminLayout';
import ErrorBoundary from './components/ui/ErrorBoundary';
import CookieConsent from './components/ui/CookieConsent';
import session from './utils/session';

const HomePage = lazy(() => import('./pages/home/HomePage'));
const ShopPage = lazy(() => import('./pages/shop/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/product/ProductDetailPage'));
const CartPage = lazy(() => import('./pages/cart/CartPage'));
const CheckoutPage = lazy(() => import('./pages/checkout/CheckoutPage'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const { AdminProducts, AdminCategories, AdminBrands, AdminOrders, AdminCoupons, AdminBanners, AdminUsers, AdminAnalytics } = require('./pages/admin/AdminManagement');
const { UserProfile, UserOrders, UserWishlist, UserAddresses } = require('./pages/user/UserPages');

const CLERK_PUBLISHABLE_KEY = process.env.REACT_APP_CLERK_PUBLISHABLE_KEY || '';

const queryClient = new QueryClient({
  defaultOptions: { queries: { refetchOnWindowFocus: false, retry: 1, staleTime: 5 * 60 * 1000 } },
});

function PageTracker() {
  const location = useLocation();
  useEffect(() => {
    session.trackPageView(location.pathname + location.search);
  }, [location]);
  return null;
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
        <p className="text-sm text-surface-400 font-medium">Loading...</p>
      </div>
    </div>
  );
}

function ClerkAuthCheck({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut>
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <div className="bg-white dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-800 p-8 shadow-lg">
            <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-3">Sign in Required</h2>
            <p className="text-surface-500 mb-6">Please sign in to access this page.</p>
            <SignInButton mode="modal">
              <button className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-xl font-semibold transition-colors">
                Sign In
              </button>
            </SignInButton>
            <Link to="/" className="block mt-4 text-sm text-surface-500 hover:text-primary-600 transition-colors">
              Back to Home
            </Link>
          </div>
        </div>
      </SignedOut>
    </>
  );
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  return (
    <ClerkAuthCheck>
      <AdminGuard>{children}</AdminGuard>
    </ClerkAuthCheck>
  );
}

function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, isLoaded } = useAuth();
  if (!isLoaded) return <LoadingSpinner />;
  const isAdmin = (user as any)?.publicMetadata?.role === 'admin';
  if (!isAdmin) return <Navigate to="/" />;
  return <>{children}</>;
}

function UserRoute({ children }: { children: React.ReactNode }) {
  return <ClerkAuthCheck>{children}</ClerkAuthCheck>;
}

function NotFoundPage() {
  const navigate = useNavigate();
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <h1 className="text-6xl font-extrabold text-surface-200 dark:text-surface-800 mb-4">404</h1>
        <p className="text-xl font-semibold text-surface-900 dark:text-white mb-2">Page Not Found</p>
        <p className="text-surface-500 mb-6">The page you're looking for doesn't exist.</p>
        <div className="flex gap-3">
          <button
            onClick={() => navigate(-1)}
            className="bg-surface-200 dark:bg-surface-700 text-surface-900 dark:text-white px-6 py-3 rounded-xl font-medium hover:bg-surface-300 dark:hover:bg-surface-600 transition-colors"
          >
            Go Back
          </button>
          <Link
            to="/"
            className="bg-primary-600 text-white px-6 py-3 rounded-xl font-medium hover:bg-primary-700 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}

function AppRoutes() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/shop" element={<ShopPage />} />
            <Route path="/product/:slug" element={<ProductDetailPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={
              <UserRoute><CheckoutPage /></UserRoute>
            } />

            <Route path="/user/profile" element={<UserRoute><UserProfile /></UserRoute>} />
            <Route path="/user/orders" element={<UserRoute><UserOrders /></UserRoute>} />
            <Route path="/user/wishlist" element={<UserRoute><UserWishlist /></UserRoute>} />
            <Route path="/user/addresses" element={<UserRoute><UserAddresses /></UserRoute>} />
          </Route>

          <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="products" element={<AdminProducts />} />
            <Route path="categories" element={<AdminCategories />} />
            <Route path="brands" element={<AdminBrands />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="banners" element={<AdminBanners />} />
            <Route path="coupons" element={<AdminCoupons />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="analytics" element={<AdminAnalytics />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

function App() {
  if (!CLERK_PUBLISHABLE_KEY) {
    console.error('Missing REACT_APP_CLERK_PUBLISHABLE_KEY');
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <ClerkProvider publishableKey={CLERK_PUBLISHABLE_KEY}>
            <AuthProvider>
              <CartProvider>
                <WishlistProvider>
                  <RecentlyViewedProvider>
                    <BrowserRouter>
                      <PageTracker />
                      <AppRoutes />
                      <CookieConsent />
                      <Toaster
                        position="top-right"
                        toastOptions={{
                          duration: 3000,
                          style: {
                            background: 'transparent',
                            boxShadow: 'none',
                            padding: 0,
                          },
                        }}
                      />
                    </BrowserRouter>
                  </RecentlyViewedProvider>
                </WishlistProvider>
              </CartProvider>
            </AuthProvider>
          </ClerkProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  );
}

export default App;
