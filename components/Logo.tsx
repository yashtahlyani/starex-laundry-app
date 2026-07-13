// STAREX brand lockup — vector recreation of the client's logo:
// bold STAREX wordmark with the brand star as the "A"; the star carries the
// signature white inner-star cutout from the original mark.
type LogoProps = {
  /** Letter color — white on dark surfaces, brand red on light */
  color?: string;
  fontSize?: string;
};

// Same gradient in every instance, so a shared id is safe (first definition wins).
const gid = "starex-star-grad";

// 5-point star points for a given center/radius pair
function starPoints(cx: number, cy: number, outer: number, inner: number): string {
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`);
  }
  return pts.join(" ");
}

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
        style={{ width: "1.12em", height: "1.12em", margin: "0 0.03em", transform: "translateY(-0.04em)" }}
        aria-hidden="true"
      >
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#C24862" />
            <stop offset="100%" stopColor="#8F2740" />
          </linearGradient>
        </defs>
        {/* outer star in brand red */}
        <polygon points={starPoints(12, 12.6, 11.2, 4.5)} fill={`url(#${gid})`} />
        {/* signature white inner-star cutout, as in the client's mark */}
        <polygon points={starPoints(12, 12.6, 5.6, 2.25)} fill="#FFFFFF" />
      </svg>
      REX
    </span>
  );
}
