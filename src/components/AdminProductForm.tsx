import React, { useState } from 'react';
import { Plus, Trash2, Save, X } from 'lucide-react';

export function AdminProductForm({ onClose }: { onClose: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand: '',
    categoryId: '1', // Default category mock
    basePrice: 0,
    description: '',
    isNew: false,
    isHot: false,
    discountPct: 0
  });

  const [specs, setSpecs] = useState<{key: string, value: string}[]>([]);
  
  const handleSpecChange = (index: number, field: 'key' | 'value', val: string) => {
    const newSpecs = [...specs];
    newSpecs[index][field] = val;
    setSpecs(newSpecs);
  };

  const addSpec = () => setSpecs([...specs, { key: '', value: '' }]);
  const removeSpec = (index: number) => setSpecs(specs.filter((_, i) => i !== index));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert specs array to object
    const specsObj = specs.reduce((acc, curr) => {
      if (curr.key.trim() !== '') {
        acc[curr.key] = curr.value;
      }
      return acc;
    }, {} as Record<string, string>);

    const payload = {
      ...formData,
      specs: specsObj
    };

    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (response.ok) {
        alert('Tạo sản phẩm thành công!');
        onClose();
      } else {
        const error = await response.json();
        alert('Lỗi: ' + error.error);
      }
    } catch (err: any) {
      alert('Lỗi kết nối: ' + err.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-md p-4">
      <div className="w-full max-w-3xl bg-white/70 backdrop-blur-xl border border-black/5 rounded-3xl shadow-2xl p-6 md:p-8 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-black text-black tracking-tight">
            Thêm Sản Phẩm Mới
          </h2>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white flex items-center justify-center text-black border border-black/5 shadow-sm hover:bg-black/5 transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1.5 ml-1">Tên sản phẩm *</label>
              <input 
                required 
                className="w-full bg-white/90 border border-black/10 rounded-2xl px-4 py-3 text-black focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 outline-none shadow-sm font-medium"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value, slug: e.target.value.toLowerCase().replace(/ /g, '-')})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1.5 ml-1">Slug (URL) *</label>
              <input 
                required 
                className="w-full bg-white/90 border border-black/10 rounded-2xl px-4 py-3 text-black focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 outline-none shadow-sm font-medium"
                value={formData.slug}
                onChange={e => setFormData({...formData, slug: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-bold text-black mb-1.5 ml-1">Thương hiệu</label>
              <input 
                className="w-full bg-white/90 border border-black/10 rounded-2xl px-4 py-3 text-black focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 outline-none shadow-sm font-medium"
                value={formData.brand}
                onChange={e => setFormData({...formData, brand: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1.5 ml-1">Giá cơ bản ($) *</label>
              <input 
                type="number" 
                required 
                className="w-full bg-white/90 border border-black/10 rounded-2xl px-4 py-3 text-black focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 outline-none shadow-sm font-medium"
                value={formData.basePrice}
                onChange={e => setFormData({...formData, basePrice: parseFloat(e.target.value)})}
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-black mb-1.5 ml-1">Giảm giá (%)</label>
              <input 
                type="number" 
                className="w-full bg-white/90 border border-black/10 rounded-2xl px-4 py-3 text-black focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 outline-none shadow-sm font-medium"
                value={formData.discountPct}
                onChange={e => setFormData({...formData, discountPct: parseInt(e.target.value)})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-black mb-1.5 ml-1">Mô tả sản phẩm</label>
            <textarea 
              rows={3}
              className="w-full bg-white/90 border border-black/10 rounded-2xl px-4 py-3 text-black focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 outline-none shadow-sm font-medium"
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="p-6 border border-black/5 rounded-3xl bg-white/40 shadow-sm backdrop-blur-md">
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-bold text-black">Dynamic Fields (Thông số kỹ thuật)</h3>
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
                    onChange={e => handleSpecChange(index, 'key', e.target.value)}
                  />
                  <input 
                    placeholder="Giá trị (VD: 25.600)"
                    className="flex-1 bg-white border border-black/10 rounded-2xl px-4 py-3 text-sm text-black focus:border-primary-neon focus:ring-4 focus:ring-primary-neon/20 outline-none shadow-sm font-medium"
                    value={spec.value}
                    onChange={e => handleSpecChange(index, 'value', e.target.value)}
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
                <p className="text-sm text-text-secondary italic text-center py-4">Chưa có thông số nào. Bấm "Thêm thuộc tính" để tạo Dynamic Fields (EAV).</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-6 mt-4 border-t border-black/5">
            <button 
              type="button" 
              onClick={onClose}
              className="px-6 py-3 rounded-2xl text-black font-semibold hover:bg-black/5 transition"
            >
              Hủy
            </button>
            <button 
              type="submit"
              className="flex items-center gap-2 px-8 py-3 rounded-2xl font-bold bg-primary-neon text-black shadow-md hover:brightness-110 hover:-translate-y-0.5 transition-all outline-none"
            >
              <Save size={18} /> Lưu Sản Phẩm
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
