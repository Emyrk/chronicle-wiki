import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import type { GuideIndexEntry } from "../data/guideIndex";
import { GuidesPage, guideCardBackgroundStyle } from "./GuidesPage";

function renderGuidesPage(path = "/legacy/guides") {
  return renderToStaticMarkup(
    createElement(
      MemoryRouter,
      { initialEntries: [path] },
      createElement(Routes, null, createElement(Route, { path: "/:serverSlug/guides", element: createElement(GuidesPage) })),
    ),
  );
}

const entryWithoutBackground: Pick<GuideIndexEntry, "backgroundImageUrl"> = {
  backgroundImageUrl: undefined,
};

describe("guide cards", () => {
  it("renders instance cards with the Chronicle instance background image and readable overlay", () => {
    const html = renderGuidesPage();

    expect(html).toContain("background-image:url(/assets/instances/molten-core/background.jpg)");
    expect(html).toContain("absolute inset-0 bg-gradient-to-t from-black/95 via-black/75 to-black/35");
    expect(html).toContain("relative z-10");
    expect(html).toContain("Molten Core");
  });

  it("omits background-image style when an entry has no background image", () => {
    expect(guideCardBackgroundStyle(entryWithoutBackground)).toBeUndefined();
  });
});
