// Rendered fresh on every navigation. Previously it faded each page in from
// opacity 0 over 0.25s, which made switching pages feel laggy — the new page
// was briefly invisible on every click. Rendering children directly makes
// navigation feel instant. Per-section entrance animations (whileInView on the
// individual pages) still provide the polish, only now they don't gate the
// whole page's first paint.
export default function Template({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
