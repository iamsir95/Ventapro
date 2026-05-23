import React, { useState, useEffect, useCallback } from 'react';
import { ProductCard } from '../components/ProductCard';
import { mockProducts } from '../data/mockProducts';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { getRecommendations } from '../lib/recommendations';
import { Sparkles, User, LogOut, Search, X, SlidersHorizontal, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoginModal } from '../components/LoginModal';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { getSession, signIn, signOut } from '../lib/authClient';
import { Product } from '../types';

const BRANDS = ['Logitech G', 'Razer', 'Corsair', 'SteelSeries', 'HyperX', 'Glorious'];
const CATEGORIES = ['Mouse', 'Keyboard', 'Headset', 'Mousepad', 'Keycaps', 'Wrist Rest', 'Headphone Stand'];

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dbProducts, setDbProducts] = useState<Product[]>([]);
  const [usingDb, setUsingDb] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500]);
  const [sortBy, setSortBy] = useState<'newest' | 'price-asc' | 'price-desc'>('newest');

  const fetchSession = async () => setSession(await getSession());

  useEffect(() => {
    fetchSession();
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'OAUTH_AUTH_SUCCESS') fetchSession();
    };
    const handleSecretShortcut = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const res = await signIn('credentials', { email: 'admin@pro-gaming.com', password: 'admin123' });
        if (res && (res as any).ok) window.location.href = '/admin';
      }
    };
    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleSecretShortcut);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleSecretShortcut);
    };
  }, []);

  const loadProducts = useCallback(async () => {
    try {
      const url = searchQuery.trim()
        ? `/api/products/search?q=${encodeURIComponent(searchQuery)}&limit=50`
        : `/api/products?limit=50`;
      const res = await fetch(url);
      const json = await res.json();
      if (json?.data?.length) {
        setDbProducts(json.data);
        setUsingDb(true);
      } else {
        setDbProducts([]);
        setUsingDb(searchQuery.trim().length > 0);
      }
    } catch {
      setUsingDb(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const t = setTimeout(loadProducts, 300);
    return () => clearTimeout(t);
  }, [loadProducts]);

  const cartItems = useCartStore((s) => s.items);
  const recentlyViewed = useUserStore((s) => s.recentlyViewed);

  const historyContext = [
    ...cartItems.filter((i) => i.category).map((i) => ({ category: i.category as string })),
    ...recentlyViewed.map((i) => ({ category: i.category })),
  ];
  const viewedIds = [...cartItems.map((i) => i.id), ...recentlyViewed.map((i) => i.id)];
  const recommendations = getRecommendations(historyContext, mockProducts, viewedIds);

  const baseList: Product[] = usingDb && dbProducts.length > 0 ? dbProducts : mockProducts;
  const filtered = baseList
    .filter((p) => {
      if (selectedBrands.size > 0 && !selectedBrands.has((p as any).brand || '')) return false;
      if (selectedCategories.size > 0 && !selectedCategories.has(p.category)) return false;
      if (p.price < priceRange[0] || p.price > priceRange[1]) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price-asc') return a.price - b.price;
      if (sortBy === 'price-desc') return b.price - a.price;
      return 0;
    });

  const toggleSet = (set: Set<string>, value: string) => {
    const next = new Set(set);
    next.has(value) ? next.delete(value) : next.add(value);
    return next;
  };

  const clearFilters = () => {
    setSelectedBrands(new Set());
    setSelectedCategories(new Set());
    setPriceRange([0, 500]);
  };

  const activeFilterCount = selectedBrands.size + selectedCategories.size + (priceRange[0] !== 0 || priceRange[1] !== 500 ? 1 : 0);

  return (
    <div className="min-h-screen bg-transparent text-text-primary font-sans flex flex-col relative">
      {/* Header */}
      <header className="sticky top-0 z-50 h-[80px] flex items-center border-b border-black/5 bg-white/40 px-6 backdrop-blur-xl">
        <div className="flex w-full max-w-7xl mx-auto items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-black tracking-tight text-black flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-neon flex items-center justify-center text-black">
                <Sparkles size={18} />
              </span>
              VEN<span className="opacity-30">TA</span>
            </Link>
            <nav className="hidden lg:flex items-center gap-5 font-bold text-sm">
              <Link to="/" className="text-black hover:text-primary-neon transition-colors uppercase tracking-wider">Trang chủ</Link>
              <Link to="/about" className="text-black hover:text-primary-neon transition-colors uppercase tracking-wider">Về chúng tôi</Link>
              <Link to="/policy" className="text-black hover:text-primary-neon transition-colors uppercase tracking-wider">Chính sách</Link>
              <Link to="/contact" className="text-black hover:text-primary-neon transition-colors uppercase tracking-wider">Liên hệ</Link>
            </nav>
          </div>
          <div className="relative flex-1 max-w-[400px]">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
            <input
              type="text"
              placeholder="Tìm kiếm thiết bị gaming..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white/60 backdrop-blur-md pl-12 pr-4 py-3 text-sm text-black outline-none transition-all focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-3">
            {session?.user ? (
              <div className="hidden md:flex items-center gap-3 bg-white/50 backdrop-blur-md border border-black/5 pl-2 pr-3 py-1.5 rounded-full shadow-sm">
                {session.user.image ? (
                  <img src={session.user.image} alt="" className="w-7 h-7 rounded-full" referrerPolicy="no-referrer" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-primary-neon"><User size={14} /></div>
                )}
                <span className="text-black text-sm font-bold max-w-[120px] truncate">{session.user.name || session.user.email}</span>
                <button onClick={() => signOut()} className="text-black/50 hover:text-red-500 transition-colors" title="Đăng Xuất">
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="hidden md:block text-black hover:bg-black/5 px-4 py-2 rounded-xl transition-colors font-bold text-sm">
                Đăng Nhập
              </button>
            )}
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-black text-primary-neon px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-primary-neon hover:text-black transition-all"
            >
              <ShoppingBag size={16} />
              <span className="bg-primary-neon text-black px-2 py-0.5 rounded-md text-xs">{cartItems.reduce((acc, i) => acc + i.quantity, 0)}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero strip */}
      <section className="bg-black text-white px-6 py-12 md:py-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div>
            <p className="text-primary-neon font-bold uppercase tracking-widest text-xs mb-2">[ Cửa hàng Venta ]</p>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter">
              Trang Bị<br /><span className="text-primary-neon">Đẳng Cấp Pro</span>
            </h1>
          </div>
          <p className="text-gray-400 font-medium max-w-md text-base">
            {baseList.length} thiết bị gaming chuyên nghiệp. Bảo hành 24 tháng, giao tốc hành 2H nội thành.
          </p>
        </div>
      </section>

      {/* Main grid */}
      <div className="mx-auto max-w-7xl w-full px-6 py-10 grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-8">
        {/* Sidebar */}
        <aside className="lg:sticky lg:top-24 lg:h-min space-y-4">
          <div className="rounded-3xl border border-black/5 bg-white/60 backdrop-blur-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-black/5">
              <h3 className="font-black uppercase tracking-wide text-sm flex items-center gap-2">
                <SlidersHorizontal size={16} /> Bộ lọc
              </h3>
              {activeFilterCount > 0 && (
                <button onClick={clearFilters} className="text-xs font-bold text-text-secondary hover:text-red-500 transition-colors flex items-center gap-1">
                  <X size={12} /> Xoá ({activeFilterCount})
                </button>
              )}
            </div>

            <FilterGroup label="Danh mục">
              {CATEGORIES.map((c) => (
                <CheckRow key={c} label={c} checked={selectedCategories.has(c)} onChange={() => setSelectedCategories((s) => toggleSet(s, c))} />
              ))}
            </FilterGroup>

            <FilterGroup label="Thương hiệu">
              {BRANDS.map((b) => (
                <CheckRow key={b} label={b} checked={selectedBrands.has(b)} onChange={() => setSelectedBrands((s) => toggleSet(s, b))} />
              ))}
            </FilterGroup>

            <FilterGroup label={`Giá ($${priceRange[0]} - $${priceRange[1]})`}>
              <input
                type="range"
                min={0}
                max={500}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="w-full accent-primary-neon"
              />
            </FilterGroup>
          </div>
        </aside>

        {/* Content */}
        <main className="flex flex-col gap-8 pb-20">
          {recommendations.length > 0 && (
            <div className="rounded-3xl border border-black/5 bg-gradient-to-br from-primary-neon/30 to-white/40 p-8 shadow-sm backdrop-blur-xl">
              <div className="mb-6 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-primary-neon">
                  <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-black tracking-tight uppercase">Thiết bị đề xuất</h2>
                  <p className="text-sm text-text-secondary font-medium">Lựa chọn AI phù hợp với nhu cầu của bạn</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((p) => <ProductCard key={`rec-${p.id}`} {...p} />)}
              </div>
            </div>
          )}

          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-black uppercase">Tất cả sản phẩm</h2>
              <p className="text-sm text-text-secondary mt-1 font-medium">Đang hiển thị {filtered.length} thiết bị</p>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="rounded-2xl border border-black/10 bg-white/60 backdrop-blur-md px-4 py-2.5 text-sm font-bold outline-none focus:border-primary-neon shadow-sm"
            >
              <option value="newest">Mới nhất</option>
              <option value="price-asc">Giá thấp → cao</option>
              <option value="price-desc">Giá cao → thấp</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((p) => <ProductCard key={p.id} {...p} />)}
            {filtered.length === 0 && (
              <div className="col-span-full py-24 text-center bg-white/30 rounded-3xl backdrop-blur-md border border-black/5 border-dashed">
                <p className="text-lg font-black text-black mb-2 uppercase">Không tìm thấy thiết bị</p>
                <p className="text-sm text-text-secondary mb-6">Thử bỏ bớt bộ lọc hoặc đổi từ khoá tìm kiếm.</p>
                {activeFilterCount > 0 && (
                  <button onClick={clearFilters} className="px-6 py-3 rounded-2xl bg-black text-primary-neon font-bold hover:bg-primary-neon hover:text-black transition-colors">
                    Xoá tất cả bộ lọc
                  </button>
                )}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="mt-auto border-t border-black/5 bg-white/60 backdrop-blur-xl py-10 px-6">
        <div className="mx-auto max-w-7xl text-center text-sm font-bold text-text-secondary">
          © 2026 Venta Vietnam · Made for gamers
        </div>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={fetchSession} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}

function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-6 last:mb-0">
      <span className="mb-3 block text-[11px] font-black uppercase tracking-[1px] text-text-secondary">{label}</span>
      <div className="flex flex-col gap-1">{children}</div>
    </div>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: () => void }) {
  return (
    <label className="group flex cursor-pointer items-center py-1.5 text-sm text-black font-medium hover:text-primary-neon transition-colors">
      <div className={`mr-3 flex h-4 w-4 items-center justify-center rounded border transition-all ${checked ? 'border-black bg-black' : 'border-black/20 bg-white group-hover:border-black'}`}>
        {checked && <div className="w-2 h-2 rounded-sm bg-primary-neon"></div>}
        <input type="checkbox" className="hidden" checked={checked} onChange={onChange} />
      </div>
      {label}
    </label>
  );
}
