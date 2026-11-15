"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { Calendar, X } from "lucide-react";
import { Dialog, RadioGroup } from "radix-ui";
import { useForm } from "react-hook-form";

import {
  FormAlert,
  Honeypot,
  SiteField,
  SuccessTick,
  SummaryRows,
} from "@/components/site/forms/site-field";
import { ApiError, apiErrorMessage } from "@/lib/api";
import { upcomingDemoDays, type DemoDay } from "@/lib/forms/demo-slots";
import {
  demoDetailsDefaults,
  demoDetailsSchema,
  firstName,
  type DemoDetailsInput,
} from "@/lib/forms/schemas";
import { submitLead, takenDemoSlots } from "@/lib/forms/submit";
import { demoTopics, type DemoTopic } from "@/lib/labels";
import { cn } from "@/lib/utils";

/**
 * Book a demo (docs/01, "Book a demo"; design/screens/website/12 to 15):
 * 1. what to see, 2. date and time, 3. your details, then a confirmation.
 *
 * Closing the dialog before the end keeps what the visitor picked, so
 * reopening continues where they left off. After the confirmation it
 * starts again from step 1.
 */

const TOPIC_DETAILS: Record<DemoTopic, string> = {
  TRAVEL_BOOKING_PLATFORM: "Amadeus flight search, booking and ticketing",
  AGENT_ADMIN_DASHBOARDS: "Agent portals, bookings, payments and reports",
  CUSTOM_SOFTWARE_WEBSITES: "Talk through your idea and see similar builds",
  API_INTEGRATIONS: "Payments, GDS and third-party systems",
};

const STEP_LABELS = ["What to see", "Date and time", "Your details"];

type Step = 1 | 2 | 3 | 4;

