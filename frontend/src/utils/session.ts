const SESSION_PREFIX = 'velora_';
const SESSION_DURATION = 30 * 24 * 60 * 60 * 1000;

interface SessionData {
  value: any;
  expires: number;
  createdAt: number;
}

export const session = {
  set(key: string, value: any, days: number = 30): void {
    const data: SessionData = {
      value,
      expires: Date.now() + days * 24 * 60 * 60 * 1000,
      createdAt: Date.now(),
    };
    localStorage.setItem(SESSION_PREFIX + key, JSON.stringify(data));
    document.cookie = `${SESSION_PREFIX + key}=1; path=/; max-age=${days * 24 * 60 * 60}; SameSite=Lax`;
  },

  get<T = any>(key: string): T | null {
    try {
      const raw = localStorage.getItem(SESSION_PREFIX + key);
      if (!raw) return null;
      const data: SessionData = JSON.parse(raw);
      if (Date.now() > data.expires) {
        this.remove(key);
        return null;
      }
      return data.value as T;
    } catch {
      return null;
    }
  },

  remove(key: string): void {
    localStorage.removeItem(SESSION_PREFIX + key);
    document.cookie = `${SESSION_PREFIX + key}=; path=/; max-age=0`;
  },

  exists(key: string): boolean {
    return this.get(key) !== null;
  },

  clear(): void {
    const keys = Object.keys(localStorage).filter(k => k.startsWith(SESSION_PREFIX));
    keys.forEach(k => {
      localStorage.removeItem(k);
      document.cookie = `${k}=; path=/; max-age=0`;
    });
  },

  getSessionId(): string {
    let id = this.get<string>('session_id');
    if (!id) {
      id = 'sess_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
      this.set('session_id', id, 30);
    }
    return id;
  },

  getVisitorId(): string {
    let id = this.get<string>('visitor_id');
    if (!id) {
      id = 'vis_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 12);
      this.set('visitor_id', id, 365);
    }
    return id;
  },

  trackPageView(path: string): void {
    const history = this.get<string[]>('page_history') || [];
    const entry = { path, timestamp: Date.now() };
    const updated = [JSON.stringify(entry), ...history.filter(h => {
      const p = JSON.parse(h);
      return p.path !== path;
    })].slice(0, 20);
    this.set('page_history', updated, 7);
  },

  getRecentlyVisited(): string[] {
    const history = this.get<string[]>('page_history') || [];
    return history.map(h => JSON.parse(h).path);
  },

  setCookieConsent(consent: 'accepted' | 'declined'): void {
    this.set('cookie_consent', consent, 365);
  },

  getCookieConsent(): 'accepted' | 'declined' | null {
    return this.get<'accepted' | 'declined'>('cookie_consent');
  },

  trackAddToCart(productId: string): void {
    const events = this.get<string[]>('cart_events') || [];
    events.push(JSON.stringify({ productId, timestamp: Date.now() }));
    this.set('cart_events', events.slice(-50), 30);
  },

  trackSearch(query: string): void {
    const searches = this.get<string[]>('search_history') || [];
    if (!searches.includes(query)) {
      searches.unshift(query);
      this.set('search_history', searches.slice(0, 10), 30);
    }
  },

  getSearchHistory(): string[] {
    return this.get<string[]>('search_history') || [];
  },
};

export default session;
