"use client";

import * as React from "react";

export type FaqItem = { question: string; answer: React.ReactNode };

/**
 * FAQ accordion (docs/01, "Inner pages"): one answer open at a time, the
 * first one open at the start. Each question is a button that says whether
 * its answer is showing.
 */
export function Faq({
  items,
  style,
}: {
  items: FaqItem[];
  style?: React.CSSProperties;
}) {
  const [open, setOpen] = React.useState(0);
  const id = React.useId();

  return (
    <div style={style}>
      {items.map((item, index) => {
        const isOpen = open === index;
        const answerId = `${id}-answer-${index}`;

        return (
          <div
            key={item.question}
            className="rounded-[14px] border border-line bg-white"
          >
            <h3 className="m-0 font-sans text-[17px] leading-[1.45] font-semibold">
              <button
                type="button"
                aria-expanded={isOpen}
                aria-controls={answerId}
                onClick={() => setOpen(isOpen ? -1 : index)}
                className="flex w-full cursor-pointer items-start justify-between gap-4 rounded-[14px] px-6 py-[22px] text-left text-navy"
              >
                <span className="min-w-0">{item.question}</span>
                <span
                  aria-hidden="true"
                  className="w-6 flex-none text-center text-[22px] leading-[1.1] font-medium text-gold-text"
                >
                  {isOpen ? "−" : "+"}
                </span>
              </button>
            </h3>
            <div id={answerId} hidden={!isOpen}>
              <p className="m-0 px-6 pb-[22px] text-base leading-[1.6] text-body">
                {item.answer}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
