"use client";

import * as React from "react";
import { Toast as ToastPrimitive } from "radix-ui";

/**
 * Toast: a short navy message at the bottom centre of the screen, for
 * "Saved", "Invitation sent" and the like. It goes away by itself and is
 * read out by screen readers.
 *
 * ToasterProvider is already in the root layout. In any client component:
 *
 *   const toast = useToast();
 *   toast("Settings saved");
 *
 * One toast shows at a time: a new one replaces the old one.
 */

type ToastState = { id: number; message: string } | null;

const ToastContext = React.createContext<((message: string) => void) | null>(
  null,
);

function ToasterProvider({ children }: { children: React.ReactNode }) {
  const [current, setCurrent] = React.useState<ToastState>(null);
  const nextId = React.useRef(0);

  const show = React.useCallback((message: string) => {
    nextId.current += 1;
    setCurrent({ id: nextId.current, message });
  }, []);

  return (
    <ToastContext value={show}>
      <ToastPrimitive.Provider duration={4000} swipeDirection="down">
        {children}
        {current ? (
          <ToastPrimitive.Root
            key={current.id}
            data-slot="toast"
            onOpenChange={(open) => {
              if (!open) setCurrent(null);
            }}
            className="rounded-full bg-navy px-[18px] py-3 text-sm font-bold text-white shadow-[0_20px_40px_-12px_rgba(0,0,0,0.4)]"
          >
            <ToastPrimitive.Description>
              {current.message}
            </ToastPrimitive.Description>
          </ToastPrimitive.Root>
        ) : null}
        <ToastPrimitive.Viewport
          label="Messages"
          className="fixed bottom-6 left-1/2 z-[70] m-0 flex w-max max-w-[calc(100%-32px)] -translate-x-1/2 list-none flex-col items-center p-0 outline-none"
        />
      </ToastPrimitive.Provider>
    </ToastContext>
  );
}

/** Returns a function that shows a toast message. */
function useToast(): (message: string) => void {
  const show = React.use(ToastContext);
  if (!show) {
    throw new Error("useToast must be used inside <ToasterProvider>.");
  }
  return show;
}

export { ToasterProvider, useToast };
