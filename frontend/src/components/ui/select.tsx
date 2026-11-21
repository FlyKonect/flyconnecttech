"use client";

import * as React from "react";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { Popover } from "radix-ui";

import { cn } from "@/lib/utils";

import {
  controlClass,
  openableClass,
  useFieldLabel,
  useFieldProps,
} from "./field-context";
import {
  COLLISION_PADDING,
  floatingItem,
  floatingMotion,
  floatingPanel,
} from "./popover";

/**
 * The app's dropdowns: our own list instead of the browser's, the same on
 * every screen and device.
 *
 *   <Select {...form.register("type")}>        (react-hook-form)
 *   <Select name="customer" defaultValue="">   (a form that goes to the address)
 *   <Select value={v} onChange={(e) => setV(e.target.value)}>
 *     <option value="">All customers</option>
 *     <option value="…">Skyline Travel</option>
 *   </Select>
 *
 * It takes the same `<option>`s (and `<optgroup>`s) and the same props as a
 * browser `<select>`, and `onChange` gets `event.target.value`, so forms
 * don't change. Long lists (10 or more) get a search box. Keyboard: Enter,
 * Space or the arrows open it; arrows, Home, End and typing move; Enter
 * chooses; Escape closes. A letter on the closed box jumps to the next
 * choice starting with it, as a browser dropdown does.
 *
 * `MultiSelect` (below) chooses several, with ticks and a search box.
 */

export type SelectOption = {
  value: string;
  label: string;
  disabled?: boolean;
  group?: string;
  /** A second line under the label (MultiSelect). */
  hint?: string;
};

/** What `onChange` and `onBlur` get: like a browser dropdown's event. */
export type SelectTarget = {
  readonly name: string;
  value: string;
  readonly disabled: boolean;
  readonly form: HTMLFormElement | null;
  focus(): void;
  blur(): void;
};

export type SelectEvent = {
  target: SelectTarget;
  currentTarget: SelectTarget;
  type: "change" | "blur";
};

/** Lists this long get a search box. */
export const SEARCH_FROM = 10;

function textOf(node: React.ReactNode): string {
  if (node === null || node === undefined || typeof node === "boolean") {
    return "";
  }
  if (typeof node === "string" || typeof node === "number") {
    return String(node);
  }
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    return textOf(node.props.children);
  }
  return "";
}

/** The `<option>`s inside, in order (through fragments and `<optgroup>`s). */
export function optionsOf(
  children: React.ReactNode,
  group?: string,
): SelectOption[] {
  const list: SelectOption[] = [];
  React.Children.forEach(children, (child) => {
    if (!React.isValidElement(child)) return;
    const props = child.props as {
      children?: React.ReactNode;
      value?: string | number | readonly string[];
      label?: string;
      disabled?: boolean;
    };
    if (child.type === React.Fragment) {
      list.push(...optionsOf(props.children, group));
    } else if (child.type === "optgroup") {
      list.push(...optionsOf(props.children, props.label ?? group));
    } else if (child.type === "option") {
      const label = textOf(props.children).replace(/\s+/g, " ").trim();
      list.push({
        value: props.value === undefined ? label : String(props.value),
        label,
        disabled: Boolean(props.disabled),
        group,
      });
    }
  });
  return list;
}

/** Lower case, without accents, for the search box. */
const fold = (text: string) =>
  text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** The choices that match the search, or all of them. */
export function filterOptions(options: SelectOption[], query: string) {
  const words = fold(query).split(/\s+/).filter(Boolean);
  if (!words.length) return options;
  return options.filter((option) => {
    const text = fold(
      `${option.label} ${option.hint ?? ""} ${option.group ?? ""}`,
    );
    return words.every((word) => text.includes(word));
  });
}

/** The shown choice, as a browser does it: the matching one, else the first. */
function resolve(options: SelectOption[], value: string | undefined) {
  return (
    options.find((option) => option.value === value) ??
    options.find((option) => !option.disabled)
  );
}

