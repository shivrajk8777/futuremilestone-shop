'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface MasterSettings {
  marqueeVisible: boolean;
  marqueeText: string;
  carouselVisible: boolean;
  slides: any[];
}

interface SettingsContextType {
  settings: MasterSettings;
  loading: boolean;
  refetchSettings: () => Promise<void>;
}

const defaultSettings: MasterSettings = {
  marqueeVisible: true,
  marqueeText: 'Save 20% on your first order',
  carouselVisible: true,
  slides: [],
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = useState<MasterSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.settings) {
          setSettings(data.settings);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider
      value={{ settings, loading, refetchSettings: fetchSettings }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
