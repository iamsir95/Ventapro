import React, { useState, useEffect } from 'react';
import { getSession, signIn } from '../lib/authClient';
import { AdminProductForm } from '../components/AdminProductForm';
import { Package, Users, Settings, LogOut, LayoutDashboard, Plus } from 'lucide-react';

export default function AdminDashboard() {
  const [session, setSession] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    getSession().then(setSession);
  }, []);

  if (!session || session.user?.email !== 'admin@pro-gaming.com') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-light-bg text-text-primary p-4 relative overflow-hidden">
        {/* Background blobs */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary-neon/20 blur-[100px] rounded-full point-events-none"></div>

        <div className="bg-white/70 backdrop-blur-xl border border-black/5 rounded-[2rem] p-10 max-w-md w-full shadow-2xl relative z-10 flex flex-col">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
               <ShieldAlert className="w-8 h-8 text-primary-neon" />
            </div>
            <h1 className="text-3xl font-black mb-2 text-black tracking-tight uppercase">Quản Trị Hệ Thống</h1>
            <p className="text-text-secondary font-medium">Bảo mật nội bộ Venta Vietnam</p>
          </div>
          
          <form 
            className="flex flex-col gap-4"
            onSubmit={async (e) => {
              e.preventDefault();
              const email = (e.currentTarget.elements.namedItem('email') as HTMLInputElement).value;
              const password = (e.currentTarget.elements.namedItem('password') as HTMLInputElement).value;
              
              const res = await signIn('credentials', { email, password });
              if (res && res.ok) {
                 window.location.reload();
              } else {
                 alert('Thông tin không chính xác.');
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
            Quay Về Trang Cửa Hàng
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-light-bg text-black font-sans flex text-sm">
      {/* Sidebar - Glassmorphism */}
      <aside className="w-[280px] p-6 flex flex-col border-r border-black/5 bg-white/40 backdrop-blur-xl">
        <div className="mb-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center">
            <LayoutDashboard size={20} className="text-primary-neon" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight uppercase">Quản Trị<span className="text-black/40">Hệ Thống</span></h1>
          </div>
        </div>

        <nav className="flex-1 space-y-2">
          <button 
            onClick={() => setActiveTab('products')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium ${activeTab === 'products' ? 'bg-primary-neon text-black shadow-sm' : 'text-text-secondary hover:bg-black/5 hover:text-black'}`}
          >
            <Package size={18} /> Quản lý sản phẩm
          </button>
          <button 
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium ${activeTab === 'users' ? 'bg-primary-neon text-black shadow-sm' : 'text-text-secondary hover:bg-black/5 hover:text-black'}`}
          >
            <Users size={18} /> Khách hàng
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all font-medium ${activeTab === 'settings' ? 'bg-primary-neon text-black shadow-sm' : 'text-text-secondary hover:bg-black/5 hover:text-black'}`}
          >
            <Settings size={18} /> Cài đặt
          </button>
        </nav>

        <div className="mt-auto pt-6 border-t border-black/5">
          <div className="flex items-center gap-3 mb-6 bg-white/50 p-3 rounded-2xl border border-black/5">
            <img src={session.user.image || "https://api.dicebear.com/7.x/avataaars/svg?seed=Admin"} className="w-10 h-10 rounded-full" />
            <div className="overflow-hidden">
              <p className="font-semibold truncate">{session.user.name}</p>
              <p className="text-xs text-text-secondary truncate">{session.user.email}</p>
            </div>
          </div>
          <a href="/" className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-2xl border border-black/10 text-black font-medium hover:bg-black hover:text-primary-neon transition-colors">
            <LogOut size={16} /> Thoát trang Admin
          </a>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-8 lg:p-12 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <header className="flex justify-between items-end mb-10">
            <div>
              <h2 className="text-4xl font-bold tracking-tight mb-2">Sản phẩm</h2>
              <p className="text-text-secondary font-medium">Quản lý kho hàng, cập nhật thông số kĩ thuật chuyên môn.</p>
            </div>
            <button 
              onClick={() => setIsFormOpen(true)}
              className="flex items-center gap-2 bg-black text-primary-neon px-6 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md uppercase tracking-wide"
            >
              <Plus size={20} /> Thiết Bị Mới
            </button>
          </header>

          {/* Stats / Overview - Soft Glass Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            <div className="bg-white/60 backdrop-blur-lg border border-black/5 rounded-3xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary-neon/20 flex items-center justify-center text-black mb-4">
                <Package size={24} />
              </div>
              <p className="text-text-secondary font-medium mb-1">Tổng thiết bị</p>
              <p className="text-3xl font-black tracking-tight">1,204</p>
            </div>
            <div className="bg-white/60 backdrop-blur-lg border border-black/5 rounded-3xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary-neon/20 flex items-center justify-center text-black mb-4">
                <Users size={24} />
              </div>
              <p className="text-text-secondary font-medium mb-1">Thành viên</p>
              <p className="text-3xl font-black tracking-tight">854</p>
            </div>
            <div className="bg-white/60 backdrop-blur-lg border border-black/5 rounded-3xl p-6 shadow-sm">
              <div className="w-12 h-12 rounded-2xl bg-primary-neon/20 flex items-center justify-center text-black mb-4">
                <LayoutDashboard size={24} />
              </div>
              <p className="text-text-secondary font-medium mb-1">Tổng doanh thu</p>
              <p className="text-3xl font-black tracking-tight">928M ₫</p>
            </div>
          </div>

          {/* Placeholder for Data Table */}
          <div className="bg-white/60 backdrop-blur-lg border border-black/5 rounded-3xl p-16 shadow-sm min-h-[400px] flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center mb-6">
              <Settings size={32} className="text-black/30" />
            </div>
            <h3 className="text-2xl font-black text-black uppercase tracking-tight mb-2">Đang Thiết Kế</h3>
            <p className="text-text-secondary text-lg font-medium">Bảng dữ liệu cấu hình tuỳ chỉnh đang trong quá trình phát triển.</p>
          </div>
        </div>
      </main>

      {isFormOpen && <AdminProductForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}

// Simple shield icon fallback
function ShieldAlert(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m12 8-5.5 5.5"/><path d="m8 8 5.5 5.5"/></svg>
  )
}