/** The next enabled choice from `from`, `step` at a time, stopping at the ends. */
function nextEnabled(options: SelectOption[], from: number, step: number) {
  for (
    let index = from + step;
    index >= 0 && index < options.length;
    index += step
  ) {
    if (!options[index].disabled) return index;
  }
  return from;
}

const firstEnabled = (options: SelectOption[]) =>
  options.findIndex((option) => !option.disabled);
const lastEnabled = (options: SelectOption[]) => {
  for (let index = options.length - 1; index >= 0; index -= 1) {
    if (!options[index].disabled) return index;
  }
  return -1;
};

/** "Typing on a list jumps to the choice that starts with those letters." */
function useTypeahead() {
  const typed = React.useRef({ text: "", at: 0 });
  return (key: string, options: SelectOption[], from: number) => {
    const now = Date.now();
    const text =
      now - typed.current.at > 700 ? key : `${typed.current.text}${key}`;
    typed.current = { text, at: now };
    const wanted = fold(text);
    const order = [
      ...options.slice(from + (text.length === 1 ? 1 : 0)),
      ...options.slice(0, from + (text.length === 1 ? 1 : 0)),
    ];
    const found = order.find(
      (option) => !option.disabled && fold(option.label).startsWith(wanted),
    );
    return found ? options.indexOf(found) : -1;
  };
}

const isPrintable = (event: React.KeyboardEvent) =>
  event.key.length === 1 &&
  event.key !== " " &&
  !event.ctrlKey &&
  !event.metaKey &&
  !event.altKey;

/** Bold where the search matched ("Sky" in "Skyline Travel"). */
function Highlight({ text, query }: { text: string; query: string }) {
  const word = query.trim().split(/\s+/)[0];
  if (!word) return <>{text}</>;
  const start = fold(text).indexOf(fold(word));
  if (start < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, start)}
      <mark className="bg-transparent font-extrabold text-navy">
        {text.slice(start, start + word.length)}
      </mark>
      {text.slice(start + word.length)}
    </>
  );
}

type ListProps = {
  id: string;
  label: string;
  options: SelectOption[];
  query: string;
  active: number;
  isChosen: (value: string) => boolean;
  multiple: boolean;
  onActive: (index: number) => void;
  onChoose: (option: SelectOption) => void;
  listRef: React.Ref<HTMLDivElement>;
  onKeyDown: (event: React.KeyboardEvent) => void;
  /** The list itself takes the keyboard (no search box). */
  focusable: boolean;
};

