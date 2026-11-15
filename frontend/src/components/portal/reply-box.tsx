"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { FileChip } from "@/components/ui/file-chip";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import { addFiles, FILE_ACCEPT } from "@/lib/uploads";

/** "Write a reply to the support team", with files (screen 13). */
export function ReplyBox({ code }: { code: string }) {
  const router = useRouter();
  const toast = useToast();
  const [text, setText] = React.useState("");
  const [files, setFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const fileInput = React.useRef<HTMLInputElement>(null);

  function pickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    const result = addFiles(files, picked);
    setFiles(result.files);
    setError(result.error);
  }

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!text.trim() && files.length === 0) {
      setError("Write a reply or attach a file.");
      return;
    }
    setSending(true);
    setError("");
    const form = new FormData();
    form.set("body", text.trim());
    for (const file of files) form.append("files", file);
    try {
      await apiFetch(`/portal/requests/${encodeURIComponent(code)}/replies`, {
        method: "POST",
        body: form,
      });
      setText("");
      setFiles([]);
      toast("Reply sent to the support team");
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setSending(false);
    }
  }

  return (
    <form onSubmit={send} className="mt-1.5 flex flex-col gap-3" noValidate>
      <div className="overflow-hidden rounded-[18px] border border-[#CBD5E4] focus-within:border-navy">
        <textarea
          aria-label="Reply"
          rows={3}
          value={text}
          maxLength={10000}
          onChange={(event) => setText(event.target.value)}
          placeholder="Write a reply to the support team"
          className="block w-full resize-y bg-white px-4 py-3.5 text-[15px] text-navy outline-none placeholder:text-muted-foreground"
        />
        {files.length ? (
          <div className="flex flex-wrap gap-2 bg-white px-3 pb-3">
            {files.map((file) => (
              <FileChip
                key={`${file.name}-${file.size}`}
                look="picked"
                name={file.name}
                onRemove={() => setFiles(files.filter((f) => f !== file))}
              />
            ))}
          </div>
        ) : null}
        <div className="flex items-center justify-between gap-2.5 bg-[#F6F8FC] px-3 py-2.5">
          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-bold text-body hover:bg-white"
          >
            <Paperclip aria-hidden="true" className="size-3.5" />
            Attach file
          </button>
          <input
            ref={fileInput}
            type="file"
            multiple
            accept={FILE_ACCEPT}
            onChange={pickFiles}
            className="sr-only"
            tabIndex={-1}
            aria-hidden="true"
          />
          <Button
            type="submit"
            className="h-[42px] px-[18px]"
            disabled={sending}
          >
            {sending ? "Sending…" : "Send reply"}
          </Button>
        </div>
      </div>
      <FormError>{error}</FormError>
    </form>
  );
}
