import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

const selectorSchema = z.object({
  description: z.string().min(1),
  css: z.string().min(1).optional(),
  role: z.string().min(1).optional(),
  name: z.string().min(1).optional(),
  text: z.string().min(1).optional(),
  placeholder: z.string().min(1).optional(),
  candidates: z.array(z.string().min(1)).default([])
});

const stepSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("goto"),
    path: z.string().min(1)
  }),
  z.object({
    action: z.literal("click"),
    selector: selectorSchema
  }),
  z.object({
    action: z.literal("fill"),
    selector: selectorSchema,
    value: z.string()
  }),
  z.object({
    action: z.literal("press"),
    selector: selectorSchema,
    key: z.string().min(1)
  }),
  z.object({
    action: z.literal("expectVisible"),
    selector: selectorSchema
  }),
  z.object({
    action: z.literal("expectText"),
    selector: selectorSchema,
    text: z.string().min(1)
  }),
  z.object({
    action: z.literal("expectTitle"),
    pattern: z.string().min(1)
  }),
  z.object({
    action: z.literal("expectUrl"),
    pattern: z.string().min(1)
  }),
  z.object({
    action: z.literal("checkA11y")
  })
]);

const testCaseSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  tags: z.array(z.string().startsWith("@")).default([]),
  purpose: z.string().min(1),
  risk: z.string().min(1),
  steps: z.array(stepSchema).min(1)
});

export type SelectorDefinition = z.infer<typeof selectorSchema>;
export type TestStep = z.infer<typeof stepSchema>;
export type GeneratedTestCase = z.infer<typeof testCaseSchema>;

export function parseTestCaseFile(filePath: string): GeneratedTestCase {
  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = JSON.parse(raw);
  return testCaseSchema.parse(parsed);
}

export function listDefinitionFiles(inputDir: string): string[] {
  if (!fs.existsSync(inputDir)) {
    throw new Error(`Definition directory not found: ${inputDir}`);
  }

  return fs
    .readdirSync(inputDir)
    .filter((file) => file.endsWith(".json"))
    .sort()
    .map((file) => path.join(inputDir, file));
}

export function toSafeFileName(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