/** The list in the pop-up, shared by Select and MultiSelect. */
function OptionList({
  id,
  label,
  options,
  query,
  active,
  isChosen,
  multiple,
  onActive,
  onChoose,
  listRef,
  onKeyDown,
  focusable,
}: ListProps) {
  const optionId = (index: number) => `${id}-option-${index}`;

  React.useEffect(() => {
    if (active < 0) return;
    document
      .getElementById(`${id}-option-${active}`)
      ?.scrollIntoView?.({ block: "nearest" });
  }, [active, id]);

  if (!options.length) {
    return (
      <p
        role="status"
        className="px-3 py-6 text-center text-sm text-muted-foreground"
      >
        {query.trim() ? (
          <>
            Nothing matches{" "}
            <strong className="text-navy">“{query.trim()}”</strong>
          </>
        ) : (
          "Nothing to choose yet"
        )}
      </p>
    );
  }

  const groups: {
    name?: string;
    items: { option: SelectOption; index: number }[];
  }[] = [];
  options.forEach((option, index) => {
    const last = groups[groups.length - 1];
    if (last && last.name === option.group) last.items.push({ option, index });
    else groups.push({ name: option.group, items: [{ option, index }] });
  });

  const row = ({ option, index }: { option: SelectOption; index: number }) => {
    const chosen = isChosen(option.value);
    const isActive = index === active;
    return (
      <div
        key={`${option.value}-${index}`}
        id={optionId(index)}
        role="option"
        aria-selected={chosen}
        aria-disabled={option.disabled || undefined}
        data-value={option.value}
        data-active={isActive || undefined}
        onPointerMove={() => {
          if (!option.disabled && !isActive) onActive(index);
        }}
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => onChoose(option)}
        className={cn(
          floatingItem,
          "relative min-h-[42px] py-2",
          multiple ? "pl-2.5" : "pr-9",
          isActive && "bg-soft",
          chosen && !multiple && "font-bold",
          option.disabled && "cursor-not-allowed opacity-45",
        )}
      >
        {multiple ? (
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex size-[18px] shrink-0 items-center justify-center rounded-[5px] border-[1.5px] transition-colors",
              chosen
                ? "border-navy bg-navy text-white"
                : "border-[#AEBBD0] bg-white",
            )}
          >
            {chosen ? <Check strokeWidth={3} className="size-3!" /> : null}
          </span>
        ) : null}
        <span className="min-w-0 flex-1 leading-snug break-words">
          <Highlight text={option.label} query={query} />
          {option.hint ? (
            <span className="block text-xs font-medium text-muted-foreground">
              {option.hint}
            </span>
          ) : null}
        </span>
        {chosen && !multiple ? (
          <Check
            aria-hidden="true"
            strokeWidth={2.75}
            className="absolute top-1/2 right-3 -translate-y-1/2 text-gold-text"
          />
        ) : null}
      </div>
    );
  };

  return (
    <div
      ref={listRef}
      id={id}
      role="listbox"
      aria-label={label}
      aria-multiselectable={multiple || undefined}
      aria-activedescendant={active >= 0 ? optionId(active) : undefined}
      tabIndex={focusable ? 0 : -1}
      onKeyDown={focusable ? onKeyDown : undefined}
      className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-1.5 outline-none focus-visible:outline-none"
    >
      {groups.map((group, index) =>
        group.name ? (
          <div
            key={`${group.name}-${index}`}
            role="group"
            aria-label={group.name}
            className={index ? "mt-1.5 border-t border-line-3 pt-1.5" : ""}
          >
            <div
              aria-hidden="true"
              className="px-3 pt-1 pb-1.5 text-[11px] font-bold tracking-[0.08em] text-muted-foreground uppercase"
            >
              {group.name}
            </div>
            {group.items.map(row)}
          </div>
        ) : (
          <React.Fragment key={`list-${index}`}>
            {group.items.map(row)}
          </React.Fragment>
        ),
      )}
    </div>
  );
}

/** The search box at the top of a long list. */
function SearchBox({
  inputRef,
  query,
  onQuery,
  onKeyDown,
  listId,
  active,
}: {
  inputRef: React.Ref<HTMLInputElement>;
  query: string;
  onQuery: (query: string) => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
  listId: string;
  active: number;
}) {
  return (
    <div className="relative border-b border-line-3 p-1.5">
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-4.5 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        aria-expanded="true"
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={
          active >= 0 ? `${listId}-option-${active}` : undefined
        }
        aria-label="Search the choices"
        autoComplete="off"
        spellCheck={false}
        placeholder="Search…"
        value={query}
        onChange={(event) => onQuery(event.target.value)}
        onKeyDown={onKeyDown}
        className="h-10 w-full rounded-[10px] bg-soft pr-9 pl-9.5 text-sm font-medium text-navy outline-none placeholder:font-normal placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-gold/45 focus-visible:outline-none"
      />
      {query ? (
        <button
          type="button"
          aria-label="Clear the search"
          onClick={() => onQuery("")}
          className="absolute top-1/2 right-3 inline-flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground hover:bg-white hover:text-navy"
        >
          <X aria-hidden="true" className="size-3.5" />
        </button>
      ) : null}
    </div>
  );
}

