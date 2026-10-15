// Nội dung các trang thông tin ở Footer (đường dẫn: /info/<slug>).
// ĐÂY LÀ NỘI DUNG MẪU: hãy sửa lại thông tin liên hệ, chính sách... cho đúng với cửa hàng thật.
//
// Mỗi section có "heading" và MỘT trong: text (mảng đoạn văn), list (mảng gạch đầu dòng),
// hoặc table ({ head: [...], rows: [[...]] }).

export const INFO_PAGES = {
  contact: {
    title: "Contact Us",
    intro:
      "Questions about an order, a product or sizing? We're happy to help.",
    sections: [
      {
        heading: "Customer support",
        list: [
          "Email: support@example.com",
          "Phone: +84 000 000 000",
          "Hours: Monday to Saturday, 9:00 - 18:00",
        ],
      },
      {
        heading: "Before you write",
        text: [
          "For order questions, please include your order number so we can find it quickly. You can see all your orders on the Orders page after logging in.",
        ],
      },
    ],
  },

  shipping: {
    title: "Shipping Info",
    intro: "Fast, tracked delivery on every order.",
    sections: [
      {
        heading: "Shipping costs",
        list: [
          "Free shipping on orders over $100.",
          "A flat shipping fee applies to orders under $100 and is shown at checkout.",
        ],
      },
      {
        heading: "Delivery time",
        text: [
          "Orders are processed within 1-2 business days. Delivery usually takes 2-5 business days depending on your location.",
        ],
      },
      {
        heading: "Tracking",
        text: [
          "Once your order ships you can follow its status on the Orders page.",
        ],
      },
    ],
  },

  returns: {
    title: "Returns & Exchanges",
    intro: "Not the right fit? Returns are easy within 30 days.",
    sections: [
      {
        heading: "Return policy",
        list: [
          "You can return unworn shoes in their original box within 30 days of delivery.",
          "Shoes that show signs of wear, or that are missing the box, may not be accepted.",
        ],
      },
      {
        heading: "How to return",
        list: [
          "Contact our support team with your order number.",
          "Pack the shoes in their original box.",
          "Send the parcel using the instructions we give you.",
        ],
      },
      {
        heading: "Refunds & exchanges",
        text: [
          "Refunds go back to your original payment method once we receive and check the shoes. If you'd like a different size, tell us and we'll arrange an exchange.",
        ],
      },
    ],
  },

  faq: {
    title: "FAQ",
    intro: "Quick answers to the questions we hear most.",
    sections: [
      {
        heading: "Are your shoes authentic?",
        text: ["Yes. We only sell authentic branded shoes."],
      },
      {
        heading: "How do I find my size?",
        text: ["Check our Size Guide, or contact us if you're between sizes."],
      },
      {
        heading: "Can I change or cancel my order?",
        text: [
          "Contact us as soon as possible. If the order hasn't shipped yet we'll do our best to update or cancel it.",
        ],
      },
      {
        heading: "I forgot my password",
        text: [
          'Use the "Forgot password?" link on the login page and follow the instructions to set a new one.',
        ],
      },
    ],
  },

  "size-guide": {
    title: "Size Guide",
    intro:
      "Sizes vary slightly between brands, so use this table as a general guide.",
    sections: [
      {
        heading: "Size chart (approximate)",
        table: {
          head: ["US Men", "US Women", "EU", "UK", "Foot length (cm)"],
          rows: [
            ["6", "7.5", "39", "5.5", "24"],
            ["7", "8.5", "40", "6", "25"],
            ["8", "9.5", "41", "7", "26"],
            ["9", "10.5", "42.5", "8", "27"],
            ["10", "11.5", "44", "9", "28"],
            ["11", "12.5", "45", "10", "29"],
            ["12", "13.5", "46", "11", "30"],
          ],
        },
      },
      {
        heading: "How to measure your foot",
        list: [
          "Stand on a sheet of paper and mark the tip of your longest toe and your heel.",
          "Measure the distance between the two marks in centimetres.",
          "Find the closest length in the table above. If you're between sizes, choose the larger one.",
        ],
      },
    ],
  },

  about: {
    title: "About Us",
    intro:
      "Kanza is your destination for authentic branded shoes - quality, style and comfort in one place.",
    sections: [
      {
        heading: "What we do",
        text: [
          "We bring together shoes from the brands you love, for men, women and kids, so you can find the right pair without searching in a dozen places.",
        ],
      },
    ],
  },

  careers: {
    title: "Careers",
    intro:
      "We're always happy to meet people who love shoes and great service.",
    sections: [
      {
        heading: "Open positions",
        text: [
          "There are no open positions right now. Check back soon, or send us a message through the Contact Us page.",
        ],
      },
    ],
  },

  sustainability: {
    title: "Sustainability",
    intro: "Better choices, one pair at a time.",
    sections: [
      {
        heading: "Our approach",
        text: [
          "We want to reduce waste by helping you find shoes that fit well and last longer. More details about our sustainability work are coming soon.",
        ],
      },
    ],
  },

  blog: {
    title: "Blog",
    intro: "Style tips, new releases and care guides.",
    sections: [
      {
        heading: "Coming soon",
        text: ["Our first articles are on the way. Stay tuned!"],
      },
    ],
  },

  "store-locator": {
    title: "Store Locator",
    intro: "Find a Kanza store near you.",
    sections: [
      {
        heading: "Online only for now",
        text: [
          "We currently sell online only. Physical store locations will be listed here when they open.",
        ],
      },
    ],
  },

  terms: {
    title: "Terms & Conditions",
    intro: "Please read these terms before using our website.",
    sections: [
      {
        heading: "Using the site",
        text: [
          "By using this website and placing orders, you agree to these terms. Please use the site lawfully and keep your account details safe.",
        ],
      },
      {
        heading: "Orders & prices",
        text: [
          "Prices are shown on each product page. We may cancel or refuse an order if a product is unavailable or a pricing error occurred, and we will refund any payment made.",
        ],
      },
      {
        heading: "Changes",
        text: [
          "We may update these terms from time to time. Continued use of the site means you accept the updated terms.",
        ],
      },
    ],
  },

  privacy: {
    title: "Privacy Policy",
    intro: "How we handle your personal information.",
    sections: [
      {
        heading: "What we collect",
        list: [
          "Account details such as your name and email address.",
          "Order and delivery information.",
          "Your email address if you subscribe to our newsletter.",
        ],
      },
      {
        heading: "How we use it",
        text: [
          "We use your information to process orders, provide support and, if you subscribe, send you news and offers. We do not sell your personal data.",
        ],
      },
      {
        heading: "Your choices",
        text: [
          "You can contact us at any time to ask about, correct or delete your information, or to stop receiving our newsletter.",
        ],
      },
    ],
  },
};
