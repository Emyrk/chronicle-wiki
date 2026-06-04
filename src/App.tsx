import { useEffect } from "react";
import { Navigate, Route, Routes, useLocation } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { HomePage } from "@/pages/HomePage";
import { ServerHomePage } from "@/pages/ServerHomePage";
import { TalentPage } from "@/pages/TalentPage";
import { RaidPage } from "@/pages/RaidPage";
import { BossGuidePage } from "@/pages/BossGuidePage";
import { GuidesPage } from "@/pages/GuidesPage";
import { WikiDevelopmentPage } from "@/pages/WikiDevelopmentPage";
import { NotFoundPage } from "@/pages/NotFoundPage";
import { allRaidInstances } from "@/data/instances";
import { applyPageMetadata, routeMetadataForPathname } from "@/lib/pageMetadata";

const defaultRaidSlug = allRaidInstances()[0]?.slug ?? "molten-core";

export default function App() {
  const location = useLocation();

  useEffect(() => {
    applyPageMetadata(document, routeMetadataForPathname(location.pathname));
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/wiki-development" element={<WikiDevelopmentPage />} />
      <Route path="/:serverSlug" element={<Layout />}>
        <Route index element={<ServerHomePage />} />
        <Route path="guides" element={<GuidesPage />} />
        <Route path="talents" element={<TalentPage />} />
        <Route path="talents/:classSlug" element={<TalentPage />} />
        <Route path="raids" element={<Navigate to={defaultRaidSlug} replace />} />
        <Route path="raids/:instanceSlug" element={<RaidPage />} />
        <Route path="raids/:instanceSlug/:bossSlug" element={<BossGuidePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
