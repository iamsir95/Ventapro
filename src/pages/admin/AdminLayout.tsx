import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { getSession, signIn, signOut } from '../../lib/authClient';
import { LayoutDashboard, Package, ShoppingBag, Users, LogOut, ShieldAlert, Store } from 'lucide-react';

const NAV = [
  { to: '/admin', end: true, label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/admin/products', label: 'Sản phẩm', icon: Package },
  { to: '/admin/orders', label: 'Đơn hàng', icon: ShoppingBag },
  { to: '/admin/users', label: 'Khách hàng', icon: Users },
];

export default function AdminLayout() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    getSession().then((s) => {
      setSession(s);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center font-sans">
        <div className="font-bold uppercase tracking-widest text-text-secondary">Đang xác thực...</div>
      </div>
    );
  }

  if (!session?.user || session.user.email !== 'admin@pro-gaming.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg text-text-primary p-4 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-neon/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-[2rem] p-10 max-w-md w-full shadow-2xl relative z-10 flex flex-col">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ShieldAlert className="w-8 h-8 text-primary-neon" />
            </div>
            <h1 className="text-3xl font-black mb-2 text-black tracking-tight uppercase">Quản Trị Hệ Thống</h1>
            <p className="text-text-secondary font-medium">Bảo mật nội bộ Venta Vietnam</p>
          </div>

          {authError && (
            <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm font-bold text-red-700">
              {authError}
            </div>
          )}

          <form
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              setAuthError('');
              const fd = new FormData(e.currentTarget);
              const res = await signIn('credentials', { email: fd.get('email'), password: fd.get('password') });
              if (res && (res as any).ok) {
                const fresh = await getSession();
                setSession(fresh);
              } else {
                setAuthError('Thông tin đăng nhập không chính xác.');
              }
            }}
          >
            <input
              name="email"
              type="email"
              placeholder="Email quản trị"
              required
              defaultValue="admin@pro-gaming.com"
              className="w-full rounded-2xl border border-black/10 bg-white p-4 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm"
            />
            <input
              name="password"
              type="password"
              placeholder="Mật khẩu bảo mật"
              required
              className="w-full rounded-2xl border border-black/10 bg-white p-4 text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm"
            />
            <button type="submit" className="w-full rounded-2xl bg-primary-neon py-4 font-black text-black shadow-md hover:brightness-110 transition-all hover:-translate-y-0.5 mt-2 uppercase tracking-wide">
              Đăng Nhập Quản Trị
            </button>
          </form>

          <a href="/" className="mt-8 text-center text-sm font-bold text-text-secondary hover:text-black transition-colors w-full inline-block">
            Quay về cửa hàng
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg text-black font-sans flex text-sm">
      {/* Sidebar */}
      <aside className="w-[260px] p-6 flex flex-col border-r border-black/5 bg-white/40 backdrop-blur-xl sticky top-0 h-screen">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
            <LayoutDashboard size={20} className="text-primary-neon" />
          </div>
          <div>
            <h1 className="font-black text-base tracking-tight uppercase leading-tight">VENTA</h1>
            <p className="text-[10px] text-text-secondary uppercase tracking-widest font-bold">Admin Console</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV.map(({ to, end, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-bold ${
                  isActive
                    ? 'bg-primary-neon text-black shadow-md'
                    : 'text-text-secondary hover:bg-black/5 hover:text-black'
                }`
              }
            >
              <Icon size={18} /> {label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto pt-6 border-t border-black/5">
          <div className="flex items-center gap-3 mb-4 bg-white/50 p-3 rounded-2xl border border-black/5">
            <img src={session.user.image || 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin'} className="w-10 h-10 rounded-full" />
            <div className="overflow-hidden">
              <p className="font-bold truncate">{session.user.name}</p>
              <p className="text-xs text-text-secondary truncate">{session.user.email}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl text-black font-bold hover:bg-black/5 transition-colors mb-2"
          >
            <Store size={14} /> Xem cửa hàng
          </button>
          <button
            onClick={() => signOut()}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-black/10 text-black font-bold hover:bg-black hover:text-primary-neon transition-colors"
          >
            <LogOut size={14} /> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-8 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
