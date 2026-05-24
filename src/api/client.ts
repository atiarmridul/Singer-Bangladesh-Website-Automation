import { ApiClientError } from "../exceptions";

export class ApiClient {
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(baseUrl: string, timeoutMs = 30_000) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.timeoutMs = timeoutMs;
  }

  async get<T extends Record<string, unknown>>(
    requestPath: string,
    params?: Record<string, string | number>
  ): Promise<T> {
    const url = this.buildUrl(requestPath, params);
    const controller = new AbortController();
    // Node fetch has no per-request timeout option, so use AbortController for deterministic test failures.
    const timeout = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(url, { signal: controller.signal });
      await this.validateStatus(response, url);
      return await this.parseJson<T>(response, url);
    } catch (error) {
      if (error instanceof ApiClientError) {
        throw error;
      }
      const message = error instanceof Error ? error.message : String(error);
      throw new ApiClientError(`API client error: ${message}`, undefined, url);
    } finally {
      clearTimeout(timeout);
    }
  }

  private buildUrl(requestPath: string, params?: Record<string, string | number>): string {
    const path = requestPath.startsWith("/") ? requestPath : `/${requestPath}`;
    const url = new URL(path, `${this.baseUrl}/`);
    // URLSearchParams handles encoding and avoids fragile manual query-string construction.
    for (const [key, value] of Object.entries(params ?? {})) {
      url.searchParams.set(key, String(value));
    }
    return url.toString();
  }

  private async validateStatus(response: Response, url: string): Promise<void> {
    if (response.status < 400) {
      return;
    }
    // Keep failure output useful without dumping a full HTML/API error page into the report.
    const body = (await response.text()).slice(0, 500);
    throw new ApiClientError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      url,
      body
    );
  }

  private async parseJson<T extends Record<string, unknown>>(response: Response, url: string): Promise<T> {
    const text = await response.text();
    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      throw new ApiClientError(`Invalid JSON response from ${url}: ${message}\nResponse body: ${text.slice(0, 500)}`);
    }

    // API agents expect object envelopes such as { status, data }; arrays indicate a contract change.
    if (!data || typeof data !== "object" || Array.isArray(data)) {
      throw new ApiClientError(
        `Expected JSON object in response from ${url}, got ${Array.isArray(data) ? "array" : typeof data}`
      );
    }

    return data as T;
  }
}
