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
  const { text, rest } = firstPart(number(clean), max);
  return rest.length ? `${text} (continued below)` : text;
}

/** "1. First • 2. Second": numbers each change, so a long list stays readable. */
export function number(items) {
  return items.map((item, index) => `${index + 1}. ${item}`);
}

/** As many whole items as fit in `max` characters, and the ones left over. */
export function firstPart(items, max) {
  const shown = [];
  for (const item of items) {
    const next = [...shown, item].join(" • ");
    if (next.length > max && shown.length) break;
    shown.push(next.length > max ? `${item.slice(0, max - 1)}…` : item);
  }
  return { text: shown.join(" • "), rest: items.slice(shown.length) };
}

/** The left-over items in pieces of at most `max` characters each. */
export function pieces(items, max = 850) {
  const out = [];
  let left = items;
  while (left.length) {
    const { text, rest } = firstPart(left, max);
    out.push(text);
    left = rest;
  }
  return out;
}

/**
 * The extra messages for changes that did not fit in the first one: one or
 * more per section, each [section and part, the changes].
 */
export function continuations(groups, limits) {
  const sections = [
    ["New features", groups.features, limits.features],
    ["Improvements", groups.improvements, limits.improvements],
    ["Bug fixes", groups.fixes, limits.fixes],
    ["Other changes", groups.other, limits.other],
  ];
  const messages = [];
  for (const [title, items, max] of sections) {
    const clean = number(
      items.map((i) => i.replace(/[\n\t]/g, " ").replace(/ {4,}/g, "   ")),
    );
    const { rest } = firstPart(clean, max);
    const parts = pieces(rest);
    parts.forEach((text, index) => {
      const label =
        parts.length > 1
          ? `${title}, continued (${index + 1} of ${parts.length})`
          : `${title}, continued`;
      messages.push([label, text]);
    });
  }
  return messages;
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
  // How much of each list fits in the first message (WhatsApp: 1024
  // characters in all). The rest follows in "deploy_changes" messages.
  const limits = { features: 190, improvements: 190, fixes: 190, other: 120 };
  const values = [
    londonTime(),
    env.DEPLOYED_PARTS || "Website and backend",
    `${env.SITE_URL ?? ""} · ${env.API_URL ?? ""}`.trim(),
    oneLine(groups.features, limits.features),
    oneLine(groups.improvements, limits.improvements),
    oneLine(groups.fixes, limits.fixes),
    oneLine(groups.other, limits.other),
    env.RUN_URL || "-",
  ];
  const more = continuations(groups, limits);

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
        ...more.map(
          ([label, text]) =>
            `\n(next message, deploy_changes)\n${label}: ${text}`,
        ),
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

  const language = env.WHATSAPP_TEMPLATE_LANG || "en_GB";
  const send = (to, name, texts) =>
    fetch(url, {
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
          name,
          language: { code: language },
          components: [
            {
              type: "body",
              parameters: texts.map((text) => ({ type: "text", text })),
            },
          ],
        },
      }),
    });

  let failed = 0;
  for (const to of recipients) {
    // Only the last 4 digits in the log: the numbers are private.
    const who = `…${to.slice(-4)}`;
    const messages = [
      [env.WHATSAPP_TEMPLATE || "deploy_report", values],
      ...more.map((texts) => [
        env.WHATSAPP_CHANGES_TEMPLATE || "deploy_changes",
        texts,
      ]),
    ];
    for (const [index, [name, texts]] of messages.entries()) {
      const response = await send(to, name, texts);
      if (response.ok) {
        console.log(
          `WhatsApp message ${index + 1} of ${messages.length} sent to ${who}.`,
        );
      } else {
        failed += 1;
        const detail = await response.text();
        console.log(
          `::warning::WhatsApp message ${index + 1} of ${messages.length} to ${who} failed (${response.status}): ${detail.slice(0, 300)}`,
        );
        // Without the first message the rest makes no sense.
        if (index === 0) break;
      }
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
