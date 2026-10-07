// Logo.jsx
function Logo({ variant = "dark" }) {
  const iconBg = variant === "light" ? "white" : "black";
  const kColor = variant === "light" ? "black" : "#FAF7F2";
  const textColor = variant === "light" ? "text-white" : "text-black";

  return (
    <div className="flex items-center gap-2 cursor-pointer">
      <svg width="30" height="30" viewBox="0 0 30 30" fill="none">
        <rect width="30" height="30" rx="8" fill={iconBg} />
        <polygon points="0,22 11,22 30,4 30,10" fill="#FACC15" />
        <polygon points="0,28 5,28 30,13 30,17" fill="#FACC15" opacity="0.55" />
        <text
          x="15"
          y="23"
          textAnchor="middle"
          fontFamily="Arial, Helvetica, sans-serif"
          fontWeight="900"
          fontSize="20"
          fill={kColor}
        >
          K
        </text>
      </svg>
      <span className={`font-black text-2xl tracking-tight ${textColor}`}>
        KANZA
      </span>
    </div>
  );
}

export default Logo;
