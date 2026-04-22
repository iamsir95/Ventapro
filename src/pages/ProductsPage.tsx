import React, { useState, useEffect } from 'react';
import { SidebarFilter } from '../components/SidebarFilter';
import { ProductCard } from '../components/ProductCard';
import { mockProducts } from '../data/mockProducts';
import { useCartStore } from '../store/cartStore';
import { useUserStore } from '../store/userStore';
import { getRecommendations } from '../lib/recommendations';
import { Sparkles, User, LogOut, ShieldAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LoginModal } from '../components/LoginModal';
import { CartDrawer } from '../components/CartDrawer';
import { CheckoutModal } from '../components/CheckoutModal';
import { getSession, signIn, signOut } from '../lib/authClient';
import { AdminProductForm } from '../components/AdminProductForm';

export default function ProductsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [dbProducts, setDbProducts] = useState<any[]>([]); // Data from API
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [session, setSession] = useState<any>(null);

  const fetchSession = async () => {
    const s = await getSession();
    setSession(s);
  };

  useEffect(() => {
    fetchSession();
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === 'OAUTH_AUTH_SUCCESS') {
        fetchSession();
      }
    };
    
    // Secret Admin Login Shortcut (Ctrl + Shift + A or Cmd + Shift + A)
    const handleSecretShortcut = async (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const res = await signIn('credentials', { email: 'admin@pro-gaming.com', password: 'admin123' });
        if (res && res.ok) {
          window.location.href = '/admin';
        }
      }
    };

    window.addEventListener('message', handleMessage);
    window.addEventListener('keydown', handleSecretShortcut);
    return () => {
      window.removeEventListener('message', handleMessage);
      window.removeEventListener('keydown', handleSecretShortcut);
    };
  }, []);

  // Use Debounce for API Search calls
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery.trim().length > 0) {
        fetch(`/api/products/search?q=${encodeURIComponent(searchQuery)}`)
          .then(res => res.json())
          .then(data => {
            if (data && data.data) {
              setDbProducts(data.data);
            }
          })
          .catch(err => console.error("Search API Error:", err));
      } else {
        setDbProducts([]);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);
  
  const cartItems = useCartStore(state => state.items);
  const recentlyViewed = useUserStore(state => state.recentlyViewed);
  
  // Combine user activity context to feed the recommendation engine
  const historyContext = [
    ...cartItems.filter((i) => i.category).map((i) => ({ category: i.category as string })),
    ...recentlyViewed.map((i) => ({ category: i.category })),
  ];
  const viewedIds = [...cartItems.map(i => i.id), ...recentlyViewed.map(i => i.id)];
  
  const recommendations = getRecommendations(historyContext, mockProducts, viewedIds);

  // If we have DB products from search, display them, otherwise show mock default array
  const filteredProducts = searchQuery ? (dbProducts.length > 0 ? dbProducts : []) : mockProducts;

  return (
    <div className="min-h-screen bg-transparent text-text-primary font-sans flex flex-col relative">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 h-[80px] flex items-center justify-between border-b border-black/5 bg-white/40 px-10 backdrop-blur-xl">
        <div className="flex w-full max-w-7xl mx-auto items-center justify-between gap-8">
          <div className="flex items-center gap-6">
            <Link to="/" className="text-2xl font-black tracking-tight text-black flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-primary-neon flex items-center justify-center text-black">
               <Sparkles size={18} />
              </span>
              VEN<span className="opacity-30">TA</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 font-bold text-sm ml-4">
              <Link to="/" className="text-black hover:text-black/60 transition-colors uppercase tracking-[1px]">Trang chủ</Link>
              <Link to="/about" className="text-black hover:text-black/60 transition-colors uppercase tracking-[1px]">Về chúng tôi</Link>
              <Link to="/policy" className="text-black hover:text-black/60 transition-colors uppercase tracking-[1px]">Chính sách</Link>
              <Link to="/contact" className="text-black hover:text-black/60 transition-colors uppercase tracking-[1px]">Liên hệ</Link>
            </nav>
          </div>
          <div className="relative flex-1 max-w-[400px]">
            <input 
              type="text" 
              placeholder="Tìm kiếm thiết bị gaming..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-black/10 bg-white/60 backdrop-blur-md px-5 py-3 text-sm text-black outline-none transition-all focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm font-medium"
            />
          </div>
          <div className="flex items-center gap-5 text-sm font-medium">
            {session?.user ? (
              <div className="flex items-center gap-4 bg-white/50 backdrop-blur-md border border-black/5 pl-2 pr-4 py-1.5 rounded-full shadow-sm">
                <span className="text-black flex items-center gap-2 text-sm font-bold">
                  {session.user.image ? (
                    <img src={session.user.image} alt="Avatar" className="w-7 h-7 rounded-full border border-black/10" referrerPolicy="no-referrer" />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-black flex items-center justify-center text-primary-neon"><User size={14} /></div>
                  )}
                  {session.user.name || session.user.email}
                </span>
                <button onClick={() => signOut()} className="text-black/50 hover:text-red-500 transition-colors ml-2" title="Đăng Xuất">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button onClick={() => setIsLoginOpen(true)} className="text-black hover:bg-black/5 px-4 py-2 rounded-xl transition-colors font-semibold">
                Đăng Nhập
              </button>
            )}
            <button 
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 bg-black text-primary-neon px-5 py-2.5 rounded-xl font-bold shadow-md hover:bg-black/80 transition-all hover:-translate-y-0.5"
            >
              Giỏ hàng <span className="bg-primary-neon text-black px-2 py-0.5 rounded-md text-xs">{cartItems.reduce((acc, item) => acc + item.quantity, 0)}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="mx-auto flex max-w-7xl w-full flex-1 md:grid md:grid-cols-[260px_1fr] pt-8 gap-8 px-4 md:px-0">
        <SidebarFilter />
        
        <main className="flex flex-col gap-8 pb-20">
          {recommendations.length > 0 && (
            <div className="mb-2 rounded-3xl border border-black/5 bg-white/40 p-8 shadow-sm backdrop-blur-xl">
              <div className="mb-8 flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-primary-neon flex items-center justify-center text-black">
                 <Sparkles size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-black tracking-tight uppercase">
                    Thiết bị đề xuất
                  </h2>
                  <p className="text-sm text-text-secondary font-medium">Lựa chọn AI phù hợp với nhu cầu của bạn</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendations.map((product) => (
                  <ProductCard key={`rec-${product.id}`} {...product} />
                ))}
              </div>
            </div>
          )}

          <div className="flex items-end justify-between mt-4 mb-2 px-2">
            <div>
              <h2 className="text-3xl font-black tracking-tight text-black uppercase">
                Tất Cả Sản Phẩm
              </h2>
              <p className="text-sm text-text-secondary mt-1 font-medium">
                Đang hiển thị {filteredProducts.length} sản phẩm
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} {...product} />
            ))}
            {filteredProducts.length === 0 && (
              <div className="col-span-full py-32 text-center text-text-secondary bg-white/30 rounded-3xl backdrop-blur-md border border-black/5 border-dashed">
                <p className="text-lg font-bold text-black mb-2">Không tìm thấy thiết bị phù hợp.</p>
                <p className="text-sm">Thử thay đổi từ khoá tìm kiếm của bạn.</p>
              </div>
            )}
          </div>
        </main>
      </div>
      
      {/* Footer */}
      <footer className="mt-auto border-t border-black/5 bg-white/60 backdrop-blur-xl py-12">
        <div className="mx-auto max-w-7xl px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <a href="/" className="text-2xl font-black tracking-tight text-black flex items-center gap-2 mb-4">
              <span className="w-8 h-8 rounded-lg bg-primary-neon flex items-center justify-center text-black">
               <Sparkles size={18} />
              </span>
              VEN<span className="opacity-30">TA</span>
            </a>
            <p className="text-sm text-text-secondary font-medium max-w-sm mb-6 leading-relaxed">
              Venta là nhà cung cấp thiết bị chuyên các dòng sản phẩm về game thủ, cosplay, decor, gear cao cấp số 1 Việt Nam. Chúng tôi đồng hành cùng cộng đồng game thủ trong hành trình chinh phục những đỉnh cao mới.
            </p>
            <div className="text-sm font-bold text-black">© 2026 Venta Vietnam. All rights reserved.</div>
          </div>
          <div>
            <h4 className="font-bold text-black uppercase tracking-[1px] mb-4">Khám phá</h4>
            <ul className="flex flex-col gap-2 text-sm font-medium text-text-secondary">
              <li><a href="/" className="hover:text-primary-neon hover:text-black transition-colors">Tất cả sản phẩm</a></li>
              <li><a href="/about" className="hover:text-primary-neon hover:text-black transition-colors">Về chúng tôi</a></li>
              <li><a href="/policy" className="hover:text-primary-neon hover:text-black transition-colors">Theo dõi đơn hàng</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-bold text-black uppercase tracking-[1px] mb-4">Hỗ trợ</h4>
            <ul className="flex flex-col gap-2 text-sm font-medium text-text-secondary">
              <li><a href="/policy" className="hover:text-primary-neon hover:text-black transition-colors">Chính sách bảo hành</a></li>
              <li><a href="/policy" className="hover:text-primary-neon hover:text-black transition-colors">Chính sách đổi trả</a></li>
              <li><a href="/contact" className="hover:text-primary-neon hover:text-black transition-colors">Liên hệ / CSKH</a></li>
            </ul>
          </div>
        </div>
      </footer>

      <LoginModal isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} onLoginSuccess={fetchSession} />
      <CartDrawer isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} onCheckout={() => setIsCheckoutOpen(true)} />
      <CheckoutModal isOpen={isCheckoutOpen} onClose={() => setIsCheckoutOpen(false)} />
    </div>
  );
}
