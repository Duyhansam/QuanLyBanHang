import { createContext, useContext, useState, useEffect } from "react";
import toast from "react-hot-toast";

export const MAX_COMPARE = 3;

const CompareContext = createContext(null);

export function CompareProvider({ children }) {
  // Khởi tạo từ localStorage giống wishlist / cart
  const [compareList, setCompareList] = useState(() => {
    const saved = localStorage.getItem("my_compare");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("my_compare", JSON.stringify(compareList));
  }, [compareList]);

  const isInCompare = (id) => compareList.some((item) => item.id === id);

  // Toggle: có rồi thì bỏ, chưa có thì thêm (tối đa MAX_COMPARE)
  const handleToggleCompare = (product) => {
    if (isInCompare(product.id)) {
      setCompareList((prev) => prev.filter((item) => item.id !== product.id));
      toast("Removed from compare.", { icon: "🔁" });
      return;
    }
    if (compareList.length >= MAX_COMPARE) {
      toast.error(`You can compare up to ${MAX_COMPARE} products.`);
      return;
    }
    const image =
      product.image ||
      product.variants?.[0]?.image ||
      product.variants?.[0]?.thumbnail ||
      "";
    setCompareList((prev) => [...prev, { ...product, image }]);
    toast.success("Added to compare!");
  };

  const handleRemoveCompare = (id) =>
    setCompareList((prev) => prev.filter((item) => item.id !== id));

  const handleClearCompare = () => setCompareList([]);

  return (
    <CompareContext.Provider
      value={{
        compareList,
        compareCount: compareList.length,
        isInCompare,
        handleToggleCompare,
        handleRemoveCompare,
        handleClearCompare,
      }}
    >
      {children}
    </CompareContext.Provider>
  );
}

export function useCompare() {
  const ctx = useContext(CompareContext);
  if (!ctx) throw new Error("useCompare must be used inside <CompareProvider>");
  return ctx;
}
