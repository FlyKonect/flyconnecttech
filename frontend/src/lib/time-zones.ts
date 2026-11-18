/** Every time zone, labelled like "Europe/London (GMT)", for Profile settings. */
export function timeZoneOptions(current: string) {
  const now = new Date();
  const zones = Intl.supportedValuesOf("timeZone");
  if (!zones.includes(current)) zones.unshift(current);
  return zones.map((zone) => {
    let offset = "";
    try {
      offset =
        new Intl.DateTimeFormat("en-GB", {
          timeZone: zone,
          timeZoneName: "shortOffset",
        })
          .formatToParts(now)
          .find((part) => part.type === "timeZoneName")?.value ?? "";
    } catch {
      offset = "";
    }
    // "GMT+0" reads as "GMT", as in the design.
    if (offset === "GMT+0") offset = "GMT";
    return { value: zone, label: offset ? `${zone} (${offset})` : zone };
  });
}
