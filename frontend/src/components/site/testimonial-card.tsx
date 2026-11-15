import {
  initialsOf,
  testimonialByline,
  type SiteTestimonial,
} from "@/lib/site-content";

/**
 * One client quote, as Home's "What our clients say" shows it: the design's
 * card, with the client's initials in the circle.
 */
export function TestimonialCard({
  testimonial,
}: {
  testimonial: SiteTestimonial;
}) {
  const byline = testimonialByline(testimonial);
  return (
    <figure
      style={{
        margin: "0",
        padding: "28px",
        border: "1px solid #E8EDF4",
        borderRadius: "16px",
        background: "#FFFFFF",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <blockquote
        style={{
          margin: "0",
          fontSize: "17px",
          lineHeight: "1.6",
          color: "#23324F",
        }}
      >
        “{testimonial.quote}”
      </blockquote>
      <figcaption
        style={{
          marginTop: "24px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <span
          aria-hidden="true"
          style={{
            width: "40px",
            height: "40px",
            flex: "none",
            borderRadius: "50%",
            background: "#E3E9F5",
            color: "#0C3584",
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "13px",
            fontWeight: "700",
          }}
        >
          {initialsOf(testimonial.name)}
        </span>
        <span
          style={{ fontSize: "14px", lineHeight: "1.45", color: "#3E4C66" }}
        >
          <span
            style={{ display: "block", fontWeight: "700", color: "#021A54" }}
          >
            {testimonial.name}
          </span>
          {byline ? <span style={{ display: "block" }}>{byline}</span> : null}
        </span>
      </figcaption>
    </figure>
  );
}
