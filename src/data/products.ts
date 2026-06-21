export interface ProductDetailSection {
  id: string;
  imageUrl: string;
  heading: string;
  content: string;
}

export interface Product {
  slug: string;
  name: string;
  price: number;
  category: 'wood' | 'dark' | 'modern';
  tagline: string;
  description: string;
  features: string[];
  dimensions: string;
  shippingReturns: string;
  images: string[];
  originalPrice?: number;
  discountBadge?: string;
  details?: ProductDetailSection[];
}

export const products: Product[] = [
  {
    slug: 'sona',
    name: 'Sona Armchair',
    price: 650,
    category: 'wood',
    tagline: 'Crafting Comfort, Inspired by the North',
    description: 'Designed for ultimate comfort and aesthetic appeal, the Sona Armchair balances a robust timber framework with soft leather upholstery. Perfect for lounge spaces and modern living rooms looking for a touch of Scandinavian elegance.',
    features: [
      'Handcrafted solid oak frame',
      'Premium top-grain leather cushioning',
      'Ergonomic lumbar support',
      'Timeless Scandinavian aesthetic'
    ],
    dimensions: 'Height: 82cm | Width: 74cm | Depth: 78cm | Seat Height: 44cm',
    shippingReturns: 'Free shipping on orders over $500. Standard delivery takes 3-7 business days. Easy returns within 30 days of delivery.',
    images: [
      '/images/s1Gw9pyuUEC9vViCqmou6hRgI_bc9f50.webp',
      '/images/1c3s4XR0YhiP5U0jMudG8pcXqDA_692e67.webp',
      '/images/vb8XKVhsi1CNqzR5Bozhb2yTXeo_ca005a.webp',
      '/images/GbiVrsgrVhulfQoqpcQTKA1u4_a30742.webp'
    ]
  },
  {
    slug: 'sage',
    name: 'Sage Dining Chair',
    price: 380,
    category: 'wood',
    tagline: 'Natural Elegance in Every Detail',
    description: 'Crafted from solid oak with a smooth, durable finish, the Sage Dining Chair is both timeless and sturdy. Its clean lines and minimalistic design complement any modern dining layout, offering reliable support and enduring style.',
    features: [
      '100% solid white oak construction',
      'Contoured seat for added comfort',
      'Non-slip floor protector pads included',
      'Durable matte protective finish'
    ],
    dimensions: 'Height: 78cm | Width: 46cm | Depth: 50cm | Seat Height: 45cm',
    shippingReturns: 'Ships in a protective double-walled box. Standard flat-rate shipping applies. Returns accepted within 30 days.',
    images: [
      '/images/AI4t0V6X3l1WLYpNSHg1ozW2k_0dab0d.png',
      '/images/AI4t0V6X3l1WLYpNSHg1ozW2k_0dab0d.png',
      '/images/AI4t0V6X3l1WLYpNSHg1ozW2k_392f24.png'
    ]
  },
  {
    slug: 'venn',
    name: 'Venn Lounge Chair',
    price: 420,
    category: 'modern',
    tagline: 'Simple, sleek, and built for a cozy lifestyle',
    description: 'The Venn Lounge Chair brings together organic textures and modern geometry. Featuring structural wool webbing and a lightweight ash frame, it provides a relaxed seat that adds warmth and minimal charm to your interior.',
    features: [
      'Lightweight solid ash wood frame',
      'Flexible, high-tensile wool webbing',
      'Perfect for reading nooks and bedrooms',
      'Eco-friendly manufacturing processes'
    ],
    dimensions: 'Height: 74cm | Width: 68cm | Depth: 72cm | Seat Height: 40cm',
    shippingReturns: 'Ships fully assembled. Standard shipping fees apply. Easy exchange policy within 14 days of delivery.',
    images: [
      '/images/yYLWsSIThGzudn2zKw0Wb4koj8_ba7228.png',
      '/images/yYLWsSIThGzudn2zKw0Wb4koj8_ba7228.png',
      '/images/yYLWsSIThGzudn2zKw0Wb4koj8_9ad902.png'
    ]
  },
  {
    slug: 'holt',
    name: 'Holt Stool',
    price: 290,
    category: 'wood',
    tagline: 'Compact Minimalism, Enduring Craft',
    description: 'The Holt Stool is a versatile accent piece designed for multiple spaces. Use it as a stool, side table, or footrest. Crafted from rich European walnut, its sturdy joint construction ensures it lasts a lifetime.',
    features: [
      'Solid walnut wood',
      'Traditional mortise and tenon joinery',
      'Multi-functional design',
      'Matte oil finish'
    ],
    dimensions: 'Height: 45cm | Width: 35cm | Depth: 35cm',
    shippingReturns: 'Free standard shipping. Returns are subject to a 10% restocking fee after 15 days.',
    images: [
      '/images/ggJfZ3SXgLDkDSgbnlBWaFUxmPk_4d5566.png',
      '/images/ggJfZ3SXgLDkDSgbnlBWaFUxmPk_4d5566.png',
      '/images/ggJfZ3SXgLDkDSgbnlBWaFUxmPk_fb74f5.png'
    ]
  },
  {
    slug: 'noor',
    name: 'Noor Lounge Chair',
    price: 490,
    category: 'dark',
    tagline: 'Sleek Dark Finishes for Sophisticated Living',
    description: 'The Noor Lounge Chair features a matte black stained oak frame and plush, dark charcoal performance fabric cushions. Its low profile and deep seat offer a relaxed, luxurious lounging experience.',
    features: [
      'Stained black oak frame',
      'Stain-resistant performance fabric cushions',
      'Deep, low-profile seating',
      'Removable, dry-cleanable cushion covers'
    ],
    dimensions: 'Height: 72cm | Width: 80cm | Depth: 84cm | Seat Height: 38cm',
    shippingReturns: 'Ships in 2 boxes, assembly required. Free shipping nationwide. Returns accepted within 30 days.',
    images: [
      '/images/vTrJfjXHGV0J4ECovLJuNPdGg8_84abf8.png',
      '/images/vTrJfjXHGV0J4ECovLJuNPdGg8_84abf8.png',
      '/images/vTrJfjXHGV0J4ECovLJuNPdGg8_0d3da8.png'
    ]
  },
  {
    slug: 'haven',
    name: 'Haven Sofa',
    price: 1200,
    category: 'modern',
    tagline: 'A Sanctuary of Comfort and Style',
    description: 'The Haven Sofa is the focal point of the modern home. Its modular construction, subtle curves, and premium boucle fabric provide a luxurious, inviting space for family and friends. Made with solid hardwood frames for ultimate durability.',
    features: [
      'Premium textured boucle upholstery',
      'High-resiliency foam and feather blend fill',
      'Kiln-dried hardwood frame',
      'Modular expansion options available'
    ],
    dimensions: 'Height: 70cm | Width: 210cm | Depth: 95cm | Seat Height: 42cm',
    shippingReturns: 'Special white-glove delivery required. Delivery time: 2-3 weeks. Returns accepted with return shipping fee covered by customer.',
    images: [
      '/images/yYHBRzt10DB4XejQ5Ryjy1WcDFw_f20830.png',
      '/images/yYHBRzt10DB4XejQ5Ryjy1WcDFw_f20830.png',
      '/images/yYHBRzt10DB4XejQ5Ryjy1WcDFw_bf0aec.png'
    ]
  },
  {
    slug: 'elm',
    name: 'Elm Dining Chair',
    price: 340,
    category: 'wood',
    tagline: 'Simplicity Elevated',
    description: 'A classic chair redefined with modern angles. The Elm Dining Chair highlights the organic grains of elm wood, featuring a curved spindle backrest and slim legs for a lightweight silhouette that suits compact and grand dining spaces alike.',
    features: [
      'Solid elm wood spindle design',
      'Ergonomically curved backrest',
      'Lightweight and easy to move',
      'Eco-friendly water-based finish'
    ],
    dimensions: 'Height: 84cm | Width: 45cm | Depth: 48cm | Seat Height: 46cm',
    shippingReturns: 'Flat pack shipping, minor assembly required. Free shipping on pairs.',
    images: [
      '/images/SYAR7zTVigzC7mgv745HOH4dmg_dd2b5d.png',
      '/images/SYAR7zTVigzC7mgv745HOH4dmg_dd2b5d.png',
      '/images/SYAR7zTVigzC7mgv745HOH4dmg_ed8970.png'
    ]
  },
  {
    slug: 'kapp',
    name: 'Kapp Side Table',
    price: 450,
    category: 'dark',
    tagline: 'Industrial Elements Meet Nordic Geometry',
    description: 'The Kapp Side Table pairs a blackened steel pedestal with a dark, stained oak top. The sculptural base adds a dramatic accent to living spaces, making it a perfect stand for books, drinks, or minimal lamps.',
    features: [
      'Weighted steel base in matte black',
      'Dark stained solid oak top',
      'Compact footprint',
      'Industrial minimalist style'
    ],
    dimensions: 'Height: 52cm | Diameter: 42cm',
    shippingReturns: 'Fully assembled shipping. Low shipping rates. 30 days return window.',
    images: [
      '/images/iJjf4vyN8lA7ss2czi2hH8XBJ5Y_2c60b7.png',
      '/images/iJjf4vyN8lA7ss2czi2hH8XBJ5Y_2c60b7.png',
      '/images/iJjf4vyN8lA7ss2czi2hH8XBJ5Y_61ff25.png'
    ]
  },
  {
    slug: 'sol',
    name: 'Sol Coffee Table',
    price: 310,
    category: 'wood',
    tagline: 'Warmth and Geometry in Balance',
    description: 'Inspired by the sun, the Sol Coffee Table features a perfectly circular top supported by three chunky, triangular timber legs. Made of light oak, it reflects natural light beautifully, enhancing the warmth of any lounge area.',
    features: [
      'Solid light oak top and legs',
      'Rounded safety edges',
      'Chunky architectural legs',
      'Heat and spill resistant sealer'
    ],
    dimensions: 'Height: 38cm | Diameter: 80cm',
    shippingReturns: 'Flat pack, assembly takes 5 minutes (tools included). Standard flat-rate shipping.',
    images: [
      '/images/ymzPiAu4uaJ0K3vu595O2xdpyWY_f48ee8.png',
      '/images/ymzPiAu4uaJ0K3vu595O2xdpyWY_f48ee8.png',
      '/images/ymzPiAu4uaJ0K3vu595O2xdpyWY_302993.png'
    ]
  },
  {
    slug: 'nest',
    name: 'Nest Storage Unit',
    price: 360,
    category: 'wood',
    tagline: 'Hide Your Belongings in Style',
    description: 'A minimal cabinet designed to tuck away clutter. The Nest Storage Unit features sliding tambour doors that glide smoothly, revealing adjustable shelving inside. Made of pale solid ash for a soft, airy look.',
    features: [
      ' Tambour sliding door mechanism',
      'Adjustable internal shelving',
      'Solid ash casing',
      'Wall-mounting safety hardware included'
    ],
    dimensions: 'Height: 65cm | Width: 90cm | Depth: 40cm',
    shippingReturns: 'Ships assembled. Heavy item delivery surcharges apply. Returns accepted within 14 days.',
    images: [
      '/images/LWD4822KCHnWOlyOH4PqORY_527ce8.png',
      '/images/LWD4822KCHnWOlyOH4PqORY_527ce8.png',
      '/images/LWD4822KCHnWOlyOH4PqORY_e6e6f8.png'
    ]
  },
  {
    slug: 'skala',
    name: 'Skala',
    price: 210,
    originalPrice: 420,
    discountBadge: '50% OFF',
    category: 'modern',
    tagline: 'Architectural Comfort',
    description: 'Made from solid oak, this chair showcases the natural beauty of the wood with its smooth grain and warm finish.',
    features: [
      'Angular architectural oak frame',
      'Deep, angled seat cushion',
      'Neutral textured weave fabric',
      'Reinforced joinery'
    ],
    dimensions: 'Height: 76cm | Width: 70cm | Depth: 76cm | Seat Height: 41cm',
    shippingReturns: 'Ships assembled. Free shipping. Returns accepted in original packaging within 30 days.',
    images: [
      '/images/iZcQmYN9TR0h0ayggDdZtavX6Y_e4e4b0.png',
      '/images/iZcQmYN9TR0h0ayggDdZtavX6Y_e4e4b0.png',
      '/images/iZcQmYN9TR0h0ayggDdZtavX6Y_6ef375.png'
    ]
  },
  {
    slug: 'runa',
    name: 'Runa Armchair',
    price: 480,
    category: 'dark',
    tagline: 'Moody Scandinavian Minimalism',
    description: 'A striking statement chair designed to capture attention. The Runa Armchair features a dark charcoal ash frame and matching wool cushions, bringing a clean, moody, and highly sophisticated tone to the modern study or corner.',
    features: [
      'Dark charcoal stained ash frame',
      '100% boiled wool dark cushions',
      'Sleek tapered armrests',
      'High density memory foam insert'
    ],
    dimensions: 'Height: 80cm | Width: 65cm | Depth: 70cm | Seat Height: 44cm',
    shippingReturns: 'Ships within 3 days. Standard shipping. Returns accepted within 30 days.',
    images: [
      '/images/iNpQffoQhCjWmeui2qONazlqcE_aeec88.png',
      '/images/iNpQffoQhCjWmeui2qONazlqcE_aeec88.png',
      '/images/iNpQffoQhCjWmeui2qONazlqcE_6bd1be.png'
    ]
  },
  {
    slug: 'lykke',
    name: 'Lykke Dining Chair',
    price: 430,
    category: 'modern',
    tagline: 'Joy in Form',
    description: 'Lykke, the Danish word for happiness, perfectly captures this chair. Its backrest forms a gentle crescent shape that wraps around you, upholstered in a soft beige fabric and supported by slim black metal legs.',
    features: [
      'Curved crescent wrap-around backrest',
      'Powder-coated slim black steel legs',
      'Beige durable textured fabric',
      'Sturdy steel core frame'
    ],
    dimensions: 'Height: 79cm | Width: 54cm | Depth: 55cm | Seat Height: 45cm',
    shippingReturns: 'Flat pack, assembly takes 5 mins. Free shipping on sets of 4.',
    images: [
      '/images/TBjf6f4a48NH4ch4WosP8wEFjo_ebc576.png',
      '/images/TBjf6f4a48NH4ch4WosP8wEFjo_ebc576.png',
      '/images/TBjf6f4a48NH4ch4WosP8wEFjo_ab628a.png'
    ]
  },
  {
    slug: 'alba',
    name: 'Alba Credenza',
    price: 590,
    category: 'modern',
    tagline: 'Premium Storage Redefined',
    description: 'An elegant credenza featuring details that elevate the ordinary. The Alba Sideboard is made from natural oak, featuring detailed horizontal louvers that act as integrated drawer pulls, providing clean storage for media or dining essentials.',
    features: [
      'Solid oak louvered doors',
      'Integrated soft-close hinges',
      'Wire routing holes in back panel',
      'Adjustable internal shelving'
    ],
    dimensions: 'Height: 72cm | Width: 160cm | Depth: 45cm',
    shippingReturns: 'Ships on pallet. Freight shipping rates apply. Returns within 15 days.',
    images: [
      '/images/oDylGuE4LeZKCi2X69Rzd3Mt0Jk_e265f9.webp',
      '/images/oDylGuE4LeZKCi2X69Rzd3Mt0Jk_0a7050.webp',
      '/images/oDylGuE4LeZKCi2X69Rzd3Mt0Jk_f1cd2f.webp'
    ]
  }
];
