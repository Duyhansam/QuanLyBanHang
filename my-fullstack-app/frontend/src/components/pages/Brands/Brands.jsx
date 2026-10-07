import BrandsHeader from "./BrandsHeader";
import BrandCard from "./BrandCard";
import { useFetch } from "../../hooks/useFetch";

export default function Brands() {
  const { data: brands, loading, error } = useFetch("/api/brands");

  if (loading) {
    return <div className="px-8 py-9">Đang tải thương hiệu...</div>;
  }
  if (error) {
    return (
      <div className="px-8 py-9 text-red-500">Lỗi tải dữ liệu: {error}</div>
    );
  }

  return (
    <div className="bg-white text-black min-h-screen px-8 py-9 max-w-7xl mx-auto">
      <BrandsHeader count={brands.length} />

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-6 mt-8">
        {brands.map((brand) => (
          <BrandCard key={brand.id} brand={brand} />
        ))}
      </div>
    </div>
  );
}
