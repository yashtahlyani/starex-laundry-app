// Plain StareX wordmark — a stopgap until the client provides real logo
// image assets to integrate here directly.
type LogoProps = {
  /** Text color — white on dark surfaces, brand red on light */
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
        letterSpacing: "0.02em",
        fontSize,
        color,
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      StareX
    </span>
  );
}
