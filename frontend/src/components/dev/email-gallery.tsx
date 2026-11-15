"use client";

import * as React from "react";

import { Logo } from "@/components/brand/logo";
import { TextLink } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { env } from "@/env";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { cn } from "@/lib/utils";

type Preview = {
  key: string;
  /** The docs/01 §7 row. */
  row: string;
  to: string;
  subject: string;
  calendar: boolean;
};

const previewUrl = (key: string, text = false) =>
  `${env.NEXT_PUBLIC_API_URL}/dev/emails/${key}${text ? "?format=text" : ""}`;

/**
 * /dev/emails: every email, grouped by the rows of docs/01 §7, with who gets
 * it, its subject, the email as sent and its plain-text version. The emails
 * come from the backend's /dev/emails, so they are the real templates.
 */
export function EmailGallery() {
  const [previews, setPreviews] = React.useState<Preview[] | null>(null);
  const [failed, setFailed] = React.useState("");
  const [chosen, setChosen] = React.useState<string | null>(null);
  const [html, setHtml] = React.useState("");
  const [text, setText] = React.useState("");

  React.useEffect(() => {
    apiFetch<Preview[]>("/dev/emails")
      .then((list) => {
        setPreviews(list);
        setChosen((current) => current ?? list[0]?.key ?? null);
      })
      .catch((error) => setFailed(apiErrorMessage(error)));
  }, []);

  React.useEffect(() => {
    if (!chosen) return;
    let live = true;
    Promise.all([
      fetch(previewUrl(chosen)).then((response) => response.text()),
      fetch(previewUrl(chosen, true)).then((response) => response.text()),
    ])
      .then(([page, plain]) => {
        if (!live) return;
        setHtml(page);
        setText(plain);
      })
      .catch(() => undefined);
    return () => {
      live = false;
    };
  }, [chosen]);

  const rows = React.useMemo(() => {
    const groups = new Map<string, Preview[]>();
    for (const preview of previews ?? []) {
      groups.set(preview.row, [...(groups.get(preview.row) ?? []), preview]);
    }
    return [...groups.entries()];
  }, [previews]);
  const current = previews?.find((preview) => preview.key === chosen);

  return (
    <div className="min-h-screen bg-portal-bg">
      <div className="mx-auto flex max-w-[1240px] flex-col gap-8 px-[clamp(16px,3vw,32px)] py-10">
        <header className="flex flex-col gap-4">
          <Logo eager className="h-8 self-start" />
          <h1 className="text-[clamp(28px,3vw,40px)] font-bold tracking-[-0.03em]">
            Emails
          </h1>
          <p className="max-w-2xl text-[15px] leading-[1.6] text-body">
            Every email the app sends, with sample content, grouped by the rows
            of the notifications table in docs/01 section 7. This page only
            exists on a developer&apos;s PC.
          </p>
          <p>
            <TextLink href="/dev/components">Components</TextLink>
          </p>
        </header>

        {failed ? (
          <p role="alert" className="text-sm font-semibold text-danger">
            The emails could not be loaded: {failed} Is the backend running?
          </p>
        ) : null}

        <div className="flex flex-wrap items-start gap-6">
          <nav
            aria-label="Emails"
            className="flex min-w-0 flex-[1_1_300px] flex-col gap-4"
          >
            {rows.map(([row, items]) => (
              <section key={row}>
                <h2 className="text-xs font-bold tracking-[0.04em] text-muted-foreground uppercase">
                  {row}
                </h2>
                <ul className="mt-1.5 flex flex-col gap-1">
                  {items.map((item) => (
                    <li key={item.key}>
                      <button
                        type="button"
                        aria-current={item.key === chosen ? "true" : undefined}
                        onClick={() => setChosen(item.key)}
                        className={cn(
                          "w-full cursor-pointer rounded-xl border px-3.5 py-2.5 text-left text-sm",
                          item.key === chosen
                            ? "border-navy bg-tint font-bold"
                            : "border-line-2 bg-white hover:bg-soft",
                        )}
                      >
                        {item.subject}
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </nav>

          {current ? (
            <section
              aria-label="Preview"
              className="min-w-0 flex-[2_1_560px] rounded-[22px] border border-line-2 bg-white p-5 min-[900px]:sticky min-[900px]:top-6"
            >
              <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 text-sm">
                <dt className="text-muted-foreground">To</dt>
                <dd>{current.to}</dd>
                <dt className="text-muted-foreground">Subject</dt>
                <dd className="font-bold">{current.subject}</dd>
                {current.calendar ? (
                  <>
                    <dt className="text-muted-foreground">With</dt>
                    <dd>A calendar invite (invite.ics)</dd>
                  </>
                ) : null}
              </dl>
              <Tabs defaultValue="email" className="mt-4">
                <TabsList aria-label="Version">
                  <TabsTrigger value="email">Email</TabsTrigger>
                  <TabsTrigger value="text">Plain text</TabsTrigger>
                </TabsList>
                <TabsContent value="email">
                  <iframe
                    title={`Email: ${current.subject}`}
                    srcDoc={html}
                    sandbox=""
                    className="mt-3 h-[min(760px,70vh)] w-full rounded-xl border border-line-2 bg-[#F4F6FA]"
                  />
                </TabsContent>
                <TabsContent value="text">
                  <pre className="mt-3 max-h-[760px] overflow-auto rounded-xl border border-line-2 bg-[#F6F8FC] p-4 text-[13px] leading-[1.6] whitespace-pre-wrap text-body">
                    {text}
                  </pre>
                </TabsContent>
              </Tabs>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
