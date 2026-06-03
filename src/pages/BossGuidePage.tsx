import { Navigate, useParams } from "react-router-dom";
import { resolveServerContext } from "@/data/servers";
import { getRaidInstance } from "@/data/instances";
import { NotFoundPage } from "./NotFoundPage";

export function BossGuidePage() {
  const { serverSlug, instanceSlug, bossSlug } = useParams();
  const context = resolveServerContext(serverSlug);
  const instance = getRaidInstance(instanceSlug ?? "");
  const encounter = instance?.encounters.find((candidate) => candidate.slug === bossSlug);
  if (!context || !instance || !encounter) return <NotFoundPage />;

  return <Navigate to={`/${context.server.slug}/raids/${instance.slug}?boss=${encounter.slug}`} replace />;
}