/** Moving through a list with the keyboard; shared by both kinds. */
function useListKeys({
  shown,
  active,
  setActive,
  choose,
  close,
  typeahead,
  hasSearch,
}: {
  shown: SelectOption[];
  active: number;
  setActive: (index: number) => void;
  choose: (option: SelectOption) => void;
  close: () => void;
  typeahead: ReturnType<typeof useTypeahead>;
  hasSearch: boolean;
}) {
  return (event: React.KeyboardEvent) => {
    const fromSearch = event.target instanceof HTMLInputElement;
    switch (event.key) {
      case "ArrowDown":
        event.preventDefault();
        setActive(
          active < 0 ? firstEnabled(shown) : nextEnabled(shown, active, 1),
        );
        return;
      case "ArrowUp":
        event.preventDefault();
        setActive(
          active < 0 ? lastEnabled(shown) : nextEnabled(shown, active, -1),
        );
        return;
      case "PageDown":
        event.preventDefault();
        setActive(
          nextEnabled(shown, Math.min(active + 9, shown.length - 1), 1),
        );
        return;
      case "PageUp":
        event.preventDefault();
        setActive(nextEnabled(shown, Math.max(active - 9, 0), -1));
        return;
      case "Home":
      case "End":
        if (fromSearch) return;
        event.preventDefault();
        setActive(
          event.key === "Home" ? firstEnabled(shown) : lastEnabled(shown),
        );
        return;
      case "Enter":
        event.preventDefault();
        if (active >= 0 && shown[active]) choose(shown[active]);
        return;
      case " ":
        if (fromSearch) return;
        event.preventDefault();
        if (active >= 0 && shown[active]) choose(shown[active]);
        return;
      case "Tab":
        event.preventDefault();
        close();
        return;
      default:
        if (!hasSearch && isPrintable(event)) {
          const found = typeahead(event.key, shown, Math.max(active, 0));
          if (found >= 0) setActive(found);
        }
    }
  };
}

type SelectProps = Omit<
  React.ComponentProps<"button">,
  "onChange" | "onBlur" | "ref" | "value" | "defaultValue" | "type"
> & {
  name?: string;
  required?: boolean;
  /** Taken for a browser dropdown's sake; the list has no autofill. */
  autoComplete?: string;
  value?: string | number;
  defaultValue?: string | number;
  onChange?: (event: SelectEvent) => void;
  onBlur?: (event: SelectEvent) => void;
  ref?: React.Ref<SelectTarget>;
  /** A search box at the top. On by default for 10 or more choices. */
  searchable?: boolean;
  /** Shown, greyed, when no choice is chosen and there's no empty one. */
  placeholder?: string;
};

