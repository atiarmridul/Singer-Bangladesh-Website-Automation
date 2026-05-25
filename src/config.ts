import fs from "node:fs";
import path from "node:path";
import { URL } from "node:url";

import dotenv from "dotenv";

import { ConfigurationError } from "./exceptions";

export type BrowserName = "chromium" | "firefox" | "webkit";

export interface Settings {
  envName: string;
  baseUrl: string;
  apiBaseUrl: string;
  browserName: BrowserName;
  headed: boolean;
  slowMo: number;
  timeoutMs: number;
  defaultCategory: string;
  productsLimit: number;
}

// Finds the project folder, like finding the home base for all files.
function rootDir(): string {
  return path.resolve(__dirname, "..");
}

// Reads one .env file and turns it into key/value settings.
function parseEnvFile(filePath: string): Record<string, string> {
  // Missing env files are allowed for the default local run; selected TEST_ENV files are validated later.
  if (!fs.existsSync(filePath)) {
    return {};
  }
  return dotenv.parse(fs.readFileSync(filePath));
}

// Turns words like "true" or "yes" into a real boolean.
function toBool(value: string | boolean | undefined, fallback = false): boolean {
  // Accept common CI-friendly truthy values so env files and shell variables behave the same way.
  if (typeof value === "boolean") return value;
  if (value === undefined) return fallback;
  return ["1", "true", "yes", "on"].includes(value.trim().toLowerCase());
}

// Reads a setting as a number and fails if it is not a usable integer.
function toPositiveInt(key: string, value: string | undefined, fallback: number): number {
  // Parse first, then range-check in getSettings so error messages include the original config key.
  const parsed = Number.parseInt(value ?? String(fallback), 10);
  if (!Number.isFinite(parsed)) {
    throw new ConfigurationError(`Invalid ${key} value`, key, value, "Integer");
  }
  return parsed;
}

// Checks that a setting is shaped like a real website URL.
function assertUrl(key: string, value: string): void {
  try {
    const parsed = new URL(value);
    if (!parsed.protocol || !parsed.hostname) {
      throw new Error("Invalid URL");
    }
  } catch {
    throw new ConfigurationError(
      `Invalid ${key} format`,
      key,
      value,
      "Non-empty URL with valid format (scheme://domain)"
    );
  }
}

// Checks that the selected browser is one Playwright understands.
function assertBrowser(value: string): asserts value is BrowserName {
  const browsers = new Set(["chromium", "firefox", "webkit"]);
  if (!browsers.has(value)) {
    throw new ConfigurationError("Invalid BROWSER value", "BROWSER", value, "chromium, firefox, webkit");
  }
}

// Builds the final settings object from env files and process variables.
export function getSettings(envName?: string): Settings {
  const root = rootDir();
  const values: Record<string, string | undefined> = {};

  // Precedence: .env defaults -> selected environments/*.env profile -> live process.env overrides.
  Object.assign(values, parseEnvFile(path.join(root, ".env")));

  const selectedEnv = envName ?? process.env.TEST_ENV ?? values.TEST_ENV;
  const effectiveEnvName = selectedEnv ?? "default";
  if (selectedEnv) {
    // TEST_ENV is explicit, so fail fast when the named profile is missing instead of silently using defaults.
    const envFile = path.join(root, "environments", `${selectedEnv}.env`);
    if (!fs.existsSync(envFile)) {
      throw new Error(`Environment file not found: ${envFile}. Create it or use TEST_ENV with an existing profile.`);
    }
    Object.assign(values, parseEnvFile(envFile));
  }

  Object.assign(values, process.env);

  const baseUrl = values.BASE_URL ?? "https://www.singerbd.com/";
  const apiBaseUrl = values.API_BASE_URL ?? "https://www.singerbd.com";
  const browserName = values.BROWSER ?? "chromium";
  const headed = toBool(values.HEADED, false);
  const slowMo = toPositiveInt("SLOW_MO", values.SLOW_MO, 0);
  const timeoutMs = toPositiveInt("TIMEOUT_MS", values.TIMEOUT_MS, 30_000);
  const defaultCategory = values.DEFAULT_CATEGORY ?? "television";
  const productsLimit = toPositiveInt("PRODUCTS_LIMIT", values.PRODUCTS_LIMIT, 12);

  assertUrl("BASE_URL", baseUrl);
  assertUrl("API_BASE_URL", apiBaseUrl);
  assertBrowser(browserName);

  if (slowMo < 0) {
    throw new ConfigurationError("Invalid SLOW_MO value", "SLOW_MO", slowMo, "Non-negative integer");
  }
  if (timeoutMs <= 0) {
    throw new ConfigurationError("Invalid TIMEOUT_MS value", "TIMEOUT_MS", timeoutMs, "Positive integer");
  }
  if (productsLimit <= 0) {
    throw new ConfigurationError("Invalid PRODUCTS_LIMIT value", "PRODUCTS_LIMIT", productsLimit, "Positive integer");
  }

  return {
    envName: effectiveEnvName,
    baseUrl,
    apiBaseUrl,
    browserName,
    headed,
    slowMo,
    timeoutMs,
    defaultCategory,
    productsLimit
  };
}
