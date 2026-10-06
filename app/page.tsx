import { Suspense } from "react";
import { HomeSearchProvider } from "./home-search-provider";
import HomeUrlSync from "./home-url-sync";
import HomePageClient from "./home-page-client";
import HomeFaqJsonLd from "../components/HomeFaqJsonLd";

export default function Page() {
  return (
    <>
      <HomeFaqJsonLd />
      <HomeSearchProvider>
        <Suspense fallback={null}>
          <HomeUrlSync />
        </Suspense>
        <HomePageClient />
      </HomeSearchProvider>
    </>
  );
}