function Select({
  className,
  children,
  name,
  value,
  defaultValue,
  onChange,
  onBlur,
  ref,
  disabled = false,
  searchable,
  placeholder,
  required,
  autoComplete,
  ...props
}: SelectProps) {
  const { required: needed, ...field } = useFieldProps({ ...props, required });
  const fieldLabel = useFieldLabel();
  const listId = React.useId();
  const options = React.useMemo(() => optionsOf(children), [children]);

  const controlled = value !== undefined;
  const [inner, setInner] = React.useState(
    defaultValue === undefined ? undefined : String(defaultValue),
  );
  const raw = controlled ? String(value) : inner;
  const selected = resolve(options, raw);
  const current = selected?.value ?? "";

  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(-1);
  const hasSearch = searchable ?? options.length >= SEARCH_FROM;
  const shown = React.useMemo(
    () => (hasSearch ? filterOptions(options, query) : options),
    [hasSearch, options, query],
  );

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const hiddenRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);
  const typeahead = useTypeahead();

  // What the handle reads: the latest options and value, kept after each render.
  const latest = React.useRef({ options, raw, name, disabled, controlled });
  React.useLayoutEffect(() => {
    latest.current = { options, raw, name, disabled, controlled };
  });

  /** The `event.target` of onChange, and what react-hook-form's ref gets. */
  const handle = React.useMemo<SelectTarget>(
    () => ({
      get name() {
        return latest.current.name ?? "";
      },
      get value() {
        return resolve(latest.current.options, latest.current.raw)?.value ?? "";
      },
      set value(next: string) {
        const text = next === null || next === undefined ? "" : String(next);
        latest.current = { ...latest.current, raw: text };
        if (hiddenRef.current) hiddenRef.current.value = text;
        if (!latest.current.controlled) setInner(text);
      },
      get disabled() {
        return latest.current.disabled;
      },
      get form() {
        return triggerRef.current?.form ?? null;
      },
      focus: () => triggerRef.current?.focus(),
      blur: () => triggerRef.current?.blur(),
    }),
    [],
  );
  React.useImperativeHandle(ref, () => handle, [handle]);

  function pick(option: SelectOption) {
    if (option.disabled) return;
    setOpen(false);
    if (option.value === current) return;
    latest.current = { ...latest.current, raw: option.value };
    // The form reads the new value straight away (filters that send on change).
    if (hiddenRef.current) hiddenRef.current.value = option.value;
    if (!controlled) setInner(option.value);
    onChange?.({ target: handle, currentTarget: handle, type: "change" });
  }

  function openList() {
    if (disabled) return;
    setQuery("");
    setActive(Math.max(options.indexOf(selected!), firstEnabled(options)));
    setOpen(true);
  }

  const listKeys = useListKeys({
    shown,
    active,
    setActive,
    choose: pick,
    close: () => setOpen(false),
    typeahead,
    hasSearch,
  });

  const label = props["aria-label"] ?? fieldLabel ?? "Choices";
  const empty = !selected || (selected.value === "" && Boolean(placeholder));

  return (
    <Popover.Root
      modal
      open={open}
      onOpenChange={(next) => (next ? openList() : setOpen(false))}
    >
      <Popover.Trigger asChild>
        <button
          ref={triggerRef}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-controls={open ? listId : undefined}
          disabled={disabled}
          data-slot="select"
          {...props}
          {...field}
          aria-required={needed || undefined}
          onKeyDown={(event) => {
            props.onKeyDown?.(event);
            if (event.defaultPrevented || open) return;
            if (["ArrowDown", "ArrowUp"].includes(event.key)) {
              event.preventDefault();
              openList();
            } else if (isPrintable(event)) {
              if (hasSearch) {
                event.preventDefault();
                openList();
                setQuery(event.key);
                return;
              }
              const found = typeahead(
                event.key,
                options,
                Math.max(options.indexOf(selected!), 0),
              );
              if (found >= 0) pick(options[found]);
            }
          }}
          onBlur={(event) => {
            if (contentRef.current?.contains(event.relatedTarget)) return;
            if (!open)
              onBlur?.({ target: handle, currentTarget: handle, type: "blur" });
          }}
          className={cn(
            controlClass,
            openableClass,
            "group/select flex h-[50px] cursor-pointer items-center gap-2 pr-3 pl-3.5 text-left",
            className,
          )}
        >
          {/* As wide as the longest choice, like a browser dropdown (the words are
              drawn by CSS, so they are not part of the box's text). */}
          <span className="grid min-w-0 flex-1 grid-cols-[minmax(0,1fr)]">
            {options.map((option, index) => (
              <span
                key={`${option.value}-${index}`}
                aria-hidden="true"
                data-label={option.label}
                className="invisible col-start-1 row-start-1 h-0 overflow-hidden whitespace-nowrap after:content-[attr(data-label)]"
              />
            ))}
            <span
              className={cn(
                "col-start-1 row-start-1 truncate",
                empty && placeholder && "font-normal text-muted-foreground",
              )}
            >
              {empty && placeholder ? placeholder : selected?.label}
            </span>
          </span>
          <ChevronDown
            aria-hidden="true"
            className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-data-[state=open]/select:rotate-180 motion-reduce:transition-none"
          />
        </button>
      </Popover.Trigger>
      {name ? (
        <input
          ref={hiddenRef}
          type="hidden"
          name={name}
          value={current}
          disabled={disabled}
          autoComplete={autoComplete}
        />
      ) : null}
      <Popover.Portal>
        <Popover.Content
          ref={contentRef}
          align="start"
          sideOffset={6}
          collisionPadding={COLLISION_PADDING}
          aria-label={label}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (searchRef.current ?? listRef.current)?.focus({
              preventScroll: true,
            });
          }}
          className={cn(
            floatingPanel,
            floatingMotion,
            "flex max-h-[min(22rem,var(--radix-popover-content-available-height))] w-(--radix-popover-trigger-width) max-w-[min(28rem,calc(100vw-1.5rem))] min-w-[12rem] origin-(--radix-popover-content-transform-origin) flex-col overflow-hidden",
          )}
        >
          {hasSearch ? (
            <SearchBox
              inputRef={searchRef}
              query={query}
              onQuery={(text) => {
                setQuery(text);
                setActive(firstEnabled(filterOptions(options, text)));
              }}
              onKeyDown={listKeys}
              listId={listId}
              active={active}
            />
          ) : null}
          <OptionList
            id={listId}
            label={label}
            options={shown}
            query={hasSearch ? query : ""}
            active={active}
            isChosen={(v) => v === current}
            multiple={false}
            onActive={setActive}
            onChoose={pick}
            listRef={listRef}
            onKeyDown={listKeys}
            focusable={!hasSearch}
          />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

