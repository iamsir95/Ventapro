import React, { useEffect, useState } from 'react';
import { Package, Users, ShoppingBag, TrendingUp, AlertTriangle, Clock } from 'lucide-react';
import { formatVND } from '../../lib/format';

interface Dashboard {
  summary: {
    totalProducts: number;
    totalUsers: number;
    totalOrders: number;
    totalRevenue: number;
    completedOrderCount: number;
  };
  revenueByDay: { date: string; revenue: number; count: number }[];
  topProducts: { id: string; name: string; quantity: number; revenue: number }[];
  lowStock: { id: string; sku: string; name: string; stock: number; productName: string }[];
  recentOrders: { id: string; userId: string; totalAmount: number; status: string; itemCount: number; createdAt: string }[];
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<Dashboard | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch('/api/admin/analytics')
      .then(async (r) => {
        if (!r.ok) throw new Error((await r.json()).error || 'Lỗi tải dữ liệu');
        return r.json();
      })
      .then(setData)
      .catch((e) => setError(e.message));
  }, []);

  if (error) {
    return <div className="rounded-3xl bg-red-50 border border-red-200 p-6 text-red-700 font-bold">{error}</div>;
  }
  if (!data) {
    return <div className="text-center py-20 text-text-secondary font-bold uppercase tracking-widest">Đang tải...</div>;
  }

  const maxRevenue = Math.max(...data.revenueByDay.map((d) => d.revenue), 1);

  return (
    <div className="space-y-8">
      <header>
        <h2 className="text-4xl font-black tracking-tight">Tổng quan</h2>
        <p className="text-text-secondary font-medium mt-1">Bức tranh thời gian thực về cửa hàng Venta.</p>
      </header>

      {/* Summary cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        <StatCard icon={<TrendingUp size={24} />} label="Doanh thu" value={formatVND(data.summary.totalRevenue)} sub={`${data.summary.completedOrderCount} đơn hoàn tất`} />
        <StatCard icon={<ShoppingBag size={24} />} label="Tổng đơn hàng" value={data.summary.totalOrders.toString()} sub="Tất cả trạng thái" />
        <StatCard icon={<Package size={24} />} label="Sản phẩm" value={data.summary.totalProducts.toString()} sub="Trong kho" />
        <StatCard icon={<Users size={24} />} label="Khách hàng" value={data.summary.totalUsers.toString()} sub="Đã đăng ký" />
      </div>

      {/* Revenue chart */}
      <section className="bg-white/60 backdrop-blur-lg border border-black/5 rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-black mb-1">Doanh thu 7 ngày gần nhất</h3>
        <p className="text-sm text-text-secondary font-medium mb-8">Chỉ tính các đơn đã COMPLETED.</p>
        <div className="flex items-end gap-3 h-64">
          {data.revenueByDay.map((d) => {
            const heightPct = (d.revenue / maxRevenue) * 100;
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-2 group">
                <div className="text-xs font-bold text-black opacity-0 group-hover:opacity-100 transition-opacity">
                  {formatVND(d.revenue)}
                </div>
                <div className="w-full bg-black/5 rounded-2xl flex items-end overflow-hidden" style={{ height: '100%' }}>
                  <div
                    className="w-full bg-primary-neon hover:bg-black transition-colors rounded-2xl"
                    style={{ height: `${Math.max(heightPct, 2)}%` }}
                    title={`${d.date}: ${formatVND(d.revenue)} (${d.count} đơn)`}
                  ></div>
                </div>
                <div className="text-xs font-bold text-text-secondary">{d.date}</div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Two columns: top products + low stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white/60 backdrop-blur-lg border border-black/5 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-black mb-1">Top sản phẩm bán chạy</h3>
          <p className="text-sm text-text-secondary font-medium mb-6">7 ngày gần nhất, sắp xếp theo số lượng.</p>
          {data.topProducts.length === 0 ? (
            <p className="text-text-secondary italic text-center py-8">Chưa có dữ liệu bán hàng.</p>
          ) : (
            <ul className="space-y-3">
              {data.topProducts.map((p, i) => (
                <li key={p.id} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-black/5 transition-colors">
                  <div className="w-8 h-8 rounded-xl bg-primary-neon text-black font-black flex items-center justify-center text-sm shrink-0">
                    {i + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-black truncate">{p.name}</p>
                    <p className="text-xs text-text-secondary">{p.quantity} đơn vị · {formatVND(p.revenue)}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="bg-white/60 backdrop-blur-lg border border-black/5 rounded-3xl p-8 shadow-sm">
          <h3 className="text-xl font-black mb-1 flex items-center gap-2">
            <AlertTriangle size={20} className="text-orange-500" /> Cảnh báo tồn kho
          </h3>
          <p className="text-sm text-text-secondary font-medium mb-6">Các variant còn dưới 10 đơn vị.</p>
          {data.lowStock.length === 0 ? (
            <p className="text-text-secondary italic text-center py-8">Tất cả sản phẩm đều đủ hàng.</p>
          ) : (
            <ul className="space-y-2">
              {data.lowStock.map((v) => (
                <li key={v.id} className="flex items-center justify-between p-3 rounded-2xl bg-orange-50 border border-orange-100">
                  <div className="min-w-0">
                    <p className="font-bold text-black truncate">{v.productName}</p>
                    <p className="text-xs text-text-secondary">{v.sku}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-black ${v.stock === 0 ? 'bg-red-600 text-white' : 'bg-orange-500 text-white'}`}>
                    {v.stock} còn lại
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Recent orders */}
      <section className="bg-white/60 backdrop-blur-lg border border-black/5 rounded-3xl p-8 shadow-sm">
        <h3 className="text-xl font-black mb-1 flex items-center gap-2">
          <Clock size={20} /> Đơn hàng gần nhất
        </h3>
        <p className="text-sm text-text-secondary font-medium mb-6">5 đơn mới nhất.</p>
        {data.recentOrders.length === 0 ? (
          <p className="text-text-secondary italic text-center py-8">Chưa có đơn hàng.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-text-secondary font-bold uppercase text-xs tracking-wider border-b border-black/5">
                  <th className="py-3 pr-4">Mã đơn</th>
                  <th className="py-3 pr-4">Khách</th>
                  <th className="py-3 pr-4">Số món</th>
                  <th className="py-3 pr-4">Tổng</th>
                  <th className="py-3 pr-4">Trạng thái</th>
                  <th className="py-3 pr-4">Thời gian</th>
                </tr>
              </thead>
              <tbody>
                {data.recentOrders.map((o) => (
                  <tr key={o.id} className="border-b border-black/5 hover:bg-black/5">
                    <td className="py-3 pr-4 font-mono text-xs">{o.id.slice(0, 8)}</td>
                    <td className="py-3 pr-4 font-mono text-xs">{o.userId.slice(0, 8)}</td>
                    <td className="py-3 pr-4 font-bold">{o.itemCount}</td>
                    <td className="py-3 pr-4 font-bold">{formatVND(o.totalAmount)}</td>
                    <td className="py-3 pr-4"><StatusPill status={o.status} /></td>
                    <td className="py-3 pr-4 text-text-secondary">{new Date(o.createdAt).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatCard({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub: string }) {
  return (
    <div className="bg-white/60 backdrop-blur-lg border border-black/5 rounded-3xl p-6 shadow-sm">
      <div className="w-12 h-12 rounded-2xl bg-primary-neon/20 flex items-center justify-center text-black mb-4">
        {icon}
      </div>
      <p className="text-text-secondary font-medium text-sm mb-1">{label}</p>
      <p className="text-3xl font-black tracking-tight mb-1">{value}</p>
      <p className="text-xs text-text-secondary font-medium">{sub}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    COMPLETED: 'bg-green-100 text-green-800',
    SHIPPED: 'bg-blue-100 text-blue-800',
    CANCELLED: 'bg-red-100 text-red-800',
    REFUNDED: 'bg-gray-100 text-gray-800',
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
      {status}
    </span>
  );
}
