import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Search, ShoppingCart, Heart, User, Menu, X, Sun, Moon, Package, LogOut, ChevronDown } from 'lucide-react';
import { SignInButton, SignedIn, SignedOut, useUser, useClerk } from '@clerk/clerk-react';
import { useTheme } from '../../contexts/ThemeContext';
import { useCart } from '../../contexts/CartContext';
import { useAuth } from '../../contexts/AuthContext';
import { searchAPI } from '../../services/api';
import { cn } from '../../utils';

export default function Header() {
  const { resolvedTheme, setTheme } = useTheme();
  const { itemCount } = useCart();
  const { user: authUser, logout: authLogout } = useAuth();
  const { user: clerkUser, isSignedIn } = useUser();
  const { signOut } = useClerk();
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearch, setShowSearch] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [userMenu, setUserMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMobileMenu(false);
    setShowSearch(false);
    setUserMenu(false);
  }, [location]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setShowSearch(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenu(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = (q: string) => {
    setSearchQuery(q);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (q.length < 2) { setSearchResults([]); return; }
    searchTimeout.current = setTimeout(async () => {
      try {
        const res: any = await searchAPI.autocomplete(q);
        setSearchResults(res.data || []);
      } catch { setSearchResults([]); }
    }, 300);
  };

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/shop?isTrending=true', label: 'Trending' },
    { to: '/shop?isNewArrival=true', label: 'New Arrivals' },
    { to: '/shop?isBestSeller=true', label: 'Best Sellers' },
  ];

  const handleLogout = async () => {
    authLogout();
    await signOut();
    setUserMenu(false);
  };

  const displayName = clerkUser?.fullName || clerkUser?.firstName || authUser?.name || 'Account';
  const displayEmail = clerkUser?.emailAddresses?.[0]?.emailAddress || authUser?.email || '';
  const displayAvatar = clerkUser?.imageUrl;
  const isAdmin = (clerkUser as any)?.publicMetadata?.role === 'admin' || authUser?.role === 'admin';

  return (
    <>
      <header className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        scrolled
          ? 'bg-white/90 dark:bg-surface-950/90 backdrop-blur-xl shadow-lg shadow-black/5 dark:shadow-black/20'
          : 'bg-white/60 dark:bg-surface-950/60 backdrop-blur-md'
      )}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16 lg:h-18">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
  <img
    src="/logo512.png"
    alt="Velora"
    className="w-9 h-9 object-contain rounded-xl transition-transform duration-200 group-hover:scale-105"
  />

  <span className="text-xl font-extrabold tracking-tight">
    <span className="bg-gradient-to-r from-primary-600 via-primary-500 to-primary-700 bg-clip-text text-transparent">
      Velo
    </span>
    <span className="text-surface-900 dark:text-white">ra</span>
  </span>
</Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-0.5">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={cn(
                    'px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200',
                    location.pathname === link.to && location.search === new URL(link.to, 'http://localhost').search
                      ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20 dark:text-primary-400'
                      : 'text-surface-600 hover:text-surface-900 hover:bg-surface-100 dark:text-surface-400 dark:hover:text-white dark:hover:bg-surface-800/60'
                  )}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Right Side */}
            <div className="flex items-center gap-1.5">
              {/* Search */}
              <div ref={searchRef} className="relative hidden sm:block">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => searchQuery.length >= 2 && setShowSearch(true)}
                    placeholder="Search products..."
                    className="w-48 lg:w-64 h-9 pl-9 pr-3 rounded-xl bg-surface-100 dark:bg-surface-800/80 text-sm border border-surface-200 dark:border-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-surface-900 dark:text-white placeholder:text-surface-400 transition-all"
                  />
                </div>
                {showSearch && searchResults.length > 0 && (
                  <div className="absolute top-full mt-2 w-full bg-white dark:bg-surface-900 rounded-xl shadow-xl border border-surface-100 dark:border-surface-800 overflow-hidden z-50">
                    {searchResults.map((p: any) => (
                      <Link key={p._id} to={`/product/${p.slug}`} className="flex items-center gap-3 p-3 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors" onClick={() => { setSearchQuery(''); setShowSearch(false); }}>
                        <img src={p.images?.[0]?.url || ''} alt="" className="w-10 h-10 rounded-lg object-cover" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-surface-900 dark:text-white truncate">{p.name}</p>
                          <p className="text-xs text-surface-500">Rs. {p.price?.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Theme Toggle */}
              <button
                onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200"
                aria-label="Toggle theme"
              >
                {resolvedTheme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* Wishlist - only for signed in users */}
              <SignedIn>
                <Link to="/user/wishlist" className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 relative hidden sm:flex">
                  <Heart size={18} />
                </Link>
              </SignedIn>

              {/* Cart */}
              <Link to="/cart" className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 relative">
                <ShoppingCart size={18} />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-primary-600 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center ring-2 ring-white dark:ring-surface-950">
                    {itemCount > 99 ? '99+' : itemCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative" ref={userMenuRef}>
                <SignedOut>
                  <SignInButton mode="modal">
                    <button className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium transition-colors shadow-sm shadow-primary-600/25 hover:shadow-primary-600/40">
                      <User size={16} />
                      <span className="hidden sm:inline">Sign In</span>
                    </button>
                  </SignInButton>
                </SignedOut>

                <SignedIn>
                  <button
                    onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 transition-colors"
                  >
                    {displayAvatar ? (
                      <img src={displayAvatar} alt="" className="w-8 h-8 rounded-lg object-cover ring-2 ring-surface-200 dark:ring-surface-700" />
                    ) : (
                      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white text-sm font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                    )}
                    <ChevronDown size={14} className={cn('text-surface-400 transition-transform hidden sm:block', userMenu && 'rotate-180')} />
                  </button>
                </SignedIn>

                {userMenu && isSignedIn && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white dark:bg-surface-900 rounded-2xl shadow-xl border border-surface-100 dark:border-surface-800 overflow-hidden z-50">
                    <div className="p-4 border-b border-surface-100 dark:border-surface-800">
                      <div className="flex items-center gap-3">
                        {displayAvatar ? (
                          <img src={displayAvatar} alt="" className="w-10 h-10 rounded-xl object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center text-white font-bold">
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-surface-900 dark:text-white truncate">{displayName}</p>
                          <p className="text-xs text-surface-500 truncate">{displayEmail}</p>
                        </div>
                      </div>
                    </div>
                    <div className="py-1">
                      <Link to="/user/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors" onClick={() => setUserMenu(false)}>
                        <User size={16} /> Profile
                      </Link>
                      <Link to="/user/orders" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors" onClick={() => setUserMenu(false)}>
                        <Package size={16} /> Orders
                      </Link>
                      <Link to="/user/wishlist" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors" onClick={() => setUserMenu(false)}>
                        <Heart size={16} /> Wishlist
                      </Link>
                      {isAdmin && (
                        <Link to="/admin" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors font-medium" onClick={() => setUserMenu(false)}>
                          Admin Dashboard
                        </Link>
                      )}
                    </div>
                    <div className="border-t border-surface-100 dark:border-surface-800 py-1">
                      <button onClick={handleLogout} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors">
                        <LogOut size={16} /> Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <button onClick={() => setMobileMenu(!mobileMenu)} className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-800 lg:hidden transition-colors text-surface-500 dark:text-surface-400">
                {mobileMenu ? <X size={20} /> : <Menu size={20} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenu && (
          <div className="lg:hidden border-t border-surface-100 dark:border-surface-800 bg-white/95 dark:bg-surface-950/95 backdrop-blur-xl">
            <div className="px-4 py-4 space-y-1">
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-surface-400" size={16} />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full h-11 pl-9 pr-3 rounded-xl bg-surface-100 dark:bg-surface-800 text-sm border border-surface-200 dark:border-surface-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              {navLinks.map(link => (
                <Link key={link.to} to={link.to} className={cn(
                  'block px-4 py-3 rounded-xl text-sm font-medium transition-colors',
                  location.pathname === link.to
                    ? 'text-primary-600 bg-primary-50 dark:bg-primary-900/20'
                    : 'text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800'
                )}>
                  {link.label}
                </Link>
              ))}
              <SignedIn>
                <Link to="/user/orders" className="block px-4 py-3 rounded-xl text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800">
                  My Orders
                </Link>
              </SignedIn>
            </div>
          </div>
        )}
      </header>
      <div className="h-16 lg:h-18" />
    </>
  );
}
