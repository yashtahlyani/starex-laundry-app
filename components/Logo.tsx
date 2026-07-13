// STAREX brand lockup — bold wordmark with the red star standing in as the "A",
// recreated as a vector from the client's logo (red star + STAREX, red on white).
type LogoProps = {
  /** Letter color — white on dark surfaces, brand red on light */
  color?: string;
  /** Star fill override; defaults to the brand gradient */
  fontSize?: string;
};

// Same gradient in every instance, so a shared id is safe (first definition wins).
const gid = "starex-star-grad";

export default function Logo({ color = "#FFFFFF", fontSize = "1.2rem" }: LogoProps) {
  return (
    <span
      aria-label="StareX"
      style={{
        display: "inline-flex",
        alignItems: "center",
        fontFamily: "Poppins, sans-serif",
        fontWeight: 800,
        letterSpacing: "0.06em",
        fontSize,
        color,
        lineHeight: 1,
        userSelect: "none",
      }}
    >
      ST
      <svg
        viewBox="0 0 24 24"
        style={{ width: "1.06em", height: "1.06em", margin: "0 0.03em", transform: "translateY(-0.04em)" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#E0525F" />
            <stop offset="100%" stopColor="#C13A4E" />
          </linearGradient>
        </defs>
        <polygon
          points="12,1.2 15,8.5 22.8,8.9 16.7,13.8 18.9,21.4 12,17 5.1,21.4 7.3,13.8 1.2,8.9 9,8.5"
          fill={`url(#${gid})`}
        />
      </svg>
      REX
    </span>
  );
}
