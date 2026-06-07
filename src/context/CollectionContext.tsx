'use client';

import React, { createContext, useContext, useReducer, useEffect } from 'react';

export interface Collection {
  id: string;
  name: string;
  slug: string;
  imageUrl: string;
  description: string;
}

interface CollectionState {
  collections: Collection[];
  loading: boolean;
  error: string | null;
  fetched: boolean;
}

type CollectionAction =
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: Collection[] }
  | { type: 'FETCH_FAILURE'; payload: string };

const initialState: CollectionState = {
  collections: [],
  loading: false,
  error: null,
  fetched: false,
};

function collectionReducer(state: CollectionState, action: CollectionAction): CollectionState {
  switch (action.type) {
    case 'FETCH_START':
      return { ...state, loading: true, error: null };
    case 'FETCH_SUCCESS':
      return {
        ...state,
        loading: false,
        collections: action.payload,
        fetched: true,
        error: null,
      };
    case 'FETCH_FAILURE':
      return { ...state, loading: false, error: action.payload, fetched: true };
    default:
      return state;
  }
}

const CollectionContext = createContext<
  | {
      state: CollectionState;
      refetchCollections: () => Promise<void>;
    }
  | undefined
>(undefined);

export function CollectionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(collectionReducer, initialState);

  const fetchCollections = async () => {
    dispatch({ type: 'FETCH_START' });
    try {
      const response = await fetch('/api/collections');
      if (!response.ok) {
        throw new Error(`Error: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.success) {
        dispatch({ type: 'FETCH_SUCCESS', payload: data.collections });
      } else {
        throw new Error(data.error || 'Failed to fetch collections');
      }
    } catch (error: any) {
      console.error('Failed to fetch collections:', error);
      dispatch({ type: 'FETCH_FAILURE', payload: error.message || 'Unknown error' });
    }
  };

  useEffect(() => {
    if (!state.fetched) {
      fetchCollections();
    }
  }, [state.fetched]);

  return (
    <CollectionContext.Provider value={{ state, refetchCollections: fetchCollections }}>
      {children}
    </CollectionContext.Provider>
  );
}

export function useCollections() {
  const context = useContext(CollectionContext);
  if (!context) {
    throw new Error('useCollections must be used within a CollectionProvider');
  }
  return context;
}
