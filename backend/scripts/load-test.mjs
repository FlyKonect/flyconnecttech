// Load test: many visitors at once against a backend on this computer,
// to see how fast it stays. Never the live site: it stops unless the
// address is localhost.
//
//   npm run load-test                          (http://localhost:4000)
//   LOAD_URL=http://localhost:4100 npm run load-test
//   LOAD_EMAIL=... LOAD_PASSWORD=... npm run load-test   (also a customer's
//     "My requests", signed in as that sample customer)
//
// Start the backend with RATE_LIMITS=false for it, or the numbers measure
// the request limits instead of the app. Each step runs 20 visitors for
// 10 seconds and prints requests a second and response times.

import autocannon from 'autocannon';

const base = (process.env.LOAD_URL ?? 'http://localhost:4000').replace(
  /\/$/,
  '',
);
const host = new URL(base).hostname;
if (!['localhost', '127.0.0.1', '::1'].includes(host)) {
  console.error(
    `Refusing to load-test ${base}: only a backend on this computer.`,
  );
  process.exit(1);
}

const CONNECTIONS = Number(process.env.LOAD_CONNECTIONS ?? 20);
const SECONDS = Number(process.env.LOAD_SECONDS ?? 10);

async function signIn() {
  const email = process.env.LOAD_EMAIL;
  const password = process.env.LOAD_PASSWORD;
  if (!email || !password) return null;
  const response = await fetch(`${base}/api/auth/sign-in/email`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: process.env.LOAD_ORIGIN ?? 'http://localhost:3001',
      'x-fct-side': 'customer',
    },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    console.error(`Sign-in for the load test failed (${response.status}).`);
    return null;
  }
  return response.headers
    .getSetCookie()
    .map((cookie) => cookie.split(';')[0])
    .join('; ');
}

async function step(name, path, headers = {}) {
  const result = await autocannon({
    url: `${base}${path}`,
    connections: CONNECTIONS,
    duration: SECONDS,
    headers,
  });
  const errors = result.errors + result.non2xx;
  console.log(
    [
      name.padEnd(28),
      `${Math.round(result.requests.average)} req/s`.padStart(12),
      `median ${result.latency.p50} ms`.padStart(16),
      `p99 ${result.latency.p99} ms`.padStart(14),
      errors ? `  ${errors} errors or non-2xx` : '',
    ].join(''),
  );
  return {
    name,
    rps: result.requests.average,
    p99: result.latency.p99,
    errors,
  };
}

console.log(
  `Load test of ${base}: ${CONNECTIONS} visitors at once, ${SECONDS} s per step\n`,
);
const results = [
  await step('Health check', '/health'),
  await step('Website content (public)', '/website'),
  await step('Demo times (public)', '/leads/demo-slots'),
];
const cookie = await signIn();
if (cookie) {
  results.push(
    await step('My requests (signed in)', '/portal/requests', { cookie }),
  );
} else {
  console.log(
    '\n(Set LOAD_EMAIL and LOAD_PASSWORD to also test a signed-in page.)',
  );
}
const bad = results.filter((r) => r.errors > 0);
process.exitCode = bad.length ? 1 : 0;
