import { createContext, useContext, useState, type ReactNode } from "react";

export interface GlobalContextType {
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  isAuthenticated: boolean;
  setisAuthenticated: (initialized: boolean) => void;
  isLoaded: boolean | null;
  setIsLoaded: (initialized: boolean | null) => void;
}

export const GlobalContext = createContext<GlobalContextType>(
  {} as GlobalContextType
);

export function GlobalProvider({ children }: { children: ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setisAuthenticated] = useState(false);
  const [isLoaded, setIsLoaded] = useState<boolean | null>(null);
  const value: GlobalContextType = {
    isLoading,
    setIsLoading,
    isAuthenticated,
    setisAuthenticated,
    isLoaded,
    setIsLoaded,
  };

  return (
    <GlobalContext.Provider value={value}>
      {children}
      {isLoading && (
        <div className="fixed inset-0 bg-background/50 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </GlobalContext.Provider>
  );
}

export function useGlobal(): GlobalContextType {
  const context = useContext(GlobalContext);
  if (!context) {
    throw new Error("useGlobal must be used within a GlobalProvider");
  }
  return context;
}
