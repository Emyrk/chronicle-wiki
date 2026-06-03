import { describe, expect, it } from "vitest";
import { globalSearchResults } from "./search";

describe("global search tool descriptions", () => {
  it("keeps talent calculator result copy player-facing", () => {
    const result = globalSearchResults("turtle", "talent").find((entry) => entry.title === "Talent calculator");

    expect(result?.description).toBe("Plan and share class builds for the selected server.");
  });
});
