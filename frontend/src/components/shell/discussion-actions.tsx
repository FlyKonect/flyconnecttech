"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Paperclip } from "lucide-react";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Checkbox,
  Field,
  Input,
  Select,
  Textarea,
} from "@/components/ui/field";
import { FileChip } from "@/components/ui/file-chip";
import { RowMenu, RowMenuItem } from "@/components/ui/row-menu";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import {
  POST_MAX,
  TITLE_MAX,
  type AskChoice,
  type TopicPost,
} from "@/lib/discussions";
import { roles } from "@/lib/labels";
import { addFiles, FILE_ACCEPT } from "@/lib/uploads";

/** Picked files with "Attach file" (up to 5, the request upload rules). */
function useFiles() {
  const [files, setFiles] = React.useState<File[]>([]);
  const [error, setError] = React.useState("");
  const input = React.useRef<HTMLInputElement>(null);
  const picker = (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="inline-flex min-h-10 cursor-pointer items-center gap-1.5 rounded-[10px] px-3 text-[13px] font-bold text-body hover:bg-soft"
      >
        <Paperclip aria-hidden="true" className="size-3.5" />
        Attach file
      </button>
      <input
        ref={input}
        type="file"
        multiple
        accept={FILE_ACCEPT}
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? []);
          event.target.value = "";
          const result = addFiles(files, picked);
          setFiles(result.files);
          setError(result.error);
        }}
        className="sr-only"
        tabIndex={-1}
        aria-hidden="true"
      />
    </>
  );
  const chips = files.length ? (
    <div className="flex flex-wrap gap-2">
      {files.map((file) => (
        <FileChip
          key={`${file.name}-${file.size}`}
          look="picked"
          name={file.name}
          onRemove={() => setFiles(files.filter((f) => f !== file))}
        />
      ))}
    </div>
  ) : null;
  return { files, setFiles, error, setError, picker, chips };
}

/** Team topics: tick the people to ask. */
function AskPicker({
  choices,
  chosen,
  onChange,
}: {
  choices: AskChoice[];
  chosen: string[];
  onChange: (ids: string[]) => void;
}) {
  if (!choices.length) return null;
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-[13px] font-bold">
        Ask someone (optional)
      </legend>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(200px,1fr))] gap-1.5">
        {choices.map((person) => (
          <Checkbox
            key={person.id}
            checked={chosen.includes(person.id)}
            onChange={(event) =>
              onChange(
                event.target.checked
                  ? [...chosen, person.id]
                  : chosen.filter((id) => id !== person.id),
              )
            }
          >
            {person.name}
            <span className="text-muted-foreground">
              {" "}
              · {person.jobTitle ?? roles[person.role].label}
            </span>
          </Checkbox>
        ))}
      </div>
    </fieldset>
  );
}

