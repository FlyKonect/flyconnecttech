/**
 * The website's security headers, sent with every page (next.config.ts).
 *
 * The policy is the standard one from the Next.js guide, without nonces, so
 * pages stay pre-built and fast: inline scripts and styles are allowed (the
 * website pages keep the design's inline styles), but nothing loads from
 * another site, the browser only calls this site and the backend, no other
 * site may show these pages in a frame, and forms only post here.
 */
export type HeaderOptions = {
  apiUrl: string;
  /** This website's address: https rules only apply when it is https. */
  siteUrl: string;
  development: boolean;
};

const onHttps = (options: HeaderOptions) =>
  new URL(options.siteUrl).protocol === "https:";

export function contentSecurityPolicy(options: HeaderOptions): string {
  const api = new URL(options.apiUrl).origin;
  return [
    "default-src 'self'",
    // React needs eval in development only, for its error messages.
    `script-src 'self' 'unsafe-inline'${options.development ? " 'unsafe-eval'" : ""}`,
    "style-src 'self' 'unsafe-inline'",
    "img-src 'self' data: blob:",
    "font-src 'self'",
    `connect-src 'self' ${api}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(onHttps(options) ? ["upgrade-insecure-requests"] : []),
  ].join("; ");
}

export function securityHeaders(
  options: HeaderOptions,
): { key: string; value: string }[] {
  return [
    {
      key: "Content-Security-Policy",
      value: contentSecurityPolicy(options),
    },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=()",
    },
    // Live (https) only: always use https here, for a year.
    ...(!onHttps(options)
      ? []
      : [
          {
            key: "Strict-Transport-Security",
            value: "max-age=31536000; includeSubDomains",
          },
        ]),
  ];
}
