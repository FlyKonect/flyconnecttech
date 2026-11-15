"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import { Chip, ChipGroup, RadioCard, RadioCards } from "@/components/ui/choice";
import { Field, Input, Textarea } from "@/components/ui/field";
import { FileChip } from "@/components/ui/file-chip";
import { LabelPill } from "@/components/ui/pill";
import { Stepper } from "@/components/ui/stepper";
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
import { addFiles, FILE_ACCEPT } from "@/lib/uploads";

const STEPS = ["Project", "Request type", "Details", "Review"];

type Answers = {
  projectId: string;
  type: RequestType | "";
  priority: Priority;
  title: string;
  description: string;
  url: string;
  files: File[];
};

/** Create support request: project, type, details, review (screens 07 to 10). */
export function NewRequestWizard({ projects }: { projects: PortalProject[] }) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [answers, setAnswers] = React.useState<Answers>({
    projectId: projects.length === 1 ? projects[0].id : "",
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
  const heading = React.useRef<HTMLHeadingElement>(null);
  const fileInput = React.useRef<HTMLInputElement>(null);
  const firstRender = React.useRef(true);

  // Each new step starts at the top, with the step bar in view, and its
  // heading takes the keyboard focus so screen readers announce it.
  React.useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
    heading.current?.focus({ preventScroll: true });
  }, [step]);

  const project = projects.find((p) => p.id === answers.projectId);
  const set = <K extends keyof Answers>(key: K, value: Answers[K]) => {
    setAnswers((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: "" }));
  };

  function problemsOn(current: number): Record<string, string> {
    const found: Record<string, string> = {};
    if (current === 1 && !answers.projectId)
      found.projectId = "Choose a project.";
    if (current === 2 && !answers.type) found.type = "Choose a request type.";
    if (current === 3) {
      if (!answers.title.trim()) found.title = "Enter a request title";
      if (!answers.description.trim()) {
        found.description = "Describe the request";
      }
    }
    return found;
  }

  function next() {
    const found = problemsOn(step);
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    setFormError("");
    setStep(step + 1);
  }

  function back() {
    setFormError("");
    if (step === 1) router.push(routes.portal);
    else setStep(step - 1);
  }

  function pickFiles(event: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(event.target.files ?? []);
    event.target.value = "";
    const result = addFiles(answers.files, picked);
    set("files", result.files);
    setErrors((current) => ({ ...current, files: result.error }));
  }

  async function submit() {
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

  const title = (text: string) => (
    <h2
      ref={heading}
      tabIndex={-1}
      className="mt-6 font-heading text-2xl font-bold tracking-[-0.03em] outline-none"
    >
      {text}
    </h2>
  );

  return (
    <section className="rounded-3xl border border-line-2 bg-white p-[clamp(18px,3vw,28px)]">
      <Stepper
        steps={STEPS}
        current={step}
        className="gap-x-6 gap-y-2.5 border-b border-line-3 pb-[22px]"
      />

      {step === 1 ? (
        <>
          {title("Which project is this about?")}
          <p className="mt-1.5 text-sm text-muted-foreground">
            These are the projects linked to your account.
          </p>
          {projects.length === 0 ? (
            <p className="mt-[18px] rounded-2xl bg-[#F6F8FC] p-[18px] text-sm text-body">
              There are no projects on your account yet. Ask the FlyConnect Tech
              team to add one.
            </p>
          ) : (
            <RadioCards
              aria-label="Project"
              value={answers.projectId}
              onValueChange={(value) => set("projectId", value)}
              className="mt-[18px] grid-cols-[repeat(auto-fit,minmax(260px,1fr))]"
            >
              {projects.map((p) => (
                <RadioCard
                  key={p.id}
                  value={p.id}
                  className="[&>span]:w-full"
                  title={
                    <>
                      <span className="flex w-full items-center justify-between gap-2.5">
                        <span className="text-xs font-bold text-muted-foreground">
                          {p.code} · {projectTypes[p.type].label}
                        </span>
                        <LabelPill group="projectStatus" value={p.status} />
                      </span>
                      <span className="mt-1.5 block text-[17px]">{p.name}</span>
                    </>
                  }
                />
              ))}
            </RadioCards>
          )}
          <StepError>{errors.projectId}</StepError>
        </>
      ) : null}

      {step === 2 ? (
        <>
          {title("What kind of request is it?")}
          <p className="mt-1.5 text-sm text-muted-foreground">
            Project: {project?.name}
          </p>
          <RadioCards
            aria-label="Request type"
            value={answers.type}
            onValueChange={(value) => set("type", value as RequestType)}
            className="mt-[18px] grid-cols-[repeat(auto-fit,minmax(220px,1fr))]"
          >
            {(Object.keys(requestTypes) as RequestType[]).map((type) => (
              <RadioCard
                key={type}
                value={type}
                title={
                  <span className="text-[15px]">
                    {requestTypes[type].label}
                  </span>
                }
                description={requestTypes[type].description}
              />
            ))}
          </RadioCards>
          <StepError>{errors.type}</StepError>
        </>
      ) : null}

      {step === 3 ? (
        <>
          {title("Tell us about the request")}
          <div className="mt-[18px] flex max-w-[820px] flex-col gap-4">
            <Field label="Request title" error={errors.title}>
              <Input
                value={answers.title}
                maxLength={200}
                onChange={(event) => set("title", event.target.value)}
              />
            </Field>
            <Field label="Detailed description" error={errors.description}>
              <Textarea
                value={answers.description}
                maxLength={10000}
                onChange={(event) => set("description", event.target.value)}
              />
            </Field>
            <div>
              <p id="priority-label" className="mb-2 text-[13px] font-bold">
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
            <Field label="Page or website URL (optional)">
              <Input
                value={answers.url}
                maxLength={500}
                onChange={(event) => set("url", event.target.value)}
              />
            </Field>
            <div>
              <p id="attachments-label" className="mb-2 text-[13px] font-bold">
                Attachments
              </p>
              <div
                role="group"
                aria-labelledby="attachments-label"
                className="flex flex-wrap items-center gap-2.5 rounded-2xl border-2 border-dashed border-[#CBD5E4] p-4"
              >
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
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="min-h-10 cursor-pointer rounded-[10px] bg-tint px-3.5 text-[13px] font-bold text-navy-700 hover:bg-[#E3E9F5]"
                >
                  + Add screenshot or file
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
              </div>
              <StepError>{errors.files}</StepError>
            </div>
          </div>
        </>
      ) : null}

      {step === 4 ? (
        <>
          {title("Review your request")}
          <p className="mt-1.5 text-sm text-muted-foreground">
            Check everything before you submit. You can still add information
            after submitting.
          </p>
          <div className="mt-[18px] grid grid-cols-[repeat(auto-fit,minmax(260px,1fr))] gap-3">
            <ReviewBox label="Project" onEdit={() => setStep(1)}>
              {project?.name}
            </ReviewBox>
            <ReviewBox label="Request type" onEdit={() => setStep(2)}>
              {answers.type ? requestTypes[answers.type].label : ""}
            </ReviewBox>
            <ReviewBox label="Priority" onEdit={() => setStep(3)}>
              <LabelPill group="priority" value={answers.priority} />
            </ReviewBox>
          </div>
          <div className="mt-3 rounded-2xl border border-line-2 p-5">
            <p className="text-lg font-bold break-words">
              {answers.title.trim()}
            </p>
            <p className="mt-2.5 text-[15px] leading-[1.6] break-words whitespace-pre-wrap text-body">
              {answers.description.trim()}
            </p>
            {answers.url.trim() ? (
              <p className="mt-3 text-[13px] break-all text-muted-foreground">
                URL: {answers.url.trim()}
              </p>
            ) : null}
            {answers.files.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {answers.files.map((file) => (
                  <FileChip
                    key={`${file.name}-${file.size}`}
                    name={file.name}
                  />
                ))}
              </div>
            ) : null}
          </div>
        </>
      ) : null}

      {formError ? (
        <div className="mt-5">
          <FormError>{formError}</FormError>
        </div>
      ) : null}

      <div className="mt-[26px] flex justify-between gap-3 border-t border-line-3 pt-5">
        {step === 1 ? (
          <Button asChild variant="outline" size="lg">
            <Link href={routes.portal}>Cancel</Link>
          </Button>
        ) : (
          <Button variant="outline" size="lg" onClick={back} disabled={sending}>
            Previous step
          </Button>
        )}
        {step < 4 ? (
          <Button key="continue" size="lg" className="px-6" onClick={next}>
            Continue
            <ArrowRight aria-hidden="true" className="size-4" />
          </Button>
        ) : (
          <Button
            // A new button, not the navy one fading to green.
            key="submit"
            variant="success"
            size="lg"
            className="px-6"
            onClick={submit}
            disabled={sending}
          >
            {sending ? "Submitting…" : "Submit request"}
          </Button>
        )}
      </div>
    </section>
  );
}

function StepError({ children }: { children?: string }) {
  if (!children) return null;
  return (
    <p role="alert" className="mt-3 text-sm font-semibold text-danger">
      {children}
    </p>
  );
}

function ReviewBox({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl bg-[#F6F8FC] p-[18px]">
      <p className="text-xs font-bold text-muted-foreground uppercase">
        {label}
      </p>
      <div className="mt-1.5 text-base font-bold">{children}</div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Edit ${label.toLowerCase()}`}
        className="mt-1.5 min-h-9 cursor-pointer text-[13px] font-bold text-gold-text hover:underline"
      >
        Edit
      </button>
    </div>
  );
}
