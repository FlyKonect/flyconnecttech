"use client";

import * as React from "react";
import {
  AlertCircle,
  CheckCircle2,
  Info,
  X,
  type LucideIcon,
} from "lucide-react";
import { Toast as ToastPrimitive } from "radix-ui";

import { cn } from "@/lib/utils";

/**
 * Toasts: short messages at the top right (across the top on phones),
 * below the header, for "Saved", "Invitation sent" or "That didn't work".
 *
 * ToasterProvider is already in the root layout. In any client component:
 *
 *   const toast = useToast();
 *   toast("Settings saved");                  // success (green)
 *   toast(apiErrorMessage(failed), "error");  // failure (red, stays longer)
 *   toast("Nothing to send yet", "info");     // a note (navy)
 *
 * Each is a white card with its icon, a title, the message, a close
 * button and a line that runs down the time left (it waits while the
 * mouse is over it). They slide in, can be swiped away to the right, and
 * stack (up to three, newest on top); the same message again replaces its
 * copy. Screen readers read them; errors at once.
 */

export type ToastTone = "success" | "error" | "info";

type ShowToast = (message: string, tone?: ToastTone) => void;

type Item = { id: number; message: string; tone: ToastTone; open: boolean };

const MOST = 3;

const TONES: Record<
  ToastTone,
  {
    title: string;
    icon: LucideIcon;
    badge: string;
    timer: string;
    duration: number;
  }
> = {
  success: {
    title: "Success",
    icon: CheckCircle2,
    badge: "bg-[#DCFCE7] text-[#15803D]",
    timer: "bg-[#16A34A]",
    duration: 4500,
  },
  error: {
    title: "Something went wrong",
    icon: AlertCircle,
    badge: "bg-[#FEE2E2] text-[#B91C1C]",
    timer: "bg-[#DC2626]",
    duration: 8000,
  },
  info: {
    title: "Note",
    icon: Info,
    badge: "bg-[#E3E9F5] text-[#0C3584]",
    timer: "bg-navy",
    duration: 5500,
  },
};

const ToastContext = React.createContext<ShowToast | null>(null);

function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<Item[]>([]);
  const nextId = React.useRef(0);

  const show = React.useCallback<ShowToast>((message, tone = "success") => {
    nextId.current += 1;
    const id = nextId.current;
    setItems((current) =>
      [
        { id, message, tone, open: true },
        ...current.filter(
          (item) => !(item.message === message && item.tone === tone),
        ),
      ].slice(0, MOST),
    );
  }, []);

  const close = React.useCallback((id: number) => {
    setItems((current) =>
      current.map((item) => (item.id === id ? { ...item, open: false } : item)),
    );
    // Gone once its slide out has played.
    window.setTimeout(() => {
      setItems((current) => current.filter((item) => item.id !== id));
    }, 300);
  }, []);

  return (
    <ToastContext value={show}>
      <ToastPrimitive.Provider swipeDirection="right">
        {children}
        {items.map((item) => (
          <ToastCard key={item.id} item={item} onClose={() => close(item.id)} />
        ))}
        <ToastPrimitive.Viewport
          label="Messages"
          className="fixed top-[84px] right-5 z-[90] m-0 flex w-[380px] max-w-[calc(100vw-24px)] list-none flex-col-reverse gap-2.5 p-0 outline-none max-app:top-3 max-app:right-3 max-app:left-3 max-app:w-auto"
        />
      </ToastPrimitive.Provider>
    </ToastContext>
  );
}

function ToastCard({ item, onClose }: { item: Item; onClose: () => void }) {
  const tone = TONES[item.tone];
  const Icon = tone.icon;
  return (
    <ToastPrimitive.Root
      data-slot="toast"
      data-tone={item.tone}
      open={item.open}
      duration={tone.duration}
      type={item.tone === "error" ? "foreground" : "background"}
      onOpenChange={(open) => {
        if (!open) onClose();
      }}
      className={cn(
        "group relative flex w-full items-start gap-3 overflow-hidden rounded-[16px] border border-line-2 bg-white py-3.5 pr-11 pl-3.5 text-navy shadow-[0_22px_48px_-16px_rgba(2,26,84,0.35),0_4px_10px_-4px_rgba(2,26,84,0.12)]",
        "data-[state=open]:animate-in data-[state=open]:duration-200 data-[state=open]:fade-in-0 data-[state=open]:slide-in-from-right-8",
        "data-[state=closed]:animate-out data-[state=closed]:duration-200 data-[state=closed]:fade-out-0 data-[state=closed]:slide-out-to-right-8",
        "data-[swipe=cancel]:translate-x-0 data-[swipe=cancel]:transition-transform data-[swipe=end]:animate-out data-[swipe=end]:slide-out-to-right-full data-[swipe=move]:translate-x-(--radix-toast-swipe-move-x)",
        "motion-reduce:animate-none",
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
          tone.badge,
        )}
      >
        <Icon className="size-5" strokeWidth={2.2} />
      </span>
      <div className="min-w-0 flex-1 pt-px">
        <ToastPrimitive.Title className="text-[13px] font-bold text-navy">
          {tone.title}
        </ToastPrimitive.Title>
        <ToastPrimitive.Description className="mt-0.5 text-sm leading-snug [overflow-wrap:anywhere] text-body">
          {item.message}
        </ToastPrimitive.Description>
      </div>
      <ToastPrimitive.Close
        aria-label="Close"
        className="absolute top-2.5 right-2.5 inline-flex size-8 cursor-pointer items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-soft hover:text-navy"
      >
        <X aria-hidden="true" className="size-4" />
      </ToastPrimitive.Close>
      <span
        aria-hidden="true"
        className={cn(
          "absolute inset-x-0 bottom-0 h-[3px] origin-left group-focus-within:[animation-play-state:paused] group-hover:[animation-play-state:paused] motion-reduce:hidden",
          tone.timer,
        )}
        style={{
          animationName: "toast-time-left",
          animationDuration: `${tone.duration}ms`,
          animationTimingFunction: "linear",
          animationFillMode: "forwards",
        }}
      />
    </ToastPrimitive.Root>
  );
}

/** Returns a function that shows a toast: toast("Saved") or toast(text, "error"). */
function useToast(): ShowToast {
  const show = React.use(ToastContext);
  if (!show) {
    throw new Error("useToast must be used inside <ToasterProvider>.");
  }
  return show;
}

export { ToasterProvider, useToast };
