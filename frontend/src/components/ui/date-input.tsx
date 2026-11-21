"use client";

import * as React from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Popover } from "radix-ui";

import {
  MONTHS,
  WEEKDAYS,
  addDays,
  addMonths,
  clampDay,
  dayOf,
  endOfWeek,
  inRange,
  isDay,
  longDay,
  monthGrid,
  monthTitle,
  parseTyped,
  partsOf,
  startOfWeek,
  today,
  typedDay,
} from "@/lib/calendar";
import { cn } from "@/lib/utils";

import { controlClass, openableClass, useFieldProps } from "./field-context";
import { COLLISION_PADDING, floatingMotion, floatingPanel } from "./popover";

/**
 * A date box with our own calendar, the same on every screen and device.
 *
 *   <DateInput {...form.register("startDate")} />          (react-hook-form)
 *   <DateInput name="from" defaultValue="2026-11-01" />    (a form that goes to the address)
 *   <DateInput value={day} onChange={(e) => setDay(e.target.value)} min={today()} />
 *
 * The value is a "YYYY-MM-DD" day (or ""), as with the browser's date box,
 * and `onChange` gets `event.target.value`, so forms don't change. People
 * type it ("21/11/2026", "21 Nov 2026" or "2026-11-21"; it is read when
 * they leave the box or press Enter) or pick it: a click on the box or the
 * calendar button opens the calendar. In the calendar the arrows move a
 * day or a week, Page Up and Page Down a month (with Shift a year), Home
 * and End the week, Enter chooses, Escape closes. The month name opens the
 * months, then the years.
 */

/** What `onChange` and `onBlur` get: like a browser date box's event. */
export type DateTarget = {
  readonly name: string;
  value: string;
  readonly disabled: boolean;
  readonly form: HTMLFormElement | null;
  focus(): void;
  blur(): void;
};

export type DateEvent = {
  target: DateTarget;
  currentTarget: DateTarget;
  type: "change" | "blur";
};

type View = "days" | "months" | "years";

type CalendarProps = {
  /** The chosen day ("" for none). */
  value: string;
  /** The day typed so far, shown while typing. */
  preview?: string;
  min?: string;
  max?: string;
  /** Move the keyboard into the days when it opens from the button. */
  autoFocus: boolean;
  onPick: (day: string) => void;
  onClear?: () => void;
};

const navButton =
  "inline-flex size-9 cursor-pointer items-center justify-center rounded-full text-navy transition-colors hover:bg-soft active:scale-95 disabled:cursor-not-allowed disabled:opacity-35 disabled:hover:bg-transparent motion-reduce:active:scale-100 [&_svg]:size-[18px]";

const cellButton =
  "relative inline-flex w-full cursor-pointer items-center justify-center rounded-full text-sm font-semibold transition-[background-color,color,transform] duration-100 active:scale-95 motion-reduce:active:scale-100";

/**
 * The calendar on its own: days, months and years, with Today and Clear.
 * Exported for the components page; forms use `<DateInput>`.
 */
