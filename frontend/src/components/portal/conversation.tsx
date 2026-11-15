import { Avatar } from "@/components/ui/avatar";
import { FileChip } from "@/components/ui/file-chip";
import { env } from "@/env";
import { formatMessageTime } from "@/lib/format-time";
import type { RequestDetail, RequestFile } from "@/lib/portal/types";

/** Where a request's file downloads from (the backend checks who asks). */
export function fileUrl(code: string, fileId: string): string {
  return `${env.NEXT_PUBLIC_API_URL}/portal/requests/${encodeURIComponent(code)}/files/${fileId}`;
}

/**
 * The conversation on a request, as the customer sees it (screen 13):
 * their own messages on the right in navy, the team's on the left, and
 * system events as small lines in the middle. The backend never sends
 * internal notes here.
 */
export function Conversation({
  request,
  timeZone,
}: {
  request: RequestDetail;
  timeZone: string;
}) {
  const now = new Date();
  const time = (iso: string) => formatMessageTime(iso, timeZone, now);
  const filesOf = (messageId: string | null) =>
    request.files.filter((file) => file.messageId === messageId);

  return (
    <ol aria-label="Conversation" className="flex flex-col gap-4">
      {/* The request itself is the first message. */}
      <li className="flex flex-col">
        <Mine
          when={time(request.createdAt)}
          body={request.description}
          files={filesOf(null)}
          code={request.code}
        />
      </li>

      {request.messages.map((message) => {
        const files = filesOf(message.id);
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
            <li key={message.id} className="flex flex-col">
              <Mine
                when={time(message.createdAt)}
                body={message.body}
                files={files}
                code={request.code}
              />
            </li>
          );
        }
        const name = message.author?.name ?? "FlyConnect Tech Support";
        return (
          <li
            key={message.id}
            className="flex max-w-[78%] gap-2.5 self-start max-app:max-w-[92%]"
          >
            <Avatar name={name} size="sm" className="size-9 text-xs" />
            <div className="flex min-w-0 flex-col gap-1.5">
              <p className="text-xs text-muted-foreground">
                <strong className="text-navy">{name}</strong> · FlyConnect Tech
                Support · {time(message.createdAt)}
              </p>
              {message.body ? (
                <div className="rounded-[4px_18px_18px_18px] border border-line-2 bg-[#F6F8FC] px-4 py-3.5 text-[15px] leading-[1.55] break-words whitespace-pre-wrap">
                  {message.body}
                </div>
              ) : null}
              <Files files={files} code={request.code} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

/** One of the customer's own messages, on the right. */
function Mine({
  when,
  body,
  files,
  code,
}: {
  when: string;
  body: string;
  files: RequestFile[];
  code: string;
}) {
  return (
    <div className="flex max-w-[78%] flex-col items-end gap-1.5 self-end max-app:max-w-[92%]">
      <p className="text-xs text-muted-foreground">
        <strong className="text-navy">You</strong> · {when}
      </p>
      {body ? (
        <div className="rounded-[18px_18px_4px_18px] bg-navy px-4 py-3.5 text-[15px] leading-[1.55] break-words whitespace-pre-wrap text-white">
          {body}
        </div>
      ) : null}
      <Files files={files} code={code} align="end" />
    </div>
  );
}

function Files({
  files,
  code,
  align = "start",
}: {
  files: RequestFile[];
  code: string;
  align?: "start" | "end";
}) {
  if (!files.length) return null;
  return (
    <div
      className={
        align === "end"
          ? "flex flex-wrap justify-end gap-1.5"
          : "flex flex-wrap gap-1.5"
      }
    >
      {files.map((file) => (
        <FileChip
          key={file.id}
          look="link"
          name={file.fileName}
          href={fileUrl(code, file.id)}
        />
      ))}
    </div>
  );
}
