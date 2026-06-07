'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface SavedAddress {
  id: string;
  label: string;
  name: string;
  addressLine: string;
  phone?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  savedAddresses?: SavedAddress[];
}

interface UserContextType {
  user: User | null;
  loading: boolean;
  isAuthModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signup: (name: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: { name: string; phone?: string; address?: string }) => Promise<{ success: boolean; error?: string }>;
  addAddress: (data: { label: string; name: string; addressLine: string; phone?: string }) => Promise<{ success: boolean; error?: string }>;
  deleteAddress: (addressId: string) => Promise<{ success: boolean; error?: string }>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch user:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // Listen to profile / authentication updates
  useEffect(() => {
    const handleAuthChange = () => {
      fetchCurrentUser();
    };
    window.addEventListener('auth-changed', handleAuthChange);
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        window.dispatchEvent(new Event('auth-changed'));
        return { success: true };
      }
      return { success: false, error: data.error || 'Login failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred' };
    }
  };

  const signup = async (name: string, email: string, password: string) => {
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (data.success && data.user) {
        setUser(data.user);
        window.dispatchEvent(new Event('auth-changed'));
        return { success: true };
      }
      return { success: false, error: data.error || 'Signup failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred' };
    }
  };

  const logout = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      setUser(null);
      window.dispatchEvent(new Event('auth-changed'));
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const updateProfile = async (data: { name: string; phone?: string; address?: string }) => {
    try {
      const res = await fetch('/api/auth/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        setUser(resData.user);
        return { success: true };
      }
      return { success: false, error: resData.error || 'Update failed' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred' };
    }
  };

  const addAddress = async (data: { label: string; name: string; addressLine: string; phone?: string }) => {
    try {
      const res = await fetch('/api/auth/addresses/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        setUser(resData.user);
        return { success: true };
      }
      return { success: false, error: resData.error || 'Failed to add address' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred' };
    }
  };

  const deleteAddress = async (addressId: string) => {
    try {
      const res = await fetch('/api/auth/addresses/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ addressId }),
      });
      const resData = await res.json();
      if (resData.success && resData.user) {
        setUser(resData.user);
        return { success: true };
      }
      return { success: false, error: resData.error || 'Failed to delete address' };
    } catch (err: any) {
      return { success: false, error: err.message || 'An error occurred' };
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        loading,
        isAuthModalOpen,
        setAuthModalOpen,
        login,
        signup,
        logout,
        updateProfile,
        addAddress,
        deleteAddress,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
