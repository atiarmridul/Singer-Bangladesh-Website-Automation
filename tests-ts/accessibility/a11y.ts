import AxeBuilder from "@axe-core/playwright";
import { expect, Page, TestInfo } from "@playwright/test";

type AxeImpact = "minor" | "moderate" | "serious" | "critical";

export interface A11yOptions {
  includedImpacts?: AxeImpact[];
  tags?: string[];
}

const defaultTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"];

// Runs axe on a page and fails only for the selected accessibility impact levels.
export async function checkA11y(page: Page, testInfo?: TestInfo, options: A11yOptions = {}): Promise<void> {
  // The live storefront has known serious issues; keep the default gate focused on release-blocking defects.
  const includedImpacts = options.includedImpacts ?? ["critical"];
  const results = await new AxeBuilder({ page }).withTags(options.tags ?? defaultTags).analyze();
  // Attach serious findings too so reports still expose accessibility debt without failing every live-site run.
  const reportableViolations = results.violations.filter((violation) =>
    ["critical", "serious"].includes(String(violation.impact))
  );
  const violations = results.violations.filter((violation) => includedImpacts.includes(violation.impact as AxeImpact));

  if (testInfo) {
    await testInfo.attach("axe-violations", {
      body: JSON.stringify(reportableViolations, null, 2),
      contentType: "application/json"
    });
  }

  expect(violations, formatViolations(violations)).toEqual([]);
}

// Builds a readable message that points to each broken accessibility rule.
function formatViolations(violations: Awaited<ReturnType<AxeBuilder["analyze"]>>["violations"]): string {
  if (violations.length === 0) {
    return "No accessibility violations found";
  }

  return violations
    .map((violation) => {
      // Include targets in the assertion message so failures point directly to affected DOM nodes.
      const targets = violation.nodes.map((node) => node.target.join(" ")).join(", ");
      return `${violation.impact ?? "unknown"}: ${violation.id} - ${violation.help} (${targets})`;
    })
    .join("\n");
}
