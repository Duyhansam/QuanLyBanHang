import { Link, useLocation } from "react-router-dom";

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <section className="flex min-h-[60vh] flex-col items-center justify-center px-8 py-16 text-center">
      <p className="font-archivo-black text-8xl md:text-9xl text-black">404</p>

      <h1 className="mt-4 text-xl md:text-2xl font-bold uppercase tracking-wider">
        Page not found
      </h1>

      <p className="mt-3 max-w-md text-sm text-gray-600">
        We couldn&apos;t find{" "}
        <span className="font-mono break-all text-black">{pathname}</span>. It
        may have been moved, or the link might be wrong.
      </p>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          to="/"
          className="bg-[#222] text-white text-xs font-bold uppercase tracking-wider px-8 py-4 rounded hover:bg-black transition-colors shadow-sm"
        >
          Back to home
        </Link>
        <Link
          to="/shop"
          className="border border-black text-black text-xs font-bold uppercase tracking-wider px-8 py-4 rounded hover:bg-black hover:text-white transition-colors"
        >
          Continue shopping
        </Link>
      </div>
    </section>
  );
}
