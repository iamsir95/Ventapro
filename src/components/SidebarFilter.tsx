import React from 'react';
import { Filter, SlidersHorizontal } from 'lucide-react';

export function SidebarFilter() {
  return (
    <aside className="sticky top-20 h-min w-full rounded-3xl border border-black/5 bg-white/40 backdrop-blur-xl p-8 mr-4 shadow-sm md:w-[260px]">
      <div className="mb-6 flex items-center gap-2 border-b border-black/5 pb-4">
        <SlidersHorizontal size={18} className="text-black" />
        <h3 className="font-bold text-black">Bộ Lọc Tìm Kiếm</h3>
      </div>
      
      <div className="mb-8">
        <span className="mb-4 block text-[11px] font-bold uppercase tracking-[1px] text-text-secondary">
          Thương Hiệu
        </span>
        <div className="flex flex-col">
          {['Logitech G', 'Razer', 'Corsair', 'SteelSeries'].map((brand) => (
            <label key={brand} className="group flex cursor-pointer items-center mb-3 text-sm text-black font-medium transition-opacity hover:opacity-70">
              <div className="mr-3 flex h-4 w-4 items-center justify-center rounded border border-black/20 bg-white transition-colors group-hover:border-black">
                <input type="checkbox" className="peer hidden" />
                <div className="hidden h-2.5 w-2.5 rounded-sm bg-black peer-checked:block"></div>
              </div>
              {brand}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <span className="mb-4 block text-[11px] font-bold uppercase tracking-[1px] text-text-secondary">
          Kết Nối
        </span>
        <div className="flex flex-col">
          {['Không Dây Cấp Pro', 'Có Dây', 'Bluetooth'].map((conn) => (
            <label key={conn} className="group flex cursor-pointer items-center mb-3 text-sm text-black font-medium transition-opacity hover:opacity-70">
              <div className="mr-3 flex h-4 w-4 items-center justify-center rounded border border-black/20 bg-white transition-colors group-hover:border-black">
                <input type="checkbox" className="peer hidden" />
                <div className="hidden h-2.5 w-2.5 rounded-sm bg-black peer-checked:block"></div>
              </div>
              {conn}
            </label>
          ))}
        </div>
      </div>

      <div className="mb-8">
        <span className="mb-4 block text-[11px] font-bold uppercase tracking-[1px] text-text-secondary">
          Loại Switch Phím
        </span>
        <div className="flex flex-col">
          {['Cơ Học Tuyến Tính (Red)', 'Quang Học Mới', 'Tactile Phản Hồi (Brown)'].map((sw) => (
            <label key={sw} className="group flex cursor-pointer items-center mb-3 text-sm text-black font-medium transition-opacity hover:opacity-70">
              <div className="mr-3 flex h-4 w-4 items-center justify-center rounded border border-black/20 bg-white transition-colors group-hover:border-black">
                <input type="checkbox" className="peer hidden" />
                <div className="hidden h-2.5 w-2.5 rounded-sm bg-black peer-checked:block"></div>
              </div>
              {sw}
            </label>
          ))}
        </div>
      </div>
    </aside>
  );
}
