const navItems = [
  { name: "Home", path: "/", hasMegaMenu: false },
  {
    name: "Shop",
    path: "/shop",
    hasMegaMenu: true,
    columns: [
      {
        title: "All Categories",
        links: [
          "All Products",
          "New Arrivals",
          "Best Sellers",
          "Discounts",
          "Limited Edition",
        ],
      },
      {
        title: "Featured",
        links: [
          "Trending Now",
          "Collaborations",
          "Eco-Friendly",
          "Online Exclusive",
        ],
      },
      {
        title: "Price Range",
        links: ["Under $50", "$50 - $100", "$100 - $200", "Over $200"],
      },
    ],
  },
  {
    name: "Men",
    path: "/men",
    hasMegaMenu: true,
    columns: [
      {
        title: "Footwear",
        links: [
          "All Mens",
          "Latest",
          "Best Sellers",
          "Sneakers",
          "Boots",
          "Lace Up Shoes",
        ],
      },
      {
        title: "Shop By Use",
        links: [
          "Hiking",
          "Trail Running",
          "Road Running",
          "Training",
          "Everyday",
          "Walking",
        ],
      },
      {
        title: "Accessories",
        links: [
          "All Accessories",
          "MIM Socks",
          "Care Products",
          "Apparel",
          "Insoles",
        ],
      },
    ],
  },
  {
    name: "Women",
    path: "/women",
    hasMegaMenu: true,
    columns: [
      {
        title: "Footwear",
        links: [
          "All Womens",
          "Latest",
          "Best Sellers",
          "Sneakers",
          "Sandals",
          "Slip-Ons",
        ],
      },
      {
        title: "Shop By Use",
        links: ["Running", "Yoga & Gym", "Casual Wear", "Outdoor", "Travel"],
      },
      {
        title: "Accessories",
        links: ["Bags & Backpacks", "Socks", "Headwear", "Gift Cards"],
      },
    ],
  },
  {
    name: "Kids",
    path: "/kids",
    hasMegaMenu: true,
    columns: [
      {
        title: "Age Group",
        links: ["Toddlers", "Little Kids", "Big Kids"],
      },
      {
        title: "Footwear",
        links: [
          "All Kids Shoes",
          "School Shoes",
          "Sport Sneakers",
          "Outdoor Sandals",
        ],
      },
      {
        title: "Accessories",
        links: ["Kids Backpacks", "Colorful Socks", "Caps"],
      },
    ],
  },
  {
    name: "Brands",
    path: "/brands",
    hasMegaMenu: true,
    columns: [
      {
        title: "Top Brands",
        links: ["Nike", "Adidas", "Puma", "Reebok", "New Balance"],
      },
      {
        title: "Exclusive",
        links: ["Kanza Signature", "Local Pride", "Global Designers"],
      },
    ],
  },
  { name: "Sale", path: "/sale", hasMegaMenu: false, isSale: true },
];
export default navItems;
