export default function FooterBottom() {
  return (
    <div className="border-t-2 border-neutral-800 mt-4 pt-4 justify-between items-center flex-col md:flex-row flex gap-4 ">
      <div>
        <span className="text-sm text-neutral-400">
          2026 Kanza. All Rights Reserved.
        </span>
      </div>
      <div>
        <a href="#" className="text-sm text-neutral-400 hover:text-white">
          Terms & Conditions
        </a>
        <span className="text-sm text-neutral-400 mx-2">|</span>
        <a href="#" className="text-sm text-neutral-400 hover:text-white">
          Privacy Policy
        </a>
      </div>
    </div>
  );
}
