import { Navigate, Route, Routes } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { HomePage } from "@/pages/HomePage";
import { ServerHomePage } from "@/pages/ServerHomePage";
import { TalentPage } from "@/pages/TalentPage";
import { RaidPage } from "@/pages/RaidPage";
import { BossGuidePage } from "@/pages/BossGuidePage";
import { UnitExplorerPage } from "@/pages/UnitExplorerPage";
import { GuidesPage } from "@/pages/GuidesPage";
import { WikiDevelopmentPage } from "@/pages/WikiDevelopmentPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/wiki-development" element={<WikiDevelopmentPage />} />
      <Route path="/:serverSlug" element={<Layout />}>
        <Route index element={<ServerHomePage />} />
        <Route path="guides" element={<GuidesPage />} />
        <Route path="talents" element={<TalentPage />} />
        <Route path="talents/:classSlug" element={<TalentPage />} />
        <Route path="raids" element={<Navigate to="molten-core" replace />} />
        <Route path="raids/molten-core" element={<RaidPage />} />
        <Route path="raids/molten-core/:bossSlug" element={<BossGuidePage />} />
        <Route path="explorer" element={<UnitExplorerPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
