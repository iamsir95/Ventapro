import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Edit, Trash2, Search, Sparkles, Flame, ChevronLeft, ChevronRight } from 'lucide-react';
import { AdminProductForm } from '../../components/AdminProductForm';
import { formatVND } from '../../lib/format';

interface ProductRow {
  id: string;
  name: string;
  slug: string;
  brand: string;
  basePrice: number;
  category: string;
  isNew: boolean;
  isHot: boolean;
  discountPct: number;
  image: string;
  specs: Record<string, string>;
  variants: { id: string; sku: string; stock: number }[];
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState<ProductRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = search
        ? `/api/products/search?q=${encodeURIComponent(search)}&page=${page}&limit=20`
        : `/api/products?page=${page}&limit=20`;
      const res = await fetch(url);
      const json = await res.json();
      setProducts(json.data || []);
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

  const handleDelete = async (id: string) => {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (res.ok) {
      setConfirmDeleteId(null);
      await load();
    } else {
      alert('Xoá thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-4xl font-black tracking-tight">Sản phẩm</h2>
          <p className="text-text-secondary font-medium mt-1">{meta.total} mặt hàng trong kho.</p>
        </div>
        <button
          onClick={() => setCreating(true)}
          className="flex items-center gap-2 bg-black text-primary-neon px-6 py-3.5 rounded-2xl font-bold hover:shadow-lg hover:-translate-y-0.5 transition-all shadow-md uppercase tracking-wide"
        >
          <Plus size={20} /> Thiết bị mới
        </button>
      </header>

      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary" />
        <input
          type="text"
          placeholder="Tìm theo tên, mô tả, thương hiệu..."
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
        ) : products.length === 0 ? (
          <p className="text-center py-20 text-text-secondary">Không có sản phẩm.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary font-bold uppercase text-xs tracking-wider border-b border-black/5 bg-black/[0.02]">
                  <th className="py-4 px-6">Sản phẩm</th>
                  <th className="py-4 px-4">Thương hiệu</th>
                  <th className="py-4 px-4">Danh mục</th>
                  <th className="py-4 px-4">Giá</th>
                  <th className="py-4 px-4">Kho</th>
                  <th className="py-4 px-4">Nhãn</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => {
                  const totalStock = p.variants.reduce((s, v) => s + v.stock, 0);
                  return (
                    <tr key={p.id} className="border-b border-black/5 hover:bg-black/[0.02] transition-colors">
                      <td className="py-3 px-6">
                        <div className="flex items-center gap-3">
                          <img src={p.image} className="w-12 h-12 rounded-xl object-cover bg-white border border-black/5" />
                          <div>
                            <p className="font-bold text-black">{p.name}</p>
                            <p className="text-xs text-text-secondary font-mono">{p.slug}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 font-bold">{p.brand}</td>
                      <td className="py-3 px-4 text-text-secondary">{p.category}</td>
                      <td className="py-3 px-4">
                        <p className="font-bold">{formatVND(p.basePrice)}</p>
                        {p.discountPct > 0 && <p className="text-xs text-red-600 font-bold">-{p.discountPct}%</p>}
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-bold ${totalStock === 0 ? 'text-red-600' : totalStock < 10 ? 'text-orange-600' : 'text-green-700'}`}>
                          {totalStock}
                        </span>
                        <span className="text-xs text-text-secondary"> ({p.variants.length} variant)</span>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex gap-1">
                          {p.isNew && <span title="Mới"><Sparkles size={14} className="text-primary-neon stroke-black" /></span>}
                          {p.isHot && <span title="Hot"><Flame size={14} className="text-red-500" /></span>}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditing(p)}
                            className="w-9 h-9 rounded-xl bg-white border border-black/10 hover:border-black flex items-center justify-center transition-colors"
                            title="Sửa"
                          >
                            <Edit size={14} />
                          </button>
                          <button
                            onClick={() => setConfirmDeleteId(p.id)}
                            className="w-9 h-9 rounded-xl bg-white border border-black/10 hover:bg-red-50 hover:border-red-300 hover:text-red-600 flex items-center justify-center transition-colors"
                            title="Xoá"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {meta.totalPages > 1 && (
          <div className="flex items-center justify-between p-4 border-t border-black/5">
            <p className="text-sm text-text-secondary font-medium">
              Trang {meta.page} / {meta.totalPages}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="w-9 h-9 rounded-xl border border-black/10 flex items-center justify-center disabled:opacity-40 hover:bg-black hover:text-primary-neon transition-colors"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setPage((p) => Math.min(meta.totalPages, p + 1))}
                disabled={page >= meta.totalPages}
                className="w-9 h-9 rounded-xl border border-black/10 flex items-center justify-center disabled:opacity-40 hover:bg-black hover:text-primary-neon transition-colors"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>

      {creating && (
        <AdminProductForm
          onClose={() => setCreating(false)}
          onSaved={() => {
            setCreating(false);
            load();
          }}
        />
      )}

      {editing && (
        <AdminProductForm
          initial={editing}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            load();
          }}
        />
      )}

      {confirmDeleteId && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl">
            <h3 className="text-xl font-black mb-2">Xoá sản phẩm?</h3>
            <p className="text-text-secondary font-medium mb-6">Hành động này không thể hoàn tác. Tất cả variants liên quan sẽ bị xoá.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setConfirmDeleteId(null)} className="px-5 py-2.5 rounded-2xl font-bold hover:bg-black/5">Huỷ</button>
              <button onClick={() => handleDelete(confirmDeleteId)} className="px-5 py-2.5 rounded-2xl bg-red-600 text-white font-bold hover:bg-red-700">Xoá</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
