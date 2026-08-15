// StareX wordmark — matches the StareX Dry Cleaners (India) mark exactly:
// "ST" + a five-point star standing in for the "A" + "REX", star always in
// the logo's signature red regardless of the wordmark's own color.
const LOGO_RED = "#E73338";

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
        fontFamily: "Poppins, sans-serif",
        fontWeight: 800,
        letterSpacing: "0.01em",
        fontSize,
        color,
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      ST
      <svg
        width="0.72em"
        height="0.72em"
        viewBox="0 0 24 24"
        aria-hidden="true"
        style={{ flexShrink: 0, margin: "0 0.02em" }}
      >
        <path
          d="M12.00,1.00 L14.53,8.52 L22.46,8.60 L16.09,13.33 L18.47,20.90 L12.00,16.30 L5.53,20.90 L7.91,13.33 L1.54,8.60 L9.47,8.52 Z"
          fill={LOGO_RED}
        />
      </svg>
      REX
    </span>
  );
}
