import React, { createContext, useContext, useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { createDatabase, destroyDatabase, MaraudersMoney } from '../database/config';

interface AppContextType {
  database: MaraudersMoney | null;
  isLoading: boolean;
  error: Error | null;
}

const defaultContext: AppContextType = {
  database: null,
  isLoading: true,
  error: null,
};

const AppContext = createContext<AppContextType>(defaultContext);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [database, setDatabase] = useState<MaraudersMoney | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;

    const initDatabase = async () => {
      try {
        const db = await createDatabase();
        if (isMounted) {
          setDatabase(db);
          setError(null);
        }
      } catch (err) {
        console.error('Database initialization error:', err);
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Failed to initialize database'));
          setDatabase(null);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    initDatabase();

    return () => {
      isMounted = false;
      // Note: We don't call destroyDatabase here anymore since it might affect other components
    };
  }, []);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff' }}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={{ marginTop: 10, color: '#666666' }}>Initializing database...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#ffffff', padding: 20 }}>
        <Text style={{ fontSize: 18, color: '#ff0000', textAlign: 'center', marginBottom: 10 }}>
          Error initializing database
        </Text>
        <Text style={{ fontSize: 14, color: '#666666', textAlign: 'center' }}>{error.message}</Text>
      </View>
    );
  }

  return (
    <AppContext.Provider value={{ database, isLoading, error }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
