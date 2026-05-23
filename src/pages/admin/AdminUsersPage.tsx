import React, { useEffect, useState, useCallback } from 'react';
import { Search, ChevronLeft, ChevronRight, ShieldCheck, User as UserIcon } from 'lucide-react';
import { formatVND } from '../../lib/format';

interface UserRow {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  emailVerified: string | null;
  createdAt: string;
  orderCount: number;
  totalSpent: number;
  isAdmin: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (search) params.set('search', search);
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const json = await res.json();
      setUsers(json.data || []);
      setMeta(json.meta || meta);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search]);

  useEffect(() => {
    const t = setTimeout(load, search ? 300 : 0);
    return () => clearTimeout(t);
  }, [load]);

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-4xl font-black tracking-tight">Khách hàng</h2>
        <p className="text-text-secondary font-medium mt-1">{meta.total} tài khoản đã đăng ký.</p>
      </header>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="Tìm theo tên hoặc email..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full rounded-2xl border border-black/10 bg-white/60 backdrop-blur-md pl-12 pr-5 py-3.5 text-sm text-black outline-none focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 shadow-sm font-medium"
        />
      </div>

      <section className="bg-white/60 backdrop-blur-lg border border-black/5 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center py-20 text-text-secondary font-bold uppercase tracking-widest">Đang tải...</p>
        ) : users.length === 0 ? (
          <p className="text-center py-20 text-text-secondary">Không có tài khoản phù hợp.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary font-bold uppercase text-xs tracking-wider border-b border-black/5 bg-black/[0.02]">
                  <th className="py-4 px-6">Người dùng</th>
                  <th className="py-4 px-4">Email</th>
                  <th className="py-4 px-4">Số đơn</th>
                  <th className="py-4 px-4">Tổng chi tiêu</th>
                  <th className="py-4 px-4">Đăng ký</th>
                  <th className="py-4 px-4">Vai trò</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                    <td className="py-3 px-6">
                      <div className="flex items-center gap-3">
                        {u.image ? (
                          <img src={u.image} className="w-10 h-10 rounded-full bg-white border border-black/5" referrerPolicy="no-referrer" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-black text-primary-neon flex items-center justify-center">
                            <UserIcon size={16} />
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-black">{u.name || '—'}</p>
                          <p className="text-xs text-text-secondary font-mono">{u.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium">{u.email}</td>
                    <td className="py-3 px-4 font-bold">{u.orderCount}</td>
                    <td className="py-3 px-4 font-bold">{formatVND(u.totalSpent)}</td>
                    <td className="py-3 px-4 text-text-secondary text-xs">{new Date(u.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="py-3 px-4">
                      {u.isAdmin ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-black bg-primary-neon text-black">
                          <ShieldCheck size={12} /> Admin
                        </span>
                      ) : (
                        <span className="text-xs text-text-secondary font-bold">Khách</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-black/5">
            <p className="text-sm text-text-secondary font-medium">Trang {meta.page} / {meta.totalPages}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}
                className="w-9 h-9 rounded-xl border border-black/10 flex items-center justify-center disabled:opacity-40 hover:bg-black hover:text-primary-neon transition-colors">
                <ChevronLeft size={16} />
              </button>
              <button onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))} disabled={page >= meta.totalPages}
                className="w-9 h-9 rounded-xl border border-black/10 flex items-center justify-center disabled:opacity-40 hover:bg-black hover:text-primary-neon transition-colors">
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
