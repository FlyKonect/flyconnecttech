"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";

import { refreshWebsite } from "@/app/team/(app)/website-content/actions";
import { FormError } from "@/components/auth/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { Checkbox, Field, Input, Textarea } from "@/components/ui/field";
import { LabelPill } from "@/components/ui/pill";
import { RowMenu, RowMenuItem } from "@/components/ui/row-menu";
import { useToast } from "@/components/ui/toast";
import { apiErrorMessage, apiFetch } from "@/lib/api";
import type { TeamTestimonial, WebsiteContentView } from "@/lib/team/types";
import {
  emptyTestimonial,
  HOME_TESTIMONIALS,
  isWebAddress,
  LINK_ERROR,
  placesOf,
  QUOTE_MAX,
  testimonialErrors,
  type TestimonialForm,
} from "@/lib/team/website-content";

const card = "rounded-[22px] border border-line-2 bg-white p-6";

/**
 * After a change: the website drops its old copy first, so when the
 * message shows, visitors already see the change. Then this page updates.
 */
function useAfterChange() {
  const router = useRouter();
  const toast = useToast();
  return async (message: string) => {
    await refreshWebsite();
    toast(message);
    router.refresh();
  };
}

/**
 * Website content (super admins and admins): the live-project link and the
 * client testimonials the public website shows.
 */
export function WebsiteContent({ view }: { view: WebsiteContentView }) {
  return (
    <div className="flex flex-col gap-5">
      <LiveProjectLinkCard saved={view.liveProjectUrl} />
      <TestimonialsCard testimonials={view.testimonials} />
    </div>
  );
}

// ------------------------------------------------------- live-project link

function LiveProjectLinkCard({ saved }: { saved: string }) {
  const afterChange = useAfterChange();
  const [url, setUrl] = React.useState(saved);
  const [tried, setTried] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const invalid = !isWebAddress(url);

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    setError("");
    if (invalid) return;
    setBusy(true);
    try {
      await apiFetch("/team/website/link", {
        method: "POST",
        body: { liveProjectUrl: url.trim() },
      });
      await afterChange("Live project link saved");
    } catch (failed) {
      setError(apiErrorMessage(failed));
    } finally {
      setBusy(false);
    }
  }

  return (
    <section aria-labelledby="live-project-link" className={card}>
      <h2 id="live-project-link" className="text-[17px] font-bold">
        Live project link
      </h2>
      <form
        noValidate
        onSubmit={save}
        className="mt-3.5 flex flex-wrap items-start gap-3"
      >
        <Field
          label="Web address"
          hint={`The website's "View live project" buttons open this address.`}
          error={tried && invalid ? LINK_ERROR : ""}
          className="min-w-0 flex-[1_1_320px]"
        >
          <Input
            type="url"
            inputMode="url"
            value={url}
            onChange={(event) => setUrl(event.target.value)}
          />
        </Field>
        <Button type="submit" disabled={busy} className="mt-[26px]">
          {busy ? "Saving…" : "Save link"}
        </Button>
      </form>
      {error ? (
        <div className="mt-3">
          <FormError>{error}</FormError>
        </div>
      ) : null}
    </section>
  );
}

// ------------------------------------------------------------ testimonials

function TestimonialsCard({
  testimonials,
}: {
  testimonials: TeamTestimonial[];
}) {
  const [adding, setAdding] = React.useState(false);
  const [editing, setEditing] = React.useState<TeamTestimonial | null>(null);
  const [removing, setRemoving] = React.useState<TeamTestimonial | null>(null);

  return (
    <section aria-labelledby="testimonials" className={card}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-[1_1_320px]">
          <h2 id="testimonials" className="text-[17px] font-bold">
            Testimonials
          </h2>
          <p className="mt-1.5 max-w-[640px] text-sm leading-[1.55] text-muted-foreground">
            Only add quotes with the client&apos;s permission. Home shows the{" "}
            {HOME_TESTIMONIALS} newest marked for Home; Case Studies shows the
            newest marked for Case Studies.
          </p>
        </div>
        <Button onClick={() => setAdding(true)}>
          <Plus aria-hidden="true" className="size-4" />
          Add testimonial
        </Button>
      </div>

      {testimonials.length === 0 ? (
        <p className="mt-5 rounded-[16px] border border-dashed border-line px-5 py-6 text-center text-sm text-muted-foreground">
          No testimonials yet. The website hides this section until you add one.
        </p>
      ) : (
        <ul aria-label="Testimonials" className="mt-5 flex flex-col gap-3">
          {testimonials.map((testimonial) => (
            <TestimonialRow
              key={testimonial.id}
              testimonial={testimonial}
              onEdit={() => setEditing(testimonial)}
              onRemove={() => setRemoving(testimonial)}
            />
          ))}
        </ul>
      )}

      {adding ? <TestimonialDialog onClose={() => setAdding(false)} /> : null}
      {editing ? (
        <TestimonialDialog
          testimonial={editing}
          onClose={() => setEditing(null)}
        />
      ) : null}
      {removing ? (
        <RemoveDialog
          testimonial={removing}
          onClose={() => setRemoving(null)}
        />
      ) : null}
    </section>
  );
}

