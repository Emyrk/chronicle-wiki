import { expect, test } from "@playwright/test";

type RouteCase = {
  slug: string;
  path: string;
  heading: string;
};

const routeCases: RouteCase[] = [
  { slug: "home", path: "/", heading: "Private server knowledgebase" },
  { slug: "server-home", path: "/turtle", heading: "Turtle WoW" },
  { slug: "guides", path: "/turtle/guides", heading: "Guides" },
  { slug: "raid-overview", path: "/turtle/raids/molten-core", heading: "Molten Core" },
  { slug: "boss-guide", path: "/turtle/raids/molten-core/garr", heading: "Garr" },
  { slug: "talents", path: "/turtle/talents/mage", heading: "Talent calculator" },
];

test.beforeEach(async ({ context }) => {
  await context.route("**/*", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const isLocalApp = url.hostname === "127.0.0.1";

    if (isLocalApp) {
      await route.continue();
      return;
    }

    await route.abort();
  });
});

for (const routeCase of routeCases) {
  test(`${routeCase.slug} has a stable page screenshot`, async ({ page }, testInfo) => {
    await page.goto(routeCase.path);
    await page.addStyleTag({
      content: `
        *, *::before, *::after {
          animation-duration: 0s !important;
          animation-delay: 0s !important;
          transition-duration: 0s !important;
          scroll-behavior: auto !important;
        }
      `,
    });
    await expect(page.getByRole("main").getByRole("heading", { name: routeCase.heading, level: 1 })).toBeVisible();
    await expectNoHorizontalOverflow(page);
    await expect(page).toHaveScreenshot(`${routeCase.slug}-${testInfo.project.name}.png`, { fullPage: true });
  });
}

async function expectNoHorizontalOverflow(page: import("@playwright/test").Page) {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;
    return documentElement.scrollWidth - documentElement.clientWidth;
  });

  expect(overflow).toBeLessThanOrEqual(1);
}
