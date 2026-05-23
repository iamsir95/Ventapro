import React, { useEffect, useState, useCallback } from 'react';
import { Eye, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { formatVND } from '../../lib/format';

interface OrderRow {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: { id: string; variantId: string; quantity: number; price: number; productName: string | null; sku: string | null }[];
}

const STATUSES = ['', 'PENDING', 'COMPLETED', 'SHIPPED', 'CANCELLED', 'REFUNDED'];
const STATUS_LABELS: Record<string, string> = {
  '': 'Tất cả',
  PENDING: 'Chờ xử lý',
  COMPLETED: 'Hoàn tất',
  SHIPPED: 'Đã giao',
  CANCELLED: 'Đã huỷ',
  REFUNDED: 'Hoàn tiền',
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [meta, setMeta] = useState({ page: 1, limit: 20, total: 0, totalPages: 1 });
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(false);
  const [viewing, setViewing] = useState<OrderRow | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (statusFilter) params.set('status', statusFilter);
      const res = await fetch(`/api/admin/orders?${params.toString()}`);
      const json = await res.json();
      setOrders(json.data || []);
      setMeta(json.meta || meta);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const updateStatus = async (id: string, status: string) => {
    const res = await fetch(`/api/admin/orders/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrders((prev) => prev.map((o) => (o.id === id ? { ...o, ...updated } : o)));
      if (viewing?.id === id) setViewing({ ...viewing, ...updated });
    } else {
      alert('Cập nhật trạng thái thất bại');
    }
  };

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-4xl font-black tracking-tight">Đơn hàng</h2>
        <p className="text-text-secondary font-medium mt-1">{meta.total} đơn trong hệ thống.</p>
      </header>

      <div className="flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s || 'all'}
            onClick={() => {
              setStatusFilter(s);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-2xl text-sm font-bold transition-colors ${
              statusFilter === s ? 'bg-black text-primary-neon' : 'bg-white/60 border border-black/10 hover:bg-black/5'
            }`}
          >
            {STATUS_LABELS[s]}
          </button>
        ))}
      </div>

      <section className="bg-white/60 backdrop-blur-lg border border-black/5 rounded-3xl shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-center py-20 text-text-secondary font-bold uppercase tracking-widest">Đang tải...</p>
        ) : orders.length === 0 ? (
          <p className="text-center py-20 text-text-secondary">Không có đơn hàng phù hợp.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary font-bold uppercase text-xs tracking-wider border-b border-black/5 bg-black/[0.02]">
                  <th className="py-4 px-6">Mã đơn</th>
                  <th className="py-4 px-4">Khách</th>
                  <th className="py-4 px-4">Số món</th>
                  <th className="py-4 px-4">Tổng</th>
                  <th className="py-4 px-4">Trạng thái</th>
                  <th className="py-4 px-4">Thời gian</th>
                  <th className="py-4 px-6 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.id} className="border-b border-black/5 hover:bg-black/[0.02]">
                    <td className="py-3 px-6 font-mono text-xs">{o.id.slice(0, 8)}</td>
                    <td className="py-3 px-4 font-mono text-xs text-text-secondary">{o.userId.slice(0, 8)}</td>
                    <td className="py-3 px-4 font-bold">{o.items.length}</td>
                    <td className="py-3 px-4 font-bold">{formatVND(o.totalAmount)}</td>
                    <td className="py-3 px-4">
                      <StatusSelect status={o.status} onChange={(s) => updateStatus(o.id, s)} />
                    </td>
                    <td className="py-3 px-4 text-text-secondary text-xs">{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                    <td className="py-3 px-6">
                      <button
                        onClick={() => setViewing(o)}
                        className="w-9 h-9 rounded-xl bg-white border border-black/10 hover:border-black flex items-center justify-center transition-colors ml-auto"
                      >
                        <Eye size={14} />
                      </button>
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

      {viewing && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-black/5">
              <div>
                <h3 className="text-xl font-black">Chi tiết đơn hàng</h3>
                <p className="text-xs font-mono text-text-secondary">{viewing.id}</p>
              </div>
              <button onClick={() => setViewing(null)} className="w-9 h-9 rounded-full hover:bg-black/5 flex items-center justify-center">
                <X size={18} />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Field label="Khách hàng" value={viewing.userId} mono />
                <Field label="Trạng thái" value={viewing.status} />
                <Field label="Tổng tiền" value={formatVND(viewing.totalAmount)} />
                <Field label="Thời gian" value={new Date(viewing.createdAt).toLocaleString('vi-VN')} />
              </div>
              <div>
                <h4 className="font-black mb-3">Sản phẩm</h4>
                <div className="rounded-2xl border border-black/5 overflow-hidden">
                  {viewing.items.map((it) => (
                    <div key={it.id} className="flex justify-between p-4 border-b border-black/5 last:border-b-0">
                      <div>
                        <p className="font-bold">{it.productName || 'Sản phẩm không xác định'}</p>
                        <p className="text-xs font-mono text-text-secondary">{it.sku || it.variantId}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{it.quantity} × {formatVND(it.price)}</p>
                        <p className="text-sm text-text-secondary">{formatVND(it.quantity * it.price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatusSelect({ status, onChange }: { status: string; onChange: (s: string) => void }) {
  const colors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    COMPLETED: 'bg-green-100 text-green-800 border-green-200',
    SHIPPED: 'bg-blue-100 text-blue-800 border-blue-200',
    CANCELLED: 'bg-red-100 text-red-800 border-red-200',
    REFUNDED: 'bg-gray-100 text-gray-800 border-gray-200',
  };
  return (
    <select
      value={status}
      onChange={(e) => onChange(e.target.value)}
      className={`px-3 py-1 rounded-full text-xs font-bold border cursor-pointer outline-none ${colors[status] || 'bg-gray-100 text-gray-800 border-gray-200'}`}
    >
      {['PENDING', 'COMPLETED', 'SHIPPED', 'CANCELLED', 'REFUNDED'].map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase text-text-secondary tracking-wider mb-1">{label}</p>
      <p className={`text-black font-bold ${mono ? 'font-mono text-sm break-all' : ''}`}>{value}</p>
    </div>
  );
}