export function DemoDialog({
  open,
  openedAt,
  onOpenChange,
  returnFocusTo,
}: {
  open: boolean;
  /** When the dialog was opened (milliseconds). The days count from this. */
  openedAt: number | null;
  onOpenChange: (open: boolean) => void;
  /** Gets the keyboard focus back when the dialog closes. */
  returnFocusTo: React.RefObject<HTMLElement | null>;
}) {
  const pathname = usePathname();
  const [step, setStep] = React.useState<Step>(1);
  const [topic, setTopic] = React.useState<DemoTopic | null>(null);
  const days = React.useMemo<DemoDay[]>(
    () => (openedAt === null ? [] : upcomingDemoDays(new Date(openedAt))),
    [openedAt],
  );
  const [dayIndex, setDayIndex] = React.useState(0);
  const [slotStart, setSlotStart] = React.useState<string | null>(null);
  const [stepError, setStepError] = React.useState("");
  /** Slots a scheduled demo already holds (UTC instants), crossed out. */
  const [takenSlots, setTakenSlots] = React.useState<Set<string>>(
    () => new Set(),
  );
  const [honeypot, setHoneypot] = React.useState("");

  // Each time the dialog opens, ask which times are already booked. If
  // that fails, every time is shown; the backend still refuses a taken one.
  React.useEffect(() => {
    if (openedAt === null) return;
    let current = true;
    takenDemoSlots()
      .then((taken) => {
        if (current) setTakenSlots(taken);
      })
      .catch(() => undefined);
    return () => {
      current = false;
    };
  }, [openedAt]);

  const form = useForm<DemoDetailsInput>({
    resolver: zodResolver(demoDetailsSchema),
    defaultValues: demoDetailsDefaults,
  });
  const { errors, isSubmitting } = form.formState;

  const reset = () => {
    setStep(1);
    setTopic(null);
    setDayIndex(0);
    setSlotStart(null);
    setStepError("");
    form.reset(demoDetailsDefaults);
  };

  const handleOpenChange = (next: boolean) => {
    onOpenChange(next);
    if (!next) {
      setStepError("");
      if (step === 4) reset();
    }
  };

  const day = days[dayIndex];
  const slot = day?.slots.find((candidate) => candidate.start === slotStart);
  const whenShort = day
    ? `${day.weekdayShort} ${day.dayOfMonth} ${day.monthShort}${slot ? ` · ${slot.time} UK time` : ""}`
    : "";

  const submitDetails = form.handleSubmit(async (details) => {
    if (!topic || !slotStart) return;
    try {
      await submitLead(
        {
          kind: "demo",
          data: {
            ...demoDetailsSchema.parse(details),
            topic,
            preferredStart: slotStart,
          },
        },
        pathname,
        honeypot,
      );
    } catch (error) {
      if (error instanceof ApiError && error.code === "SLOT_TAKEN") {
        // Someone booked it a moment ago: back to the times.
        setTakenSlots((taken) => new Set(taken).add(slotStart));
        setSlotStart(null);
        setStep(2);
      }
      setStepError(apiErrorMessage(error));
      return;
    }
    setStepError("");
    setStep(4);
  });

  const next = async () => {
    if (step === 1) {
      if (!topic) return setStepError("Choose what you’d like to see.");
      setStepError("");
      return setStep(2);
    }
    if (step === 2) {
      if (!slotStart || takenSlots.has(slotStart)) {
        return setStepError("Pick an available time to continue.");
      }
      setStepError("");
      return setStep(3);
    }
    if (step === 3) {
      const valid = await form.trigger();
      if (!valid) {
        setStepError("Please fix the highlighted fields.");
        return;
      }
      await submitDetails();
      return;
    }
    handleOpenChange(false);
  };

  const values = form.getValues();

  return (
    <Dialog.Root open={open} onOpenChange={handleOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-[80] flex overflow-y-auto bg-[rgba(1,18,61,0.62)] px-3 py-6 sm:px-6">
          <Dialog.Content
            aria-describedby={undefined}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              returnFocusTo.current?.focus();
            }}
            className="m-auto w-full max-w-[620px] overflow-hidden rounded-[20px] bg-white text-left text-navy shadow-[0_40px_90px_-24px_rgba(0,5,22,0.65)]"
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-4 border-b border-line-2 px-[22px] pt-5 pb-4">
              <div className="flex min-w-0 items-center gap-3">
                <span className="inline-flex size-11 flex-none items-center justify-center rounded-xl bg-[rgba(211,175,52,0.13)] text-gold-text">
                  <Calendar aria-hidden="true" className="size-[22px]" />
                </span>
                <div className="min-w-0">
                  <Dialog.Title className="m-0 font-heading text-[21px] font-bold tracking-[-0.02em]">
                    Book a demo
                  </Dialog.Title>
                  <p className="m-0 mt-0.5 text-sm text-muted-foreground">
                    30-minute video call with our team
                  </p>
                </div>
              </div>
              <Dialog.Close
                aria-label="Close"
                className="inline-flex size-10 flex-none cursor-pointer items-center justify-center rounded-[10px] border border-stroke bg-white text-navy"
              >
                <X aria-hidden="true" className="size-[18px]" />
              </Dialog.Close>
            </div>

            {/* Progress */}
            {step < 4 ? (
              <ol className="m-0 flex list-none gap-2 px-[22px] pt-4">
                {STEP_LABELS.map((label, index) => {
                  const number = index + 1;
                  return (
                    <li
                      key={label}
                      aria-current={number === step ? "step" : undefined}
                      className="min-w-0 flex-1"
                    >
                      <div
                        aria-hidden="true"
                        className={cn(
                          "h-1 rounded-sm",
                          number <= step ? "bg-gold" : "bg-line",
                        )}
                      />
                      <p
                        className={cn(
                          "m-0 mt-2 text-xs font-semibold",
                          number === step
                            ? "text-navy"
                            : number < step
                              ? "text-muted-foreground"
                              : "text-[#7D8AA3]",
                        )}
                      >
                        {label}
                      </p>
                    </li>
                  );
                })}
              </ol>
            ) : null}

            {/* Body */}
            <div className="px-[22px] pt-[18px] pb-1">
              {step === 1 ? (
                <>
                  <p
                    id="demo-topic-label"
                    className="m-0 mb-3 text-[15px] font-semibold"
                  >
                    What would you like to see?
                  </p>
                  <RadioGroup.Root
                    aria-labelledby="demo-topic-label"
                    value={topic ?? ""}
                    onValueChange={(value) => {
                      setTopic(value as DemoTopic);
                      setStepError("");
                    }}
                    className="grid grid-cols-1 gap-2.5 sm:grid-cols-2"
                  >
                    {(Object.keys(demoTopics) as DemoTopic[]).map((key) => (
                      <RadioGroup.Item
                        key={key}
                        value={key}
                        className="group flex w-full cursor-pointer items-start gap-3 rounded-[14px] border border-stroke bg-white p-3.5 text-left data-[state=checked]:border-2 data-[state=checked]:border-navy data-[state=checked]:bg-soft data-[state=checked]:p-[13px]"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-px size-5 flex-none rounded-full border-2 border-[#B8C3D6] bg-white shadow-[inset_0_0_0_3px_#fff] group-data-[state=checked]:border-navy group-data-[state=checked]:bg-gold"
                        />
                        <span className="min-w-0">
                          <span className="block text-[15px] font-semibold text-navy">
                            {demoTopics[key].label}
                          </span>
                          <span className="mt-[3px] block text-[13px] leading-[1.45] text-muted-foreground">
                            {TOPIC_DETAILS[key]}
                          </span>
                        </span>
                      </RadioGroup.Item>
                    ))}
                  </RadioGroup.Root>
                </>
              ) : null}

              {step === 2 && day ? (
                <>
                  <p
                    id="demo-day-label"
                    className="m-0 mb-3 text-[15px] font-semibold"
                  >
                    Pick a day
                  </p>
                  <RadioGroup.Root
                    aria-labelledby="demo-day-label"
                    orientation="horizontal"
                    value={day.date}
                    onValueChange={(date) => {
                      setDayIndex(days.findIndex((d) => d.date === date));
                      setSlotStart(null);
                      setStepError("");
                    }}
                    className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1"
                  >
                    {days.map((option) => (
                      <RadioGroup.Item
                        key={option.date}
                        value={option.date}
                        aria-label={option.long}
                        className="flex w-16 flex-none cursor-pointer flex-col items-center gap-px rounded-xl border border-stroke bg-white py-[9px] text-navy data-[state=checked]:border-navy data-[state=checked]:bg-navy data-[state=checked]:text-white"
                      >
                        <span className="text-xs font-semibold opacity-80">
                          {option.weekdayShort}
                        </span>
                        <span className="font-heading text-[19px] font-bold">
                          {option.dayOfMonth}
                        </span>
                        <span className="text-xs opacity-80">
                          {option.monthShort}
                        </span>
                      </RadioGroup.Item>
                    ))}
                  </RadioGroup.Root>

                  <p
                    id="demo-time-label"
                    className="m-0 mt-4 mb-3 text-[15px] font-semibold"
                  >
                    Available times · {day.long}
                  </p>
                  <RadioGroup.Root
                    aria-labelledby="demo-time-label"
                    value={slotStart ?? ""}
                    onValueChange={(start) => {
                      setSlotStart(start);
                      setStepError("");
                    }}
                    className="grid grid-cols-3 gap-2"
                  >
                    {day.slots.map((option) => {
                      const taken = takenSlots.has(option.start);
                      return (
                        <RadioGroup.Item
                          key={option.start}
                          value={option.start}
                          disabled={taken}
                          aria-label={`${option.time}${taken ? ", taken" : ""}`}
                          className="h-11 cursor-pointer rounded-[10px] border border-stroke bg-white text-[15px] font-semibold text-navy disabled:cursor-not-allowed disabled:border-[#EEF1F6] disabled:bg-[#F3F5F9] disabled:text-[#7D8AA3] disabled:line-through data-[state=checked]:border-gold data-[state=checked]:bg-gold data-[state=checked]:text-navy"
                        >
                          {option.time}
                        </RadioGroup.Item>
                      );
                    })}
                  </RadioGroup.Root>
                  <p className="m-0 mt-3 text-[13px] leading-normal text-muted-foreground">
                    Times are UK time (GMT). Crossed-out times are already
                    taken.
                  </p>
                </>
              ) : null}

              {step === 3 ? (
                <form
                  id="demo-details"
                  noValidate
                  onSubmit={(event) => {
                    event.preventDefault();
                    void next();
                  }}
                >
                  <Honeypot value={honeypot} onChange={setHoneypot} />
                  <div className="flex items-center gap-3 rounded-xl border border-line bg-soft px-3.5 py-3 text-sm">
                    <Calendar
                      aria-hidden="true"
                      className="size-[18px] flex-none text-gold-text"
                    />
                    <span className="min-w-0 flex-auto">
                      <b>{whenShort}</b> ·{" "}
                      {topic ? demoTopics[topic].label : ""}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setStepError("");
                        setStep(2);
                      }}
                      className="min-h-9 flex-none cursor-pointer bg-transparent px-1.5 text-sm font-semibold text-navy"
                    >
                      Change
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap gap-3">
                    <SiteField
                      label="Full name *"
                      size="compact"
                      error={errors.name?.message}
                      className="flex-[1_1_220px]"
                    >
                      {(props) => (
                        <input
                          type="text"
                          autoComplete="name"
                          placeholder="Your name"
                          {...props}
                          {...form.register("name")}
                        />
                      )}
                    </SiteField>
                    <SiteField
                      label="Work email *"
                      size="compact"
                      error={errors.email?.message}
                      className="flex-[1_1_220px]"
                    >
                      {(props) => (
                        <input
                          type="email"
                          autoComplete="email"
                          placeholder="you@company.com"
                          {...props}
                          {...form.register("email")}
                        />
                      )}
                    </SiteField>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-3">
                    <SiteField
                      label="Company *"
                      size="compact"
                      error={errors.company?.message}
                      className="flex-[1_1_220px]"
                    >
                      {(props) => (
                        <input
                          type="text"
                          autoComplete="organization"
                          placeholder="Company name"
                          {...props}
                          {...form.register("company")}
                        />
                      )}
                    </SiteField>
                    <SiteField
                      label="Phone (optional)"
                      size="compact"
                      className="flex-[1_1_220px]"
                    >
                      {(props) => (
                        <input
                          type="tel"
                          autoComplete="tel"
                          placeholder="+44 20 0000 0000"
                          {...props}
                          {...form.register("phone")}
                        />
                      )}
                    </SiteField>
                  </div>
                  <SiteField
                    label="Anything we should prepare? (optional)"
                    kind="textarea"
                    className="mt-3"
                  >
                    {(props) => (
                      <textarea
                        rows={3}
                        placeholder="For example your current booking flow, or the features you want to see"
                        {...props}
                        {...form.register("notes")}
                      />
                    )}
                  </SiteField>
                  {/* Lets Enter in a field send the form. */}
                  <button type="submit" hidden tabIndex={-1} />
                </form>
              ) : null}

              {step === 4 ? (
                <div role="status">
                  <div className="pt-1 text-center">
                    <SuccessTick size={60} />
                    <p className="m-0 mt-3.5 font-heading text-2xl font-bold tracking-[-0.02em]">
                      Demo requested
                    </p>
                    <p className="mx-auto mt-2 mb-0 max-w-[430px] text-[15px] leading-[1.6] text-body">
                      Thanks, {firstName(values.name)}. We will send a calendar
                      invite to <b className="text-navy">{values.email}</b>{" "}
                      within [1 business day].
                    </p>
                  </div>
                  <div className="mt-[18px]">
                    <SummaryRows
                      labelWidth={84}
                      rows={[
                        ["Demo", topic ? demoTopics[topic].label : ""],
                        [
                          "When",
                          day && slot
                            ? `${day.long}, ${slot.time} UK time`
                            : "",
                        ],
                        ["Where", "Video call · 30 minutes"],
                        ["Company", values.company?.trim() ?? ""],
                      ]}
                    />
                  </div>
                </div>
              ) : null}

              {stepError ? (
                <div className="mt-3">
                  <FormAlert>{stepError}</FormAlert>
                </div>
              ) : null}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between gap-2.5 px-[22px] pt-4 pb-5">
              {step === 2 || step === 3 ? (
                <button
                  type="button"
                  onClick={() => {
                    setStepError("");
                    setStep((step - 1) as Step);
                  }}
                  className="h-[46px] cursor-pointer rounded-[10px] border border-input bg-white px-[18px] text-[15px] font-semibold text-navy"
                >
                  Back
                </button>
              ) : (
                <span className="text-[13px] text-muted-foreground">
                  {step === 1 ? "Takes less than a minute" : ""}
                </span>
              )}
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => void next()}
                className={cn(
                  "ml-auto h-[46px] cursor-pointer rounded-[10px] px-[22px] text-[15px] font-semibold disabled:opacity-60",
                  step === 3 ? "bg-gold text-navy" : "bg-navy text-white",
                )}
              >
                {step === 3 ? "Request demo" : step === 4 ? "Done" : "Continue"}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Overlay>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
