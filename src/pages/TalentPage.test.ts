import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { TalentPage } from "./TalentPage";

function renderTalentPage(path = "/legacy/talents/mage") {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  });

  return renderToStaticMarkup(
    createElement(
      QueryClientProvider,
      { client: queryClient },
      createElement(
        MemoryRouter,
        { initialEntries: [path] },
        createElement(
          Routes,
          null,
          createElement(Route, { path: "/:serverSlug/talents/:classSlug", element: createElement(TalentPage) }),
        ),
      ),
    ),
  );
}

describe("TalentPage player-facing header", () => {
  it("does not render admin data controls above the calculator", () => {
    const html = renderTalentPage();

    expect(html).toContain("Talent calculator");
    expect(html).toContain("Mage");
    expect(html).not.toContain("Builder data controls");
    expect(html).not.toContain("Chronicle API JSON");
    expect(html).not.toContain("Server / flavor");
    expect(html).not.toContain("Reparse current source");
  });
});
