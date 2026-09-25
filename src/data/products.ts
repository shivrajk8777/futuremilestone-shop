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

];
