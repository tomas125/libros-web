"use client";

import { useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { useHomeSearch } from "./home-search-provider";

/** Lee ?q= y ?buscar=1; debe ir dentro de Suspense en el page (Server Component). */
export default function HomeUrlSync() {
  const searchParams = useSearchParams();
  const { setSearch, searchInputRef } = useHomeSearch();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(decodeURIComponent(q));
  }, [searchParams, setSearch]);

  useEffect(() => {
    if (searchParams.get("buscar") !== "1") return;
    const t = window.setTimeout(() => searchInputRef.current?.focus(), 200);
    return () => window.clearTimeout(t);
  }, [searchParams, searchInputRef]);

  return null;
}
