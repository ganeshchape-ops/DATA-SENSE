import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Dataset, DatasetProfile } from '../types';
import { datasetApi, analyticsApi } from '../services/api';
import { useAuth } from './AuthContext';

interface DatasetContextType {
  datasets: Dataset[];
  activeDataset: Dataset | null;
  profile: DatasetProfile | null;
  isLoading: boolean;
  isProfileLoading: boolean;
  setActiveDataset: (dataset: Dataset | null) => void;
  selectDatasetById: (id: number) => Promise<void>;
  refreshDatasets: () => Promise<void>;
  loadSampleDataset: (sampleKey: string) => Promise<Dataset>;
  deleteDataset: (id: number) => Promise<void>;
}

const DatasetContext = createContext<DatasetContextType | undefined>(undefined);

export const DatasetProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [datasets, setDatasets] = useState<Dataset[]>([]);
  const [activeDataset, setActiveDataset] = useState<Dataset | null>(null);
  const [profile, setProfile] = useState<DatasetProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isProfileLoading, setIsProfileLoading] = useState<boolean>(false);

  const refreshDatasets = async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    try {
      const data = await datasetApi.list();
      setDatasets(data);
      if (data.length > 0 && !activeDataset) {
        setActiveDataset(data[0]);
      }
    } catch (err) {
      console.error("Failed to load datasets:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      refreshDatasets();
    } else {
      setDatasets([]);
      setActiveDataset(null);
      setProfile(null);
    }
  }, [isAuthenticated]);

  // When activeDataset changes, fetch its profile
  useEffect(() => {
    if (activeDataset) {
      setIsProfileLoading(true);
      analyticsApi.getProfile(activeDataset.id)
        .then(profData => setProfile(profData))
        .catch(err => console.error("Failed to fetch profile:", err))
        .finally(() => setIsProfileLoading(false));
    } else {
      setProfile(null);
    }
  }, [activeDataset?.id]);

  const selectDatasetById = async (id: number) => {
    const found = datasets.find(d => d.id === id);
    if (found) {
      setActiveDataset(found);
    } else {
      try {
        const d = await datasetApi.get(id);
        setActiveDataset(d);
      } catch (err) {
        console.error("Failed to select dataset:", err);
      }
    }
  };

  const loadSampleDataset = async (sampleKey: string) => {
    setIsLoading(true);
    try {
      const created = await datasetApi.loadSample(sampleKey);
      await refreshDatasets();
      setActiveDataset(created);
      return created;
    } finally {
      setIsLoading(false);
    }
  };

  const deleteDataset = async (id: number) => {
    await datasetApi.delete(id);
    if (activeDataset?.id === id) {
      const remaining = datasets.filter(d => d.id !== id);
      setActiveDataset(remaining.length > 0 ? remaining[0] : null);
    }
    await refreshDatasets();
  };

  return (
    <DatasetContext.Provider
      value={{
        datasets,
        activeDataset,
        profile,
        isLoading,
        isProfileLoading,
        setActiveDataset,
        selectDatasetById,
        refreshDatasets,
        loadSampleDataset,
        deleteDataset,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
};

export const useDataset = () => {
  const ctx = useContext(DatasetContext);
  if (!ctx) throw new Error('useDataset must be used within a DatasetProvider');
  return ctx;
};
