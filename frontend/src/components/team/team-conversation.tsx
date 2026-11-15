import { Lock } from "lucide-react";

import { Avatar } from "@/components/ui/avatar";
import { FileChip } from "@/components/ui/file-chip";
import { env } from "@/env";
import { formatMessageTime } from "@/lib/format-time";
import type { TeamRequestDetail, TeamRequestFile } from "@/lib/team/types";

/** Where a request's file downloads from, for the team. */
export function teamFileUrl(code: string, fileId: string): string {
  return `${env.NEXT_PUBLIC_API_URL}/team/requests/${encodeURIComponent(code)}/files/${fileId}`;
}

/**
 * "Conversation & internal notes" (screens 22 and 24): the customer's
 * messages, replies to the customer, amber internal notes (never shown to
 * the customer) and system lines.
 */
export function TeamConversation({
  request,
  timeZone,
}: {
  request: TeamRequestDetail;
  timeZone: string;
}) {
  const now = new Date();
  const time = (iso: string) => formatMessageTime(iso, timeZone, now);
  const filesOf = (messageId: string | null) =>
    request.files.filter((file) => file.messageId === messageId);
  const customerName = request.customer.name ?? request.customer.company;

  return (
    <section
      aria-labelledby="conversation"
      className="flex flex-col gap-3.5 rounded-[22px] border border-line bg-white p-[clamp(16px,2.4vw,24px)]"
    >
      <h2 id="conversation" className="text-base font-bold">
        Conversation &amp; internal notes
      </h2>
      <ol className="flex flex-col gap-3.5">
        <li>
          <FromCustomer
            name={customerName}
            when={time(request.createdAt)}
            body={request.description}
            files={filesOf(null)}
            code={request.code}
          />
        </li>
        {request.messages.map((message) => {
          const files = filesOf(message.id);
          const name = message.author?.name ?? "FlyConnect Tech Support";
          if (message.kind === "SYSTEM") {
            return (
              <li
                key={message.id}
                className="self-center rounded-full bg-[#F6F8FC] px-3 py-1.5 text-center text-xs font-semibold text-muted-foreground"
              >
                {message.body} · {time(message.createdAt)}
              </li>
            );
          }
          if (message.kind === "CUSTOMER_REPLY") {
            return (
              <li key={message.id}>
                <FromCustomer
                  name={name}
                  when={time(message.createdAt)}
                  body={message.body}
                  files={files}
                  code={request.code}
                />
              </li>
            );
          }
          if (message.kind === "INTERNAL_NOTE") {
            return (
              <li
                key={message.id}
                className="rounded-2xl border border-dashed border-[#F59E0B] bg-[#FFFBEB] px-4 py-3.5"
              >
                <p className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs font-bold text-[#92400E]">
                  <Lock aria-hidden="true" className="size-3.5" />
                  INTERNAL NOTE · {name} · {time(message.createdAt)} · Not
                  visible to the customer
                </p>
                <p className="mt-2 text-[15px] leading-[1.55] break-words whitespace-pre-wrap text-[#451A03]">
                  {message.body}
                </p>
                <Files files={files} code={request.code} />
              </li>
            );
          }
          return (
            <li key={message.id} className="flex gap-2.5">
              <Avatar name={name} className="size-9 text-xs" />
              <div className="min-w-0 flex-1">
                <p className="text-xs text-muted-foreground">
                  <strong className="text-navy">{name}</strong> · Reply to
                  customer · {time(message.createdAt)}
                </p>
                {message.body ? (
                  <div className="mt-1.5 rounded-[4px_16px_16px_16px] border border-stroke bg-white px-4 py-3.5 text-[15px] leading-[1.55] break-words whitespace-pre-wrap">
                    {message.body}
                  </div>
                ) : null}
                <Files files={files} code={request.code} />
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

function FromCustomer({
  name,
  when,
  body,
  files,
  code,
}: {
  name: string;
  when: string;
  body: string;
  files: TeamRequestFile[];
  code: string;
}) {
  return (
    <div className="flex gap-2.5">
      <Avatar name={name} tone="tint" className="size-9 text-xs" />
      <div className="min-w-0 flex-1">
        <p className="text-xs text-muted-foreground">
          <strong className="text-navy">{name}</strong> · Customer · {when}
        </p>
        {body ? (
          <div className="mt-1.5 rounded-[4px_16px_16px_16px] bg-[#F6F8FC] px-4 py-3.5 text-[15px] leading-[1.55] break-words whitespace-pre-wrap">
            {body}
          </div>
        ) : null}
        <Files files={files} code={code} />
      </div>
    </div>
  );
}

function Files({ files, code }: { files: TeamRequestFile[]; code: string }) {
  if (!files.length) return null;
  return (
    <div className="mt-1.5 flex flex-wrap gap-1.5">
      {files.map((file) => (
        <FileChip
          key={file.id}
          look="link"
          name={file.fileName}
          href={teamFileUrl(code, file.id)}
        />
      ))}
    </div>
  );
}
