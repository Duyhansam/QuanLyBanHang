import Logo from "../Header/Logo";
import { ArrowRight } from "lucide-react";
import { FaInstagram, FaFacebook, FaTwitter, FaTiktok } from "react-icons/fa";
export default function Footer() {
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
          <a
            href="#"
            aria-label="Instagram"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <FaInstagram size={20} />
          </a>
          <a
            href="#"
            aria-label="Facebook"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <FaFacebook size={20} />
          </a>
          <a
            href="#"
            aria-label="Twitter"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <FaTwitter size={20} />
          </a>
          <a
            href="#"
            aria-label="TikTok"
            className="text-neutral-400 hover:text-white transition-colors"
          >
            <FaTiktok size={20} />
          </a>
        </div>
      </div>
      {/* Cột 2 */}
      <div className=" flex flex-col gap-4">
        <h4 className="text-lg font-bold text-white">SHOP</h4>
        <ul className="text-white text-sm font-medium mt-4 flex flex-col gap-2">
          <li>
            <a href="#" className="hover:text-gray-600">
              All Shoes
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600">
              Men
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600">
              Women
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600">
              Kids
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600">
              Sale
            </a>
          </li>
        </ul>
      </div>
      {/* Cột 3 */}
      <div className=" flex flex-col gap-4">
        <h4 className="text-lg font-bold text-white">CUSTOMER CARE</h4>
        <ul className="text-white text-sm font-medium mt-4 flex flex-col gap-2">
          <li>
            <a href="#" className="hover:text-gray-600">
              Contact Us
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600">
              Shipping info
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600">
              Returns & Exchanges
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600">
              FAQ
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600">
              Size Guide
            </a>
          </li>
        </ul>
      </div>
      {/* Cột 4 */}
      <div className=" flex flex-col gap-4">
        <h4 className="text-lg font-bold text-white">COMPANY</h4>
        <ul className="text-white text-sm font-medium mt-4 flex flex-col gap-2">
          <li>
            <a href="#" className="hover:text-gray-600">
              About Us
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600">
              Careers
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600">
              Sustainability
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600">
              Blog
            </a>
          </li>
          <li>
            <a href="#" className="hover:text-gray-600">
              Store Locator
            </a>
          </li>
        </ul>
      </div>
      {/* Cột 5 */}
      <div className=" flex flex-col gap-4">
        <h4 className="text-lg font-bold text-white">NEWSLETTER</h4>
        <span className="text-white text-sm font-medium mt-4 flex flex-col gap-2">
          Get updates on new arrival, exclusive offers and more.
        </span>
        <div className="mt-4 relative flex items-center">
          <input
            type="email"
            placeholder="Enter your email"
            className="bg-[#1f2022] p-4 pr-14 rounded-lg w-full text-white placeholder-gray-400 outline-none focus:ring-1 focus:ring-blue-300"
          />
          <button
            type="submit"
            className=" bg-[#2a2b2d] p-2.5 cursor-pointer absolute right-2.5 text-gray-400 hover:text-white transition rounded-md flex items-center justify-center"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}
