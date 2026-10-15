import { STATUS_INFO } from "./orderUtils";

export default function OrderStatusBadge({ status }) {
  const info = STATUS_INFO[status] ?? {
    label: status,
    className: "bg-gray-100 text-gray-600",
  };
  return (
    <span
      className={`inline-block text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded ${info.className}`}
    >
      {info.label}
    </span>
  );
}
