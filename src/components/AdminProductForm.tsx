import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';

interface ProductInitial {
  id?: string;
  name?: string;
  slug?: string;
  brand?: string;
  categoryId?: string;
  basePrice?: number;
  description?: string;
  isNew?: boolean;
  isHot?: boolean;
  discountPct?: number;
  specs?: Record<string, string>;
}

export function AdminProductForm({
  onClose,
  onSaved,
  initial,
}: {
  onClose: () => void;
  onSaved?: () => void;
  initial?: ProductInitial;
}) {
  const isEdit = !!initial?.id;

  const [formData, setFormData] = useState({
    name: initial?.name || '',
    slug: initial?.slug || '',
    brand: initial?.brand || '',
    categoryId: initial?.categoryId || '1',
    basePrice: initial?.basePrice ?? 0,
    description: initial?.description || '',
    isNew: initial?.isNew || false,
    isHot: initial?.isHot || false,
    discountPct: initial?.discountPct ?? 0,
  });

  const [specs, setSpecs] = useState<{ key: string; value: string }[]>(
    initial?.specs ? Object.entries(initial.specs).map(([k, v]) => ({ key: k, value: String(v) })) : []
  );
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    setSpecs((prev) => prev.map((s, i) => (i === index ? { ...s, [field]: val } : s)));
  };
  const addSpec = () => setSpecs((s) => [...s, { key: '', value: '' }]);
  const removeSpec = (index: number) => setSpecs((s) => s.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    const specsObj = specs.reduce((acc, curr) => {
      if (curr.key.trim() !== '') acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const payload = { ...formData, specs: specsObj };

    try {
      const res = await fetch(isEdit ? `/api/products/${initial!.id}` : '/api/products', {
        method: isEdit ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        onSaved?.();
        onClose();
      } else {
        const err = await res.json();
        alert('Lỗi: ' + (err.error || 'Không thể lưu sản phẩm'));
      }
    } catch (err: any) {
      alert('Lỗi kết nối: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl bg-white/80 backdrop-blur-xl border border-black/5 rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tight">
              {isEdit ? 'Sửa Sản Phẩm' : 'Thêm Sản Phẩm Mới'}
            </h2>
            {isEdit && <p className="text-xs font-mono text-text-secondary mt-1">{initial!.id}</p>}
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white flex items-center justify-center text-black border border-black/5 shadow-sm hover:bg-black/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Tên sản phẩm *" required value={formData.name}
              onChange={(v) => setFormData({ ...formData, name: v, slug: isEdit ? formData.slug : v.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') })} />
            <Input label="Slug (URL) *" required value={formData.slug}
              onChange={(v) => setFormData({ ...formData, slug: v })} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input label="Thương hiệu" value={formData.brand}
              onChange={(v) => setFormData({ ...formData, brand: v })} />
            <Input label="Giá cơ bản ($) *" type="number" required value={formData.basePrice}
              onChange={(v) => setFormData({ ...formData, basePrice: parseFloat(v) || 0 })} />
            <Input label="Giảm giá (%)" type="number" value={formData.discountPct}
              onChange={(v) => setFormData({ ...formData, discountPct: parseInt(v) || 0 })} />
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1.5 ml-1">Mô tả sản phẩm</label>
            <textarea
              rows={3}
              className="w-full bg-white/90 border border-black/10 rounded-2xl px-4 py-3 text-black focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 outline-none shadow-sm font-medium"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-4">
            <Toggle label="Hàng mới" checked={formData.isNew} onChange={(v) => setFormData({ ...formData, isNew: v })} />
            <Toggle label="Sản phẩm hot" checked={formData.isHot} onChange={(v) => setFormData({ ...formData, isHot: v })} />
          </div>

          <div className="p-6 border border-black/5 rounded-3xl bg-white/40 shadow-sm backdrop-blur-md">
            <div className="flex justify-between items-center mb-5">
              <div>
                <h3 className="text-lg font-bold text-black">Thông số kỹ thuật</h3>
                <p className="text-xs text-text-secondary font-medium">Dynamic fields lưu dạng JSON</p>
              </div>
              <button
                type="button"
                onClick={addSpec}
                className="flex items-center gap-2 text-sm bg-black text-white px-4 py-2 rounded-xl hover:bg-black/80 transition font-bold shadow-md"
              >
                <Plus size={16} className="text-primary-neon" /> Thêm thuộc tính
              </button>
            </div>

            <div className="space-y-3">
              {specs.map((spec, index) => (
                <div key={index} className="flex items-start gap-3">
                  <input
                    placeholder="Tên (VD: DPI)"
                    className="flex-1 bg-white border border-black/10 rounded-2xl px-4 py-3 text-sm text-black focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 outline-none shadow-sm font-medium"
                    value={spec.key}
                    onChange={(e) => handleSpecChange(index, 'key', e.target.value)}
                  />
                  <input
                    placeholder="Giá trị (VD: 25.600)"
                    className="flex-1 bg-white border border-black/10 rounded-2xl px-4 py-3 text-sm text-black focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 outline-none shadow-sm font-medium"
                    value={spec.value}
                    onChange={(e) => handleSpecChange(index, 'value', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => removeSpec(index)}
                    className="h-[46px] w-[46px] flex justify-center items-center text-red-500 bg-white border border-black/10 shadow-sm hover:bg-red-50 rounded-2xl transition"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
              {specs.length === 0 && (
                <p className="text-sm text-text-secondary italic text-center py-4">
                  Chưa có thông số. Bấm "Thêm thuộc tính" để tạo dynamic fields.
                </p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-black/5">
            <button type="button" onClick={onClose} className="px-6 py-3 rounded-2xl text-black font-semibold hover:bg-black/5 transition">
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-primary-neon text-black shadow-md hover:brightness-110 hover:-translate-y-0.5 transition-all outline-none disabled:opacity-50"
            >
              <Save size={18} /> {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật' : 'Lưu sản phẩm'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Input({ label, value, onChange, type = 'text', required }: { label: string; value: any; onChange: (v: string) => void; type?: string; required?: boolean }) {
  return (
    <div>
      <label className="block text-sm font-bold text-black mb-1.5 ml-1">{label}</label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/90 border border-black/10 rounded-2xl px-4 py-3 text-black focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 outline-none shadow-sm font-medium"
      />
    </div>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="inline-flex items-center gap-3 cursor-pointer select-none px-4 py-2.5 rounded-2xl bg-white border border-black/10 hover:border-black transition-colors">
      <input type="checkbox" className="peer hidden" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span className="w-9 h-5 rounded-full bg-black/10 peer-checked:bg-primary-neon relative transition-colors">
        <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all ${checked ? 'left-[18px]' : 'left-0.5'}`}></span>
      </span>
      <span className="text-sm font-bold text-black">{label}</span>
    </label>
  );
}