type MultiSelectProps = {
  options: SelectOption[];
  value: string[];
  onChange: (values: string[]) => void;
  /** Shown when nothing is chosen: "Choose people". */
  placeholder?: string;
  /** A search box at the top. On by default for 7 or more choices. */
  searchable?: boolean;
  id?: string;
  disabled?: boolean;
  className?: string;
  "aria-label"?: string;
  "aria-invalid"?: React.AriaAttributes["aria-invalid"];
  "aria-describedby"?: string;
};

/**
 * Choose several: the chosen ones show as chips in the box, the list has
 * ticks and stays open while you choose, with a search box and Clear.
 *
 *   <Field label="Ask someone (optional)">
 *     <MultiSelect options={people} value={ask} onChange={setAsk} />
 *   </Field>
 */
function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Choose…",
  searchable,
  disabled = false,
  className,
  ...props
}: MultiSelectProps) {
  const { required: needed, ...field } = useFieldProps(props);
  const fieldLabel = useFieldLabel();
  const listId = React.useId();
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [active, setActive] = React.useState(-1);
  const hasSearch = searchable ?? options.length >= 7;
  const shown = React.useMemo(
    () => (hasSearch ? filterOptions(options, query) : options),
    [hasSearch, options, query],
  );
  const listRef = React.useRef<HTMLDivElement>(null);
  const searchRef = React.useRef<HTMLInputElement>(null);
  const typeahead = useTypeahead();

  const chosen = options.filter((option) => value.includes(option.value));
  const label = props["aria-label"] ?? fieldLabel ?? "Choices";

  function toggle(option: SelectOption) {
    if (option.disabled) return;
    onChange(
      value.includes(option.value)
        ? value.filter((v) => v !== option.value)
        : [...value, option.value],
    );
  }

  const listKeys = useListKeys({
    shown,
    active,
    setActive,
    choose: toggle,
    close: () => setOpen(false),
    typeahead,
    hasSearch,
  });

  return (
    <Popover.Root
      modal
      open={open}
      onOpenChange={(next) => {
        if (next && disabled) return;
        if (next) {
          setQuery("");
          setActive(firstEnabled(options));
        }
        setOpen(next);
      }}
    >
      <div className={cn("relative", className)}>
        <Popover.Trigger asChild>
          <button
            type="button"
            role="combobox"
            aria-haspopup="listbox"
            aria-expanded={open}
            aria-controls={open ? listId : undefined}
            disabled={disabled}
            data-slot="multi-select"
            {...props}
            {...field}
            aria-required={needed || undefined}
            onKeyDown={(event) => {
              if (open) return;
              if (["ArrowDown", "ArrowUp"].includes(event.key)) {
                event.preventDefault();
                setQuery("");
                setActive(firstEnabled(options));
                setOpen(true);
              }
            }}
            className={cn(
              controlClass,
              openableClass,
              "group/select flex min-h-[50px] cursor-pointer items-center gap-2 py-2 pl-2.5 text-left",
              chosen.length ? "pr-[4.5rem]" : "pr-10",
            )}
          >
            {chosen.length ? (
              <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
                {chosen.map((option) => (
                  <span
                    key={option.value}
                    className="inline-flex max-w-full items-center truncate rounded-full bg-tint px-2.5 py-1 text-[13px] font-bold text-navy"
                  >
                    {option.label}
                  </span>
                ))}
              </span>
            ) : (
              <span className="min-w-0 flex-1 truncate pl-1 font-normal text-muted-foreground">
                {placeholder}
              </span>
            )}
          </button>
        </Popover.Trigger>
        {chosen.length && !disabled ? (
          <button
            type="button"
            aria-label="Clear all"
            onClick={() => onChange([])}
            className="absolute top-1/2 right-9 inline-flex size-7 -translate-y-1/2 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-soft hover:text-navy"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        ) : null}
        <ChevronDown
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180",
          )}
        />
      </div>
      <Popover.Portal>
        <Popover.Content
          align="start"
          sideOffset={6}
          collisionPadding={COLLISION_PADDING}
          aria-label={label}
          onOpenAutoFocus={(event) => {
            event.preventDefault();
            (searchRef.current ?? listRef.current)?.focus({
              preventScroll: true,
            });
          }}
          className={cn(
            floatingPanel,
            floatingMotion,
            "flex max-h-[min(24rem,var(--radix-popover-content-available-height))] w-(--radix-popover-trigger-width) max-w-[min(28rem,calc(100vw-1.5rem))] min-w-[14rem] origin-(--radix-popover-content-transform-origin) flex-col overflow-hidden",
          )}
        >
          {hasSearch ? (
            <SearchBox
              inputRef={searchRef}
              query={query}
              onQuery={(text) => {
                setQuery(text);
                setActive(firstEnabled(filterOptions(options, text)));
              }}
              onKeyDown={listKeys}
              listId={listId}
              active={active}
            />
          ) : null}
          <OptionList
            id={listId}
            label={label}
            options={shown}
            query={hasSearch ? query : ""}
            active={active}
            isChosen={(v) => value.includes(v)}
            multiple
            onActive={setActive}
            onChoose={toggle}
            listRef={listRef}
            onKeyDown={listKeys}
            focusable={!hasSearch}
          />
          <div className="flex items-center justify-between gap-2 border-t border-line-3 px-3 py-2">
            <span className="text-xs font-semibold text-muted-foreground">
              {value.length ? `${value.length} chosen` : "None chosen"}
            </span>
            <span className="flex gap-1">
              {value.length ? (
                <button
                  type="button"
                  onClick={() => onChange([])}
                  className="inline-flex h-8 cursor-pointer items-center rounded-lg px-2.5 text-[13px] font-bold text-muted-foreground hover:bg-soft hover:text-navy"
                >
                  Clear
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex h-8 cursor-pointer items-center rounded-lg bg-navy px-3 text-[13px] font-bold text-white hover:bg-navy/90"
              >
                Done
              </button>
            </span>
          </div>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

export { MultiSelect, Select };
