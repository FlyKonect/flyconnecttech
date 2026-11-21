/**
 * The one look for everything that opens over the page: dropdown lists,
 * menus ("⋯", Export, the account menu) and the calendar. Change it here and
 * every pop-up follows.
 *
 * They open above dialogs (z-index 80; dialogs are 60) and are drawn at the
 * end of the page (a portal), so a card or a scrolling table never cuts
 * them off. Radix keeps them on screen: they flip above the control when
 * there is no room below.
 */

/** The white panel: border, corners and shadow. */
export const floatingPanel =
  "z-[80] rounded-[14px] border border-line-2 bg-white text-navy shadow-[0_20px_44px_-14px_rgba(2,26,84,0.3),0_3px_8px_-2px_rgba(2,26,84,0.08)] outline-none";

/**
 * A quick fade and grow from the side it opens on (none with reduced
 * motion). It closes at once: no animation on the way out.
 */
export const floatingMotion =
  "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-97 data-[side=bottom]:slide-in-from-top-1 data-[side=top]:slide-in-from-bottom-1 data-[side=left]:slide-in-from-right-1 data-[side=right]:slide-in-from-left-1 duration-150 motion-reduce:animate-none";

/** One line in a menu or a list: highlighted by the mouse or the arrow keys. */
export const floatingItem =
  "flex min-h-10 cursor-pointer items-center gap-2.5 rounded-[10px] px-3 text-sm font-semibold text-navy outline-none select-none transition-colors duration-100 [&_svg]:size-4 [&_svg]:shrink-0";

/** Space kept between the pop-up and the screen's edges. */
export const COLLISION_PADDING = 12;
