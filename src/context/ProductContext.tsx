'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface DBProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  originalPrice?: number;
  discountBadge?: string;
  discount?: any;
  category: string;
  tagline: string;
  description: string;
  features: string[];
  dimensions: string;
  shippingReturns: string;
  images: string[];
}

interface ProductState {
  productsByCategory: Record<string, DBProduct[]>;
  pages: Record<string, number>;
  hasMore: Record<string, boolean>;
  loading: Record<string, boolean>;
  error: Record<string, string | null>;
  initialFetched: boolean;
}

type ProductAction =
  | { type: 'FETCH_INIT_START'; category: string }
  | { type: 'FETCH_INIT_SUCCESS'; category: string; products: DBProduct[] }
  | { type: 'FETCH_INIT_FAILURE'; category: string; error: string }
  | { type: 'FETCH_MORE_START'; category: string }
  | { type: 'FETCH_MORE_SUCCESS'; category: string; products: DBProduct[] }
  | { type: 'FETCH_MORE_FAILURE'; category: string; error: string }
  | { type: 'SET_INITIAL_FETCHED' };

const initialState: ProductState = {
  productsByCategory: {},
  pages: {},
  hasMore: {},
  loading: {},
  error: {},
  initialFetched: false,
};

function productReducer(state: ProductState, action: ProductAction): ProductState {
  switch (action.type) {
    case 'FETCH_INIT_START':
      return {
        ...state,
        loading: { ...state.loading, [action.category]: true },
        error: { ...state.error, [action.category]: null },
      };
    case 'FETCH_INIT_SUCCESS':
      return {
        ...state,
        loading: { ...state.loading, [action.category]: false },
        productsByCategory: {
          ...state.productsByCategory,
          [action.category]: action.products,
        },
        hasMore: {
          ...state.hasMore,
          [action.category]: action.products.length >= 8,
        },
      };
    case 'FETCH_INIT_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, [action.category]: false },
        error: { ...state.error, [action.category]: action.error },
      };
    case 'FETCH_MORE_START':
      return {
        ...state,
        loading: { ...state.loading, [action.category]: true },
      };
    case 'FETCH_MORE_SUCCESS':
      return {
        ...state,
        loading: { ...state.loading, [action.category]: false },
        productsByCategory: {
          ...state.productsByCategory,
          [action.category]: [
            ...state.productsByCategory[action.category],
            ...action.products,
          ],
        },
        pages: {
          ...state.pages,
          [action.category]: state.pages[action.category] + 1,
        },
        hasMore: {
          ...state.hasMore,
          [action.category]: action.products.length >= 8,
        },
      };
    case 'FETCH_MORE_FAILURE':
      return {
        ...state,
        loading: { ...state.loading, [action.category]: false },
        error: { ...state.error, [action.category]: action.error },
      };
    case 'SET_INITIAL_FETCHED':
      return {
        ...state,
        initialFetched: true,
      };
    default:
      return state;
  }
}

const ProductContext = createContext<
  | {
      state: ProductState;
      fetchMoreProducts: (category: string) => Promise<void>;
      fetchCategoryProducts: (category: string) => Promise<void>;
      refetchInitial: () => Promise<void>;
    }
  | undefined
>(undefined);

export function ProductProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(productReducer, initialState);

  // Helper function to fetch a single page of products
  const fetchProductsList = async (category: string, page: number) => {
    const catParam = category === 'all'
      ? ''
      : category === 'favorites'
        ? '&favorites=true'
        : `&category=${category}`;
    const response = await fetch(`/api/products?page=${page}&limit=8${catParam}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch products: ${response.statusText}`);
    }
    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error || 'Failed to fetch products');
    }
    return data.products;
  };

  const fetchInitialProducts = async () => {
    // Only pre-fetch 'all' and 'favorites' on startup — other categories load on demand
    const categories = ['all', 'favorites'];
    
    await Promise.all(
      categories.map(async (category) => {
        dispatch({ type: 'FETCH_INIT_START', category });
        try {
          const productsList = await fetchProductsList(category, 1);
          dispatch({ type: 'FETCH_INIT_SUCCESS', category, products: productsList });
        } catch (error: any) {
          console.error(`Error loading initial products for category ${category}:`, error);
          dispatch({ type: 'FETCH_INIT_FAILURE', category, error: error.message || 'Unknown error' });
        }
      })
    );
    dispatch({ type: 'SET_INITIAL_FETCHED' });
  };

  // Fetch a specific category's first page if not already loaded or loading
  const fetchCategoryProducts = async (category: string) => {
    // Skip if already loaded or currently loading
    if (
      state.loading[category] ||
      (state.productsByCategory[category] !== undefined && state.productsByCategory[category].length > 0)
    ) {
      return;
    }
    dispatch({ type: 'FETCH_INIT_START', category });
    try {
      const productsList = await fetchProductsList(category, 1);
      dispatch({ type: 'FETCH_INIT_SUCCESS', category, products: productsList });
    } catch (error: any) {
      console.error(`Error loading products for category ${category}:`, error);
      dispatch({ type: 'FETCH_INIT_FAILURE', category, error: error.message || 'Unknown error' });
    }
  };

  const fetchMoreProducts = async (category: string) => {
    if (state.loading[category] || !state.hasMore[category]) {
      return;
    }

    const nextPage = state.pages[category] + 1;
    dispatch({ type: 'FETCH_MORE_START', category });

    try {
      const productsList = await fetchProductsList(category, nextPage);
      dispatch({ type: 'FETCH_MORE_SUCCESS', category, products: productsList });
    } catch (error: any) {
      console.error(`Error loading page ${nextPage} products for category ${category}:`, error);
      dispatch({ type: 'FETCH_MORE_FAILURE', category, error: error.message || 'Unknown error' });
    }
  };

  useEffect(() => {
    if (!state.initialFetched) {
      fetchInitialProducts();
    }
  }, [state.initialFetched]);

  return (
    <ProductContext.Provider
      value={{
        state,
        fetchMoreProducts,
        fetchCategoryProducts,
        refetchInitial: fetchInitialProducts,
      }}
    >
      {children}
    </ProductContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductProvider');
  }
  return context;
}
