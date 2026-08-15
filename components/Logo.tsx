// StareX wordmark + star mark — matches the StareX Dry Cleaners (India) brand:
// a red five-point star beside the wordmark, same brand red as --brand.
type LogoProps = {
  /** Wordmark color — white on dark surfaces, ink on light */
  color?: string;
  fontSize?: string;
};

export default function Logo({ color = "#FFFFFF", fontSize = "1.2rem" }: LogoProps) {
  return (
    <span
      aria-label="StareX"
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.32em",
        fontFamily: "Poppins, sans-serif",
        fontWeight: 800,
        letterSpacing: "0.02em",
        fontSize,
        color,
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      <svg
        width="0.85em"
        height="0.85em"
        viewBox="0 0 24 24"
        fill="var(--brand, #ED1D24)"
        aria-hidden="true"
        style={{ flexShrink: 0 }}
      >
        <path d="M12.00,1.00 L14.53,8.52 L22.46,8.60 L16.09,13.33 L18.47,20.90 L12.00,16.30 L5.53,20.90 L7.91,13.33 L1.54,8.60 L9.47,8.52 Z" />
      </svg>
      StareX
    </span>
  );
}
