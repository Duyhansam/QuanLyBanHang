import { Truck, RotateCcw, ShieldCheck, CreditCard } from "lucide-react";
export default function FeaturesBar() {
  const features = [
    {
      icon: Truck,
      title: "Free Shipping",
      description: "On all orders over $100",
    },
    {
      icon: RotateCcw,
      title: "30-Day Returns",
      description: "Hassle-free returns ",
    },
    {
      icon: ShieldCheck,
      title: "100% Authentic",
      description: "Genuine branded products",
    },
    {
      icon: CreditCard,
      title: "Secure Payments",
      description: "Safe & encrypted checkout",
    },
  ];

  return (
    <section className="mx-16 mt-8 p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {features.map((feature, index) => (
        <div
          key={index}
          className="flex items-center  select-none bg-[#f7f7f7] rounded-lg p-6"
        >
          <div>
            <feature.icon className="w-12 h-12 text-blue-500 items-start mr-4 " />
          </div>
          <div>
            <span className="text-lg font-semibold mb-2">{feature.title}</span>
            <p className="text-gray-600">{feature.description}</p>
          </div>
        </div>
      ))}
    </section>
  );
}
