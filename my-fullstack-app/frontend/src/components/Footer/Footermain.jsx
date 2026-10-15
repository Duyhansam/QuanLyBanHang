import { Link } from "react-router-dom";
import Logo from "../Header/Logo";
import { FaInstagram, FaFacebook, FaTwitter, FaTiktok } from "react-icons/fa";
import NewsletterForm from "./NewsletterForm.jsx";

const SOCIALS = [
  { label: "Instagram", href: "https://www.instagram.com/", Icon: FaInstagram },
  { label: "Facebook", href: "https://www.facebook.com/", Icon: FaFacebook },
  { label: "Twitter", href: "https://twitter.com/", Icon: FaTwitter },
  { label: "TikTok", href: "https://www.tiktok.com/", Icon: FaTiktok },
];

const COLUMNS = [
  {
    title: "SHOP",
    links: [
      { label: "All Shoes", to: "/shop" },
      { label: "Men", to: "/men" },
      { label: "Women", to: "/women" },
      { label: "Kids", to: "/kids" },
      { label: "Sale", to: "/sale" },
    ],
  },
  {
    title: "CUSTOMER CARE",
    links: [
      { label: "Contact Us", to: "/info/contact" },
      { label: "Shipping info", to: "/info/shipping" },
      { label: "Returns & Exchanges", to: "/info/returns" },
      { label: "FAQ", to: "/info/faq" },
      { label: "Size Guide", to: "/info/size-guide" },
    ],
  },
  {
    title: "COMPANY",
    links: [
      { label: "About Us", to: "/info/about" },
      { label: "Careers", to: "/info/careers" },
      { label: "Sustainability", to: "/info/sustainability" },
      { label: "Blog", to: "/info/blog" },
      { label: "Store Locator", to: "/info/store-locator" },
    ],
  },
];

export default function Footermain() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pt-8 pb-12 ">
      {/* Cột 1 */}
      <div className=" flex flex-col gap-4">
        <Logo variant="light" />
        <span className="text-white text-sm font-medium mt-4 flex flex-col gap-2">
          Your destination for authentic branded shoes. Quality, style, and
          comfort-all in one place.
        </span>
        <div className="flex gap-4 mt-4">
          {SOCIALS.map(({ label, href, Icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="text-neutral-400 hover:text-white transition-colors"
            >
              <Icon size={20} />
            </a>
          ))}
        </div>
      </div>

      {/* Cột 2, 3, 4 */}
      {COLUMNS.map((col) => (
        <div key={col.title} className=" flex flex-col gap-4">
          <h4 className="text-lg font-bold text-white">{col.title}</h4>
          <ul className="text-white text-sm font-medium mt-4 flex flex-col gap-2">
            {col.links.map((link) => (
              <li key={link.to}>
                <Link to={link.to} className="hover:text-gray-600">
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}

      {/* Cột 5 */}
      <div className=" flex flex-col gap-4">
        <h4 className="text-lg font-bold text-white">NEWSLETTER</h4>
        <span className="text-white text-sm font-medium mt-4 flex flex-col gap-2">
          Get updates on new arrival, exclusive offers and more.
        </span>
        <NewsletterForm />
      </div>
    </div>
  );
}