/** "+ New topic": title, module, first message, files (and, team, who to ask). */
export function NewTopicButton({
  api,
  boardHref,
  modules,
  askChoices,
  team,
}: {
  /** The board's backend route. */
  api: string;
  /** The board's page; a new topic opens at {boardHref}/{number}. */
  boardHref: string;
  modules: { id: string; name: string }[];
  askChoices: AskChoice[];
  /** A team (internal) topic: says so, and offers Ask. */
  team: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [open, setOpen] = React.useState(false);
  const [title, setTitle] = React.useState("");
  const [moduleId, setModuleId] = React.useState("");
  const [body, setBody] = React.useState("");
  const [ask, setAsk] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);
  const attach = useFiles();

  async function start(event: React.FormEvent) {
    event.preventDefault();
    if (!title.trim()) return attach.setError("Give the topic a title");
    if (!body.trim() && !attach.files.length) {
      return attach.setError("Write the first message or attach a file.");
    }
    setBusy(true);
    attach.setError("");
    try {
      const form = new FormData();
      form.set("title", title.trim());
      form.set("body", body.trim());
      if (moduleId) form.set("moduleId", moduleId);
      for (const id of ask) form.append("ask", id);
      for (const file of attach.files) form.append("files", file);
      const created = await apiFetch<{ number: number }>(api, {
        method: "POST",
        body: form,
      });
      toast(`Topic #${created.number} started`);
      setOpen(false);
      router.push(`${boardHref}/${created.number}`);
    } catch (failed) {
      attach.setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Button
        onClick={() => {
          setTitle("");
          setModuleId("");
          setBody("");
          setAsk([]);
          attach.setFiles([]);
          attach.setError("");
          setOpen(true);
        }}
      >
        + New topic
      </Button>
      {open ? (
        <Dialog open onOpenChange={(value) => (value ? null : setOpen(false))}>
          <DialogContent className="max-w-[640px]">
            <DialogTitle>
              {team ? "New team topic" : "New discussion"}
            </DialogTitle>
            <DialogDescription>
              {team
                ? "Only the project team sees this. The customer never does."
                : "The customer and the project team see this and can reply."}
            </DialogDescription>
            <form
              noValidate
              onSubmit={start}
              className="mt-4 flex max-h-[65vh] flex-col gap-3.5 overflow-y-auto pr-1"
            >
              <Field label="Title" required>
                <Input
                  value={title}
                  maxLength={TITLE_MAX}
                  placeholder="For example: Checkout on one page?"
                  onChange={(event) => setTitle(event.target.value)}
                />
              </Field>
              {modules.length ? (
                <Field label="About a module (optional)">
                  <Select
                    value={moduleId}
                    onChange={(event) => setModuleId(event.target.value)}
                  >
                    <option value="">The whole project</option>
                    {modules.map((module) => (
                      <option key={module.id} value={module.id}>
                        {module.name}
                      </option>
                    ))}
                  </Select>
                </Field>
              ) : null}
              <Field label="Message">
                <Textarea
                  rows={5}
                  maxLength={POST_MAX}
                  value={body}
                  onChange={(event) => setBody(event.target.value)}
                />
              </Field>
              {attach.chips}
              {team ? (
                <AskPicker
                  choices={askChoices}
                  chosen={ask}
                  onChange={setAsk}
                />
              ) : null}
              {attach.error ? <FormError>{attach.error}</FormError> : null}
              <DialogFooter className="items-center justify-between">
                {attach.picker}
                <span className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpen(false)}
                    disabled={busy}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={busy}>
                    {busy ? "Starting…" : "Start topic"}
                  </Button>
                </span>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

/**
 * The reply box: text and up to 5 files; for the team on customer topics
 * "Post as a proposal"; on team topics, who to ask.
 */
export function ReplyComposer({
  api,
  number,
  canPropose,
  askChoices,
  audience,
}: {
  api: string;
  number: number;
  canPropose: boolean;
  askChoices: AskChoice[];
  /** Who hears about the reply, under the box. */
  audience: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [body, setBody] = React.useState("");
  const [proposal, setProposal] = React.useState(false);
  const [ask, setAsk] = React.useState<string[]>([]);
  const [busy, setBusy] = React.useState(false);
  const attach = useFiles();

  async function send(event: React.FormEvent) {
    event.preventDefault();
    if (!body.trim() && !attach.files.length) {
      return attach.setError("Write a reply or attach a file.");
    }
    setBusy(true);
    attach.setError("");
    try {
      const form = new FormData();
      form.set("body", body.trim());
      if (proposal) form.set("proposal", "true");
      for (const id of ask) form.append("ask", id);
      for (const file of attach.files) form.append("files", file);
      await apiFetch(`${api}/${number}/posts`, { method: "POST", body: form });
      setBody("");
      setProposal(false);
      setAsk([]);
      attach.setFiles([]);
      toast(
        proposal
          ? "Proposal posted. The customer was asked to approve it."
          : "Reply posted",
      );
      router.refresh();
    } catch (failed) {
      attach.setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={send}
      noValidate
      aria-label="Reply"
      className="flex flex-col gap-3 rounded-[18px] border border-[#CBD5E4] bg-white p-3"
    >
      <textarea
        aria-label="Your reply"
        rows={4}
        maxLength={POST_MAX}
        value={body}
        onChange={(event) => setBody(event.target.value)}
        placeholder={
          proposal
            ? "Describe the proposal: what you suggest, and why"
            : "Write a reply"
        }
        className="block w-full resize-y bg-transparent px-1.5 py-1 text-[15px] text-navy outline-none placeholder:text-muted-foreground"
      />
      {attach.chips}
      {canPropose ? (
        <Checkbox
          checked={proposal}
          onChange={(event) => setProposal(event.target.checked)}
        >
          Post as a proposal for the customer to approve
        </Checkbox>
      ) : null}
      <AskPicker choices={askChoices} chosen={ask} onChange={setAsk} />
      {attach.error ? <FormError>{attach.error}</FormError> : null}
      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line-3 pt-2.5">
        <span className="flex flex-wrap items-center gap-2">
          {attach.picker}
          <span className="text-[13px] text-muted-foreground">{audience}</span>
        </span>
        <Button type="submit" disabled={busy}>
          {busy ? "Posting…" : proposal ? "Post proposal" : "Post reply"}
        </Button>
      </div>
    </form>
  );
}

/** A post's "⋯": Edit (own), Mark as answer, Remove (admins). */
export function PostMenu({
  api,
  number,
  post,
  canAnswer,
  isAnswer,
  canRemove,
  canEdit,
}: {
  api: string;
  number: number;
  post: TopicPost;
  canAnswer: boolean;
  isAnswer: boolean;
  canRemove: boolean;
  canEdit: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [editing, setEditing] = React.useState(false);
  const [removing, setRemoving] = React.useState(false);
  const [text, setText] = React.useState(post.body);
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);
  if (!canAnswer && !canRemove && !canEdit) return null;

  async function call(path: string, body: unknown, done: string) {
    setBusy(true);
    setError("");
    try {
      await apiFetch(path, { method: "POST", body });
      toast(done);
      router.refresh();
      return true;
    } catch (failed) {
      const message = apiErrorMessage(failed);
      setError(message);
      toast(message);
      return false;
    } finally {
      setBusy(false);
    }
  }

  const who = post.author?.name ?? "the team";
  return (
    <>
      <RowMenu label={`Actions for the message by ${who}`}>
        {canEdit ? (
          <RowMenuItem
            onSelect={() => {
              setText(post.body);
              setError("");
              setEditing(true);
            }}
          >
            Edit
          </RowMenuItem>
        ) : null}
        {canAnswer ? (
          <RowMenuItem
            onSelect={() =>
              call(
                `${api}/${number}/answer`,
                { postId: isAnswer ? null : post.id },
                isAnswer ? "Answer cleared" : "Marked as the answer",
              )
            }
          >
            {isAnswer ? "Clear the answer" : "Mark as the answer"}
          </RowMenuItem>
        ) : null}
        {canRemove ? (
          <RowMenuItem danger onSelect={() => setRemoving(true)}>
            Remove
          </RowMenuItem>
        ) : null}
      </RowMenu>
      {editing ? (
        <Dialog
          open
          onOpenChange={(value) => (value ? null : setEditing(false))}
        >
          <DialogContent>
            <DialogTitle>Edit your message</DialogTitle>
            <DialogDescription>
              Everyone sees the corrected text, marked “edited”. No new email is
              sent.
            </DialogDescription>
            <form
              noValidate
              className="mt-4 flex flex-col gap-3.5"
              onSubmit={async (event) => {
                event.preventDefault();
                if (
                  await call(
                    `${api}/${number}/posts/${post.id}`,
                    { body: text.trim() },
                    "Message corrected",
                  )
                ) {
                  setEditing(false);
                }
              }}
            >
              <Field label="Message" error={error}>
                <Textarea
                  rows={5}
                  maxLength={POST_MAX}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                />
              </Field>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditing(false)}
                  disabled={busy}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Saving…" : "Save"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
      {removing ? (
        <Dialog
          open
          onOpenChange={(value) => (value ? null : setRemoving(false))}
        >
          <DialogContent>
            <DialogTitle>Remove this message?</DialogTitle>
            <DialogDescription>
              It leaves the discussion for everyone
              {post.files.length ? ", with its files" : ""}. This can&apos;t be
              undone.
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRemoving(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={busy}
                onClick={async () => {
                  if (
                    await call(
                      `${api}/${number}/posts/${post.id}/remove`,
                      undefined,
                      "Message removed",
                    )
                  ) {
                    setRemoving(false);
                  }
                }}
              >
                Remove
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

/** The customer's answer to a proposal: Approve, or Request changes. */
export function ProposalDecision({
  api,
  number,
  postId,
}: {
  api: string;
  number: number;
  postId: string;
}) {
  const router = useRouter();
  const toast = useToast();
  const [asking, setAsking] = React.useState<"approve" | "changes" | null>(
    null,
  );
  const [note, setNote] = React.useState("");
  const [error, setError] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function send(decision: "approve" | "changes") {
    if (decision === "changes" && !note.trim()) {
      return setError("Say what should change");
    }
    setBusy(true);
    setError("");
    try {
      await apiFetch(`${api}/${number}/posts/${postId}/decision`, {
        method: "POST",
        body: { decision, note: note.trim() },
      });
      toast(
        decision === "approve"
          ? "Proposal approved. The team has been told."
          : "Thanks. The team has your changes.",
      );
      setAsking(null);
      router.refresh();
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="mt-3 flex flex-wrap gap-2">
      <Button
        variant="success"
        size="sm"
        onClick={() => {
          setNote("");
          setError("");
          setAsking("approve");
        }}
      >
        Approve proposal
      </Button>
      <Button
        variant="outline"
        size="sm"
        onClick={() => {
          setNote("");
          setError("");
          setAsking("changes");
        }}
      >
        Request changes
      </Button>
      {asking ? (
        <Dialog open onOpenChange={(value) => (value ? null : setAsking(null))}>
          <DialogContent>
            <DialogTitle>
              {asking === "approve"
                ? "Approve the proposal?"
                : "Request changes"}
            </DialogTitle>
            <DialogDescription>
              {asking === "approve"
                ? "The team goes ahead with it. Add a note if you like."
                : "Tell the team what should change."}
            </DialogDescription>
            <form
              noValidate
              className="mt-4 flex flex-col gap-3.5"
              onSubmit={(event) => {
                event.preventDefault();
                void send(asking);
              }}
            >
              <Field
                label={
                  asking === "approve"
                    ? "Note (optional)"
                    : "What should change"
                }
                required={asking === "changes"}
                error={error}
              >
                <Textarea
                  rows={4}
                  maxLength={500}
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                />
              </Field>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAsking(null)}
                  disabled={busy}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant={asking === "approve" ? "success" : "navy"}
                  disabled={busy}
                >
                  {busy
                    ? "Sending…"
                    : asking === "approve"
                      ? "Approve proposal"
                      : "Send changes"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
    </div>
  );
}

/** Close topic (with a note), Reopen, and for admins Delete topic. */
export function TopicButtons({
  api,
  number,
  listHref,
  canClose,
  canReopen,
  canDelete,
}: {
  api: string;
  number: number;
  listHref: string;
  canClose: boolean;
  canReopen: boolean;
  canDelete: boolean;
}) {
  const router = useRouter();
  const toast = useToast();
  const [closing, setClosing] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);
  const [note, setNote] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  async function call(path: string, body: unknown, done: string) {
    setBusy(true);
    try {
      await apiFetch(path, { method: "POST", body });
      toast(done);
      return true;
    } catch (failed) {
      toast(apiErrorMessage(failed));
      return false;
    } finally {
      setBusy(false);
    }
  }

  if (!canClose && !canReopen && !canDelete) return null;
  return (
    <span className="flex flex-wrap items-center gap-2">
      {canClose ? (
        <Button
          variant="outline"
          onClick={() => {
            setNote("");
            setClosing(true);
          }}
        >
          Close topic
        </Button>
      ) : null}
      {canReopen ? (
        <Button
          variant="outline"
          disabled={busy}
          onClick={async () => {
            if (
              await call(`${api}/${number}/reopen`, undefined, "Topic reopened")
            ) {
              router.refresh();
            }
          }}
        >
          Reopen topic
        </Button>
      ) : null}
      {canDelete ? (
        <RowMenu label="More actions for this topic">
          <RowMenuItem danger onSelect={() => setDeleting(true)}>
            Delete topic
          </RowMenuItem>
        </RowMenu>
      ) : null}
      {closing ? (
        <Dialog
          open
          onOpenChange={(value) => (value ? null : setClosing(false))}
        >
          <DialogContent>
            <DialogTitle>Close this topic?</DialogTitle>
            <DialogDescription>
              Nobody can reply until it is reopened. Add what was agreed, if you
              like; it shows at the top.
            </DialogDescription>
            <form
              noValidate
              className="mt-4 flex flex-col gap-3.5"
              onSubmit={async (event) => {
                event.preventDefault();
                if (
                  await call(
                    `${api}/${number}/close`,
                    { note: note.trim() },
                    "Topic closed",
                  )
                ) {
                  setClosing(false);
                  router.refresh();
                }
              }}
            >
              <Field label="Closing note (optional)">
                <Textarea
                  rows={3}
                  maxLength={500}
                  value={note}
                  placeholder="For example: Agreed, one-page checkout"
                  onChange={(event) => setNote(event.target.value)}
                />
              </Field>
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setClosing(false)}
                  disabled={busy}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={busy}>
                  {busy ? "Closing…" : "Close topic"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      ) : null}
      {deleting ? (
        <Dialog
          open
          onOpenChange={(value) => (value ? null : setDeleting(false))}
        >
          <DialogContent>
            <DialogTitle>Delete this topic?</DialogTitle>
            <DialogDescription>
              Every message and file in it goes for good, for everyone. This
              can&apos;t be undone.
            </DialogDescription>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleting(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={busy}
                onClick={async () => {
                  if (
                    await call(
                      `${api}/${number}/delete`,
                      undefined,
                      "Topic deleted",
                    )
                  ) {
                    router.replace(listHref);
                  }
                }}
              >
                Delete topic
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      ) : null}
    </span>
  );
}
