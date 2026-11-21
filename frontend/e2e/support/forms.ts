import { expect, type Locator } from "@playwright/test";

/**
 * Our dropdowns and the Ask someone picker (src/components/ui/select.tsx)
 * are not browser `<select>`s, so `selectOption` does not work on them.
 * These do the same through the list, as a person would.
 */

type Wanted = string | RegExp | { label: string };

/**
 * Opens the dropdown and chooses one, like `selectOption`: by its value
 * ("IN_PROGRESS"), by its words ({ label: "In progress" } or a plain
 * string), or by a pattern (/Bluewave/).
 */
export async function choose(box: Locator, wanted: Wanted) {
  await box.click();
  const list = box.page().getByRole("listbox");
  await expect(list).toBeVisible();
  await optionIn(list, wanted).click();
  await expect(list).toBeHidden();
}

/** Ticks people in a MultiSelect, then closes it with Done. */
export async function tick(box: Locator, ...wanted: Wanted[]) {
  await box.click();
  const page = box.page();
  const list = page.getByRole("listbox");
  await expect(list).toBeVisible();
  for (const one of wanted) await optionIn(list, one).click();
  await page.getByRole("button", { name: "Done", exact: true }).click();
  await expect(list).toBeHidden();
}

function optionIn(list: Locator, wanted: Wanted): Locator {
  if (wanted instanceof RegExp) {
    return list.getByRole("option", { name: wanted }).first();
  }
  if (typeof wanted === "object") {
    return list.getByRole("option", { name: wanted.label, exact: true });
  }
  return list
    .locator(`[role="option"][data-value=${JSON.stringify(wanted)}]`)
    .or(list.getByRole("option", { name: wanted, exact: true }))
    .first();
}
