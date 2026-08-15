"use client";

export type LegalBlock =
  | { type: "p"; text: string }
  | { type: "ul"; items: (string | { label: string; text: string })[] }
  | { type: "ol"; items: string[] }
  | { type: "note"; text: string };

export type LegalSubsection = { title: string; blocks: LegalBlock[] };
export type LegalSection = { title: string; blocks: LegalBlock[]; subsections?: LegalSubsection[] };

function Blocks({ blocks }: { blocks: LegalBlock[] }) {
  return (
    <>
      {blocks.map((b, i) => {
        if (b.type === "p") {
          return (
            <p key={i} style={{ fontFamily: "Kodchasan, sans-serif", color: "#4A4A4A", fontSize: "0.9625rem", lineHeight: 1.8, marginBottom: 14 }}>
              {b.text}
            </p>
          );
        }
        if (b.type === "note") {
          return (
            <p key={i} style={{ fontFamily: "Kodchasan, sans-serif", color: "#6B6B6B", fontSize: "0.9rem", lineHeight: 1.75, fontStyle: "italic", background: "#F2F2F2", borderRadius: 10, padding: "12px 16px", marginBottom: 14 }}>
              {b.text}
            </p>
          );
        }
        if (b.type === "ol") {
          return (
            <ol key={i} style={{ margin: "0 0 14px", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
              {b.items.map((item, j) => (
                <li key={j} style={{ fontFamily: "Kodchasan, sans-serif", color: "#4A4A4A", fontSize: "0.9625rem", lineHeight: 1.7 }}>{item}</li>
              ))}
            </ol>
          );
        }
        // ul
        return (
          <ul key={i} style={{ margin: "0 0 14px", paddingLeft: 22, display: "flex", flexDirection: "column", gap: 8 }}>
            {b.items.map((item, j) => (
              <li key={j} style={{ fontFamily: "Kodchasan, sans-serif", color: "#4A4A4A", fontSize: "0.9625rem", lineHeight: 1.7 }}>
                {typeof item === "string" ? item : <><strong style={{ color: "#161616" }}>{item.label}</strong> {item.text}</>}
              </li>
            ))}
          </ul>
        );
      })}
    </>
  );
}

export default function LegalDoc({
  eyebrow, title, effectiveDate, intro, sections, seeAlso,
}: {
  eyebrow: string;
  title: string;
  effectiveDate: string;
  intro: string;
  sections: LegalSection[];
  seeAlso: { label: string; href: string }[];
}) {
  return (
    <div style={{ background: "#FFFFFF", minHeight: "100vh" }}>
      <div style={{ paddingTop: 100, paddingBottom: 64, textAlign: "center", position: "relative", overflow: "hidden", background: "var(--brand)", minHeight: 340 }}>
        <div style={{ position: "relative", maxWidth: 800, margin: "0 auto", padding: "0 24px" }}>
          <span style={{ display: "inline-block", background: "rgba(255,255,255,0.16)", border: "1px solid rgba(255,255,255,0.3)", color: "#FFFFFF", fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.75rem", letterSpacing: "0.08em", textTransform: "uppercase", padding: "5px 14px", borderRadius: 999, marginBottom: 20 }}>
            {eyebrow}
          </span>
          <h1 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "clamp(1.875rem,4vw,2.8rem)", color: "#fff", letterSpacing: "-0.025em", marginBottom: 16 }}>
            {title}
          </h1>
          <p style={{ color: "rgba(255,255,255,0.85)", fontFamily: "Kodchasan, sans-serif", fontSize: "1rem" }}>
            Last Updated: {effectiveDate} · Effective date: {effectiveDate}
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 780, margin: "0 auto", padding: "64px 24px 96px" }}>
        <p style={{ fontFamily: "Kodchasan, sans-serif", color: "#6B6B6B", fontSize: "1rem", lineHeight: 1.8, marginBottom: 48 }}>
          {intro}
        </p>

        {sections.map((s, i) => (
          <div key={i} style={{ marginBottom: 40 }}>
            <h2 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 700, fontSize: "1.15rem", color: "#161616", marginBottom: 14 }}>
              {i + 1}. {s.title}
            </h2>
            <Blocks blocks={s.blocks} />
            {s.subsections?.map((sub, j) => (
              <div key={j} style={{ marginTop: 20, marginBottom: 8 }}>
                <h3 style={{ fontFamily: "Poppins, sans-serif", fontWeight: 600, fontSize: "0.975rem", color: "#161616", marginBottom: 10 }}>
                  {i + 1}.{j + 1} {sub.title}
                </h3>
                <Blocks blocks={sub.blocks} />
              </div>
            ))}
          </div>
        ))}

        <div style={{ borderTop: "1px solid #E4E4E7", paddingTop: 32, marginTop: 16 }}>
          <p style={{ fontFamily: "Kodchasan, sans-serif", color: "#8C8C8C", fontSize: "0.875rem" }}>
            See also{" "}
            {seeAlso.map((s, i) => (
              <span key={s.href}>
                <a href={s.href} style={{ color: "#B30F14", textDecoration: "underline" }}>{s.label}</a>
                {i < seeAlso.length - 1 ? " and " : ". "}
              </span>
            ))}
            For questions, email{" "}
            <a href="mailto:hello@starexlaundrydryclean.ca" style={{ color: "#B30F14", textDecoration: "underline" }}>hello@starexlaundrydryclean.ca</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
