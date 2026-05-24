export class ApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiError";
  }
}

export class ApiClientError extends Error {
  constructor(
    message: string,
    readonly statusCode?: number,
    readonly url?: string,
    readonly responseBody?: string
  ) {
    // Compose details into the Error message so reporters show the context without custom serialization.
    const details = [message];
    if (statusCode) details.push(`Status Code: ${statusCode}`);
    if (url) details.push(`URL: ${url}`);
    if (responseBody) details.push(`Response: ${responseBody}`);
    super(details.join(" | "));
    this.name = "ApiClientError";
  }
}

export class ApiResponseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ApiResponseError";
  }
}

export class PageLoadError extends Error {
  constructor(
    message: string,
    readonly pageUrl?: string,
    readonly timeoutSeconds?: number,
    readonly expectedElement?: string | readonly string[]
  ) {
    // Keep page-load failures actionable by including the URL and selector/timeout context when available.
    const details = [message];
    if (pageUrl) details.push(`Page: ${pageUrl}`);
    if (timeoutSeconds) details.push(`Timeout: ${timeoutSeconds}s`);
    if (expectedElement)
      details.push(
        `Expected Element: ${Array.isArray(expectedElement) ? expectedElement.join(" | ") : expectedElement}`
      );
    super(details.join(" | "));
    this.name = "PageLoadError";
  }
}

export class ConfigurationError extends Error {
  constructor(
    message: string,
    readonly configKey?: string,
    readonly configValue?: unknown,
    readonly allowedValues?: string
  ) {
    // Configuration errors should tell the runner exactly which env variable needs correction.
    const details = [message];
    if (configKey) details.push(`Config Key: ${configKey}`);
    if (configValue !== undefined) details.push(`Current Value: ${String(configValue)}`);
    if (allowedValues) details.push(`Allowed Values: ${allowedValues}`);
    super(details.join(" | "));
    this.name = "ConfigurationError";
  }
}

export class NoDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "NoDataError";
  }
}
