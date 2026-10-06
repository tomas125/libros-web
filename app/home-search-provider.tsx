"use client";

import {
  createContext,
  useContext,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";

type HomeSearchContextValue = {
  search: string;
  setSearch: React.Dispatch<React.SetStateAction<string>>;
  searchInputRef: MutableRefObject<HTMLInputElement | null>;
};

const HomeSearchContext = createContext<HomeSearchContextValue | null>(null);

export function HomeSearchProvider({ children }: { children: ReactNode }) {
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  return (
    <HomeSearchContext.Provider value={{ search, setSearch, searchInputRef }}>
      {children}
    </HomeSearchContext.Provider>
  );
}

export function useHomeSearch() {
  const ctx = useContext(HomeSearchContext);
  if (!ctx) {
    throw new Error("useHomeSearch debe usarse dentro de HomeSearchProvider");
  }
  return ctx;
}
