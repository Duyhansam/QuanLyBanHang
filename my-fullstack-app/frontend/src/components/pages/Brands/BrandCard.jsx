export default function BrandCard({ brand }) {
  return (
    <div className="group bg-white rounded-xl overflow-hidden border border-gray-200 flex flex-col transition-all duration-300 hover:shadow-md hover:border-black cursor-pointer p-6">
      {/* Vùng hiển thị logo nằm trong ô trắng bo góc tinh tế giống ảnh mẫu */}
      <div className="relative aspect-[16/9] flex items-center justify-center mb-4 bg-white">
        <img
          src={brand.logo}
          alt={brand.name}
          className="max-h-12 w-auto object-contain transition-transform duration-300 group-hover:scale-105"
        />
      </div>

      {/* Thông tin chi tiết */}
      <div className="flex flex-col flex-grow justify-between">
        <div>
          <h3 className="text-xs font-bold text-black uppercase tracking-wider mb-1">
            {brand.name}
          </h3>
          <p className="text-[11px] text-gray-500 line-clamp-2 mb-4">
            {brand.description}
          </p>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-[11px]">
          <span className="text-gray-400 font-medium">
            {brand.productCount} Items
          </span>
          <span className="font-bold text-black uppercase tracking-wider group-hover:underline">
            View →
          </span>
        </div>
      </div>
    </div>
  );
}
