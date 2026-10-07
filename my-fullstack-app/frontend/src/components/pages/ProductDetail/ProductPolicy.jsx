import { Truck, ShieldCheck, RefreshCw } from "lucide-react";

export default function ProductPolicy() {
  return (
    <div className="border border-gray-200 rounded-lg p-4 space-y-3 bg-gray-50 text-xs text-gray-600">
      <div className="flex items-center gap-3">
        <Truck className="w-4 h-4 text-black flex-shrink-0" />
        <span>Free shipping nationwide for orders over $50.</span>
      </div>
      <div className="flex items-center gap-3">
        <RefreshCw className="w-4 h-4 text-black flex-shrink-0" />
        <span>Easy returns within 30 days of receiving your order.</span>
      </div>
      <div className="flex items-center gap-3">
        <ShieldCheck className="w-4 h-4 text-black flex-shrink-0" />
        <span>100% authentic products with quality warranty.</span>
      </div>
    </div>
  );
}
