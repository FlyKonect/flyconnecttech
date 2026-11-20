// Sends "deployed to live" with what changed to WhatsApp numbers, through
// Meta's official WhatsApp Cloud API. Run by deploy.yml after the live site
// answers. A failure here never undoes or fails the deploy.
//
// Meta lets a business message someone first only with an approved
// template, and a template's values may not contain line breaks. So the
// template (docs/deploy.md, Step 17) holds the layout, and each value is
// one line, items joined with " • ".
//
// Settings (environment):
//   WHATSAPP_TOKEN            permanent access token (secret)
//   WHATSAPP_PHONE_NUMBER_ID  the sending number's ID (secret)
//   WHATSAPP_TO               who gets it: numbers with country code, comma
//                             separated, for example 447700900123 (secret)
//   WHATSAPP_TEMPLATE         template name, default deploy_report
//   WHATSAPP_TEMPLATE_LANG    its language code, default en_GB
//   WHATSAPP_API_VERSION      Graph API version, default v23.0
//   FROM_COMMIT               the last deployed commit (may be empty)
//   SITE_URL, API_URL, DEPLOYED_PARTS, RUN_URL
//
// Try it without sending:  node .github/scripts/notify-whatsapp.mjs --dry-run
import { execFileSync } from "node:child_process";

const env = process.env;
const dryRun = process.argv.includes("--dry-run");

/** Commit titles since the last deploy (at most 40), oldest first. */
export function commitTitles(from, to = "HEAD") {
  const git = (args) =>
    execFileSync("git", args, { encoding: "utf8" })
      .trim()
      .split("\n")
      .filter(Boolean);
  let range = to;
  if (from && /^[0-9a-f]{7,40}$/i.test(from)) {
    try {
      execFileSync("git", ["cat-file", "-e", `${from}^{commit}`]);
      range = `${from}..${to}`;
    } catch {
      // Not in this clone (for example after a force push): use the last few.
    }
  }
  const titles = git(["log", "--no-merges", "--format=%s", "-n", "40", range]);
  return titles.reverse();
}

/** New features, improvements, bug fixes and the rest, from commit titles. */
export function groupChanges(titles) {
  const groups = { features: [], improvements: [], fixes: [], other: [] };
  for (const title of titles) {
    const text = title.replace(/\s+/g, " ").trim();
    if (
      /\b(fix|fixes|fixed|bug|broken|repair|works again|error)\b/i.test(text)
    ) {
      groups.fixes.push(text);
    } else if (/^(add|adds|new)\b|\b(new|adds?|feature|option)\b/i.test(text)) {
      groups.features.push(text);
    } else if (
      /\b(improv\w*|clean\w*|clear\w*|faster|better|redesign\w*|polish\w*|layout|design|wording|tid\w*|simpl\w*|lighter)\b/i.test(
        text,
      )
    ) {
      groups.improvements.push(text);
    } else {
      groups.other.push(text);
    }
  }
  return groups;
}

/** One line for a template value: items joined, shortened to fit. */
export function oneLine(items, max = 190) {
  if (items.length === 0) return "None";
  // WhatsApp refuses line breaks, tabs and long runs of spaces in values.
  const clean = items.map((item) =>
    item.replace(/[\n\t]/g, " ").replace(/ {4,}/g, "   "),
  );
  // Whole items only; the rest is counted ("+3 more"). The full list is on
  // the run's page (the Details link).
  const shown = [];
  for (const item of clean) {
    const next = [...shown, item].join(" • ");
    if (next.length > max && shown.length) break;
    shown.push(next.length > max ? `${item.slice(0, max - 1)}…` : item);
  }
  const rest = clean.length - shown.length;
  return rest ? `${shown.join(" • ")} (+${rest} more)` : shown.join(" • ");
}

function londonTime(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/London",
  }).format(date);
}

async function main() {
  const titles = commitTitles(env.FROM_COMMIT ?? "");
  const groups = groupChanges(titles);
  const values = [
    londonTime(),
    env.DEPLOYED_PARTS || "Website and backend",
    `${env.SITE_URL ?? ""} · ${env.API_URL ?? ""}`.trim(),
    oneLine(groups.features),
    oneLine(groups.improvements),
    oneLine(groups.fixes),
    oneLine(groups.other, 120),
    env.RUN_URL || "-",
  ];

  // The full lists on the run's page (the message's Details link).
  if (env.GITHUB_STEP_SUMMARY) {
    const section = (title, items) =>
      `### ${title}\n${items.length ? items.map((i) => `- ${i}`).join("\n") : "- None"}\n`;
    const { appendFileSync } = await import("node:fs");
    appendFileSync(
      env.GITHUB_STEP_SUMMARY,
      [
        `## Deployed ${values[0]} (${values[1]})`,
        section("New features", groups.features),
        section("Improvements", groups.improvements),
        section("Bug fixes", groups.fixes),
        section("Other", groups.other),
      ].join("\n"),
    );
  }

  if (dryRun) {
    console.log(
      [
        "Deploy report (dry run, nothing sent):",
        `When: ${values[0]}`,
        `Deployed: ${values[1]}`,
        `Live: ${values[2]}`,
        `New features: ${values[3]}`,
        `Improvements: ${values[4]}`,
        `Bug fixes: ${values[5]}`,
        `Other: ${values[6]}`,
        `Details: ${values[7]}`,
      ].join("\n"),
    );
    return;
  }

  const missing = [
    "WHATSAPP_TOKEN",
    "WHATSAPP_PHONE_NUMBER_ID",
    "WHATSAPP_TO",
  ].filter((name) => !env[name]);
  if (missing.length) {
    console.log(
      `WhatsApp message skipped: ${missing.join(", ")} not set (docs/deploy.md, Step 17).`,
    );
    return;
  }

  const version = env.WHATSAPP_API_VERSION || "v23.0";
  const url = `https://graph.facebook.com/${version}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  const recipients = env.WHATSAPP_TO.split(",")
    .map((n) => n.replace(/[^\d]/g, ""))
    .filter(Boolean);

  let failed = 0;
  for (const to of recipients) {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to,
        type: "template",
        template: {
          name: env.WHATSAPP_TEMPLATE || "deploy_report",
          language: { code: env.WHATSAPP_TEMPLATE_LANG || "en_GB" },
          components: [
            {
              type: "body",
              parameters: values.map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
    });
    // Only the last 4 digits in the log: the numbers are private.
    const who = `…${to.slice(-4)}`;
    if (response.ok) {
      console.log(`WhatsApp message sent to ${who}.`);
    } else {
      failed += 1;
      const detail = await response.text();
      console.log(
        `::warning::WhatsApp message to ${who} failed (${response.status}): ${detail.slice(0, 300)}`,
      );
    }
  }
  if (failed) process.exitCode = 1;
}

if (
  import.meta.url === `file://${process.argv[1]}` ||
  process.argv[1]?.endsWith("notify-whatsapp.mjs")
) {
  await main();
}
