"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LifeBuoy, Send, UploadCloud } from "lucide-react";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Chip, ChipGroup } from "@/components/ui/choice";
import { Field, Input, Select, Textarea } from "@/components/ui/field";
import { FileChip } from "@/components/ui/file-chip";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import {
  priorities,
  projectTypes,
  requestTypes,
  type Priority,
  type RequestType,
} from "@/lib/labels";
import type { PortalProject } from "@/lib/portal/types";
import { routes } from "@/lib/routes";
import {
  addFiles,
  FILE_ACCEPT,
  MAX_FILE_BYTES,
  MAX_FILES,
} from "@/lib/uploads";

type Answers = {
  projectId: string;
  type: RequestType | "";
  priority: Priority;
  title: string;
  description: string;
  url: string;
  files: File[];
};

const card = "rounded-3xl border border-line-2 bg-white";

/**
 * Create support request: one page with everything on it. The project is
 * picked already when the customer has only one, or came from a project's
 * page (?project=P-0004).
 */
export function NewRequestForm({
  projects,
  projectCode,
}: {
  projects: PortalProject[];
  projectCode?: string;
}) {
  const router = useRouter();
  const [answers, setAnswers] = React.useState<Answers>({
    projectId:
      projects.find((project) => project.code === projectCode)?.id ??
      (projects.length === 1 ? projects[0].id : ""),
    type: "",
    priority: "MEDIUM",
    title: "",
    description: "",
    url: "",
    files: [],
  });
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [formError, setFormError] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const formRef = React.useRef<HTMLFormElement>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);

  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  function takeFiles(picked: File[]) {
    const result = addFiles(answers.files, picked);
    set("files", result.files);
    setErrors((current) => ({ ...current, files: result.error }));
  }

  function problems(): Record<string, string> {
    const found: Record<string, string> = {};
    if (!answers.projectId) found.projectId = "Choose a project.";
    if (!answers.type) found.type = "Choose a request type.";
    if (!answers.title.trim()) found.title = "Enter a request title";
    if (!answers.description.trim()) found.description = "Describe the request";
    return found;
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const found = problems();
    setErrors(found);
    if (Object.keys(found).length) {
      // Take the person to the first thing to fix.
      requestAnimationFrame(() =>
        formRef.current
          ?.querySelector<HTMLElement>(
            '[aria-invalid="true"], [data-invalid="true"] [role="radio"]',
          )
          ?.focus(),
      );
      return;
    }
    setSending(true);
    setFormError("");
    const form = new FormData();
    form.set("projectId", answers.projectId);
    form.set("type", answers.type);
    form.set("priority", answers.priority);
    form.set("title", answers.title.trim());
    form.set("description", answers.description.trim());
    if (answers.url.trim()) form.set("url", answers.url.trim());
    for (const file of answers.files) form.append("files", file);
    try {
      const { code } = await apiFetch<{ code: string }>("/portal/requests", {
        method: "POST",
        body: form,
      });
      router.push(routes.portalRequestSubmitted(code));
      // The sidebar's numbers change too.
      router.refresh();
    } catch (error) {
      setFormError(apiErrorMessage(error));
      setSending(false);
    }
  }

  if (projects.length === 0) {
    return (
      <section className={`${card} p-[clamp(18px,3vw,28px)]`}>
        <h2 className="font-heading text-2xl font-bold tracking-[-0.03em]">
          New support request
        </h2>
        <p className="mt-3 rounded-2xl bg-[#F6F8FC] p-[18px] text-sm text-body">
          There are no projects on your account yet. Ask the FlyConnect Tech
          team to add one.
        </p>
      </section>
    );
  }

  const chosenType = answers.type ? requestTypes[answers.type] : null;
  const maxMb = Math.round(MAX_FILE_BYTES / (1024 * 1024));

  return (
    <div className="flex flex-wrap items-start gap-5">
      <form
        ref={formRef}
        noValidate
        onSubmit={submit}
        className={`${card} min-w-0 flex-[1.7_1_560px] p-[clamp(18px,3vw,30px)]`}
      >
        <div className="flex items-start gap-3.5 border-b border-line-3 pb-5">
          <span
            aria-hidden="true"
            className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-tint text-navy-700"
          >
            <LifeBuoy className="size-[22px]" strokeWidth={1.9} />
          </span>
          <div>
            <h2 className="font-heading text-[22px] font-bold tracking-[-0.03em]">
              New support request
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Tell us what you need. Fields marked * are required.
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-[repeat(auto-fit,minmax(240px,1fr))] gap-4">
          <Field label="Project" required error={errors.projectId}>
            <Select
              value={answers.projectId}
              onChange={(event) => set("projectId", event.target.value)}
            >
              {projects.length > 1 ? (
                <option value="" disabled>
                  Choose a project
                </option>
              ) : null}
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} · {projectTypes[p.type].label}
                </option>
              ))}
            </Select>
          </Field>

          <div className="flex flex-col gap-1.5">
            <p id="priority-label" className="text-[13px] font-bold">
              Priority
            </p>
            <ChipGroup
              aria-labelledby="priority-label"
              value={answers.priority}
              onValueChange={(value) => set("priority", value as Priority)}
            >
              {(Object.keys(priorities) as Priority[]).map((priority) => (
                <Chip key={priority} value={priority}>
                  {priorities[priority].label}
                </Chip>
              ))}
            </ChipGroup>
          </div>
        </div>

        <div className="mt-5" data-invalid={errors.type ? "true" : undefined}>
          <p id="type-label" className="mb-2 text-[13px] font-bold">
            Request type *
          </p>
          <ChipGroup
            aria-labelledby="type-label"
            value={answers.type}
            onValueChange={(value) => set("type", value as RequestType)}
          >
            {(Object.keys(requestTypes) as RequestType[]).map((type) => (
              <Chip key={type} value={type}>
                {requestTypes[type].label}
              </Chip>
            ))}
          </ChipGroup>
          {errors.type ? (
            <InlineError>{errors.type}</InlineError>
          ) : chosenType ? (
            <p className="mt-2 text-xs text-muted-foreground">
              {chosenType.description}
            </p>
          ) : null}
        </div>

        <div className="mt-5 flex flex-col gap-4">
          <Field label="Request title" required error={errors.title}>
            <Input
              value={answers.title}
              maxLength={200}
              placeholder="A short summary, e.g. Prices show in the wrong currency"
              onChange={(event) => set("title", event.target.value)}
            />
          </Field>
          <Field
            label="Detailed description"
            required
            error={errors.description}
            hint="What happened, what you expected, and the steps to see it."
          >
            <Textarea
              rows={6}
              value={answers.description}
              maxLength={10000}
              onChange={(event) => set("description", event.target.value)}
            />
          </Field>
          <Field label="Page or website URL (optional)">
            <Input
              value={answers.url}
              maxLength={500}
              placeholder="https://"
              onChange={(event) => set("url", event.target.value)}
            />
          </Field>

          <div>
            <p id="attachments-label" className="mb-2 text-[13px] font-bold">
              Attachments (optional)
            </p>
            <div
              role="group"
              aria-labelledby="attachments-label"
              onDragOver={(event) => {
                event.preventDefault();
                setDragging(true);
              }}
              onDragLeave={() => setDragging(false)}
              onDrop={(event) => {
                event.preventDefault();
                setDragging(false);
                takeFiles(Array.from(event.dataTransfer.files));
              }}
              className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed p-5 text-center transition-colors ${
                dragging
                  ? "border-navy-700 bg-tint"
                  : "border-[#CBD5E4] bg-[#FAFBFD]"
              }`}
            >
              <UploadCloud
                aria-hidden="true"
                className="size-7 text-navy-700"
                strokeWidth={1.7}
              />
              <p className="text-sm text-body">
                Drag screenshots or files here, or{" "}
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="cursor-pointer font-bold text-navy-700 underline underline-offset-2"
                >
                  browse
                </button>
              </p>
              <p className="text-xs text-muted-foreground">
                Up to {MAX_FILES} files, {maxMb} MB each.
              </p>
              {answers.files.length ? (
                <div className="flex flex-wrap justify-center gap-2">
                  {answers.files.map((file) => (
                    <FileChip
                      key={`${file.name}-${file.size}`}
                      look="picked"
                      name={file.name}
                      onRemove={() =>
                        set(
                          "files",
                          answers.files.filter((f) => f !== file),
                        )
                      }
                    />
                  ))}
                </div>
              ) : null}
              <input
                ref={fileInput}
                type="file"
                multiple
                accept={FILE_ACCEPT}
                onChange={(event) => {
                  const picked = Array.from(event.target.files ?? []);
                  event.target.value = "";
                  takeFiles(picked);
                }}
                className="sr-only"
                tabIndex={-1}
                aria-hidden="true"
              />
            </div>
            <InlineError>{errors.files}</InlineError>
          </div>
        </div>

        {Object.values(errors).some(Boolean) ? (
          <p role="alert" className="mt-5 text-sm font-semibold text-danger">
            Please fill in the highlighted fields.
          </p>
        ) : null}
        {formError ? (
          <div className="mt-5">
            <FormError>{formError}</FormError>
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-line-3 pt-5">
          <Button asChild variant="outline" size="lg">
            <Link href={routes.portal}>Cancel</Link>
          </Button>
          <Button type="submit" size="lg" className="px-6" disabled={sending}>
            <Send aria-hidden="true" className="size-4" />
            {sending ? "Submitting…" : "Submit request"}
          </Button>
        </div>
      </form>

      <aside
        aria-labelledby="next-steps"
        className="min-w-0 flex-[1_1_280px] rounded-3xl bg-navy p-6 text-white"
      >
        <h2 id="next-steps" className="text-[17px] font-bold">
          What happens next
        </h2>
        <ol className="mt-4 flex flex-col gap-3.5 text-sm leading-normal text-[#DCE3F0]">
          {[
            "We review your request and assign it to the right person.",
            "You get an email when the team replies. Replies show in My Requests too.",
            "When it is resolved, you confirm it, or reopen it if something is still wrong.",
          ].map((step, index) => (
            <li key={index} className="flex gap-3">
              <span
                aria-hidden="true"
                className={`inline-flex size-[26px] shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  index === 0 ? "bg-gold text-navy" : "bg-white/12 text-white"
                }`}
              >
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 border-t border-white/12 pt-4 text-[13px] text-[#9FB0D6]">
          A screenshot and the page address help us fix things faster.
        </p>
      </aside>
    </div>
  );
}

function InlineError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-2 text-xs font-semibold text-danger">
      {children}
    </p>
  );
}