function TestimonialRow({
  testimonial,
  onEdit,
  onRemove,
}: {
  testimonial: TeamTestimonial;
  onEdit: () => void;
  onRemove: () => void;
}) {
  const places = placesOf(testimonial);
  const byline = [testimonial.role, testimonial.company]
    .filter(Boolean)
    .join(", ");
  return (
    <li className="flex items-start gap-3 rounded-[16px] border border-line-2 p-4">
      <div className="min-w-0 flex-1">
        <p className="line-clamp-3 text-[15px] leading-[1.55] text-ink-2">
          “{testimonial.quote}”
        </p>
        <p className="mt-2 text-sm">
          <span className="font-bold">{testimonial.name}</span>
          {byline ? (
            <span className="text-muted-foreground"> · {byline}</span>
          ) : null}
        </p>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          {places.length ? (
            places.map((place) => (
              <LabelPill key={place} group="testimonialPlace" value={place} />
            ))
          ) : (
            <span className="text-xs font-semibold text-muted-foreground">
              Not shown on the website
            </span>
          )}
        </div>
      </div>
      <RowMenu label={`Actions for ${testimonial.name}'s testimonial`}>
        <RowMenuItem onSelect={onEdit}>Edit</RowMenuItem>
        <RowMenuItem danger onSelect={onRemove}>
          Remove
        </RowMenuItem>
      </RowMenu>
    </li>
  );
}

/** Add testimonial, or Edit testimonial when one is given. */
function TestimonialDialog({
  testimonial,
  onClose,
}: {
  testimonial?: TeamTestimonial;
  onClose: () => void;
}) {
  const afterChange = useAfterChange();
  const [form, setForm] = React.useState<TestimonialForm>(() =>
    testimonial
      ? {
          quote: testimonial.quote,
          name: testimonial.name,
          role: testimonial.role ?? "",
          company: testimonial.company ?? "",
          showOnHome: testimonial.showOnHome,
          showOnCaseStudy: testimonial.showOnCaseStudy,
        }
      : emptyTestimonial,
  );
  const [tried, setTried] = React.useState(false);
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");
  const errors = tried ? testimonialErrors(form) : {};

  const set =
    (key: "quote" | "name" | "role" | "company") =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm({ ...form, [key]: event.target.value });

  async function save(event: React.FormEvent) {
    event.preventDefault();
    setTried(true);
    setError("");
    if (Object.keys(testimonialErrors(form)).length) return;
    setBusy(true);
    try {
      await apiFetch(
        testimonial
          ? `/team/website/testimonials/${testimonial.id}`
          : "/team/website/testimonials",
        { method: "POST", body: form },
      );
      await afterChange(
        testimonial ? "Testimonial saved" : "Testimonial added",
      );
      onClose();
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogTitle>
          {testimonial ? "Edit testimonial" : "Add testimonial"}
        </DialogTitle>
        <DialogDescription>
          Only add quotes with the client&apos;s permission.
        </DialogDescription>
        <form noValidate onSubmit={save} className="mt-5 flex flex-col gap-4">
          <Field
            label="Quote"
            required
            error={errors.quote}
            hint={`${form.quote.trim().length} of ${QUOTE_MAX} characters`}
          >
            <Textarea rows={4} value={form.quote} onChange={set("quote")} />
          </Field>
          <Field label="Client name" required error={errors.name}>
            <Input
              autoComplete="off"
              value={form.name}
              onChange={set("name")}
            />
          </Field>
          <div className="flex flex-wrap gap-4">
            <Field
              label="Role (optional)"
              error={errors.role}
              className="min-w-0 flex-[1_1_180px]"
            >
              <Input
                autoComplete="off"
                placeholder="Managing director"
                value={form.role}
                onChange={set("role")}
              />
            </Field>
            <Field
              label="Company (optional)"
              error={errors.company}
              className="min-w-0 flex-[1_1_180px]"
            >
              <Input
                autoComplete="off"
                value={form.company}
                onChange={set("company")}
              />
            </Field>
          </div>
          <fieldset className="flex flex-col gap-1">
            <legend className="mb-1.5 text-[13px] font-bold">Show on</legend>
            <Checkbox
              className="min-h-9 gap-3"
              checked={form.showOnHome}
              onChange={(event) =>
                setForm({ ...form, showOnHome: event.target.checked })
              }
            >
              Home
            </Checkbox>
            <Checkbox
              className="min-h-9 gap-3"
              checked={form.showOnCaseStudy}
              onChange={(event) =>
                setForm({ ...form, showOnCaseStudy: event.target.checked })
              }
            >
              Case Studies
            </Checkbox>
          </fieldset>
          {error ? <FormError>{error}</FormError> : null}
          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={busy}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={busy}>
              {busy
                ? "Saving…"
                : testimonial
                  ? "Save changes"
                  : "Add testimonial"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function RemoveDialog({
  testimonial,
  onClose,
}: {
  testimonial: TeamTestimonial;
  onClose: () => void;
}) {
  const afterChange = useAfterChange();
  const [busy, setBusy] = React.useState(false);
  const [error, setError] = React.useState("");

  async function remove() {
    setBusy(true);
    setError("");
    try {
      await apiFetch(`/team/website/testimonials/${testimonial.id}/remove`, {
        method: "POST",
      });
      await afterChange("Testimonial removed");
      onClose();
    } catch (failed) {
      setError(apiErrorMessage(failed));
      setBusy(false);
    }
  }

  return (
    <Dialog open onOpenChange={(open) => (open ? null : onClose())}>
      <DialogContent>
        <DialogTitle>Remove this testimonial?</DialogTitle>
        <DialogDescription>
          {testimonial.name}&apos;s quote disappears from the website.
        </DialogDescription>
        {error ? (
          <div className="mt-4">
            <FormError>{error}</FormError>
          </div>
        ) : null}
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={remove} disabled={busy}>
            {busy ? "Removing…" : "Remove"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