export function Calendar({
  value,
  preview,
  min,
  max,
  autoFocus,
  onPick,
  onClear,
}: CalendarProps) {
  const now = today();
  const start = clampDay(preview || value || now, min, max);
  const [cursor, setCursor] = React.useState(start);
  const [view, setView] = React.useState<View>("days");
  const [slide, setSlide] = React.useState<"left" | "right" | null>(null);
  const [shownPreview, setShownPreview] = React.useState(preview);
  const focusNext = React.useRef(autoFocus);
  const gridRef = React.useRef<HTMLDivElement>(null);
  const titleId = React.useId();

  // While someone types a whole date, the calendar goes to it.
  if (preview !== shownPreview) {
    setShownPreview(preview);
    if (preview && isDay(preview)) setCursor(preview);
  }

  const { year, month } = partsOf(cursor)!;

  React.useEffect(() => {
    if (!focusNext.current) return;
    focusNext.current = false;
    gridRef.current
      ?.querySelector<HTMLButtonElement>('[tabindex="0"]')
      ?.focus({ preventScroll: true });
  });

  const move = (next: string, focus = true) => {
    if (next.slice(0, 7) !== cursor.slice(0, 7)) {
      setSlide(next > cursor ? "left" : "right");
    }
    focusNext.current = focus;
    setCursor(next);
  };

  const changeView = (next: View) => {
    focusNext.current = true;
    setSlide(null);
    setView(next);
  };

  const monthOpen = (y: number, m: number) =>
    inRange(dayOf(y, m + 1, 0), min) && inRange(dayOf(y, m, 1), undefined, max);
  const yearOpen = (y: number) =>
    inRange(dayOf(y, 11, 31), min) && inRange(dayOf(y, 0, 1), undefined, max);

  const firstYear = year - (year % 12);
  const steps = {
    days: {
      title: monthTitle(year, month),
      prev: "Previous month",
      next: "Next month",
      canPrev: monthOpen(year, month - 1),
      canNext: monthOpen(year, month + 1),
      titleLabel: `${monthTitle(year, month)}: choose another month`,
    },
    months: {
      title: String(year),
      prev: "Previous year",
      next: "Next year",
      canPrev: yearOpen(year - 1),
      canNext: yearOpen(year + 1),
      titleLabel: `${year}: choose another year`,
    },
    years: {
      title: `${firstYear} – ${firstYear + 11}`,
      prev: "Earlier years",
      next: "Later years",
      canPrev: yearOpen(firstYear - 1),
      canNext: yearOpen(firstYear + 12),
      titleLabel: `Years ${firstYear} to ${firstYear + 11}: back to the days`,
    },
  }[view];
  /** Months that the arrows move by, and where the title goes. */
  const shift = { days: 1, months: 12, years: 144 }[view];
  const up = ({ days: "months", months: "years", years: "days" } as const)[
    view
  ];

  function onDayKey(event: React.KeyboardEvent) {
    const jumps: Record<string, () => string> = {
      ArrowLeft: () => addDays(cursor, -1),
      ArrowRight: () => addDays(cursor, 1),
      ArrowUp: () => addDays(cursor, -7),
      ArrowDown: () => addDays(cursor, 7),
      Home: () => startOfWeek(cursor),
      End: () => endOfWeek(cursor),
      PageUp: () => addMonths(cursor, event.shiftKey ? -12 : -1),
      PageDown: () => addMonths(cursor, event.shiftKey ? 12 : 1),
    };
    const jump = jumps[event.key];
    if (!jump) return;
    event.preventDefault();
    move(clampDay(jump(), min, max));
  }

  function onPickerKey(event: React.KeyboardEvent, kind: "months" | "years") {
    const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -3, ArrowDown: 3 }[
      event.key
    ];
    if (step === undefined) return;
    event.preventDefault();
    move(addMonths(cursor, kind === "months" ? step : step * 12));
  }

  const selectedParts = partsOf(value);
  const todayOpen = inRange(now, min, max);
  const animation =
    slide === "left"
      ? "animate-in fade-in-0 slide-in-from-right-3"
      : slide === "right"
        ? "animate-in fade-in-0 slide-in-from-left-3"
        : "animate-in fade-in-0";

  return (
    <div className="w-[min(20.5rem,calc(100vw-1.5rem))] p-3 select-none">
      <div className="mb-2 flex items-center justify-between gap-1">
        <button
          type="button"
          aria-label={steps.prev}
          disabled={!steps.canPrev}
          onClick={() => move(addMonths(cursor, -shift), false)}
          className={navButton}
        >
          <ChevronLeft aria-hidden="true" />
        </button>
        <button
          type="button"
          id={titleId}
          aria-label={steps.titleLabel}
          aria-live="polite"
          onClick={() => changeView(up)}
          className="group/title inline-flex h-9 cursor-pointer items-center gap-1 rounded-full px-3 text-[15px] font-bold text-navy transition-colors hover:bg-soft"
        >
          {steps.title}
          <ChevronDown
            aria-hidden="true"
            className={cn(
              "size-4 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
              view !== "days" && "rotate-180",
            )}
          />
        </button>
        <button
          type="button"
          aria-label={steps.next}
          disabled={!steps.canNext}
          onClick={() => move(addMonths(cursor, shift), false)}
          className={navButton}
        >
          <ChevronRight aria-hidden="true" />
        </button>
      </div>

      <div ref={gridRef}>
        {view === "days" ? (
          <table
            role="grid"
            aria-label={monthTitle(year, month)}
            onKeyDown={onDayKey}
            className="w-full border-separate border-spacing-y-0.5"
          >
            <thead>
              <tr>
                {WEEKDAYS.map((day) => (
                  <th
                    key={day}
                    scope="col"
                    abbr={day}
                    className="pb-1.5 text-center text-[11px] font-bold tracking-[0.06em] text-muted-foreground uppercase"
                  >
                    {day.slice(0, 2)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody
              key={`${year}-${month}`}
              className={cn(
                animation,
                "duration-200 motion-reduce:animate-none",
              )}
            >
              {monthGrid(year, month).map((week) => (
                <tr key={week[0]}>
                  {week.map((day) => {
                    const parts = partsOf(day)!;
                    const outside = parts.month !== month;
                    const chosen = day === value;
                    const isToday = day === now;
                    const allowed = inRange(day, min, max);
                    const previewing = !chosen && day === preview;
                    return (
                      <td
                        key={day}
                        role="gridcell"
                        aria-selected={chosen}
                        className="p-0 text-center"
                      >
                        <button
                          type="button"
                          tabIndex={day === cursor ? 0 : -1}
                          aria-label={longDay(day)}
                          aria-current={isToday ? "date" : undefined}
                          disabled={!allowed}
                          data-day={day}
                          onClick={() => onPick(day)}
                          onFocus={() => {
                            if (day !== cursor) setCursor(day);
                          }}
                          className={cn(
                            cellButton,
                            "aspect-square max-h-10",
                            outside ? "text-muted-foreground" : "text-navy",
                            allowed
                              ? !chosen && "hover:bg-soft"
                              : "cursor-not-allowed text-muted-foreground line-through decoration-1 opacity-40 active:scale-100",
                            isToday &&
                              !chosen &&
                              "font-extrabold text-gold-text",
                            previewing && "bg-tint ring-1 ring-navy/25",
                            chosen &&
                              "bg-navy font-bold text-white shadow-[0_6px_14px_-6px_rgba(2,26,84,0.7)]",
                          )}
                        >
                          {parts.day}
                          {isToday ? (
                            <span
                              aria-hidden="true"
                              className={cn(
                                "absolute bottom-[5px] left-1/2 size-1 -translate-x-1/2 rounded-full",
                                chosen ? "bg-gold" : "bg-gold-text",
                              )}
                            />
                          ) : null}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        ) : view === "months" ? (
          <div
            role="group"
            aria-label={`Months of ${year}`}
            onKeyDown={(event) => onPickerKey(event, "months")}
            className="grid animate-in grid-cols-3 gap-1.5 py-1 duration-150 fade-in-0 zoom-in-98 motion-reduce:animate-none"
          >
            {MONTHS.map((name, index) => {
              const open = monthOpen(year, index);
              const chosen =
                selectedParts?.year === year && selectedParts.month === index;
              const focused = index === month;
              return (
                <button
                  key={name}
                  type="button"
                  tabIndex={focused ? 0 : -1}
                  aria-label={`${name} ${year}`}
                  aria-pressed={chosen}
                  disabled={!open}
                  onClick={() => {
                    move(
                      clampDay(
                        dayOf(year, index, Math.min(partsOf(cursor)!.day, 28)),
                        min,
                        max,
                      ),
                    );
                    changeView("days");
                  }}
                  className={cn(
                    cellButton,
                    "h-12 rounded-[12px] disabled:cursor-not-allowed disabled:opacity-35",
                    chosen
                      ? "bg-navy text-white"
                      : focused
                        ? "bg-tint text-navy hover:bg-soft"
                        : "text-navy hover:bg-soft",
                  )}
                >
                  {name.slice(0, 3)}
                </button>
              );
            })}
          </div>
        ) : (
          <div
            role="group"
            aria-label={`Years ${firstYear} to ${firstYear + 11}`}
            onKeyDown={(event) => onPickerKey(event, "years")}
            className="grid animate-in grid-cols-3 gap-1.5 py-1 duration-150 fade-in-0 zoom-in-98 motion-reduce:animate-none"
          >
            {Array.from({ length: 12 }, (_, index) => firstYear + index).map(
              (y) => {
                const chosen = selectedParts?.year === y;
                const focused = y === year;
                return (
                  <button
                    key={y}
                    type="button"
                    tabIndex={focused ? 0 : -1}
                    aria-pressed={chosen}
                    disabled={!yearOpen(y)}
                    onClick={() => {
                      move(
                        clampDay(addMonths(cursor, (y - year) * 12), min, max),
                      );
                      changeView("months");
                    }}
                    className={cn(
                      cellButton,
                      "h-12 rounded-[12px] disabled:cursor-not-allowed disabled:opacity-35",
                      chosen
                        ? "bg-navy text-white"
                        : focused
                          ? "bg-tint text-navy hover:bg-soft"
                          : "text-navy hover:bg-soft",
                    )}
                  >
                    {y}
                  </button>
                );
              },
            )}
          </div>
        )}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 border-t border-line-3 pt-2.5">
        <button
          type="button"
          disabled={!todayOpen}
          onClick={() => onPick(now)}
          className="inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full px-3 text-[13px] font-bold text-navy transition-colors hover:bg-soft disabled:cursor-not-allowed disabled:opacity-40"
        >
          <span
            aria-hidden="true"
            className="size-1.5 rounded-full bg-gold-text"
          />
          Today
        </button>
        {onClear && value ? (
          <button
            type="button"
            onClick={onClear}
            className="inline-flex h-9 cursor-pointer items-center rounded-full px-3 text-[13px] font-bold text-muted-foreground transition-colors hover:bg-soft hover:text-navy"
          >
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}

type DateInputProps = {
  id?: string;
  name?: string;
  /** "YYYY-MM-DD", or "" for none. */
  value?: string | null;
  defaultValue?: string | null;
  onChange?: (event: DateEvent) => void;
  onBlur?: (event: DateEvent) => void;
  ref?: React.Ref<DateTarget>;
  /** The earliest and latest days that can be chosen ("YYYY-MM-DD"). */
  min?: string | number;
  max?: string | number;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;
};

const asDay = (value: unknown) =>
  typeof value === "string" && isDay(value) ? value : "";

function DateInput({
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  ref,
  min: minProp,
  max: maxProp,
  disabled = false,
  placeholder = "DD/MM/YYYY",
  className,
  ...props
}: DateInputProps) {
  const min = asDay(minProp) || undefined;
  const max = asDay(maxProp) || undefined;
  const field = useFieldProps(props);
  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(asDay(defaultValue));
  const current = controlled ? asDay(value) : inner;

  const [text, setText] = React.useState(typedDay(current));
  const [textFor, setTextFor] = React.useState(current);
  const [problem, setProblem] = React.useState("");
  const [open, setOpen] = React.useState(false);
  const [fromButton, setFromButton] = React.useState(false);
  const problemId = React.useId();

  // A new value from outside (or a pick) shows in the box.
  if (current !== textFor) {
    setTextFor(current);
    setText(typedDay(current));
  }

  const wrapRef = React.useRef<HTMLDivElement>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const hiddenRef = React.useRef<HTMLInputElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const leftOutside = React.useRef(false);

  const latest = React.useRef({ current, name, disabled, controlled });
  React.useLayoutEffect(() => {
    latest.current = { current, name, disabled, controlled };
  });

  /** The `event.target` of onChange, and what react-hook-form's ref gets. */
  const handle = React.useMemo<DateTarget>(
    () => ({
      get name() {
        return latest.current.name ?? "";
      },
      get value() {
        return latest.current.current;
      },
      set value(next: string) {
        const day = asDay(next);
        latest.current = { ...latest.current, current: day };
        if (hiddenRef.current) hiddenRef.current.value = day;
        if (!latest.current.controlled) setInner(day);
      },
      get disabled() {
        return latest.current.disabled;
      },
      get form() {
        return inputRef.current?.form ?? null;
      },
      focus: () => inputRef.current?.focus(),
      blur: () => inputRef.current?.blur(),
    }),
    [],
  );
  React.useImperativeHandle(ref, () => handle, [handle]);

  function commit(day: string) {
    setProblem("");
    setText(typedDay(day));
    if (day === latest.current.current) return;
    latest.current = { ...latest.current, current: day };
    // The form reads the new value straight away.
    if (hiddenRef.current) hiddenRef.current.value = day;
    if (!controlled) setInner(day);
    onChange?.({ target: handle, currentTarget: handle, type: "change" });
  }

  /** Reads what was typed: a day, nothing, or back to the last good one. */
  function readTyped() {
    const typed = text.trim();
    if (typed === typedDay(current)) {
      setProblem("");
      return;
    }
    if (!typed) {
      commit("");
      return;
    }
    const day = parseTyped(typed);
    if (day && inRange(day, min, max)) {
      commit(day);
      return;
    }
    setText(typedDay(current));
    setProblem(
      day
        ? `Choose a day ${min && day < min ? `from ${typedDay(min)}` : `up to ${typedDay(max!)}`}`
        : "Write the date like 21/11/2026, or pick it",
    );
  }

  function pick(day: string) {
    commit(day);
    setOpen(false);
  }

  function show(viaButton: boolean) {
    if (disabled) return;
    setFromButton(viaButton);
    setOpen(true);
  }

  const typedPreview = parseTyped(text) ?? undefined;
  const invalid = Boolean(problem) || field["aria-invalid"];
  const describedBy =
    [field["aria-describedby"], problem ? problemId : undefined]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <Popover.Root
      open={open}
      onOpenChange={(next) => {
        if (next) show(true);
        else {
          setOpen(false);
          readTyped();
        }
      }}
    >
      <Popover.Anchor asChild>
        <div ref={wrapRef} data-slot="date-input" className="relative w-full">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck={false}
            placeholder={placeholder}
            disabled={disabled}
            {...props}
            {...field}
            aria-invalid={invalid || undefined}
            aria-describedby={describedBy}
            value={text}
            onChange={(event) => {
              setText(event.target.value);
              if (problem) setProblem("");
            }}
            onClick={() => {
              if (!open) show(false);
            }}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                readTyped();
                if (open) {
                  event.preventDefault();
                  setOpen(false);
                }
              } else if (event.key === "ArrowDown" && !open) {
                event.preventDefault();
                show(true);
              } else if (event.key === "Escape" && open) {
                event.preventDefault();
                setOpen(false);
              }
            }}
            onBlur={(event) => {
              const to = event.relatedTarget;
              if (
                wrapRef.current?.contains(to) ||
                contentRef.current?.contains(to)
              ) {
                return;
              }
              if (!open) readTyped();
              onBlur?.({ target: handle, currentTarget: handle, type: "blur" });
            }}
            className={cn(
              controlClass,
              openableClass,
              "h-[50px] pr-12 pl-3.5 tabular-nums",
              open && "border-navy/45 shadow-[0_0_0_4px_rgba(211,175,52,0.18)]",
              className,
            )}
          />
          <Popover.Trigger asChild>
            <button
              type="button"
              aria-label="Open calendar"
              disabled={disabled}
              className="absolute top-1/2 right-1.5 inline-flex size-10 -translate-y-1/2 cursor-pointer items-center justify-center rounded-[8px] text-muted-foreground transition-colors hover:bg-soft hover:text-navy disabled:cursor-not-allowed disabled:hover:bg-transparent data-[state=open]:bg-soft data-[state=open]:text-navy"
            >
              <CalendarDays aria-hidden="true" className="size-[18px]" />
            </button>
          </Popover.Trigger>
          {name ? (
            <input
              ref={hiddenRef}
              type="hidden"
              name={name}
              value={current}
              disabled={disabled}
            />
          ) : null}
        </div>
      </Popover.Anchor>
      {problem ? (
        <p
          id={problemId}
          role="alert"
          className="text-xs font-semibold text-danger"
        >
          {problem}
        </p>
      ) : null}
      <Popover.Portal>
        <Popover.Content
          ref={contentRef}
          align="start"
          sideOffset={6}
          collisionPadding={COLLISION_PADDING}
          aria-label="Calendar"
          onOpenAutoFocus={(event) => {
            // From a click on the box, the keyboard stays there for typing.
            if (!fromButton) event.preventDefault();
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            if (!leftOutside.current) inputRef.current?.focus();
            leftOutside.current = false;
          }}
          onInteractOutside={(event) => {
            if (wrapRef.current?.contains(event.target as Node)) {
              event.preventDefault();
              return;
            }
            leftOutside.current = true;
          }}
          onKeyDown={(event) => {
            // The keyboard goes round inside the calendar, as in a dialog.
            if (event.key !== "Tab") return;
            const stops = Array.from(
              contentRef.current?.querySelectorAll<HTMLElement>(
                'button:not([disabled]):not([tabindex="-1"])',
              ) ?? [],
            );
            if (!stops.length) return;
            const first = stops[0];
            const last = stops[stops.length - 1];
            if (event.shiftKey && document.activeElement === first) {
              event.preventDefault();
              last.focus();
            } else if (!event.shiftKey && document.activeElement === last) {
              event.preventDefault();
              first.focus();
            }
          }}
          className={cn(
            floatingPanel,
            floatingMotion,
            "origin-(--radix-popover-content-transform-origin)",
          )}
        >
          <Calendar
            value={current}
            preview={typedPreview}
            min={min}
            max={max}
            autoFocus={fromButton}
            onPick={pick}
            onClear={field.required ? undefined : () => pick("")}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export { DateInput };
