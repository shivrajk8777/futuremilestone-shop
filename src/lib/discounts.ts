import { getDatabase } from '@/lib/mongodb';

export interface Discount {
  _id: any;
  name: string;
  type: 'percentage' | 'fixed';
  value: number;
  scope: 'all' | 'category' | 'products';
  collectionIds?: string[];
  productIds?: string[];
  active: boolean;
}

export async function getActiveDiscounts(): Promise<Discount[]> {
  try {
    const db = await getDatabase();
    return await db.collection<Discount>('discounts').find({ active: true }).toArray();
  } catch (error) {
    console.error('Failed to get active discounts:', error);
    return [];
  }
}

export function applyDiscountsToProduct(product: any, discounts: Discount[]) {
  const originalPrice = Number(product.price) || 0;
  let bestDiscountedPrice = originalPrice;
  let activeDiscount: Discount | null = null;

  for (const discount of discounts) {
    let applies = false;
    if (discount.scope === 'all') {
      applies = true;
    } else if (discount.scope === 'category' && discount.collectionIds && product.collectionId) {
      applies = discount.collectionIds.includes(product.collectionId.toString());
    } else if (discount.scope === 'products' && discount.productIds && product.id) {
      applies = discount.productIds.includes(product.id.toString());
    }

    if (applies) {
      let discountedPrice = originalPrice;
      if (discount.type === 'percentage') {
        discountedPrice = originalPrice * (1 - discount.value / 100);
      } else if (discount.type === 'fixed') {
        discountedPrice = originalPrice - discount.value;
      }
      
      discountedPrice = Math.max(0, discountedPrice);
      if (discountedPrice < bestDiscountedPrice) {
        bestDiscountedPrice = discountedPrice;
        activeDiscount = discount;
      }
    }
  }

  let discountBadge = '';
  if (activeDiscount) {
    if (activeDiscount.type === 'percentage') {
      discountBadge = `${activeDiscount.value}% OFF`;
    } else {
      discountBadge = `$${activeDiscount.value} OFF`;
    }
  }

  // Also apply discounts to dimensionsList variants if present
  let dimensionsList = product.dimensionsList || [];
  if (dimensionsList.length > 0) {
    dimensionsList = dimensionsList.map((d: any) => {
      const dOriginalPrice = Number(d.price) || 0;
      let dBestPrice = dOriginalPrice;

      if (activeDiscount) {
        if (activeDiscount.type === 'percentage') {
          dBestPrice = dOriginalPrice * (1 - activeDiscount.value / 100);
        } else if (activeDiscount.type === 'fixed') {
          dBestPrice = dOriginalPrice - activeDiscount.value;
        }
        dBestPrice = Math.max(0, dBestPrice);
      }

      return {
        ...d,
        originalPrice: dOriginalPrice,
        price: dBestPrice,
      };
    });
  }

  return {
    ...product,
    price: bestDiscountedPrice,
    originalPrice,
    discountBadge,
    discount: activeDiscount ? {
      name: activeDiscount.name,
      type: activeDiscount.type,
      value: activeDiscount.value,
    } : null,
    dimensionsList,
  };
}
